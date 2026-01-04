const express = require('express');
const userRoutes = require('./server'); // assuming routes are in server.js
const cors = require('cors');
const path = require('path');
const bodyParser = require("body-parser");
const cron = require('node-cron');
const db = require('./db');


const app = express();
const PORT = process.env.PORT || 3000;

//makes picture folder publicly accessible
app.use('/api/pictures', express.static('pictures'));

// Middleware to parse JSON body
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enable CORS for all origins (adjust origin in production)
app.use(cors());

// Use the routes defined in server.js
app.use('/api', userRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Release unpaid tickets 1 hour before show
async function releaseUnpaidTickets() {
  try {
    // Get all pending orders with their show details
    const [pendingOrders] = await db.promise().query(`
      SELECT o.id, o.show_date, o.show_time, o.activeplay_id, ap.start_date, ap.end_date
      FROM orders o
      JOIN active_play ap ON o.activeplay_id = ap.id
      WHERE o.status = 'PENDING'
    `);

    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    for (const order of pendingOrders) {
      try {
        // Parse show_date (e.g., "Jan 4") and show_time (e.g., "7:00 PM")
        // Use the active_play's start_date year as reference
        const referenceYear = new Date(order.start_date).getFullYear();
        const showDateStr = `${order.show_date}, ${referenceYear}`;
        const showDateTime = new Date(`${showDateStr} ${order.show_time}`);

        // Check if show is within 1 hour from now
        if (!isNaN(showDateTime.getTime()) && showDateTime <= oneHourFromNow) {
          console.log(`Releasing unpaid order ${order.id} - show at ${showDateTime}`);

          // Delete associated bookings first
          await db.promise().query(
            `DELETE FROM bookings WHERE order_id = ?`,
            [order.id]
          );

          // Update order status to cancelled
          await db.promise().query(
            `UPDATE orders SET status = 'CANCELLED' WHERE id = ?`,
            [order.id]
          );

          console.log(`Order ${order.id} cancelled and bookings released`);
        }
      } catch (parseError) {
        console.error(`Error processing order ${order.id}:`, parseError.message);
      }
    }
  } catch (error) {
    console.error('Error in releaseUnpaidTickets:', error);
  }
}

// Run every 5 minutes
cron.schedule('*/5 * * * *', () => {
  console.log('Running scheduled task: Release unpaid tickets');
  releaseUnpaidTickets();
});

console.log('Scheduled task registered: Release unpaid tickets (runs every 5 minutes)');


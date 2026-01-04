//server.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");
const QRCode = require("qrcode");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const { authMiddleware, adminMiddleware } = require("./middleware/auth");
const router = express.Router();


// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "pictures"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});


// Register a new user
router.post("/register", async (req, res) => {
    console.log("Register endpoint hit");
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password are required" });
    }

    try {
        // Check if email already exists
        const [existingUser] = await db.promise().query(
            "SELECT id FROM users WHERE email = ?", [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({ message: "Email already registered" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        const [result] = await db.promise().query(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            [username, email, hashedPassword]
        );

        // Generate JWT token
        const token = jwt.sign(
            { userId: result.insertId, email, is_admin: false },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: "User registered successfully",
            userId: result.insertId,
            token,
            user: { id: result.insertId, username, email, is_admin: false }
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Error registering user" });
    }
});

// User login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Find the user by email
        const [results] = await db.promise().query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = results[0];

        if (!user.password) {
            return res.status(500).json({ message: 'Password not set for this account' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, is_admin: user.is_admin || false },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Login successful',
            userId: user.id,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                address: user.address,
                is_admin: user.is_admin || false
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify token and get current user
router.get('/auth/me', authMiddleware, async (req, res) => {
    try {
        const [results] = await db.promise().query(
            'SELECT id, username, email, address, is_admin FROM users WHERE id = ?',
            [req.user.userId]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = results[0];
        res.status(200).json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                address: user.address,
                is_admin: user.is_admin || false
            }
        });
    } catch (error) {
        console.error('Auth/me error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//User read
router.get("/users", async(req,res) => {
    try {
        const data = await db.promise().query(
          `SELECT *  from users;`
        );
        
        res.status(202).json({
          users: data[0],
        });
      } catch (err) {
        res.status(500).json({
          message: err,
        });
      }
});

//uSER REad
router.get("/user/:id", async(req, res) => {
    try {
        const {id} = req.params
        const data = await db.promise().query(
          `SELECT *  from users where id = ?`,[id]
        );
        res.status(200).json({
          user: data[0][0],
        });
      } catch (err) {
        res.status(500).json({
          message: err,
        });
      }
});

//User Update
router.patch("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password,address, is_admin } = req.body;
    const hashedPassword= await bcrypt.hash(password,10)
    await db.promise().query(
        `UPDATE users set username = ?, email = ?, password = ?, address = ?, is_admin= ? where id = ?`,
        [ username, email, hashedPassword, address, is_admin, id]
      );
    res.status(200).json({
      message: "updated",
    });
  } catch (err) {
    res.status(500).json({
      message: err,
    });
  }
});

//User Delete
router.delete("/user/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.promise().query(
          `DELETE FROM  users where id = ?`,
          [id]
        );
      res.status(200).json({
        message: "deleted",
      });
    } catch (err) {
      res.status(500).json({
        message: err,
      });
    }
  });

  //create play
router.post("/createplay", upload.single("image"), (req, res) => {
  console.log("Create play endpoint hit");
  const { playname, director, duration, genre, added_by, description, image_url } = req.body;

  // Use uploaded file path or provided image_url
  const finalImageUrl = req.file ? `pictures/${req.file.filename}` : (image_url || null);

  // Parse added_by as integer (user ID) or null
  const addedById = added_by && added_by !== 'null' ? parseInt(added_by, 10) : null;

  const query = "INSERT INTO plays (playname, director, duration, genre, added_by, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.query(query, [playname, director, duration, genre, addedById, description, finalImageUrl], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Error creating play", error: err.message });
    }
    res.status(201).json({ message: "Play created successfully", playId: result.insertId });
  });
});


//play R single
router.get("/play/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [playData] = await db.promise().query(
      `SELECT p.*, a.id AS activeplay_id, a.start_date, a.end_date, a.time
       FROM plays p
       LEFT JOIN active_play a ON p.id = a.play_id
       WHERE p.id = ?`,
      [id]
    );

    if (playData.length === 0) {
      return res.status(404).json({ message: "Play not found" });
    }

    res.status(200).json({ play: playData[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


//play Read all
router.get("/plays", async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT p.*, a.start_date, a.end_date
      FROM plays p
      LEFT JOIN active_play a ON p.id = a.play_id
      ORDER BY a.end_date DESC
    `);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching plays:", err);
    res.status(500).json({ message: "Error fetching plays" });
  }
});


//play U
router.patch("/play/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { playname, director, genre, duration, added_by, description, image_url } = req.body;

    // Use uploaded file path or provided image_url
    const finalImageUrl = req.file ? `pictures/${req.file.filename}` : (image_url || null);

    // Parse added_by as integer (user ID) or null
    const addedById = added_by && added_by !== 'null' ? parseInt(added_by, 10) : null;

    await db.promise().query(
        `UPDATE plays set playname = ?, director = ?, genre = ?, duration = ?, added_by = ?, description = ?, image_url = ? where id = ?`,
        [ playname, director, genre, duration, addedById, description, finalImageUrl, id]
      );

    res.status(200).json({
      message: "updated",
    });
  } catch (err) {
    console.error("Error updating play:", err);
    res.status(500).json({
      message: err.message || "Failed to update play",
    });
  }
});

//play D
router.delete("/play/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.promise().query(
          `DELETE FROM  plays where id = ?`,
          [id]
        );
      res.status(200).json({
        message: "deleted",
      });
    } catch (err) {
      res.status(500).json({
        message: err,
      });
    }
  });

//activeplay create
router.post("/createacplay", (req, res) => {
  console.log("Register endpoint hit");
  const { time, total_occupancy, play_id, start_date, end_date } = req.body;

  const query = "INSERT INTO active_play (time, total_occupancy, play_id, start_date, end_date) VALUES (?, ?, ?, ?, ?)";
  db.query(query, [time, total_occupancy, play_id, start_date, end_date], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send("Error creating play");
    }
    res.status(201).send("Play created successfully");
  });
});

//activeplay read (current plays)
router.get("/active_play", async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT a.id, p.id AS play_id, p.playname, p.director, p.duration, p.genre, p.description, p.image_url, a.start_date, a.end_date, a.time, a.total_occupancy
      FROM plays p
      INNER JOIN active_play a ON p.id = a.play_id
      WHERE CURDATE() BETWEEN a.start_date AND a.end_date
      ORDER BY a.start_date ASC
    `);
    console.log("Active plays query result:", rows); // 👈 add this line

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching active plays" });
  }
});

//activeplay sinngle read
router.get("/active_play/:id", async(req,res)=>{
  try{
    const { id } =req.params;
    const data = await db.promise().query(
      `SELECT *  from active_play where id = ?`,[id]
      );
        res.status(200).json({
          active_play: data[0][0],
        });
      } catch (err) {
        res.status(500).json({
          message: err,
        });
      }
});

//activeplay update
router.patch("/active_play/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { time, total_occupancy, play_id, start_date, end_date } = req.body;
    await db.promise().query(
        `UPDATE active_play SET time = ?, total_occupancy = ?, play_id = ?, start_date= ?, end_date = ? where id = ?`,
        [ time, total_occupancy, play_id, start_date, end_date, id]
      );
    
    res.status(200).json({
      message: "updated",
    });
  } catch (err) {
    res.status(500).json({
      message: err,
    });
  }
});

//activeplay delete
router.delete("/active_play/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.promise().query(
          `DELETE FROM  active_play where id = ?`,
          [id]
        );
      res.status(200).json({
        message: "deleted",
      });
    } catch (err) {
      res.status(500).json({
        message: err,
      });
    }
  });

//bookings create
router.post("/booking", (req, res) => {
  console.log("Register endpoint hit");
  const { activeplay_id, seatno, payment_id, user_id, qr_code, order_id, show_date } = req.body;

  const query = "INSERT INTO bookings (activeplay_id, seatno, payment_id, user_id, qr_code, order_id, show_date) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.query(query, [activeplay_id, seatno, payment_id, user_id, qr_code, order_id, show_date], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Booking Failed." });
    }
    res.status(201).json({ message: "Show Booked Successfully." , bookingId: result.insertId});
  });
});

//booking read w
router.get("/bookingrw", async(req, res) => {
    try {
        const data = await db.promise().query(
          `SELECT *  from bookings;`
        );
        res.status(202).json({
          bookings: data[0],
        });
      } catch (err) {
        res.status(500).json({
          message: err,
        });
      }
});

//booking read s
router.get("/bookingrs/:id", async(req,res)=>{
  try{
    const { id } =req.params;
    const data = await db.promise().query(
      `SELECT *  from bookings where id = ?`,[id]
      );
        res.status(200).json({
          bookings: data[0][0],
        });
      } catch (err) {
        res.status(500).json({
          message: err,
        });
      }
});

// booking active seats for a specific play and date
router.get("/booking/active/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    // Join with orders to get payment status
    const [rows] = await db.promise().query(
      `SELECT b.seatno, o.status
       FROM bookings b
       LEFT JOIN orders o ON b.order_id = o.id
       WHERE b.activeplay_id = ? AND b.show_date = ?`,
      [id, date]
    );

    // Separate booked (paid) and reserved (pending) seats
    const bookedSeats = rows.filter(r => r.status === 'PAID').map(r => ({ seatno: r.seatno }));
    const reservedSeats = rows.filter(r => r.status === 'PENDING').map(r => ({ seatno: r.seatno }));

    res.status(200).json({ bookedSeats, reservedSeats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching booked seats" });
  }
});


//booking update
router.patch("/booking/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { activeplay_id, seatno, payment_id, user_id, qr_code, order_id } = req.body;
    await db.promise().query(
        `UPDATE bookings set activeplay_id = ?, seatno = ?, payment_id = ?, user_id = ?, qr_code = ?, order_id where id = ?`,
        [ activeplay_id, seatno, payment_id, user_id, qr_code,order_id, id]
      );
    
    res.status(200).json({
      message: "updated",
    });
  } catch (err) {
    res.status(500).json({
      message: err,
    });
  }
});

router.delete("/active-play/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // 1️⃣ delete bookings first
    await db.promise().query(
      "DELETE FROM booking WHERE activeplay_id = ?",
      [id]
    );

    // 2️⃣ delete schedule
    await db.promise().query(
      "DELETE FROM active_play WHERE id = ?",
      [id]
    );

    res.json({ message: "Schedule deleted" });
  } catch (err) {
    console.error("Delete schedule error:", err);
    res.status(500).json({ error: err.message });
  }
});


// server.js (continued – add this at the end of your existing file)


// ==================== PAYMENTS TABLE ROUTES ====================

// Create a payment record (when initiating payment, e.g., Razorpay order)
router.post("/payments", async (req, res) => {
  const { request_data, amount, status = "created" } = req.body; // request_data can store Razorpay order creation payload

  try {
    const [result] = await db.promise().query(
      `INSERT INTO payments (request_data, amount, status) VALUES (?, ?, ?)`,
      [JSON.stringify(request_data), amount, status]
    );

    res.status(201).json({
      message: "Payment record created",
      paymentId: result.insertId,
    });
  } catch (err) {
    console.error("Error creating payment record:", err);
    res.status(500).json({ message: "Failed to create payment record" });
  }
});

// Update payment status + response (called in webhook or callback)
router.patch("/payments/:id", async (req, res) => {
  const { id } = req.params;
  const { response_data, status } = req.body;

  try {
    await db.promise().query(
      `UPDATE payments SET response_data = ?, status = ? WHERE id = ?`,
      [JSON.stringify(response_data), status, id]
    );

    res.status(200).json({ message: "Payment updated successfully" });
  } catch (err) {
    console.error("Error updating payment:", err);
    res.status(500).json({ message: "Failed to update payment" });
  }
});

// Get single payment (admin/debug)
router.get("/payments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.promise().query(`SELECT * FROM payments WHERE id = ?`, [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Payment not found" });
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ==================== ORDERS TABLE ROUTES ====================

// Create order (usually after payment is initiated or verified)
router.post("/orders", async (req, res) => {
  const {
    play_id,
    activeplay_id,
    show_date,
    show_time,
    seats_json,        // e.g., ["A1", "A2"] or JSON string
    user_id,
    amount,
    transaction_uuid,  // optional unique identifier
    status = "PENDING",
    payment_id,
    payment_method = "cod",
  } = req.body;

  try {
    const seatsStr = Array.isArray(seats_json) ? JSON.stringify(seats_json) : seats_json;
    const uuid = transaction_uuid || crypto.randomUUID();

    const [result] = await db.promise().query(
      `INSERT INTO orders
       (play_id, activeplay_id, show_date, show_time, seats_json, user_id, amount, transaction_uuid, status, payment_id, payment_method, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        play_id,
        activeplay_id || null,
        show_date,
        show_time,
        seatsStr,
        user_id,
        amount,
        uuid,
        status,
        payment_id || null,
        payment_method,
      ]
    );

    res.status(201).json({
      message: "Order created successfully",
      orderId: result.insertId,
      transaction_uuid: uuid,
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
});

// Update order status (e.g., after successful payment webhook)
router.patch("/orders/:id", async (req, res) => {
  const { id } = req.params;
  const { status, payment_id, paid_at, transaction_uuid } = req.body;

  try {
    let query = `UPDATE orders SET status = ?`;
    const params = [status];

    if (payment_id !== undefined) {
      query += `, payment_id = ?`;
      params.push(payment_id);
    }
    if (paid_at) {
      query += `, paid_at = ?`;
      params.push(paid_at);
    }
    if (transaction_uuid) {
      query += `, transaction_uuid = ?`;
      params.push(transaction_uuid);
    }

    query += ` WHERE id = ?`;
    params.push(id);

    await db.promise().query(query, params);

    res.status(200).json({ message: "Order updated successfully" });
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ message: "Failed to update order" });
  }
});

// Get all orders (admin)
router.get("/orders", async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT o.*, p.playname, u.username, u.email
      FROM orders o
      LEFT JOIN plays p ON o.play_id = p.id
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// Get orders by user
router.get("/orders/user/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const [rows] = await db.promise().query(`
      SELECT o.*, p.playname, p.image_url
      FROM orders o
      JOIN plays p ON o.play_id = p.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [user_id]);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching user orders" });
  }
});

// Get single order
router.get("/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.promise().query(`
      SELECT o.*, p.playname, p.director, p.image_url, u.username, u.email
      FROM orders o
      JOIN plays p ON o.play_id = p.id
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [id]);

    if (rows.length === 0) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Optional: Webhook endpoint example for payment success (Razorpay, etc.)
// You can call this from your payment gateway webhook
router.post("/webhook/payment-success", async (req, res) => {
  // Example payload: { payment_id: 123, order_id: 456, status: "captured", signature: "..." }
  const { payment_id, order_id, status } = req.body;

  try {
    // 1. Update payment status
    await db.promise().query(
      `UPDATE payments SET status = ? WHERE id = ?`,
      [status, payment_id]
    );

    // 2. Update order status and link payment
    await db.promise().query(
      `UPDATE orders SET status = 'PAID', payment_id = ?, paid_at = NOW() WHERE id = ?`,
      [payment_id, order_id]
    );

    // TODO: Here you could also create bookings from seats_json

    res.status(200).json({ message: "Webhook processed" });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ message: "Webhook failed" });
  }
});


const axios = require("axios");
const { getAccessToken, PAYPAL_BASE } = require("./paypal");

router.post("/paypal/create-order", async (req, res) => {
  try {
    const { play_id, activeplay_id, seats, amount, user_id, show_date, show_time } = req.body;

    // Convert NPR to USD (approximate rate: 1 USD = 133 NPR)
    const usdAmount = (amount / 133).toFixed(2);
    const token = await getAccessToken();

    const order = await axios.post(
      `${PAYPAL_BASE}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: "USD",
            value: usdAmount
          },
          description: `Play ${play_id} | Seats ${seats.join(", ")}`
        }]
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    // Save pending order with show_date and show_time
    const [result] = await db.promise().query(
      `INSERT INTO orders
      (play_id, activeplay_id, show_date, show_time, seats_json, user_id, amount, status, transaction_uuid, payment_method)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, 'paypal')`,
      [play_id, activeplay_id, show_date, show_time, JSON.stringify(seats), user_id, amount, order.data.id]
    );

    res.json({
      approvalUrl: order.data.links.find(l => l.rel === "approve").href,
      orderId: result.insertId,
      paypalOrderId: order.data.id,
      activeplay_id: activeplay_id
    });

  } catch (err) {
    console.error("PayPal create-order error:", err.response?.data || err.message || err);
    res.status(500).json({ message: "PayPal order creation failed", error: err.message });
  }
});

router.post("/paypal/capture", async (req, res) => {
  try {
    const { paypalOrderId, orderId } = req.body;
    const token = await getAccessToken();

    const capture = await axios.post(
      `${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}/capture`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (capture.data.status !== "COMPLETED") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    // 1. Mark order paid
    await db.promise().query(
      `UPDATE orders SET status='PAID', paid_at=NOW() WHERE id=?`,
      [orderId]
    );

    // 2. Create bookings (get activeplay_id and show_date from order)
    const [[order]] = await db.promise().query(
      `SELECT * FROM orders WHERE id=?`, [orderId]
    );

    const seats = JSON.parse(order.seats_json);

    for (const seat of seats) {
      const qr = await QRCode.toDataURL(
        `${order.id}-${seat}-${order.user_id}`
      );

      await db.promise().query(
        `INSERT INTO bookings
        (activeplay_id, seatno, payment_id, user_id, qr_code, order_id, show_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          order.activeplay_id,
          seat,
          capture.data.id,
          order.user_id,
          qr,
          order.id,
          order.show_date
        ]
      );
    }

    res.json({ message: "Payment successful & seats booked" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment capture failed" });
  }
});




module.exports = router;
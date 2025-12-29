import React from "react";
import { useLocation, Link } from "react-router-dom";
import "./BookingConfirmed.css";

export default function BookingConfirmed() {
  const location = useLocation();
  const { orderId, play, selectedDate, showTimes, selectedSeats, totalAmount, paymentMethod } = location.state || {};

  if (!orderId) {
    return (
      <div className="booking-confirmed-container">
        <div className="booking-card error">
          <h1>No Booking Found</h1>
          <p>It seems you haven't made a booking yet.</p>
          <Link to="/plays" className="primary-btn">Browse Plays</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-confirmed-container">
      <div className="booking-card success">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>

        <h1>Booking Confirmed!</h1>
        <p className="order-id">Order ID: #{orderId}</p>

        <div className="booking-details">
          <h2>Booking Details</h2>

          <div className="detail-row">
            <span className="label">Play:</span>
            <span className="value">{play?.playname}</span>
          </div>

          <div className="detail-row">
            <span className="label">Date:</span>
            <span className="value">{selectedDate}</span>
          </div>

          <div className="detail-row">
            <span className="label">Time:</span>
            <span className="value">{showTimes}</span>
          </div>

          <div className="detail-row">
            <span className="label">Seats:</span>
            <span className="value">{selectedSeats?.join(", ")}</span>
          </div>

          <div className="detail-row total">
            <span className="label">Total Amount:</span>
            <span className="value">Rs. {totalAmount}</span>
          </div>

          <div className="detail-row">
            <span className="label">Payment Status:</span>
            <span className={`status ${paymentMethod === 'cod' ? 'pending' : 'paid'}`}>
              {paymentMethod === 'cod' ? 'Pending (Pay at Venue)' : 'Paid'}
            </span>
          </div>
        </div>

        {paymentMethod === 'cod' && (
          <div className="cod-instructions">
            <h3>Payment Instructions</h3>
            <ul>
              <li>Please arrive at least 1 hour before the show starts</li>
              <li>Pay Rs. {totalAmount} at the venue counter</li>
              <li>Show this confirmation or your Order ID at the counter</li>
              <li>Your booking will be cancelled if payment is not made before the show</li>
            </ul>
          </div>
        )}

        <div className="action-buttons">
          <Link to="/profile" className="secondary-btn">View My Bookings</Link>
          <Link to="/plays" className="primary-btn">Browse More Plays</Link>
        </div>
      </div>
    </div>
  );
}

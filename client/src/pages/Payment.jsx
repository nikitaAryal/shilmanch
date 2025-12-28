import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import "./Payment.css";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  // Destructure passed data from Seating.jsx
  const { play, selectedDate, showTimes, selectedSeats, userId } = location.state || {};

  const pricePerSeat = 500; // You can adjust this
  const totalAmount = (selectedSeats?.length || 0) * pricePerSeat;

  const [loading, setLoading] = React.useState(false);

  
  const handleEsewaPayment = () => {
    if (totalAmount <= 0) {
      alert("Please select at least one seat before proceeding.");
      return;
    }

    setLoading(true);
    window.location.href = `http://localhost:5000/pay-with-esewa?price=${totalAmount}`;
  };

  if (!selectedSeats || selectedSeats.length === 0) {
    return (
      <div className="payment-empty">
        <h2>
          No seats selected!
        </h2>
        <Link to="/seating" className="text-green-600 hover:underline">
          ← Go back to select seats
        </Link>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h1 className="payment-title">
          Confirm Your Booking
        </h1>
        <p className="payment-subtitle">
          {play?.playname} — {selectedDate} — {showTimes}
        </p>

        {/* Seats Display */}
        <div className="seats-section">
          <h2>
          🎟️ Selected Seats
          </h2>
          <ul className="seat-list">
            {selectedSeats.map((seat, index) => (
              <li key={index} className="seat-item">🎟️ {seat}</li>
            ))}
          </ul>
          
          <div className="price-info">
            <div className="price-row">
              <span>Price per seat</span>
              <span>Rs. {pricePerSeat}</span>
            </div>
            <div className="price-row total">
              <span>Total Amount</span>
              <span>Rs. {totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Proceed Button */}
        <button
          onClick={handleEsewaPayment}
          disabled={loading}
          className={`esewa-btn ${loading ? "loading" : ""}`}
        >
          {loading ? "Redirecting..." : "Proceed to eSewa"}
        </button>

        <p className="note-text">
          You’ll be redirected to eSewa for secure payment.
        </p>

        <button onClick={() => navigate(-1)} className="back-btn">
          ← Go Back
        </button>

        <img
          src="https://upload.wikimedia.org/wikipedia/en/9/9b/ESewa_Logo.png"
          alt="eSewa Logo"
          className="esewa-logo"
        />
      </div>
    </div>
  );
}

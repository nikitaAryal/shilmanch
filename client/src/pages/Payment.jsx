import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ordersAPI, bookingAPI } from "../services/api";
import "./Payment.css";
import axios from "axios";


export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { play, selectedDate, showTimes, selectedSeats } = location.state || {};

  const pricePerSeat = 500;
  const totalAmount = (selectedSeats?.length || 0) * pricePerSeat;

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const handleCODPayment = async () => {
    if (totalAmount <= 0) {
      alert("Please select at least one seat before proceeding.");
      return;
    }

    setLoading(true);
    try {
      // Create order with COD payment method
      const orderResponse = await ordersAPI.create({
        play_id: play.id,
        show_date: selectedDate,
        show_time: showTimes,
        seats_json: selectedSeats,
        user_id: user.id,
        amount: totalAmount,
        status: 'pending',
        payment_method: 'cod',
      });

      const orderId = orderResponse.data.orderId;

      // Create booking entries for each seat
      for (const seatno of selectedSeats) {
        await bookingAPI.create({
          activeplay_id: play.activeplay_id,
          seatno,
          user_id: user.id,
          order_id: orderId,
        });
      }

      // Navigate to confirmation page
      navigate('/booking-confirmed', {
        state: {
          orderId,
          play,
          selectedDate,
          showTimes,
          selectedSeats,
          totalAmount,
          paymentMethod: 'cod'
        }
      });
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEsewaPayment = () => {
    if (totalAmount <= 0) {
      alert("Please select at least one seat before proceeding.");
      return;
    }

    setLoading(true);
    window.location.href = `http://localhost:5000/pay-with-esewa?price=${totalAmount}`;
  };
  
  const handlePayPalPayment = async () => {
  if (totalAmount <= 0) {
    alert("Please select at least one seat");
    return;
  }

  setLoading(true);

  try {
    const res = await axios.post(
      "http://localhost:5000/api/paypal/create-order",
      {
        play_id: play.id,
        activeplay_id: play.activeplay_id,
        show_date: selectedDate,
        show_time: showTimes,
        seats: selectedSeats,
        amount: totalAmount,
        user_id: user.id,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    // 🔥 IMPORTANT: store order reference
    localStorage.setItem("paypal_order_id", res.data.orderId);

    // Redirect user to PayPal
    window.location.href = res.data.approvalUrl;
  } catch (err) {
    console.error(err);
    alert("Failed to initiate PayPal payment");
    setLoading(false);
  }
};

  const handlePayment = () => {
  if (paymentMethod === "cod") {
    handleCODPayment();
  } else if (paymentMethod === "esewa") {
    handleEsewaPayment();
  } else if (paymentMethod === "paypal") {
    handlePayPalPayment(); 
  }
};


  if (!selectedSeats || selectedSeats.length === 0) {
    return (
      <div className="payment-empty">
        <h2>No seats selected!</h2>
        <Link to="/plays">← Go back to select a play</Link>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h1 className="payment-title">Confirm Your Booking</h1>
        <p className="payment-subtitle">
          {play?.playname} - {selectedDate} - {showTimes}
        </p>

        {/* Seats Display */}
        <div className="seats-section">
          <h2>Selected Seats</h2>
          <ul className="seat-list">
            {selectedSeats.map((seat, index) => (
              <li key={index} className="seat-item">{seat}</li>
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

        {/* Payment Method Selection */}
        <div className="payment-method-section">
          <h2>Select Payment Method</h2>
          <div className="payment-options">
            <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="option-content">
                <strong>Cash on Delivery (COD)</strong>
                <small>Pay at the venue before the show</small>
              </span>
            </label>
            <label className={`payment-option ${paymentMethod === 'esewa' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="esewa"
                checked={paymentMethod === 'esewa'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="option-content">
                <strong>eSewa</strong>
                <small>Pay online via eSewa</small>
              </span>
            </label>
            <label className={`payment-option ${paymentMethod === 'paypal' ? 'selected' : ''}`}>
  <input
    type="radio"
    name="paymentMethod"
    value="paypal"
    checked={paymentMethod === 'paypal'}
    onChange={(e) => setPaymentMethod(e.target.value)}
  />
  <span className="option-content">
    <strong>PayPal</strong>
    <small>Pay securely using PayPal</small>
  </span>
</label>

          </div>
        </div>

        {/* Proceed Button */}
        <button
          onClick={handlePayment}
          disabled={loading}
          className={`payment-btn ${loading ? "loading" : ""}`}
        >
          {loading ? "Processing..." : paymentMethod === 'cod' ? "Confirm Booking (COD)" : "Proceed to eSewa"}
        </button>

        {paymentMethod === 'cod' && (
          <p className="note-text">
            Please arrive 1 hour before the show and pay at the venue counter.
          </p>
        )}

        {paymentMethod === 'esewa' && (
          <p className="note-text">
            You'll be redirected to eSewa for secure payment.
          </p>
        )}

        {paymentMethod === 'paypal' && (
          <p className="note-text">
            You'll be redirected to paypal for secure payment.
          </p>
        )}

        <button onClick={() => navigate(-1)} className="back-btn">
          ← Go Back
        </button>
      </div>
    </div>
  );
}

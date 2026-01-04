import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { bookingAPI } from "../services/api";
import "./seating.css";

const Seating = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { play, selectedDate, showTimes } = location.state || {};

  const rows = 6;
  const cols = 10;
  const [seats, setSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [reservedSeats, setReservedSeats] = useState([]);

  const user_id = user?.id;
  const payment_id = null;

  // Fetch booked and reserved seats from backend
  useEffect(() => {
    if (!play?.activeplay_id || !selectedDate) return;

    const fetchBookedSeats = async () => {
      try {
        const response = await bookingAPI.getBookedSeats(play.activeplay_id, selectedDate);
        const booked = response.data.bookedSeats?.map((b) => b.seatno) || [];
        const reserved = response.data.reservedSeats?.map((b) => b.seatno) || [];
        setBookedSeats(booked);
        setReservedSeats(reserved);
      } catch (error) {
        console.error("Error fetching booked seats:", error);
      }
    };

    fetchBookedSeats();
  }, [play?.activeplay_id, selectedDate]);

  // Initialize seat layout with booked and reserved seats marked
  useEffect(() => {
    const initialSeats = [];
    for (let r = 0; r < rows; r++) {
      const rowSeats = [];
      for (let c = 0; c < cols; c++) {
        const seatno = `Row ${r + 1} - Seat ${c + 1}`;
        let status = "available";
        if (bookedSeats.includes(seatno)) status = "booked";
        else if (reservedSeats.includes(seatno)) status = "reserved";
        rowSeats.push({ row: r, col: c, seatno, status });
      }
      initialSeats.push(rowSeats);
    }
    setSeats(initialSeats);
  }, [bookedSeats, reservedSeats]);

  const handleSeatClick = (row, col) => {
    setSeats((prev) =>
      prev.map((r) =>
        r.map((seat) => {
          if (seat.row === row && seat.col === col) {
            if (seat.status === "available") return { ...seat, status: "selected" };
            if (seat.status === "selected") return { ...seat, status: "available" };
          }
          return seat;
        })
      )
    );
  };

  const handleProceedPayment = async () => {
    const selectedSeats = seats
      .flat()
      .filter((seat) => seat.status === "selected")
      .map((seat) => seat.seatno);

    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }

    // Navigate to payment page with selected seats (booking will be done after payment)
    navigate("/payment", {
      state: { play, selectedDate, showTimes, selectedSeats, user_id },
    });
  };

  if (!play) return <p>No play selected!</p>;

  return (
    <div className="seating-page">
      <h2 className="note">
        ⚠️ Note: If you do not show up 1 hour before the show starts, your seats will be
        cancelled automatically.
      </h2>

      <h1>
        {play.playname} - {selectedDate} - {showTimes}
      </h1>

      <h3>Screen</h3>
      <div className="seating-grid">
        {seats.map((rowSeats, rIndex) => (
          <div className="seat-row" key={rIndex}>
            {rowSeats.map((seat, cIndex) => (
              <div
                key={cIndex}
                className={`seat ${seat.status}`}
                onClick={() =>
                  seat.status !== "booked" && seat.status !== "reserved" && handleSeatClick(seat.row, seat.col)
                }
              >
                🪑
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="legend">
        <div>
          <div className="seat available"></div> Available
        </div>
        <div>
          <div className="seat reserved"></div> Reserved
        </div>
        <div>
          <div className="seat booked"></div> Booked
        </div>
        <div>
          <div className="seat selected"></div> Selected
        </div>
      </div>

      <button className="proceed-btn" onClick={handleProceedPayment}>
        Proceed to Payment
      </button>

      <Link to={`/plays/${play.id}`} state={{ play }} className="back-link">
        ← Back to Ticket Page.
      </Link>
    </div>
  );
};

export default Seating;

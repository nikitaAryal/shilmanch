import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import "./seating.css";

const Seating = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { play, selectedDate, showTimes } = location.state || {};

  const rows = 6;
  const cols = 10;
  const [seats, setSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);

  const user_id = 1; // 👈 Replace with actual logged-in user's ID when auth is ready
  const payment_id = null; // you can update this after successful payment

  // Fetch booked seats from backend
  useEffect(() => {
    if (!play?.id) return;

    const fetchBookedSeats = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/booking/active/${play.id}`);
        const data = await res.json();

        // Extract seatnos only for the current play
        const booked = data.bookedSeats.map((b) => b.seatno);
      setBookedSeats(booked);
    } catch (error) {
      console.error("Error fetching booked seats:", error);
    }
  };

    fetchBookedSeats();
  }, [play?.id]);

  // Initialize seat layout with booked seats marked
  useEffect(() => {
    const initialSeats = [];
    for (let r = 0; r < rows; r++) {
      const rowSeats = [];
      for (let c = 0; c < cols; c++) {
        const seatno = `Row ${r + 1} - Seat ${c + 1}`;
        let status = "available";
        if (bookedSeats.includes(seatno)) status = "booked";
        rowSeats.push({ row: r, col: c, seatno, status });
      }
      initialSeats.push(rowSeats);
    }
    setSeats(initialSeats);
  }, [bookedSeats]);

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

  // 🧾 Function to send seat booking to backend
  const bookSeatInBackend = async (seatno) => {
    try {
      const res = await fetch("http://localhost:3000/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activeplay_id: play.id,
          seatno,
          payment_id,
          user_id,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        console.error("Booking failed:", msg);
      }
    } catch (error) {
      console.error("Error booking seat:", error);
    }
  };

  const handleProceedPayment = async () => {
    const selectedSeats = seats
      .flat()
      .filter((seat) => seat.status === "selected")
      .map((seat) => seat.seatno);

    // Book each selected seat in backend
    for (const seatno of selectedSeats) {
      await bookSeatInBackend(seatno);
    }

    const res = await fetch(`http://localhost:3000/api/booking/active/${play.id}`);
  const data = await res.json();
  setBookedSeats(data.bookedSeats.map((b) => b.seatno));

  navigate("/Payment", {
      state: { play, selectedDate, showTimes, selectedSeats },
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
                  seat.status !== "booked" && handleSeatClick(seat.row, seat.col)
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

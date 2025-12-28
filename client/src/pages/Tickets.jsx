import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./tickets.css";

const Tickets = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [play, setPlay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDates, setShowDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showTimes, setShowTimes] = useState([]);

  // helper to get list of dates between start_date and end_date
  const generateDateRange = (start, end) => {
    const dates = [];
    let current = new Date(start);
    const endDate = new Date(end);

    while (current <= endDate) {
      const weekday = current.toLocaleDateString("en-US", { weekday: "short" });
      const date = current.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      dates.push({ date, weekday });
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  useEffect(() => {
    fetch(`http://localhost:3000/api/play/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched single play:", data);
        if (data && data.play) {
          setPlay(data.play);
          if (data.play.start_date && data.play.end_date) {
            const generatedDates = generateDateRange(
              data.play.start_date,
              data.play.end_date
            );
            setShowDates(generatedDates);
          }
          // get show times from DB if available
          if (data.play.time) {
            setShowTimes([data.play.time]);
          }
        } else {
          setPlay(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching play:", err);
        setLoading(false);
      });
  }, [id]);

  const handleTimeClick = () => {
    navigate("/Seating", {
      state: { play, selectedDate, showTimes: showTimes[0] },
    });
  };

  if (loading) return <p>Loading...</p>;
  if (!play) return <p>Play not found!</p>;

  return (
    <div className="ticket-page">
      <div className="play-header">
        <img
          src={`http://localhost:3000/api/${play.image_url}`}
          alt={play.playname}
          className="play-image"
        />
        <div className="details">
          <h1>{play.playname}</h1>
          <p className="desc">{play.description}</p>
          <p><strong>Director:</strong> {play.director}</p>
          <p><strong>Duration:</strong> {play.duration}</p>
          <p><strong>Genre:</strong> {play.genre}</p>
        </div>
      </div>

      {/* 📅 Calendar section */}
      <div className="calendar-section">
        <h2>Select Date</h2>
        <div className="calendar-grid">
          {showDates.map((day, index) => (
            <div
              key={index}
              className={`calendar-box ${
                selectedDate === day.date ? "selected" : ""
              }`}
              onClick={() => setSelectedDate(day.date)}
            >
              <span className="weekday">{day.weekday}</span>
              <span className="date">{day.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ⏰ Time section */}
      <div className="time-section">
        <h2>Show Time</h2>
        <div className="time-boxes">
          {showTimes.length > 0 && (
            <button className="time-btn" onClick={handleTimeClick}>
              {showTimes[0]}
            </button>
          )}
        </div>
      </div>

      <Link to="/plays" className="back-link">
        ← Back to Plays
      </Link>
    </div>
  );
};

export default Tickets;

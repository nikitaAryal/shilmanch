import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { playsAPI } from "../services/api";
import "./tickets.css";

const Tickets = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [play, setPlay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDates, setShowDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showTimes, setShowTimes] = useState([]);

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
    const fetchPlay = async () => {
      try {
        const response = await playsAPI.getById(id);
        const data = response.data;

        if (data && data.play) {
          setPlay(data.play);
          if (data.play.start_date && data.play.end_date) {
            const generatedDates = generateDateRange(
              data.play.start_date,
              data.play.end_date
            );
            setShowDates(generatedDates);
          }
          if (data.play.time) {
            setShowTimes([data.play.time]);
          }
        } else {
          setPlay(null);
        }
      } catch (err) {
        console.error("Error fetching play:", err);
        setPlay(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPlay();
  }, [id]);

  const handleTimeClick = () => {
    if (!selectedDate) {
      alert("Please select a date first");
      return;
    }
    navigate("/seating", {
      state: { play, selectedDate, showTimes: showTimes[0] },
    });
  };

  if (loading) return <p>Loading...</p>;
  if (!play) return <p>Play not found!</p>;

  return (
    <div className="ticket-page">
      <div className="play-header">
        <img
          src={`/api/${play.image_url}`}
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

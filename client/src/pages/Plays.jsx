import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { playsAPI } from "../services/api";

export default function Plays() {
  const [activePlays, setActivePlays] = useState([]);
  const [plays, setPlays] = useState([]);
  const [dataIsLoaded, setDataIsLoaded] = useState(false);

  useEffect(() => {
    const fetchPlays = async () => {
      try {
        const allRes = await playsAPI.getAll();
        const allPlays = Array.isArray(allRes.data) ? allRes.data : [];

        // Get today's date as YYYY-MM-DD string (timezone safe)
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // Helper to extract just the date part (YYYY-MM-DD)
        const getDateStr = (dateValue) => {
          if (!dateValue) return null;
          return dateValue.split('T')[0];
        };

        // Filter active plays: has schedule dates and today is within range
        const active = allPlays.filter(play => {
          const startStr = getDateStr(play.start_date);
          const endStr = getDateStr(play.end_date);
          if (!startStr || !endStr) return false;
          return todayStr >= startStr && todayStr <= endStr;
        });

        // Filter past plays: no schedule OR schedule has ended
        const past = allPlays.filter(play => {
          const startStr = getDateStr(play.start_date);
          const endStr = getDateStr(play.end_date);
          if (!startStr || !endStr) return true; // No schedule = past
          return todayStr > endStr;
        });

        setActivePlays(active);
        setPlays(past);
      } catch (error) {
        console.error("Error fetching plays:", error);
      } finally {
        setDataIsLoaded(true);
      }
    };

    fetchPlays();
  }, []);

  if (!dataIsLoaded) {
    return (
      <div>
        <h1>Please wait some time....</h1>
      </div>
    );
  }

  return (
    <div className="plays-container">
      {/* ==== ACTIVE PLAYS ==== */}
      <h1 className="theatre">🎭 On Theatres</h1>
      <div className="container">
        {activePlays.length > 0 ? (
          activePlays.map((item) => (
            <div className="play-box" key={item.id}>
              {item.image_url && (
                <img
                  src={`/api/${item.image_url}`}
                  alt={item.playname}
                  className="play-image"
                />
              )}
              <strong>Play Name:</strong> {item.playname} <br />
              <Link to={`/plays/${item.id}`}>
                <button className="buy">Buy Tickets Now!</button>
              </Link>
            </div>
          ))
        ) : (
          <p>No active plays at the moment.</p>
        )}
      </div>

      {/* ==== PAST PLAYS ==== */}
      <h1 className="theatre">Past Events</h1>
      <div className="container">
        {plays.length > 0 ? (
          plays.map((item) => (
            <div className="play-box" key={item.id}>
              {item.image_url && (
                <img
                  src={`/api/${item.image_url}`}
                  alt={item.playname}
                  className="play-image"
                />
              )}
              <strong>Play Name:</strong> {item.playname} <br />
              <Link to={`/plays/${item.id}`}>
                <button className="detail">Play Details</button>
              </Link>
            </div>
          ))
        ) : (
          <p>No past events found.</p>
        )}
      </div>
    </div>
  );
}

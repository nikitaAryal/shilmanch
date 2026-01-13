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

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filter active plays: has schedule dates and today is within range
        const active = allPlays.filter(play => {
          if (!play.start_date || !play.end_date) return false;
          const startDate = new Date(play.start_date);
          const endDate = new Date(play.end_date);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          return today >= startDate && today <= endDate;
        });

        // Filter past plays: no schedule OR schedule has ended
        const past = allPlays.filter(play => {
          if (!play.start_date || !play.end_date) return true; // No schedule = past
          const endDate = new Date(play.end_date);
          endDate.setHours(23, 59, 59, 999);
          return today > endDate;
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

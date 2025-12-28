import React, {useEffect, useState} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const PastPlay = () => {
    const { id } = useParams();
    const [play, setPlay] =useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetch(`http://localhost:3000/api/plays`)
        .then((res) => res.json())
        .then((data) => {
            console.log("Fetched all plays:", data);
            if (data &&data.play) {
                setPlay(data.play);
            } else{
                setPlay(null);
            }
            setLoading(false);
        })
        .catch((err) => {
            console.error("error fetching plays:", err);
            setLoading(false);
        });
    }, [id]);

    if (loading) return <p> Loading...</p>;
    if (!play) return <p>Play not found!</p>;
    return(
        <div className="past-container">
            <div className="past-header">
                <img 
                src={`http://localhost:3000/api/${play.image_url}`}
                alt={play.playname}
                className="play-image"
                />
                <div className="past-details">
                    <h1>{play.playname}</h1>
                    <p className="pastdesc">{play.description}</p>
                    <p><strong>Director:</strong>{play.director}</p>
                    <p><strong>Duration:</strong>{play.genre}</p>

                    
                </div>
            </div>
        <Link to="/plays" className="back-link">← Back to Plays</Link>

        </div>
    )
}

export default PastPlay;

import React, { useEffect, useState } from 'react'
import photo from '../assets/LostandFound.png'
import picture from "../assets/homepage.png"

export default function Home() {
  const [userId, setUserId] = useState(null)
  //const [items, setItems] = useState([]);
  const [dataIsLoaded, setDataIsLoaded] = useState(false);

  useEffect(() => {
    {/*const id = localStorage.getItem('userId')
    setUserId(id)*/}

    fetch("http://localhost:3000/api/plays")
            .then((res) => res.json())

            .then((json) => {
              console.log("Fetched data:", json.plays);  // <— check in console
              setItems(Array.isArray(json.plays) ? json.plays : []);
              setDataIsLoaded(true);
            })
            .catch((err) => {
              console.error("Fetch error:", err);
              setDataIsLoaded(true);
            });
          }, []);

  const logout = () => {
    localStorage.removeItem('userId')
    setUserId(null)
  }
  if (!dataIsLoaded) {
        return (
            <div>
                <h1>Please wait some time....</h1>
            </div>
        );
    }
  return (
    <div className='container'>
     {/*} {userId ? (
        <>
          <p>Logged in as userId: {userId}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>Not logged in</p>
      )}
    
    

        
    
     {/* <h1 className="play">On Theatres</h1>
      <div className="container">
        {items.length > 0 ? (
        items.map((item) => (
        <div className='items' key={item.id}>
          
            <img src={photo} alt="Play Image" className='image'/>
          
          <strong>Play Name:</strong>{item.playname}
          <button className='buy'>Buy Tickets Now!</button>
        </div>
        
    ))
  ):(
    <p>No Plays Found.</p>
    
  )}
  
    </div>*/}
    <div className='text'>
      <h1 className='title'>
      Shilpee Theatre Group
      </h1>
      <p className='description'>
      Theatre, for us at Shilpee Theatre Group, is a culture.
A culture of connecting people through stories, finding solutions together for a social problem.
A culture of creating an environment where art and literature come in contact with everyday life.
A culture to openly express and bring forward the voice of the voiceless.
A culture to respect diversity, preserve our history and bind people of varied backgrounds through art.
A culture to encourage a passion for art, be a platform for learning and keep the theatre alive in the hearts of many.
Shilpee Theatre Group is a professional theatre organisation established since 2006 in Kathmandu as a national NGO. It aims to promote theatre as a culture integrated into our daily life. Theatre is a mirror of our society, our lifestyle and our stories. It is not only fun to be a part of theatre but its methods also enrich us as human beings. We welcome you to regular performances at our 60 seat capacity Gothale Theatre. Dabali Cafe and a theatre library will also await you. For those interested to learn acting, storytelling, and various theatre forms, are welcome to join regular training sessions conducted at our workshop space ‘Abhimanch’. And if you are just in the mood to talk art, literature, theatre or politics, our gates are always open. 
      </p>
    </div>
    <img src={picture} alt='Home Page' className='homepic'/>
  </div>
  );
};
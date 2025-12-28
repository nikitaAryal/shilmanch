import React from "react";
import "./Header.css"; // Import the CSS file
import Logo from "../assets/shilpeelogo1.png"


export default function Header() {
  return (
    <header className="header">
      <img src={Logo} alt="Shilpee Logo" className="logo"/>
      <nav>
        <ul className="nav-list">
          <li><a href="/">Home</a></li>
          <li><a href="/plays">Plays</a></li>
          <li><a href="/contact">Contact</a></li>
          <li><a href="/profile">My Account</a></li>

        </ul>
      </nav>
    </header>
  );
}

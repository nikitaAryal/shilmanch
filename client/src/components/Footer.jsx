import React from "react";
import "./Footer.css"; 
import Logo from "../assets/shilpeelogo1.png"

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-left">
          <img src={Logo} alt="Shilpee Logo" className="footer-logo" />
        </div>

        <div className="footer-right">
          <h3>Contact</h3>
          <ul>
            <li>01-4569621</li>
            <li> contact@shilpee.org.np</li>
            <li> Post Box: 8266</li>
            <li> Battisputali, Kathmandu, Nepal</li>
          </ul>
        </div>
      </div>

      <hr />

      <div className="footer-bottom">
        <p>
          © <span className="highlight">Shilpee Theatre Group.</span> All Rights Reserved.  
          <br />
          A professional theatre organization established in 2006.
        </p>
      </div>
    </footer>
  );
}

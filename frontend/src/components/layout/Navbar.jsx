import React from "react";
import "../../styles/dashboard.css";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="navbar">
      
      <div className="navbar-left">
        <h2 className="logo">KitaVisa</h2>

        <nav className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/documents">Documents</Link>
          <a href="#">Applications</a>
          <a href="#">Support</a>
        </nav>
      </div>

      <div className="navbar-right">
        <input
          className="search"
          placeholder="Search..."
        />

        <div className="avatar">👤</div>
      </div>

    </header>
  );
}
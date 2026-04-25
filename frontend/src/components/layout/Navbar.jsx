import React from "react";
import "../../styles/dashboard.css";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="navbar">
      
      <div className="navbar-left">
        <Link to="/" className="logo-link">
          <h2 className="logo">KitaVisa</h2>
        </Link>

        <nav className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/documents">Documents</Link>
        </nav>
      </div>

    </header>
  );
}
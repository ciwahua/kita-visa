import React from "react";
import "../../styles/dashboard.css";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-header">
        <p className="label">Applicant Portal</p>
        <p className="ref">Ref: MY-88291</p>
      </div>

      <nav className="sidebar-links">
        <Link to="/dashboard">Overview</Link>
        <Link to="/documents">Document Vault</Link>
        <a href="#">Visa Status</a>
      </nav>

      <div className="sidebar-footer">
        <a href="#">Help</a>
        <a href="#">Logout</a>
      </div>

    </aside>
  );
}
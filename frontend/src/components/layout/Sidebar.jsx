import React from "react";
import "../../styles/dashboard.css";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-header">
        <b className="label">Applicant Portal</b>
        <p className="ref">Ref: MY-88291</p>
      </div>

      <div className="sidebar-footer">
        <a href="#">Help</a>
        <a href="#">Logout</a>
      </div>

    </aside>
  );
}
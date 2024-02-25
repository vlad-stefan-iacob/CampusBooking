import React, { useState } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";

export const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav>
            <Link to="/" className="title">
                Website
            </Link>
            <div className="menu" onClick={() => setMenuOpen(!menuOpen)}>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <ul className={menuOpen ? "open" : ""}>
                <li>
                    <Link to="/about">About</Link>
                </li>
                <li>
                    <Link to="/services">Services</Link>
                </li>
                <li className="profil-trigger">
                    <div>Profil</div>
                    <div className="dropdown-menu">
                        <Link to="/edit-profile">Edit Profile</Link>
                        <Link to="/logout">Logout</Link>
                    </div>
                </li>
            </ul>
        </nav>
    );
};

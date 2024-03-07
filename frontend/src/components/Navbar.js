import React, { useState } from "react";
import "../style/Navbar.css";
import { Link } from "react-router-dom";

export const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const handleProfilClick = () => {
        setMenuOpen(!menuOpen);
    };

    const storedUser = JSON.parse(localStorage.getItem('user'));
    const { firstName, lastName } = storedUser || {};

    return (
        <nav>
            <Link to="/home" className="title">
                Website
            </Link>
            <div className="menu" onClick={() => setMenuOpen(!menuOpen)}>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <ul className={menuOpen ? "open" : ""}>
                <li>
                    <Link to="/rooms">Sali</Link>
                </li>
                <li>
                    <Link to="/reservations">Rezervari <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                        <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                    </svg></Link>
                </li>
                <li className={`profil-trigger ${menuOpen ? 'active' : ''}`} onClick={handleProfilClick}>
                    <div>{firstName} {lastName} <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-fill" viewBox="0 0 16 16">
                        <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                    </svg></div>
                    <div className="dropdown-menu">
                        <Link to="/edit-profile">Vizualizare profil</Link>
                        <Link to="/logout">Deconectare</Link>
                    </div>
                </li>
            </ul>
        </nav>
    );
};

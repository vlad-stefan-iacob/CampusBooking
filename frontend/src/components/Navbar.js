import React, { useState } from "react";
import "../style/Navbar.css";
import { Link, useLocation } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import campusBookingLogo from '../images/book.png';

export const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const [activeIndex, setActiveIndex] = useState(location.pathname);

    const handleNavClick = (path) => {
        setActiveIndex(path);
        setMenuOpen(false); // Optional: close the menu on click
    };

    const handleProfilClick = () => {
        setMenuOpen(!menuOpen);
    };

    const storedUser = JSON.parse(localStorage.getItem('user'));
    const { firstName, lastName } = storedUser || {};

    return (
        <nav>
            <Link to="/home" className="title" style={{ marginLeft: '1.5%' }}>
                CampusBooking <img src={campusBookingLogo} alt="CampusBooking Logo" className="logo" />
            </Link>
            <div className="menu" onClick={() => setMenuOpen(!menuOpen)}>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <ul className={menuOpen ? "open" : ""} style={{ marginRight: '0.7%' }}>
                <li>
                    <Link
                        to="/home"
                        className={activeIndex === "/home" ? 'active' : ''}
                        onClick={() => handleNavClick("/home")}
                    >
                        Acasa <i className="bi bi-house"></i>
                    </Link>
                </li>
                <li>
                    <Link
                        to="/rooms"
                        className={activeIndex === "/rooms" ? 'active' : ''}
                        onClick={() => handleNavClick("/rooms")}
                    >
                        Sali <i className="bi bi-building"></i>
                    </Link>
                </li>
                <li>
                    <Link
                        to="/reservations"
                        className={activeIndex === "/reservations" ? 'active' : ''}
                        onClick={() => handleNavClick("/reservations")}
                    >
                        Rezervari <i className="bi bi-calendar-plus"></i>
                    </Link>
                </li>
                <li className={`profil-trigger ${menuOpen ? 'active' : ''}`} onClick={handleProfilClick}>
                    <div>{firstName} {lastName} <i className="bi bi-person-fill"></i></div>
                    <div className="dropdown-menu">
                        <Link to="/profile">Profil</Link>
                        <Link to="/logout">Deconectare</Link>
                    </div>
                </li>
            </ul>
        </nav>
    );
};

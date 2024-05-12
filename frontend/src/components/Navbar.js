import React, { useState } from "react";
import "../style/Navbar.css";
import { Link } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import campusBookingLogo from '../images/book.png';

export const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const handleProfilClick = () => {
        setMenuOpen(!menuOpen);
    };

    const storedUser = JSON.parse(localStorage.getItem('user'));
    const { firstName, lastName } = storedUser || {};

    return (
        <nav>
            <Link to="/home" className="title" style={{marginLeft:'1.5%'}}>
                CampusBooking <img src={campusBookingLogo} alt="CampusBooking Logo" className="logo"/>
            </Link>
            <div className="menu" onClick={() => setMenuOpen(!menuOpen)}>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <ul className={menuOpen ? "open" : ""} style={{marginRight:'0.7%'}}>
                <li>
                    <Link to="/home">Acasa <i class="bi bi-house"></i></Link>
                </li>
                <li>
                    <Link to="/rooms">Sali <i className="bi bi-building"></i></Link>
                </li>
                <li>
                    <Link to="/reservations">Rezervari <i class="bi bi-calendar-plus"></i></Link>
                </li>
                <li className={`profil-trigger ${menuOpen ? 'active' : ''}`} onClick={handleProfilClick}>
                    <div>{firstName} {lastName} <i className="bi bi-person-fill"></i></div>
                    <div className="dropdown-menu">
                        <Link to="/profile">Vizualizare profil</Link>
                        <Link to="/logout">Deconectare</Link>
                    </div>
                </li>
            </ul>
        </nav>
    );
};

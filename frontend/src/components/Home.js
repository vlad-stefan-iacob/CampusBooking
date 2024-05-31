import React from 'react';
import {Navbar} from "./Navbar";
import {useNavigate} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactBigCalendar from "./ReactBigCalendar";
import "../style/Calendar.css";

function Home() {

    const navigate = useNavigate();

    const storedUser = JSON.parse(localStorage.getItem('user'));
    const { firstName, lastName, role } = storedUser || {};
    const onRegister = () => {
        navigate('/register');
    };

    function onUsers() {
        navigate('/users');
    }

    return (
        <div className="Home">
            <Navbar/>
            <div className="background-home">

                <div className="welcome-container">
                    <div className="welcome-message">
                        {firstName && lastName && role && (
                            <p>Bine ati venit, {firstName} {lastName}! Rolul dumneavoastra este de {role}.</p>
                        )}
                    </div>
                    <div className="button-group">
                        {role === "ADMIN" && (
                            <>
                                <button type="button" className="btn btn-secondary" onClick={onRegister}>
                                    Inregistrare utilizatori
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={onUsers}>
                                    Vizualizare utilizatori
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="calendar-title">
                    <p style={{ textAlign: "center", color: "white", fontSize: "25px", marginBottom: "5px" }}>
                        {role === "ADMIN" ? "Situatia tuturor rezervarilor" : "Rezervarile mele"}
                    </p>
                </div>
                <ReactBigCalendar />
            </div>
        </div>
    );
}

export default Home;

import React from 'react';
import {Navbar} from "./Navbar";
import {useNavigate} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

function Home() {

    const navigate = useNavigate();

    const storedUser = JSON.parse(localStorage.getItem('user'));
    const { firstName, lastName, role } = storedUser || {};
    const onRegister = () => {
        navigate('/register');
    };

    return (
        <div className="Home">
            <Navbar/>
            <div className="background-home">

                <div className="welcome-message">
                    {firstName && lastName && role && (
                        <p>Bine ati venit, {firstName} {lastName}! Rolul dumneavoastra este de {role}.</p>
                    )}
                </div>

                {role === "ADMIN" && (
                    <button type="button" className="btn btn-secondary" onClick={onRegister}>
                        Inregistrare utilizatori
                    </button>
                )}

            </div>
        </div>
    );
}

export default Home;

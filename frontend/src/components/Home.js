import React from 'react';
import {Navbar} from "./Navbar";
import {useNavigate} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

function Home() {

    const navigate = useNavigate();
    const onRegister = () => {
        navigate('/register');
    };

    return (
        <div className="Home">
            <Navbar/>
            <div className="background-home">
                <button type="button" className="btn btn-secondary" onClick={onRegister}>
                    Inregistrare utilizatori
                </button>
            </div>
        </div>
    );
}

export default Home;

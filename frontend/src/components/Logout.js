import {useNavigate} from 'react-router-dom';
import {setAuthHeader, getAuthToken} from '../helpers/axios_helper';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from "react";

const Logout = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // Get the authentication token
            const token = getAuthToken();

            // Call the backend endpoint to log the user out
            const response = await fetch('http://localhost:8080/api/v1/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                // Clear the authentication token
                setAuthHeader(null);
                // Redirect to the login page or any other desired location
                navigate('/login');
            } else {
                // Handle error case, e.g., unable to log out
                console.error('Failed to log out');
            }
        } catch (error) {
            // Handle network or other errors
            console.error('An error occurred', error);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className="background-login">
            <div className="card">
                <div className="card-body">
                    <label className="text-black" style={{fontWeight: "bold", fontSize:"25px"}} htmlFor="logout-message">
                        Esti sigur ca vrei sa te deloghezi?
                    </label>
                    <div className="button-container">
                        <button type="button" className="btn btn-primary" onClick={handleLogout}>
                            Da
                        </button>
                        <button type="button" className="btn btn-danger" onClick={handleCancel}>
                            Renunta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Logout;

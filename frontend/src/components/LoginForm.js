import React, { useState } from 'react';
import classNames from 'classnames';
import 'bootstrap/dist/css/bootstrap.min.css';
import { request, setAuthHeader } from '../helpers/axios_helper';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "./AuthContext";
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // Import carousel styles
import '../style/LoginForm.css';

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const { login } = useAuth();
    const navigate = useNavigate();
    const [showLoginForm, setShowLoginForm] = useState(false);

    const handleLoginClick = () => {
        setShowLoginForm(true);
    };

    const onChangeHandler = (event) => {
        let name = event.target.name;
        let value = event.target.value;
        if (name === 'email') {
            setEmail(value);
        } else if (name === 'password') {
            setPassword(value);
        }
    };

    const onLogin = async (e) => {
        e.preventDefault();

        // Basic form validation
        let validationErrors = {};
        if (!email.trim()) {
            validationErrors.email = 'Câmp obligatoriu';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            validationErrors.email = 'Format invalid';
        }
        if (!password.trim()) {
            validationErrors.password = 'Câmp obligatoriu';
        } else if (password.length < 6) {
            validationErrors.password = 'Parola trebuie să fie de cel puțin 6 caractere';
        }

        if (Object.keys(validationErrors).length === 0) {
            // If no validation errors, proceed with the login request
            try {
                const response = await request(
                    "POST",
                    "/api/v1/auth/authenticate",
                    {
                        email: email,
                        password: password
                    }
                );

                // Check if the response indicates a successful login
                if (response.data && response.data.token) {
                    setAuthHeader(response.data.token);
                    setErrors({});
                    login(response.data.token);
                    console.log("Autentificare reușită");
                    localStorage.setItem('user', JSON.stringify({
                        firstName: response.data.firstName,
                        lastName: response.data.lastName,
                        role: response.data.role,
                        id: response.data.id }));
                    navigate('/home');
                }
            } catch (error) {
                // Handle other errors, e.g., network issues
                setAuthHeader(null);
                setErrors({ general: 'Email sau parolă incorectă' });
                console.log("Email sau parolă incorectă");
            }
        } else {
            // If there are validation errors, update the state to display the errors
            setErrors(validationErrors);
        }
    };

    return (
        <div className="login-container">
            <div className="carousel-container">
                <Carousel autoPlay infiniteLoop showThumbs={false} showStatus={false} dynamicHeight={false}>
                    <div>
                        <img src="/campus1.webp" alt="First slide" />
                    </div>
                    <div>
                        <img src="/campus2.webp" alt="Second slide" />
                    </div>
                    <div>
                        <img src="/campus3.webp" alt="Third slide" />
                    </div>
                </Carousel>
            </div>
            <div className={`right-container ${showLoginForm ? 'show-login' : ''}`}>
                <div className={`welcome-container ${showLoginForm ? 'hide' : ''}`}>
                    <h2 className="welcome-header">Bine ați venit în CampusBooking! <img src="/book.png" alt="book" /></h2>
                    <button className="btn btn-primary login-button" onClick={handleLoginClick}>Autentificare</button>
                </div>
                <div className={`login-form-container ${showLoginForm ? 'show' : ''}`}>
                    <div className="container form-container">
                        <h2 className="login-header">Autentificare</h2>
                        <form onSubmit={onLogin} className="login-form">
                            <div className="form-group">
                                <label className="text-white" htmlFor="loginName">Email *</label>
                                <input type="email" id="loginName" name="email"
                                       className={classNames("form-control", { "is-invalid": errors.email })}
                                       value={email}
                                       onChange={onChangeHandler} />
                                {errors.email && <span className="text-danger">{errors.email}</span>}
                            </div>

                            <div className="form-group">
                                <label className="text-white" htmlFor="loginPassword">Parolă *</label>
                                <input type="password" id="loginPassword" name="password"
                                       className={classNames("form-control", { "is-invalid": errors.password })}
                                       value={password} onChange={onChangeHandler} />
                                {errors.password && <span className="text-danger">{errors.password}</span>}
                            </div>

                            {errors.general && <div className="alert alert-danger">{errors.general}</div>}
                            <button type="submit" className="btn btn-success">Autentificare</button>
                        </form>
                    </div>
                </div>
                <footer className="footer">
                    <p>Suport: contact@campusbooking.com</p>
                </footer>
            </div>
        </div>
    );
}

export default LoginForm;

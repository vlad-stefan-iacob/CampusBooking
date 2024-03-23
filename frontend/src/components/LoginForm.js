import React, { useState } from 'react';
import classNames from 'classnames';
import 'bootstrap/dist/css/bootstrap.min.css';
import { request, setAuthHeader } from '../helpers/axios_helper';
import { useNavigate } from 'react-router-dom';
import {useAuth} from "./AuthContext";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const { login } = useAuth();
    const navigate = useNavigate();

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
            validationErrors.email = 'Camp obligatoriu';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            validationErrors.email = 'Format invalid';
        }
        if (!password.trim()) {
            validationErrors.password = 'Camp obligatoriu';
        } else if (password.length < 6) {
            validationErrors.password = 'Parola trebuie sa fie de cel putin 6 caractere';
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
                    console.log("Autentificare reusita");
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
                setErrors({ general: 'Email sau parola incorecta' });
                console.log("Email sau parola incorecta");
            }
        } else {
            // If there are validation errors, update the state to display the errors
            setErrors(validationErrors);
        }
    };

    return (
        <div className="background-login">
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
                        <label className="text-white" htmlFor="loginPassword">Parola *</label>
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
    );
}

export default LoginForm;

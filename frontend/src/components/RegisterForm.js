import React, { useState } from 'react';
import classNames from 'classnames';
import 'bootstrap/dist/css/bootstrap.min.css';
import { request } from '../helpers/axios_helper';

function RegisterForm() {
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    const onChangeHandler = (event) => {
        let name = event.target.name;
        let value = event.target.value;
        if (name === 'firstName') {
            setFirstname(value);
        } else if (name === 'lastName') {
            setLastname(value);
        } else if (name === 'email') {
            setEmail(value);
        } else if (name === 'password') {
            setPassword(value);
        }
    };

    const onRegister = async (e) => {
        e.preventDefault();

        // Basic form validation
        let validationErrors = {};
        if (!firstname.trim()) {
            validationErrors.firstname = 'First Name is required';
        }
        if (!lastname.trim()) {
            validationErrors.lastname = 'Last Name is required';
        }
        if (!email.trim()) {
            validationErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            validationErrors.email = 'Invalid email format';
        }
        if (!password.trim()) {
            validationErrors.password = 'Password is required';
        } else if (password.length < 6) {
            validationErrors.password = 'Password must be at least 6 characters';
        }

        if (Object.keys(validationErrors).length === 0) {
            // If no validation errors, proceed with the registration request
            try {
                const response = await request(
                    "POST",
                    "/api/v1/auth/register",
                    {
                        firstname: firstname,
                        lastname: lastname,
                        email: email,
                        password: password
                    }
                );

                // Handle successful registration (if needed)
                console.log("Registration successful:", response.data);
                setRegistrationSuccess(true);
                setErrors({});
            } catch (error) {
                // Handle registration errors, e.g., duplicate email, network issues, etc.
                console.error("Registration error:", error);
                setRegistrationSuccess(false);

                if (error.response && error.response.data) {
                    // Handle specific registration errors from the backend
                    setErrors({ general: error.response.data.message });
                } else {
                    setErrors({ general: 'Registration failed. Please try again.' });
                }
            }
        } else {
            // If there are validation errors, update the state to display the errors
            setRegistrationSuccess(false);
            setErrors(validationErrors);
        }
    };

    return (
        <div className="background">
            <div className="container form-container">
                <h2 className="login-header">Register</h2>
                <form onSubmit={onRegister} className="login-form">
                    <div className="form-group">
                        <label className="text-white" htmlFor="firstName">First Name</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            className={classNames("form-control", { "is-invalid": errors.firstname })}
                            value={firstname}
                            onChange={onChangeHandler}
                        />
                        {errors.firstname && <span className="text-danger">{errors.firstname}</span>}
                    </div>

                    <div className="form-group">
                        <label className="text-white" htmlFor="lastName">Last Name</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            className={classNames("form-control", { "is-invalid": errors.lastname })}
                            value={lastname}
                            onChange={onChangeHandler}
                        />
                        {errors.lastname && <span className="text-danger">{errors.lastname}</span>}
                    </div>

                    <div className="form-group">
                        <label className="text-white" htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className={classNames("form-control", { "is-invalid": errors.email })}
                            value={email}
                            onChange={onChangeHandler}
                        />
                        {errors.email && <span className="text-danger">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label className="text-white" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className={classNames("form-control", { "is-invalid": errors.password })}
                            value={password}
                            onChange={onChangeHandler}
                        />
                        {errors.password && <span className="text-danger">{errors.password}</span>}
                    </div>

                    {registrationSuccess && (
                        <div className="alert alert-success">Registration successful!</div>
                    )}

                    {errors.general && <div className="alert alert-danger">{errors.general}</div>}
                    <button type="submit" className="btn btn-primary">Register</button>
                </form>
            </div>
        </div>
    );
}

export default RegisterForm;

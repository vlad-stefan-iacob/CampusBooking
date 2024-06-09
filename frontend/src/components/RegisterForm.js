import React, { useState } from 'react';
import classNames from 'classnames';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getAuthToken, request } from '../helpers/axios_helper';
import { useNavigate } from 'react-router-dom';
import { Navbar } from "./Navbar";

function RegisterForm() {
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [faculty, setFaculty] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [role, setRole] = useState("");
    const dropdownOptions = ["ADMIN", "STUDENT", "PROFESOR", "ASISTENT"];

    const navigate = useNavigate();

    const onChangeHandler = (event) => {
        let name = event.target.name;
        let value = event.target.value;
        if (name === 'firstName') {
            setFirstname(value);
        } else if (name === 'lastName') {
            setLastname(value);
        } else if (name === 'faculty') {
            setFaculty(value);
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
            validationErrors.firstname = 'Camp obligatoriu';
        }
        if (!lastname.trim()) {
            validationErrors.lastname = 'Camp obligatoriu';
        }
        if (!faculty.trim()) {
            validationErrors.faculty = 'Camp obligatoriu';
        }
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
        if (!role) {
            validationErrors.role = 'Camp obligatoriu';
        }

        if (Object.keys(validationErrors).length === 0) {
            // If no validation errors, proceed with the registration request
            try {
                const token = getAuthToken();
                const response = await request(
                    "POST",
                    "/api/v1/admin/register",
                    {
                        firstname: firstname,
                        lastname: lastname,
                        faculty: faculty,
                        email: email,
                        password: password,
                        role: role
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                // Handle successful registration (if needed)
                console.log("Inregistrare cu succes:", response.data);
                setRegistrationSuccess(true);
                setErrors({});
            } catch (error) {
                // Handle registration errors, e.g., duplicate email, network issues, etc.
                console.error("Inregistrare eronata:", error);
                setRegistrationSuccess(false);

                if (error.response && error.response.data) {
                    // Handle specific registration errors from the backend
                    setErrors({ general: error.response.data.message });
                } else {
                    setErrors({ general: 'Inregistrare esuata. Va rugam reincercati.' });
                }
            }
        } else {
            // If there are validation errors, update the state to display the errors
            setRegistrationSuccess(false);
            setErrors(validationErrors);
        }
    };

    const onBack = () => {
        navigate(-1);
    };

    return (
        <div className="RegisterForm">
            <Navbar />
            <div className="background">
                <div className="container form-container">
                    <div className="card wide-card">
                        <div className="card-body">
                            <h2 className="login-header" style={{ color: "black" }}> Inregistrare utilizatori</h2>
                            <form onSubmit={onRegister} className="login-form" style={{ width: "600px" }}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label className="text-black" htmlFor="lastName">Nume *</label>
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
                                            <label className="text-black" htmlFor="firstName">Prenume *</label>
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
                                            <label className="text-black" htmlFor="faculty">Facultate *</label>
                                            <input
                                                type="text"
                                                id="faculty"
                                                name="faculty"
                                                className={classNames("form-control", { "is-invalid": errors.faculty })}
                                                value={faculty}
                                                onChange={onChangeHandler}
                                            />
                                            {errors.faculty && <span className="text-danger">{errors.faculty}</span>}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label className="text-black" htmlFor="email">Email *</label>
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
                                            <label className="text-black" htmlFor="password">Parola *</label>
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

                                        <div className="form-group">
                                            <label className="text-black" htmlFor="dropdown">Rol *</label>
                                            <select
                                                id="dropdown"
                                                name="dropdown"
                                                className={classNames("form-control", { "is-invalid": errors.role })}
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                            >
                                                <option value="" disabled>-optiuni-</option>
                                                {dropdownOptions.map((option, index) => (
                                                    <option key={index} value={option}>{option}</option>
                                                ))}
                                            </select>
                                            {errors.role && <span className="text-danger">{errors.role}</span>}
                                        </div>
                                    </div>
                                </div>

                                {registrationSuccess && (
                                    <div className="alert alert-success">Inregistrare cu succes!</div>
                                )}

                                {errors.general && <div className="alert alert-danger">{errors.general}</div>}

                                <div className="button-container">
                                    <button type="button" className="btn btn-primary" style={{ marginLeft: "0px" }} onClick={onBack}>
                                        Inapoi
                                    </button>
                                    <button type="submit" className="btn btn-success" style={{ marginLeft: "420px" }}>
                                        Inregistrare
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default RegisterForm;

import React, {useState} from 'react';
import classNames from 'classnames';
import 'bootstrap/dist/css/bootstrap.min.css';
import {getAuthToken, request} from '../helpers/axios_helper';
import {useNavigate} from 'react-router-dom';
import {Navbar} from "./Navbar";

function RegisterForm() {
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
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
            // If no validation errors, proceed with the registration request
            try {
                const token = getAuthToken();
                console.log(role);
                console.log(token);
                const response = await request(
                    "POST",
                    "/api/v1/admin/register",
                    {
                        firstname: firstname,
                        lastname: lastname,
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
                    setErrors({general: error.response.data.message});
                } else {
                    setErrors({general: 'Inregistrare esuata. Va rugam reincercati.'});
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
            <Navbar/>
            <div className="background">
                <div className="container form-container">
                    <h2 className="login-header">Inregistrare utilizatori</h2>
                    <form onSubmit={onRegister} className="login-form">
                        <div className="form-group">
                            <label className="text-white" htmlFor="lastName">Nume *</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                className={classNames("form-control", {"is-invalid": errors.lastname})}
                                value={lastname}
                                onChange={onChangeHandler}
                            />
                            {errors.lastname && <span className="text-danger">{errors.lastname}</span>}
                        </div>

                        <div className="form-group">
                            <label className="text-white" htmlFor="firstName">Prenume *</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                className={classNames("form-control", {"is-invalid": errors.firstname})}
                                value={firstname}
                                onChange={onChangeHandler}
                            />
                            {errors.firstname && <span className="text-danger">{errors.firstname}</span>}
                        </div>

                        <div className="form-group">
                            <label className="text-white" htmlFor="email">Email *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className={classNames("form-control", {"is-invalid": errors.email})}
                                value={email}
                                onChange={onChangeHandler}
                            />
                            {errors.email && <span className="text-danger">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label className="text-white" htmlFor="password">Parola *</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className={classNames("form-control", {"is-invalid": errors.password})}
                                value={password}
                                onChange={onChangeHandler}
                            />
                            {errors.password && <span className="text-danger">{errors.password}</span>}
                        </div>

                        <div className="form-group">
                            <label className="text-white" htmlFor="dropdown">Rol *</label>
                            <select
                                id="dropdown"
                                name="dropdown"
                                className={classNames("form-control", {"is-invalid": !role})}
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="" disabled>-optiuni-</option>
                                {dropdownOptions.map((option, index) => (
                                    <option key={index} value={option}>{option}</option>
                                ))}
                            </select>
                            {!role && <span className="text-danger">Alege un rol</span>}
                        </div>


                        {registrationSuccess && (
                            <div className="alert alert-success">Inregistrare cu succes!</div>
                        )}

                        {errors.general && <div className="alert alert-danger">{errors.general}</div>}

                        <div className="button-container">
                            <button type="submit" className="btn btn-success">
                                Inregistrare
                            </button>
                            <button type="button" className="btn btn-primary" onClick={onBack}>
                                Inapoi
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

    );
}

export default RegisterForm;

import React, { Component } from 'react';
import classNames from 'classnames';
import 'bootstrap/dist/css/bootstrap.min.css';
import { request, setAuthHeader } from '../helpers/axios_helper';

class LoginForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            errors: {}
        };
    }

    onChangeHandler = (event) => {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({ [name]: value });
    };

    onLogin = (e) => {
        e.preventDefault();

        const { email, password } = this.state;

        // Basic form validation
        let errors = {};
        if (!email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = 'Invalid email format';
        }
        if (!password.trim()) {
            errors.password = 'Password is required';
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (Object.keys(errors).length === 0) {
            // If no validation errors, proceed with the login request
            request(
                "POST",
                "/api/v1/auth/authenticate",
                {
                    email: email,
                    password: password
                }).then(
                (response) => {
                    setAuthHeader(response.data.token);
                    this.setState({ errors: {} });
                }).catch(
                (error) => {
                    setAuthHeader(null);
                    this.setState({ errors: {} });
                }
            );
        } else {
            // If there are validation errors, update the state to display the errors
            this.setState({ errors });
        }
    };

    render() {
        const { email, password, errors } = this.state;

        return (
            <div className="background">
                <div className="container form-container">
                    <h2 className="login-header">Login</h2>
                    <form onSubmit={this.onLogin} className="login-form">
                        <div className="form-group">
                            <label className="text-white" htmlFor="loginName">Email</label>
                            <input type="email" id="loginName" name="email"
                                   className={classNames("form-control", { "is-invalid": errors.email })}
                                   value={email}
                                   onChange={this.onChangeHandler} />
                            {errors.email && <span className="text-danger">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label className="text-white" htmlFor="loginPassword">Password</label>
                            <input type="password" id="loginPassword" name="password"
                                   className={classNames("form-control", { "is-invalid": errors.password })}
                                   value={password} onChange={this.onChangeHandler} />
                            {errors.password && <span className="text-danger">{errors.password}</span>}
                        </div>

                        <button type="submit" className="btn btn-primary">Sign in</button>
                    </form>
                </div>
            </div>
        );
    };
}

export default LoginForm;

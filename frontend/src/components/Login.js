import React, {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isError] = useState(false)

    const handleFormSubmit = (e) => {
        e.preventDefault();

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
            // Submit the form - You can implement your login logic here
            console.log('Form submitted successfully!');
            console.log(email);
        } else {
            setErrors(errors);
        }
    };


    return (
        <div className="background">
            <div className="container  form-container">
                <h2 className="login-header">Login</h2>
                <form onSubmit={handleFormSubmit} className="login-form">
                    <div className="form-group" >
                        <label htmlFor="email" className="text-white">Email:</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {errors.email && <span className="text-danger">{errors.email}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="password" className="text-white">Password:</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {errors.password && <span className="text-danger">{errors.password}</span>}
                    </div>
                    <button type="submit" className="btn btn-primary">Login</button>
                    {isError && (<>
                        <span className="text-danger">Email or password is wrong!</span>
                    </>)}
                </form>
            </div>
        </div>
    );
};

export default Login;
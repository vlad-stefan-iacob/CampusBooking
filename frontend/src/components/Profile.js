import React, { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import { getAuthToken } from "../helpers/axios_helper";
import { useNavigate } from "react-router-dom";

function Profile() {
    const [user, setUser] = useState({});
    const [temporaryPermissions, setTemporaryPermissions] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [oldPasswordError, setOldPasswordError] = useState('');
    const [emptyFieldsError, setEmptyFieldsError] = useState(false);
    const [updatedUser, setUpdatedUser] = useState({
        password: "",
        confirmPassword: "",
        oldPassword: ""
    });
    const [successMessage, setSuccessMessage] = useState('');

    const navigate = useNavigate();

    const onBack = () => {
        navigate(-1);
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = getAuthToken();
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const { id } = storedUser || {};

                const response = await fetch(`http://localhost:8080/api/v1/users/user/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData[0]);
                } else {
                    console.error('Failed to fetch user profile:', response.statusText);
                }

                const permissionsResponse = await fetch(`http://localhost:8080/api/v1/users/temporary-permissions/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (permissionsResponse.ok) {
                    const permissionsData = await permissionsResponse.json();
                    setTemporaryPermissions(permissionsData);
                } else {
                    console.error('Failed to fetch temporary permissions:', permissionsResponse.statusText);
                }
            } catch (error) {
                console.error('Error fetching user profile or permissions:', error);
            }
        };

        fetchUserProfile();
    }, []);

    const handleInputChange = async (e) => {
        const { name, value } = e.target;

        if (name === 'confirmPassword') {
            setPasswordMatch(updatedUser.password === value); // Compare with the new value
        }

        // Update the updatedUser state
        setUpdatedUser({
            ...updatedUser,
            [name]: value
        });

        if (name === 'oldPassword') {
            try {
                const token = getAuthToken();
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const { id } = storedUser || {};
                const response = await fetch(`http://localhost:8080/api/v1/users/verify-password/${id}/${value}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const matches = await response.json();
                    if (matches) {
                        setOldPasswordError('');
                    } else {
                        setOldPasswordError('Parola veche nu este corecta.');
                    }
                } else {
                    console.error("Failed to verify password:", response.statusText);
                }
            } catch (error) {
                console.error("Error verifying password:", error);
                setOldPasswordError('A aparut o eroare. Va rugam sa incercati din nou mai tarziu.');
            }
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitted(true);

        if (!updatedUser.password || !updatedUser.confirmPassword || !updatedUser.oldPassword) {
            setEmptyFieldsError(true);
            return;
        } else {
            setEmptyFieldsError(false);
        }

        if (!passwordMatch || oldPasswordError) {
            return;
        }

        try {
            const token = getAuthToken();
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const { id } = storedUser || {};
            const response = await fetch(`http://localhost:8080/api/v1/users/update-user-password/${id}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedUser),
            });

            if (response.ok) {
                setUpdatedUser({
                    password: '',
                    confirmPassword: '',
                    oldPassword: ''
                });
                const updatedUserInfo = await fetch(`http://localhost:8080/api/v1/users/user/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                }).then(response => response.json());
                setUser(updatedUserInfo[0]);
                setSuccessMessage('Parola schimbata cu succes');
                document.getElementById('oldPassword').value = '';
            } else {
                console.error("Failed to update user:", response.statusText);
            }
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    return (
        <div className="Profile">
            <Navbar />
            <div className="background-home p-4 d-flex justify-content-center align-items-center">
                <div className="container">
                    <div className="card p-4" style={{ maxWidth: 'none', width: '60%' }}>
                        <h4 className="card-title text-center mb-4">Profil</h4>
                        <form onSubmit={handleUpdate}>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="card-body">
                                        {user && (
                                            <div>
                                                <p><b>Nume:</b> {user.lastname}</p>
                                                <p><b>Prenume:</b> {user.firstname}</p>
                                                <p><b>Facultate:</b> {user.faculty}</p>
                                                <p><b>Email:</b> {user.email}</p>
                                                <p><b>Rol:</b> {user.role}</p>
                                                {user.role !== 'ADMIN' && (
                                                    <p><b>Permisiuni temporare:</b> {temporaryPermissions.join(', ')}</p>
                                                )}
                                            </div>
                                        )}
                                        {!user && <p>User not found</p>}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="oldPassword">Vechea parola</label>
                                        <input
                                            type="password"
                                            className={`form-control ${oldPasswordError ? 'is-invalid' : ''}`}
                                            id="oldPassword"
                                            name="oldPassword"
                                            onChange={(e) => handleInputChange(e)}
                                        />
                                        {oldPasswordError && (
                                            <div className="invalid-feedback">{oldPasswordError}</div>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="password">Noua parola</label>
                                        <input
                                            type="password"
                                            className={`form-control ${submitted && !passwordMatch ? 'is-invalid' : ''}`}
                                            id="password"
                                            name="password"
                                            value={updatedUser.password}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="confirmPassword">Confirma noua parola</label>
                                        <input
                                            type="password"
                                            className={`form-control ${submitted && !passwordMatch ? 'is-invalid' : ''}`}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={updatedUser.confirmPassword}
                                            onChange={handleInputChange}
                                        />
                                        {submitted && !passwordMatch && (
                                            <div className="invalid-feedback">Parolele nu se potrivesc.</div>
                                        )}
                                    </div>
                                    {emptyFieldsError && (
                                        <div className="text-danger">Toate câmpurile trebuie completate.</div>
                                    )}
                                    {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                    <button type="submit" className="btn btn-warning" style={{ marginTop: "5%" }}>Actualizeaza</button>
                                </div>
                                <div className="col-md-6 d-flex justify-content-between">
                                    <button type="button" className="btn btn-primary" style={{ marginLeft: "0px" }} onClick={onBack}>
                                        Inapoi
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;

import {Navbar} from "./Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {getAuthToken} from "../helpers/axios_helper";

function Users() {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [updatedUser, setUpdatedUser] = useState({
        firstname: "",
        lastname: "",
        email: "",
        role: "",
        password: "",
        confirmPassword: "",
        oldPassword: ""
    });
    const [submitted, setSubmitted] = useState(false);
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [oldPasswordError, setOldPasswordError] = useState('');
    const [selectedTab, setSelectedTab] = useState('ADMIN');
    const filteredUsersSelectedTab = users.filter((user) => user.role === selectedTab);
    const [updatedUserValidations, setUpdatedUserValidations] = useState({
        firstname: true,
        lastname: true,
        email: true,
        role: true,
        password: true,
    });

    const storedUser = JSON.parse(localStorage.getItem('user'));
    const {role} = storedUser || {};

    useEffect(() => {
        const token = getAuthToken();
        fetch("http://localhost:8080/api/v1/users/all-users", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        })
            .then(response => response.json())
            .then(data => setUsers(data))
            .catch(error => console.error("Error fetching data:", error));
    }, []);

    function onRegister() {
        navigate('/register');
    }

    const updateUser = (user) => {
        setSelectedUser(user);
        setUpdatedUser({
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role,
            password: ''
        });
        setShowUpdateModal(true);
    };

    const deleteUser = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const closeModal = () => {
        setShowDeleteModal(false);
        setShowUpdateModal(false);
    };

    const handleInputChange = async (e) => {
        const {name, value} = e.target;

        const isEmpty = value.trim() === '';
        // Update the state based on the field
        setUpdatedUser((prevState) => ({
            ...prevState,
            [name]: value,
        }));
        setUpdatedUserValidations((prevValidations) => ({
            ...prevValidations,
            [name]: !isEmpty,
        }));

        if (name === 'confirmPassword') {
            setPasswordMatch(updatedUser.password === value); // Compare with the new value
        }

        if (name === 'oldPassword') {
            try {
                const token = getAuthToken();
                const response = await fetch(`http://localhost:8080/api/v1/users/verify-password/${selectedUser.id}/${value}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const matches = await response.json(); // Get the response content
                    if (matches) {
                        // Password matches, clear error message
                        setOldPasswordError('');
                    } else {
                        // Password does not match, set error message
                        setOldPasswordError('Parola veche nu este corecta.');
                    }
                } else {
                    // Handle other HTTP errors if necessary
                    console.error("Failed to verify password:", response.statusText);
                }
            } catch (error) {
                console.error("Error verifying password:", error);
                // Set error message for network error
                setOldPasswordError('A aparut o eroare. Va rugam sa incercati din nou mai tarziu.');
            }
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        if (!passwordMatch || oldPasswordError) {
            return; // Don't submit the form if passwords don't match or old password is incorrect
        }
        try {
            // Make a PUT request to the backend endpoint
            const token = getAuthToken();
            const response = await fetch(`http://localhost:8080/api/v1/users/update-user/${selectedUser.id}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedUser),
            });

            if (response.ok) {
                // If successful, close the modal and refresh the user data
                closeModal();
                setUpdatedUser(prevState => ({
                    ...prevState,
                    confirmPassword: '',
                    oldPassword: ''
                }));
                // Fetch updated data from the backend
                const updatedUser = await fetch("http://localhost:8080/api/v1/users/all-users", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                })
                    .then(response => response.json())
                    .catch(error => console.error("Error fetching updated data:", error));
                setUsers(updatedUser);
            } else {
                // Handle errors, e.g., display an error message
                console.error("Failed to update user:", response.statusText);
            }
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    const handleDelete = async () => {
        try {
            // Make a DELETE request to the backend endpoint
            const token = getAuthToken();
            const response = await fetch(`http://localhost:8080/api/v1/users/delete-user/${selectedUser.id}`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.ok) {
                // If successful, close the modal and refresh the room data
                closeModal();
                // Fetch updated data from the backend
                const updatedUsers = await fetch("http://localhost:8080/api/v1/users/all-users", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                })
                    .then(response => response.json())
                    .catch(error => console.error("Error fetching updated data:", error));
                setUsers(updatedUsers);
            } else {
                // Handle errors, e.g., display an error message
                console.error("Failed to delete user:", response.statusText);
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    return (
        <div className="Users">
            <Navbar/>
            <div className="background-home p-4">
                <h2 className="text-white mb-4">
                    Informatii despre utilizatori

                    {role === "ADMIN" && (
                        <button type="button" className="btn btn-secondary" onClick={onRegister}>
                            Inregistrare utilizatori
                        </button>
                    )}
                </h2>
                {/* Tabs for different user roles */}
                <ul className="nav nav-tabs">
                    <li className="nav-item">
                        <button
                            className={`nav-link ${selectedTab === 'ADMIN' ? 'active' : ''}`}
                            style={{
                                color: selectedTab === 'ADMIN' ? 'black' : 'white',
                                border: selectedTab === 'ADMIN' ? '1px solid white' : '1px solid white',
                            }}
                            onClick={() => setSelectedTab('ADMIN')}
                        >
                            Admin
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${selectedTab === 'PROFESOR' ? 'active' : ''}`}
                            style={{
                                color: selectedTab === 'PROFESOR' ? 'black' : 'white',
                                border: selectedTab === 'PROFESOR' ? '1px solid white' : '1px solid white',
                            }}
                            onClick={() => setSelectedTab('PROFESOR')}
                        >
                            Profesor
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${selectedTab === 'STUDENT' ? 'active' : ''}`}
                            style={{
                                color: selectedTab === 'STUDENT' ? 'black' : 'white',
                                border: selectedTab === 'STUDENT' ? '1px solid white' : '1px solid white',
                            }}
                            onClick={() => setSelectedTab('STUDENT')}
                        >
                            Student
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${selectedTab === 'ASISTENT' ? 'active' : ''}`}
                            style={{
                                color: selectedTab === 'ASISTENT' ? 'black' : 'white',
                                border: selectedTab === 'ASISTENT' ? '1px solid white' : '1px solid white',
                            }}
                            onClick={() => setSelectedTab('ASISTENT')}
                        >
                            Asistent
                        </button>
                    </li>
                    {/* Add more tabs as needed */}
                </ul>
                <div className="table-responsive">
                    <table className="table table-bordered">
                        <thead className="thead" style={{background: 'white'}}>
                        <tr>
                            <th scope="col">Nume</th>
                            <th scope="col">Prenume</th>
                            <th scope="col">Email</th>
                            <th scope="col">Rol</th>
                            <th scope="col">Actiuni</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredUsersSelectedTab.map(user => (
                            <tr key={user.id}>
                                <td className="text-white">{user.lastname}</td>
                                <td className="text-white">{user.firstname}</td>
                                <td className="text-white">{user.email}</td>
                                <td className="text-white">{user.role}</td>
                                <td className="text-white">
                                    <button type="button" className="btn btn-danger"
                                            onClick={() => deleteUser(user)}>
                                        Stergere
                                    </button>

                                    <button type="button" className="btn btn-warning ml-lg-2"
                                            onClick={() => updateUser(user)}>
                                        Actualizare
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/*Updated user Modal*/}
                <div className={`modal ${showUpdateModal ? 'show' : ''}`} tabIndex="-1" role="dialog"
                     style={{display: showUpdateModal ? 'block' : 'none'}}>
                    <div className="modal-dialog" role="document" style={{maxWidth: 'none', width: '60%'}}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Actualizeaza utilizatorul</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"
                                        onClick={closeModal}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleUpdate}>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="updateLastName">Nume *</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${updatedUserValidations.lastname ? '' : 'is-invalid'}`}
                                                    id="updateLastName"
                                                    name="lastname"
                                                    value={updatedUser.lastname}
                                                    onChange={(e) => handleInputChange(e, true)}
                                                    required
                                                />
                                                {!updatedUserValidations.lastname && (
                                                    <div className="invalid-feedback">
                                                        Numele este obligatoriu.
                                                    </div>
                                                )}
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="updateFirstName">Prenume *</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${updatedUserValidations.firstname ? '' : 'is-invalid'}`}
                                                    id="updateFirstName"
                                                    name="firstname"
                                                    value={updatedUser.firstname}
                                                    onChange={(e) => handleInputChange(e, true)}
                                                    required
                                                />
                                                {!updatedUserValidations.firstname && (
                                                    <div className="invalid-feedback">
                                                        Prenumele este obligatoriu.
                                                    </div>
                                                )}
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="updatedEmail">Email *</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${updatedUserValidations.email ? '' : 'is-invalid'}`}
                                                    id="updatedEmail"
                                                    name="email"
                                                    value={updatedUser.email}
                                                    onChange={(e) => handleInputChange(e, true)}
                                                    required
                                                />
                                                {!updatedUserValidations.email && (
                                                    <div className="invalid-feedback">
                                                        Email-ul este obligatoriu.
                                                    </div>
                                                )}
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="type">Rol *</label>
                                                <select
                                                    className={`form-control ${updatedUserValidations.role ? '' : 'is-invalid'}`}
                                                    id="role"
                                                    name="role"
                                                    value={updatedUser.role}
                                                    onChange={(e) => handleInputChange(e, true)}
                                                    required
                                                >
                                                    <option value="" disabled>Selectează rolul</option>
                                                    <option value="ADMIN">ADMIN</option>
                                                    <option value="PROFESOR">PROFESOR</option>
                                                    <option value="STUDENT">STUDENT</option>
                                                    <option value="ASISTENT">ASISTENT</option>
                                                    {/* Add more options as needed */}
                                                </select>
                                            </div>
                                        </div>
                                        {/* Second Column */}
                                        <div className="col-md-6">
                                            <p className="text mb-4"><i className="bi bi-info-square"></i> Daca nu
                                                se doreste schimbarea parolei, campurile de mai jos vor fi lasate libere
                                            </p>
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
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-warning">Actualizeaza</button>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Anuleaza
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete User Modal */}
                <div className={`modal ${showDeleteModal ? 'show' : ''}`} tabIndex="-1" role="dialog"
                     style={{display: showDeleteModal ? 'block' : 'none'}}>
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Sterge urilizator</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"
                                        onClick={closeModal}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>Sunteti sigur ca doriti sa stergeti utilizatorul?</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-danger" onClick={handleDelete}>Sterge</button>
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Anuleaza
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Users;

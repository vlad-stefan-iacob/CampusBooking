import { Navbar } from "./Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from "react";
import { getAuthToken } from "../helpers/axios_helper";
import {useNavigate} from "react-router-dom";

function Users() {
    const [users, setUsers] = useState([]);
    const [temporaryPermissionsMap, setTemporaryPermissionsMap] = useState({});
    const navigate = useNavigate();
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
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
    const [searchInput, setSearchInput] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const filteredUsersSelectedTab = users.filter((user) => user.role === selectedTab);
    const [updatedUserValidations, setUpdatedUserValidations] = useState({
        firstname: true,
        lastname: true,
        faculty: true,
        email: true,
        role: true,
        password: true,
    });

    const storedUser = JSON.parse(localStorage.getItem('user'));
    const { role } = storedUser || {};

    const permissionsOptions = ["STUDENT", "PROFESOR", "ASISTENT"];

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
            .then(data => {
                setUsers(data);
                data.forEach(user => {
                    if (user.role !== 'ADMIN') {
                        fetch(`http://localhost:8080/api/v1/users/temporary-permissions/${user.id}`, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`,
                            },
                        })
                            .then(response => response.json())
                            .then(permissions => {
                                setTemporaryPermissionsMap(prevState => ({
                                    ...prevState,
                                    [user.id]: permissions
                                }));
                            })
                            .catch(error => console.error("Error fetching temporary permissions:", error));
                    }
                });
            })
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
            faculty: user.faculty,
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

    const setPermissions = (user) => {
        setSelectedUser(user);
        setShowPermissionsModal(true);
    };

    const closeModal = () => {
        setShowDeleteModal(false);
        setShowUpdateModal(false);
        setShowPermissionsModal(false);
    };

    const handleInputChange = async (e) => {
        const { name, value } = e.target;

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
                        setOldPasswordError('Parola veche nu este corectă.');
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

    const handlePermissionChange = async (event) => {
        const { value, checked } = event.target;
        try {
            const token = getAuthToken();
            const url = `http://localhost:8080/api/v1/users/${checked ? 'add' : 'remove'}-temporary-permission/${selectedUser.id}?temporaryRole=${value}`;
            await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                }
            });
            console.log(`Permisiunea temporară ${value} a fost ${checked ? 'adăugată' : 'eliminată'}.`);

            // Actualizează starea permisiunilor temporare
            if (checked) {
                setTemporaryPermissionsMap(prevState => ({
                    ...prevState,
                    [selectedUser.id]: [...prevState[selectedUser.id], value]
                }));
            } else {
                setTemporaryPermissionsMap(prevState => ({
                    ...prevState,
                    [selectedUser.id]: prevState[selectedUser.id].filter(permission => permission !== value)
                }));
            }
        } catch (error) {
            console.error(`Eroare la ${checked ? 'adăugarea' : 'eliminarea'} permisiunii temporare ${value}:`, error);
        }
    };

    const searchUser = () => {
        const searchValue = searchInput.toLowerCase();
        const user = users.find(user =>
            user.firstname.toLowerCase().includes(searchValue) ||
            user.lastname.toLowerCase().includes(searchValue)
        );

        if (user) {
            setSelectedTab(user.role);
            setSearchResults([user]);
        } else {
            alert('Utilizatorul nu a fost găsit.');
        }
    };

    return (
        <div className="Users">
            <Navbar />
            <div className="background-home p-4">
                <h2 className="text-white mb-4 d-flex align-items-center">
                    Informații despre utilizatori

                    {role === "ADMIN" && (
                        <button type="button" className="btn btn-secondary" onClick={onRegister} style={{marginRight:"570px"}}>
                            Înregistrare utilizatori
                        </button>
                    )}
                    <div className="search-box d-flex align-items-center">
                        <input
                            type="text"
                            placeholder="Căutați utilizatori..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="form-control mr-2"
                        />
                        <button onClick={searchUser} className="btn btn-primary" style={{marginLeft:"0px"}}><i className="bi bi-search"></i></button>
                    </div>
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
                            onClick={() => {
                                setSelectedTab('ADMIN');
                                setSearchResults([]);
                            }}
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
                            onClick={() => {
                                setSelectedTab('PROFESOR');
                                setSearchResults([]);
                            }}
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
                            onClick={() => {
                                setSelectedTab('STUDENT');
                                setSearchResults([]);
                            }}
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
                            onClick={() => {
                                setSelectedTab('ASISTENT');
                                setSearchResults([]);
                            }}
                        >
                            Asistent
                        </button>
                    </li>
                    {/* Add more tabs as needed */}
                </ul>
                <div className="table-responsive">
                    <table className="table table-bordered">
                        <thead className="thead" style={{ background: 'white' }}>
                        <tr>
                            <th scope="col">Nume</th>
                            <th scope="col">Prenume</th>
                            <th scope="col">Facultate</th>
                            <th scope="col">Email</th>
                            <th scope="col">Rol</th>
                            {selectedTab !== 'ADMIN' && (
                                <th scope="col">Permisiuni temporare</th>
                            )}
                            <th scope="col">Acțiuni</th>
                        </tr>
                        </thead>
                        <tbody>
                        {(searchResults.length > 0 ? searchResults : filteredUsersSelectedTab).map(user => (
                            <tr key={user.id}>
                                <td className="text-white">{user.lastname}</td>
                                <td className="text-white">{user.firstname}</td>
                                <td className="text-white">{user.faculty}</td>
                                <td className="text-white">{user.email}</td>
                                <td className="text-white">{user.role}</td>
                                {selectedTab !== 'ADMIN' && (
                                    <td className="text-white">
                                        {temporaryPermissionsMap[user.id]?.join(', ') || ''}
                                    </td>
                                )}
                                <td className="text-white">
                                    <button type="button" className="btn btn-danger"
                                            onClick={() => deleteUser(user)}>
                                        Ștergere
                                    </button>
                                    <button type="button" className="btn btn-warning ml-lg-2"
                                            onClick={() => updateUser(user)}>
                                        Actualizare
                                    </button>
                                    {user.role !== 'ADMIN' && (
                                        <button type="button" className="btn btn-info ml-lg-2"
                                                onClick={() => setPermissions(user)}>
                                            Setare permisiuni
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Update user Modal */}
                <div className={`modal ${showUpdateModal ? 'show' : ''}`} tabIndex="-1" role="dialog"
                     style={{ display: showUpdateModal ? 'block' : 'none' }}>
                    <div className="modal-dialog" role="document" style={{ maxWidth: 'none', width: '60%' }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Actualizează utilizatorul</h5>
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
                                                <label htmlFor="updateFaculty">Facultate *</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${updatedUserValidations.faculty ? '' : 'is-invalid'}`}
                                                    id="updateFaculty"
                                                    name="faculty"
                                                    value={updatedUser.faculty}
                                                    onChange={(e) => handleInputChange(e, true)}
                                                    required
                                                />
                                                {!updatedUserValidations.faculty && (
                                                    <div className="invalid-feedback">
                                                        Facultatea este obligatorie.
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
                                            <p className="text mb-4"><i className="bi bi-info-square"></i> Dacă nu
                                                se dorește schimbarea parolei, câmpurile de mai jos vor fi lăsate libere
                                            </p>
                                            <div className="form-group">
                                                <label htmlFor="oldPassword">Vechea parolă</label>
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
                                                <label htmlFor="password">Noua parolă</label>
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
                                                <label htmlFor="confirmPassword">Confirmă noua parolă</label>
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
                                    <button type="submit" className="btn btn-warning">Actualizează</button>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Anulează
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete User Modal */}
                <div className={`modal ${showDeleteModal ? 'show' : ''}`} tabIndex="-1" role="dialog"
                     style={{ display: showDeleteModal ? 'block' : 'none' }}>
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Șterge utilizator</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"
                                        onClick={closeModal}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>Sunteți sigur că doriți să ștergeți utilizatorul?</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-danger" onClick={handleDelete}>Șterge</button>
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Anulează
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Set Permissions Modal */}
                <div className={`modal ${showPermissionsModal ? 'show' : ''}`} tabIndex="-1" role="dialog"
                     style={{ display: showPermissionsModal ? 'block' : 'none' }}>
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Setare permisiuni temporare</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"
                                        onClick={closeModal}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="form-group">
                                        <label>Permisiuni temporare:</label>
                                        {selectedUser && permissionsOptions.filter(permission => permission !== selectedUser.role).map((permission, index) => (
                                            <div key={index} className="form-check">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id={`perm_${index}`}
                                                    value={permission}
                                                    checked={temporaryPermissionsMap[selectedUser.id]?.includes(permission) || false}
                                                    onChange={handlePermissionChange}
                                                />
                                                <label className="form-check-label" htmlFor={`perm_${index}`}>
                                                    {permission}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Inchide</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Users;

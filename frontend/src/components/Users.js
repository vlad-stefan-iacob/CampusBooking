import { Navbar } from "./Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

function Users() {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    const storedUser = JSON.parse(localStorage.getItem('user'));
    const { role } = storedUser || {};

    useEffect(() => {

        fetch("http://localhost:8080/api/v1/users/all-users", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(response => response.json())
            .then(data => setUsers(data))
            .catch(error => console.error("Error fetching data:", error));
    }, []);

    function onRegister() {
        navigate('/register');
    }

    return (
        <div className="Users">
            <Navbar />
            <div className="background-home p-4">
                <h2 className="text-white mb-4">
                    Informatii despre utilizatori

                    {role === "ADMIN" && (
                        <button type="button" className="btn btn-secondary" onClick={onRegister}>
                            Inregistrare utilizatori
                        </button>
                    )}
                </h2>
                <div className="table-responsive">
                    <table className="table table-bordered">
                        <thead className="thead" style={{ background: 'white' }}>
                        <tr>
                            <th scope="col">Nume</th>
                            <th scope="col">Prenume</th>
                            <th scope="col">Email</th>
                            <th scope="col">Rol</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="text-white">{user.lastname}</td>
                                <td className="text-white">{user.firstname}</td>
                                <td className="text-white">{user.email}</td>
                                <td className="text-white">{user.role}</td>
                                {/* Add more columns based on the data structure */}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Users;

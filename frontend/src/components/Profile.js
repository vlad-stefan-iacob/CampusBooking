import React, { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';

function Profile() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                // Retrieve user data from local storage
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const { id } = storedUser || {};
                console.log(storedUser);

                if (!id) {
                    console.error('User ID not found in local storage');
                    return;
                }

                // Fetch user profile using the retrieved user ID
                const response = await fetch(`http://localhost:8080/api/v1/users/user/${id}`);
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    console.error('Failed to fetch user profile:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        fetchUserProfile();
    }, []);

    return (
        <div className="Profile">
            <Navbar />
            <div className="background-home">
                {user && (
                    <table className="table table-bordered">
                        <thead className="thead-light">
                        <tr>
                            <th scope="col">First Name</th>
                            <th scope="col">Last Name</th>
                            <th scope="col">Email</th>
                            {/* Add more columns as needed */}
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>{user.firstname}</td>
                            <td>{user.lastname}</td>
                            <td>{user.email}</td>
                            {/* Add more user details as needed */}
                        </tr>
                        </tbody>
                    </table>
                )}
                {!user && <p>User not found</p>}
            </div>
        </div>
    );
}

export default Profile;

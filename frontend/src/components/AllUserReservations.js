import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthToken } from "../helpers/axios_helper";
import { Navbar } from "./Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';

function AllUserReservations() {
    const [reservations, setReservations] = useState([]);
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState('VIITOR');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);

    const filteredReservationsSelectedTab = reservations.filter((reservation) => reservation.status === selectedTab);

    useEffect(() => {
        const fetchUserReservations = async () => {
            try {
                const token = getAuthToken();
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const { id } = storedUser || {};
                if (!id) {
                    console.error("User ID not found in local storage");
                    return;
                }
                const response = await fetch(`http://localhost:8080/api/v1/reservations/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    // Fetch room details for each reservation and add room name
                    const formattedData = await Promise.all(data.map(async reservation => {
                        const roomResponse = await fetch(`http://localhost:8080/api/v1/rooms/room/${reservation.roomId}`, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`,
                            },
                        });
                        if (roomResponse.ok) {
                            const roomData = await roomResponse.json();
                            reservation.roomName = roomData[0].name; // Add room name to reservation object
                        } else {
                            console.error("Failed to fetch room details for reservation:", roomResponse.statusText);
                        }
                        // Format date and time strings
                        reservation.date = formatDate(reservation.date);
                        reservation.reservationDateTime = formatDateAndTime(reservation.reservationDateTime);
                        return reservation;
                    }));
                    setReservations(formattedData);
                } else {
                    console.error("Failed to fetch reservations:", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching reservations:", error);
            }
        };

        fetchUserReservations();
    }, []);

    // Function to format date (day-month-year)
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
    };

    // Function to format date and time (day-month-year hour:minute)
    const formatDateAndTime = (dateTimeString) => {
        const dateTime = new Date(dateTimeString);
        return `${dateTime.toLocaleDateString('en-GB')} ${dateTime.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit'
        })}`;
    };

    function updateReservation(reservation) {
        // Implement reservation update logic here
    }

    const onBack = () => {
        navigate(-1);
    };
    const closeModal = () => {
        setShowDeleteModal(false);
    };

    const deleteReservation = (reservation) => {
        setSelectedReservation(reservation); // Set the selected reservation
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        try {
            const token = getAuthToken();
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const { id } = storedUser || {};
            const response = await fetch(`http://localhost:8080/api/v1/reservations/delete-reservation/${selectedReservation.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (response.ok) {
                closeModal();

                // Fetch updated reservations data from the backend
                const updatedReservationsResponse = await fetch(`http://localhost:8080/api/v1/reservations/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (updatedReservationsResponse.ok) {
                    const updatedReservations = await updatedReservationsResponse.json();
                    // Fetch room details for each reservation and add room name
                    const formattedData = await Promise.all(updatedReservations.map(async reservation => {
                        const roomResponse = await fetch(`http://localhost:8080/api/v1/rooms/room/${reservation.roomId}`, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`,
                            },
                        });
                        if (roomResponse.ok) {
                            const roomData = await roomResponse.json();
                            reservation.roomName = roomData[0].name; // Add room name to reservation object
                        } else {
                            console.error("Failed to fetch room details for reservation:", roomResponse.statusText);
                        }
                        // Format date and time strings
                        reservation.date = formatDate(reservation.date);
                        reservation.reservationDateTime = formatDateAndTime(reservation.reservationDateTime);
                        return reservation;
                    }));
                    setReservations(formattedData);
                } else {
                    console.error("Failed to fetch updated reservations:", updatedReservationsResponse.statusText);
                }
            } else {
                // Handle errors, e.g., display an error message
                console.error("Failed to delete reservation:", response.statusText);
            }
        } catch (error) {
            console.error('Error deleting reservation:', error);
        }
    }

    return (
        <div className="UserReservations">
            <Navbar />
            <div className="background-home p-4 justify-content-center align-items-center">
                <div className="container">
                    <div className="card p-4">
                        <h4 className="card-title text-center mb-4">Rezervarile mele</h4>
                        <ul className="nav nav-tabs">
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${selectedTab === 'VIITOR' ? 'active' : ''}`}
                                    style={{
                                        color: selectedTab === 'VIITOR' ? 'black' : 'black',
                                        background: selectedTab === 'VIITOR' ? '#D0C6C3' : 'white',
                                        border: selectedTab === 'VIITOR' ? '2px solid #D0C6C3' : '1px solid #D0C6C3',
                                    }}
                                    onClick={() => setSelectedTab('VIITOR')}
                                >
                                    Rezervari viitoare
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${selectedTab === 'TRECUT' ? 'active' : ''}`}
                                    style={{
                                        color: selectedTab === 'TRECUT' ? 'black' : 'black',
                                        background: selectedTab === 'TRECUT' ? '#D0C6C3' : 'white',
                                        border: selectedTab === 'TRECUT' ? '2px solid #D0C6C3' : '1px solid #D0C6C3',
                                    }}
                                    onClick={() => setSelectedTab('TRECUT')}
                                >
                                    Rezervari trecute
                                </button>
                            </li>
                            {/* Add more tabs as needed */}
                        </ul>
                        <div className="table-responsive"> {/* Make the table responsive */}
                            <table className="table table-bordered">
                                <thead>
                                <tr style={{ background: "#D0C6C3" }}>
                                    <th>Data rezervarii</th>
                                    <th>Sala</th>
                                    <th>Ora inceput</th>
                                    <th>Ora sfarsit</th>
                                    <th>Status</th>
                                    <th>Rezervare creata la data de</th>
                                    <th>Actiuni</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredReservationsSelectedTab.map(reservation => (
                                    <tr key={reservation.id}>
                                        <td>{reservation.date}</td>
                                        <td>{reservation.roomName}</td>
                                        <td>{reservation.startTime}</td>
                                        <td>{reservation.endTime}</td>
                                        <td>{reservation.status}</td>
                                        <td>{reservation.reservationDateTime}</td>
                                        <td>
                                            <button type="button" className="btn btn-danger"
                                                    onClick={() => deleteReservation(reservation)}>
                                                Stergere
                                            </button>
                                            <button type="button" className="btn btn btn-warning ml-lg-2"
                                                    onClick={() => updateReservation(reservation)}>
                                                Actualizare
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={onBack} className="btn btn-primary" style={{ marginLeft: "90%" }}>Inapoi</button>
                    </div>
                </div>
            </div>

            {/* Delete Reservation Modal */}
            <div className={`modal ${showDeleteModal ? 'show' : ''}`} tabIndex="-1" role="dialog"
                 style={{display: showDeleteModal ? 'block' : 'none'}}>
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Sterge rezervarea</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"
                                    onClick={closeModal}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>Sunteti sigur ca doriti sa stergeti rezervarea?</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-danger" onClick={handleDelete}>Sterge</button>
                            <button type="button" className="btn btn-secondary" onClick={closeModal}>Anuleaza</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AllUserReservations;

import React, {useEffect, useState} from "react";
import {Navbar} from "./Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import {getAuthToken} from "../helpers/axios_helper";
import {useNavigate} from "react-router-dom";

function AllUserReservations() {
    const [reservations, setReservations] = useState([]);
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState('VIITOR');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const filteredReservationsSelectedTab = reservations.filter((reservation) => reservation.status === selectedTab);
    const [updatedReservation, setUpdatedReservation] = useState({userId: "", roomId: "", date: "", startTime: "", endTime: ""});
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [rooms, setRooms] = useState([]);
    const onBack = () => {
        navigate(-1);
    };

    const closeModal = () => {
        setShowDeleteModal(false);
        setShowUpdateModal(false);
        setShowRoomModal(false);
    };

    const deleteReservation = (reservation) => {
        setSelectedReservation(reservation); // Set the selected reservation
        setShowDeleteModal(true);
    };

    const updateReservation = (reservation) => {
        setSelectedReservation(reservation); // Set the selected reservation
        const formattedDate = reservation.date.split('/').reverse().join('-');
        setUpdatedReservation({
            userId: reservation.userId,
            roomId: reservation.roomId,
            date: formattedDate,
            startTime: reservation.startTime,
            endTime: reservation.endTime
        });
        setShowUpdateModal(true);
    }

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setUpdatedReservation({ ...updatedReservation, [name]: value });
    };

    useEffect(() => {
        const fetchUserReservations = async () => {
            try {
                const token = getAuthToken();
                const response = await fetch(`http://localhost:8080/api/v1/reservations/all-reservations`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    // Fetch room details and user details for each reservation
                    const formattedData = await Promise.all(data.map(async reservation => {
                        const roomResponse = await fetch(`http://localhost:8080/api/v1/rooms/room/${reservation.roomId}`, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`,
                            },
                        });
                        const userResponse = await fetch(`http://localhost:8080/api/v1/users/user/${reservation.userId}`, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`,
                            },
                        });
                        if (roomResponse.ok && userResponse.ok) {
                            const roomData = await roomResponse.json();
                            const userData = await userResponse.json();
                            reservation.roomName = roomData[0].name;
                            reservation.userName = `${userData[0].lastname} ${userData[0].firstname}`;
                        } else {
                            console.error("Failed to fetch room or user details for reservation:", roomResponse.statusText, userResponse.statusText);
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

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const token = getAuthToken();
                const response = await fetch(`http://localhost:8080/api/v1/rooms/all-rooms`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const roomsData = await response.json();
                    setRooms(roomsData);
                } else {
                    console.error("Failed to fetch rooms:", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching rooms:", error);
            }
        };

        fetchRooms();
    }, []);

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

    const handleRoomSelection = (roomId, e) => {
        e.preventDefault();
        setSelectedReservation({ ...selectedReservation, roomId });
        setUpdatedReservation({ ...updatedReservation, roomId });
        setShowRoomModal(false);
        handleInputChange({ target: { name: 'roomId', value: roomId } });
        //closeModal(true);
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
                        const userResponse = await fetch(`http://localhost:8080/api/v1/users/user/${reservation.userId}`, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`,
                            },
                        });
                        if (roomResponse.ok && userResponse.ok) {
                            const roomData = await roomResponse.json();
                            const userData = await userResponse.json();
                            reservation.roomName = roomData[0].name;
                            reservation.userName = `${userData[0].lastname} ${userData[0].firstname}`;
                        } else {
                            console.error("Failed to fetch room or user details for reservation:", roomResponse.statusText, userResponse.statusText);
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

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = getAuthToken();
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const { id } = storedUser || {};
            const response = await fetch(`http://localhost:8080/api/v1/reservations/update-reservation/${selectedReservation.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(updatedReservation),
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
                        const userResponse = await fetch(`http://localhost:8080/api/v1/users/user/${reservation.userId}`, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`,
                            },
                        });
                        if (roomResponse.ok && userResponse.ok) {
                            const roomData = await roomResponse.json();
                            const userData = await userResponse.json();
                            reservation.roomName = roomData[0].name;
                            reservation.userName = `${userData[0].lastname} ${userData[0].firstname}`;
                        } else {
                            console.error("Failed to fetch room or user details for reservation:", roomResponse.statusText, userResponse.statusText);
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
                console.error("Failed to update reservation:", response.statusText);
            }
        } catch (error) {
            console.error('Error updating reservation:', error);
        }
    }

    return (
        <div className="UserReservations">
            <Navbar />
            <div className="background-home p-4">
                <h2 className="text-white mb-4">Toate rezervarile <button onClick={onBack} className="btn btn-secondary"
                                                                          style={{
                                                                              marginLeft: "2%",
                                                                              marginTop: "0%",
                                                                              marginBottom: "0%"
                                                                          }}>Inapoi</button></h2>
                <ul className="nav nav-tabs">
                    <li className="nav-item">
                        <button
                            className={`nav-link ${selectedTab === 'VIITOR' ? 'active' : ''}`}
                            style={{
                                color: selectedTab === 'VIITOR' ? 'black' : 'white',
                                border: selectedTab === 'VIITOR' ? '1px solid white' : '1px solid white',
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
                                color: selectedTab === 'TRECUT' ? 'black' : 'white',
                                border: selectedTab === 'TRECUT' ? '1px solid white' : '1px solid white',
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
                        <thead className="thead" style={{ background: 'white' }}>
                        <tr>
                            <th>Data rezervarii</th>
                            <th>Sala</th>
                            <th>Ora inceput</th>
                            <th>Ora sfarsit</th>
                            <th>Status</th>
                            <th>Rezervare creata de</th>
                            <th>Rezervare creata la data de</th>
                            <th>Actiuni</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredReservationsSelectedTab.map((reservation) => (
                            <tr key={reservation.id}>
                                <td className="text-white">{reservation.date}</td>
                                <td className="text-white">{reservation.roomName}</td>
                                <td className="text-white">{reservation.startTime}</td>
                                <td className="text-white">{reservation.endTime}</td>
                                <td className="text-white">{reservation.status}</td>
                                <td className="text-white">{reservation.userName}</td>
                                <td className="text-white">{reservation.reservationDateTime}</td>
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

                {/* Update Reservation Modal */}
                <div className={`modal ${showUpdateModal ? 'show' : ''}`} tabIndex="-1" role="dialog"
                     style={{display: showUpdateModal ? 'block' : 'none'}}>
                    <div className="modal-dialog" role="document" style={{maxWidth: 'none', width: '60%'}}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Actualizeaza rezervarea</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"
                                        onClick={closeModal}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleUpdate}>
                                    <div className="row">
                                        {/* First column */}
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="lastName">Nume</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="lastName"
                                                    name="lastName"
                                                    value={selectedReservation?.userName.split(" ")[1] || ""}
                                                    readOnly
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="firstName">Prenume</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="firstName"
                                                    name="firstName"
                                                    value={selectedReservation?.userName.split(" ")[0] || ""}
                                                    readOnly
                                                />
                                                <input
                                                    type="hidden"
                                                    name="userId"
                                                    value={selectedReservation?.userId || ""}
                                                    readOnly
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="date">Data</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    id="date"
                                                    name="date"
                                                    value={updatedReservation.date}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        {/* Second column */}
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="roomId" className="form-label">Sala</label>
                                                <div className="row align-items-center">
                                                    <div className="col-sm-12 d-flex">
                                                        <input
                                                            type="text"
                                                            className="form-control flex-grow-1"
                                                            id="roomId"
                                                            name="roomId"
                                                            value={selectedReservation?.roomName}
                                                            readOnly
                                                        />
                                                        <input
                                                            type="hidden"
                                                            name="roomId"
                                                            value={selectedReservation?.roomId || ""}
                                                            readOnly
                                                        />
                                                        <button
                                                            className="btn btn-secondary ml-2"
                                                            style={{marginTop: "0px", marginBottom: "0px"}}
                                                            onClick={() => setShowRoomModal(true)}
                                                        >
                                                            Alege
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="startTime">Ora de inceput</label>
                                                <input
                                                    type="time"
                                                    className="form-control"
                                                    id="startTime"
                                                    name="startTime"
                                                    value={updatedReservation.startTime}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="endTime">Ora de sfarsit</label>
                                                <input
                                                    type="time"
                                                    className="form-control"
                                                    id="endTime"
                                                    name="endTime"
                                                    value={updatedReservation.endTime}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-warning">Actualizeaza</button>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Anuleaza</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Room Modal */}
                <div className={`modal ${showRoomModal ? 'show' : ''}`} tabIndex="-1" role="dialog"
                     style={{display: showRoomModal ? 'block' : 'none'}}>
                    <div className="modal-dialog modal-dialog-scrollable" role="document"
                         style={{maxWidth: 'none', width: '90%'}}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Selecteaza o sala</h5>
                                <button type="button" className="close" aria-label="Close"
                                        onClick={() => setShowRoomModal(false)}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body" style={{maxHeight: '80vh', overflowY: 'auto'}}>
                                <table className="table">
                                    <thead>
                                    <tr>
                                        <th>Nume</th>
                                        <th>Locatie</th>
                                        <th>Capacitate</th>
                                        <th>Tip</th>
                                        <th>Selecteaza</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {rooms.map(room => (
                                        <tr key={room.id}>
                                            <td>{room.name}</td>
                                            <td>{room.location}</td>
                                            <td>{room.capacity}</td>
                                            <td>{room.type}</td>
                                            <td>
                                                <button
                                                    className="btn btn-primary" style={{marginLeft: "0px"}}
                                                    onClick={() => handleRoomSelection(room.id)}
                                                >
                                                    Selecteaza
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AllUserReservations;
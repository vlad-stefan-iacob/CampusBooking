import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {getAuthToken} from "../helpers/axios_helper";
import {Navbar} from "./Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';

function AllUserReservations() {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const {role} = storedUser || {};

    const [reservations, setReservations] = useState([]);
    const navigate = useNavigate();
    const [currentDate] = useState(new Date());
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [showFuture, setShowFuture] = useState(true);
    const [updatedReservation, setUpdatedReservation] = useState({
        userId: "",
        roomId: "",
        date: "",
        startTime: "",
        endTime: ""
    });
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
        const {name, value} = event.target;
        setUpdatedReservation({...updatedReservation, [name]: value});
    };

    useEffect(() => {
        const fetchAllUserReservations = async () => {
            try {
                const token = getAuthToken();
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const {id} = storedUser || {};
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

        fetchAllUserReservations();
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

    const filteredRooms = rooms.filter((room) => {
        if (role === 'ADMIN') {
            // Admin can see all types of rooms
            return true;
        } else if (role === 'STUDENT') {
            return room.type === 'SALA LECTURA';
        } else if (role === 'PROFESOR') {
            return room.type === 'AMFITEATRU';
        } else if (role === 'ASISTENT')
            return room.type === 'LABORATOR';

        return false;
    });

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

    const futureReservations = reservations.filter(reservation => reservation.date > formatDate(currentDate));
    const pastReservations = reservations.filter(reservation => reservation.date <= formatDate(currentDate));

    const handleRoomSelection = (roomId) => {
        setSelectedReservation(prevReservation => ({...prevReservation, roomId}));
        setUpdatedReservation(prevUpdatedReservation => ({...prevUpdatedReservation, roomId}));
        setShowRoomModal(false);
    };

    const handleRoomSelect = (room) => {
        setSelectedReservation({
            ...selectedReservation,
            roomId: room.id,
            roomName: room.name
        });
    }

    const handleDelete = async () => {
        try {
            const token = getAuthToken();
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const {id} = storedUser || {};
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
            const {id} = storedUser || {};
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

    const generateTimeOptions = () => {
        const options = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                options.push(timeString);
            }
        }
        return options;
    };

    // Opțiunile de timp generale
    const timeOptions = generateTimeOptions();

    // Calculează opțiuni pentru ora de sfârșit bazate pe ora de început selectată
    const endTimeOptions = updatedReservation.startTime ? timeOptions.filter(time => time > updatedReservation.startTime) : [];

    return (
        <div className="AllUserReservations">
            <Navbar/>
            <div className="background-home p-4 justify-content-center align-items-center">
                <div className="container">
                    <div className="card p-4">
                        <h4 className="card-title text-center mb-4">Rezervarile mele</h4>
                        <ul className="nav nav-tabs">
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${showFuture ? 'active' : ''}`}
                                    style={{
                                        color: showFuture ? 'black' : 'black',
                                        background: showFuture ? '#D0C6C3' : 'white',
                                        border: showFuture ? '2px solid #D0C6C3' : '1px solid #D0C6C3',
                                    }}
                                    onClick={() => setShowFuture(true)}
                                >
                                    Rezervari viitoare
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${!showFuture ? 'active' : ''}`}
                                    style={{
                                        color: !showFuture ? 'black' : 'black',
                                        background: !showFuture ? '#D0C6C3' : 'white',
                                        border: !showFuture ? '2px solid #D0C6C3' : '1px solid #D0C6C3',
                                    }}
                                    onClick={() => setShowFuture(false)}
                                >
                                    Rezervari trecute
                                </button>
                            </li>
                            {/* Add more tabs as needed */}
                        </ul>
                        <div className="table-responsive"> {/* Make the table responsive */}
                            <table className="table table-bordered">
                                <thead>
                                <tr style={{background: "#D0C6C3"}}>
                                    <th>Data rezervarii</th>
                                    <th>Sala</th>
                                    <th>Ora inceput</th>
                                    <th>Ora sfarsit</th>
                                    <th>Rezervare creata la data de</th>
                                    {showFuture && <th>Actiuni</th>}
                                </tr>
                                </thead>
                                <tbody>
                                {showFuture ? (
                                    futureReservations.map(reservation => (
                                        <tr key={reservation.id}>
                                            <td>{reservation.date}</td>
                                            <td>{reservation.roomName}</td>
                                            <td>{reservation.startTime}</td>
                                            <td>{reservation.endTime}</td>
                                            <td>{reservation.reservationDateTime}</td>
                                            <td>
                                                <button type="button" className="btn btn-danger"
                                                        onClick={() => deleteReservation(reservation)}>
                                                    Stergere
                                                </button>
                                                <button type="button" className="btn btn-warning ml-lg-2"
                                                        onClick={() => updateReservation(reservation)}>
                                                    Actualizare
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    pastReservations.map(reservation => (
                                        <tr key={reservation.id}>
                                            <td>{reservation.date}</td>
                                            <td>{reservation.roomName}</td>
                                            <td>{reservation.startTime}</td>
                                            <td>{reservation.endTime}</td>
                                            <td>{reservation.reservationDateTime}</td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={onBack} className="btn btn-primary" style={{marginLeft: "90%"}}>Inapoi</button>
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
                                                min={new Date().toISOString().substring(0, 10)}
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
                                                        onClick={(e) => {
                                                            e.preventDefault(); // Prevent form submission
                                                            setShowRoomModal(true); // Open the second modal
                                                        }}
                                                    >
                                                        Alege
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="startTime">Ora de inceput</label>
                                            <select
                                                className="form-control"
                                                id="startTime"
                                                name="startTime"
                                                value={updatedReservation.startTime}
                                                onChange={handleInputChange}
                                            >
                                                {timeOptions.map(time => (
                                                    <option key={time} value={time}>{time}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="endTime">Ora de sfarsit</label>
                                            <select
                                                className="form-control"
                                                id="endTime"
                                                name="endTime"
                                                value={updatedReservation.endTime}
                                                onChange={handleInputChange}
                                            >
                                                {endTimeOptions.map(time => (
                                                    <option key={time} value={time}>{time}</option>
                                                ))}
                                            </select>
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
                     style={{maxWidth: 'none', width: '60%'}}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Selecteaza o sala</h5>
                            <button type="button" className="close" aria-label="Close"
                                    onClick={() => setShowRoomModal(false)}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        {role === "ADMIN" ? (
                            <div>
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
                                        {filteredRooms.map(room => (
                                            <tr key={room.id}>
                                                <td>{room.name}</td>
                                                <td>{room.location}</td>
                                                <td>{room.capacity}</td>
                                                <td>{room.type}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-primary" style={{marginLeft: "0px"}}
                                                        onClick={() => {
                                                            handleRoomSelection(room.id);
                                                            handleRoomSelect(room);}}
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
                        ) : (
                            <div>
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
                                        {filteredRooms.map(room => (
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
                            </div>)}
                    </div>
                </div>
            </div>
        </div>
    )
        ;
}

export default AllUserReservations;

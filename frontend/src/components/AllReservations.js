import React, {useEffect, useState} from "react";
import {Navbar} from "./Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import {getAuthToken} from "../helpers/axios_helper";
import {useNavigate} from "react-router-dom";

function AllReservations() {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const {role} = storedUser || {};

    const [reservations, setReservations] = useState([]);
    const navigate = useNavigate();
    const [currentDate] = useState(new Date());
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [showFuture, setShowFuture] = useState(true);
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
        setUpdatedReservation(prevReservation => {
            // Check if the modified field is date, startTime, or endTime
            if (['date', 'startTime', 'endTime'].includes(name) && prevReservation.roomId) {
                // If changing date/time, reset roomId
                return {
                    ...prevReservation,
                    [name]: value,
                    roomId: ""
                };
            }
            return {
                ...prevReservation,
                [name]: value
            };
        });
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

    useEffect(() => {
        const fetchAvailableRooms = async () => {
            const token = getAuthToken();
            const {date, startTime, endTime} = updatedReservation;
            if (updatedReservation.date && updatedReservation.startTime && updatedReservation.endTime) {
                setRooms([]); // Reset rooms list before fetching new available rooms
                try {
                    const response = await fetch(`http://localhost:8080/api/v1/rooms/check-availability`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                        body: JSON.stringify({date, startTime, endTime})
                    });
                    const availableRooms = await response.json();
                    if (response.ok) {
                        setRooms(availableRooms);
                    } else {
                        console.error('Failed to check room availability:', response.statusText);
                    }
                } catch (error) {
                    console.error('Error checking room availability:', error);
                }
            }
        };

        fetchAvailableRooms();
    }, [updatedReservation.date, updatedReservation.startTime, updatedReservation.endTime, updatedReservation]);

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

    function formatDateForComparison(dateString) {
        if (typeof dateString === 'string' && dateString.includes('/')) {
            const parts = dateString.split('/');
            return `${parts[2]}-${parts[1]}-${parts[0]}`; // Rearanjează componentele datei pentru formatul ISO
        }
    }

    const currentDateFormatted = formatDateForComparison(formatDate(currentDate)); // Convertim data curentă în formatul ISO

    const futureReservations = reservations.filter(reservation => {
        const reservationDateFormatted = formatDateForComparison(reservation.date);
        return reservationDateFormatted >= currentDateFormatted;
    });

    const pastReservations = reservations.filter(reservation => {
        const reservationDateFormatted = formatDateForComparison(reservation.date);
        return reservationDateFormatted < currentDateFormatted;
    });

    const handleRoomSelection = (roomId) => {
        setSelectedReservation(prevReservation => ({ ...prevReservation, roomId }));
        setUpdatedReservation(prevUpdatedReservation => ({ ...prevUpdatedReservation, roomId }));
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
                const updatedReservationsResponse = await fetch(`http://localhost:8080/api/v1/reservations/all-reservations`, {
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
                const updatedReservationsResponse = await fetch(`http://localhost:8080/api/v1/reservations/all-reservations`, {
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
        <div className="UserReservations">
            <Navbar />
            <div className="background-home p-4">
                <h2 className="text-white mb-4">Toate rezervările <button onClick={onBack} className="btn btn-secondary"
                                                                          style={{
                                                                              marginLeft: "2%",
                                                                              marginTop: "0%",
                                                                              marginBottom: "0%"
                                                                          }}>Înapoi</button></h2>
                <ul className="nav nav-tabs">
                    <li className="nav-item">
                        <button
                            className={`nav-link ${showFuture ? 'active' : ''}`}
                            style={{
                                color: showFuture ? 'black' : 'white',
                                border: '1px solid white',
                            }}
                            onClick={() => setShowFuture(true)}
                        >
                            Rezervări viitoare
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${!showFuture ? 'active' : ''}`}
                            style={{
                                color: !showFuture ? 'black' : 'white',
                                border: '1px solid white',
                            }}
                            onClick={() => setShowFuture(false)}
                        >
                            Rezervări trecute
                        </button>
                    </li>
                </ul>
                <div className="table-responsive"> {/* Make the table responsive */}
                    <table className="table table-bordered">
                        <thead className="thead" style={{ background: 'white' }}>
                        <tr>
                            <th>Data rezervării</th>
                            <th>Sala</th>
                            <th>Oră început</th>
                            <th>Oră sfârșit</th>
                            <th>Rezervare creată de</th>
                            <th>Rezervare creată la data de</th>
                            <th>Acțiuni</th>
                        </tr>
                        </thead>
                        <tbody>
                        {showFuture ? (
                            futureReservations.map(reservation => (
                                <tr key={reservation.id}>
                                    <td className="text-white">{reservation.date}</td>
                                    <td className="text-white">{reservation.roomName}</td>
                                    <td className="text-white">{reservation.startTime}</td>
                                    <td className="text-white">{reservation.endTime}</td>
                                    <td className="text-white">{reservation.userName}</td>
                                    <td className="text-white">{reservation.reservationDateTime}</td>
                                    <td>
                                        <button type="button" className="btn btn-danger"
                                                onClick={() => deleteReservation(reservation)}>
                                            Ștergere
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
                                    <td className="text-white">{reservation.date}</td>
                                    <td className="text-white">{reservation.roomName}</td>
                                    <td className="text-white">{reservation.startTime}</td>
                                    <td className="text-white">{reservation.endTime}</td>
                                    <td className="text-white">{reservation.userName}</td>
                                    <td className="text-white">{reservation.reservationDateTime}</td>
                                    <td>
                                        <button type="button" className="btn btn-danger"
                                                onClick={() => deleteReservation(reservation)}>
                                            Ștergere
                                        </button>
                                        <button type="button" className="btn btn-warning ml-lg-2"
                                                onClick={() => updateReservation(reservation)}>
                                            Actualizare
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>

                    </table>
                </div>

                {/* Delete Reservation Modal */}
                <div className={`modal ${showDeleteModal ? 'show' : ''}`} tabIndex="-1" role="dialog"
                     style={{display: showDeleteModal ? 'block' : 'none'}}>
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Șterge rezervarea</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"
                                        onClick={closeModal}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>Sunteți sigur că doriți să ștergeți rezervarea?</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-danger" onClick={handleDelete}>Șterge</button>
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Anulează</button>
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
                                <h5 className="modal-title">Actualizează rezervarea</h5>
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
                                                <label htmlFor="startTime">Ora de început</label>
                                                <select
                                                    className="form-control"
                                                    id="startTime"
                                                    name="startTime"
                                                    value={updatedReservation.startTime}
                                                    onChange={handleInputChange}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {timeOptions.map(time => (
                                                        <option key={time} value={time}>{time}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="endTime">Ora de sfârșit</label>
                                                <select
                                                    className="form-control"
                                                    id="endTime"
                                                    name="endTime"
                                                    value={updatedReservation.endTime}
                                                    onChange={handleInputChange}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {endTimeOptions.map(time => (
                                                        <option key={time} value={time}>{time}</option>
                                                    ))}
                                                </select>
                                            </div>
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
                                                            style={{marginTop: "0px", marginBottom: "0px", marginRight:"0px"}}
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
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-warning">Actualizează</button>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Anulează</button>
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
                                <h5 className="modal-title">Selectează o sală</h5>
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
                                                <th>Locație</th>
                                                <th>Capacitate</th>
                                                <th>Locuri disponibile</th>
                                                <th>Tip</th>
                                                <th>Selectează</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {filteredRooms.map(room => (
                                                <tr key={room.id}>
                                                    <td>{room.name}</td>
                                                    <td>{room.location}</td>
                                                    <td style={{textAlign:'center'}}>{room.capacity}</td>
                                                    <td style={{textAlign:'center'}}>{room.type === 'SALA LECTURA' ? room.availableCapacity : room.capacity}</td>
                                                    <td>{room.type}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-primary" style={{marginLeft: "0px"}}
                                                            onClick={() => {
                                                                handleRoomSelection(room.id);
                                                                handleRoomSelect(room);}}
                                                        >
                                                            Selectează
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
                                                <th>Locație</th>
                                                <th>Capacitate</th>
                                                <th>Locuri disponibile</th>
                                                <th>Tip</th>
                                                <th>Selectează</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {filteredRooms.map(room => (
                                                <tr key={room.id}>
                                                    <td>{room.name}</td>
                                                    <td>{room.location}</td>
                                                    <td style={{textAlign:'center'}}>{room.capacity}</td>
                                                    <td style={{textAlign:'center'}}>{room.type === 'SALA LECTURA' ? room.availableCapacity : room.capacity}</td>
                                                    <td>{room.type}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-primary" style={{marginLeft: "0px"}}
                                                            onClick={() => handleRoomSelection(room.id)}
                                                        >
                                                            Selectează
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
        </div>
    );
}

export default AllReservations;
import React, {useState, useEffect} from "react";
import {Navbar} from "./Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import {getAuthToken} from "../helpers/axios_helper";
import {useNavigate} from "react-router-dom";

function Reservation() {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const {firstName, lastName, id, role} = storedUser || {};

    const [rooms, setRooms] = useState([]); // State to store list of rooms
    const [reservation, setReservation] = useState({
        userId: id,
        roomId: "", // Initialize with an empty value
        date: "",
        startTime: "",
        endTime: "",
        // status: "",
        reservationDateTime: new Date().toISOString() // Set the current date and time
    });

    const [showRoomModal, setShowRoomModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const navigate = useNavigate();

    const onAllUserReservations = () => {
        navigate('/my-reservations');
    };

    const onAllReservations = () => {
        navigate('/all-reservations');
    };

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const token = getAuthToken();
                const response = await fetch("http://localhost:8080/api/v1/rooms/all-rooms", {
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
                    console.error('Failed to fetch rooms:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching rooms:', error);
            }
        };

        fetchRooms();
    }, []);

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setReservation({
            ...reservation,
            [name]: value
        });
    };

    const handleInsertReservation = async () => {
        try {
            const token = getAuthToken();
            const response = await fetch("http://localhost:8080/api/v1/reservations/add-reservation", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(reservation),
            });
            if (response.ok) {
                // Reservation inserted successfully
                console.log("Reservation inserted successfully");
                setReservation({
                    roomId: "",
                    date: "",
                    startTime: "",
                    endTime: "",
                    reservationDateTime: new Date().toISOString()
                });
            } else {
                // Handle errors, e.g., display an error message
                console.error("Failed to insert reservation:", response.statusText);
            }
            setShowRoomModal(false); // Close the room modal
            setSuccessMessage("Rezervare adaugata cu succes!");
        } catch (error) {
            console.error("Error inserting reservation:", error);
        }
    };

    const handleSelectRoom = (roomId) => {
        setReservation({...reservation, roomId});
        setShowRoomModal(false); // Close the room modal
    };

    return (
        <div className="Reservation">
            <Navbar/>
            <div className="background-home p-4 d-flex justify-content-center align-items-center">
                <div className="container">
                    <div className="card p-4" style={{maxWidth: 'none', width: '70%'}}>
                        <div className="row">
                            <button type="button" className="btn btn-secondary"
                                    style={{marginLeft: "2%", marginTop: "0px", marginBottom: "5%"}}
                                    onClick={onAllUserReservations}>
                                Rezervarile mele
                            </button>
                            {role === 'ADMIN' && (
                            <button type="button" className="btn btn-secondary"
                                    style={{marginLeft: "0px", marginTop: "0px", marginBottom: "5%"}}
                                    onClick={onAllReservations}>
                                Toate rezervarile
                            </button>)}

                        </div>
                        <h4 className="card-title text-center mb-4">Adauga o rezervare</h4>
                        {successMessage && <div className="alert alert-success">{successMessage}</div>}
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
                                        value={lastName || ""}
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
                                        value={firstName || ""}
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
                                        value={reservation.date}
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
                                                value={reservation.roomId ? rooms.find(room => room.id === reservation.roomId)?.name : ""}
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
                                        value={reservation.startTime}
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
                                        value={reservation.endTime}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>
                        <button onClick={handleInsertReservation} className="btn btn-primary"
                                style={{marginLeft: "75%"}}>Adauga rezervare
                        </button>
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
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"
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
                                                onClick={() => handleSelectRoom(room.id)}
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
    );
}

export default Reservation;

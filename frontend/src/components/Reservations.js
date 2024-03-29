import React, { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import { getAuthToken } from "../helpers/axios_helper";

function Reservation() {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const { firstName, lastName, id } = storedUser || {};

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
        const { name, value } = e.target;
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
            } else {
                // Handle errors, e.g., display an error message
                console.error("Failed to insert reservation:", response.statusText);
            }
        } catch (error) {
            console.error("Error inserting reservation:", error);
        }
    };

    return (
        <div className="Reservation">
            <Navbar />
            <div className="background-home p-4 d-flex justify-content-center align-items-center">
                <div className="container">
                    <div className="card p-4" style={{ maxWidth: 'none', width: '70%' }}>
                        <h4 className="card-title text-center mb-4">Rezervare</h4>
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
                                    <label htmlFor="roomId">Sala</label>
                                    <select
                                        className="form-control"
                                        id="roomId"
                                        name="roomId"
                                        value={reservation.roomId}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Selecteaza o sala</option>
                                        {rooms.map(room => (
                                            <option key={room.id} value={room.id}>{room.name}</option>
                                        ))}
                                    </select>
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
                        <button onClick={handleInsertReservation} className="btn btn-primary">Adauga rezervare</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Reservation;

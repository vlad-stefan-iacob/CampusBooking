import React, {useState, useEffect} from "react";
import {Navbar} from "./Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import {getAuthToken} from "../helpers/axios_helper";
import 'bootstrap-icons/font/bootstrap-icons.css';
import {useNavigate} from "react-router-dom";

function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [roomAvailabilityChecked, setRoomAvailabilityChecked] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRoomDetails, setSelectedRoomDetails] = useState(null);
    const [newRoom, setNewRoom] = useState({name: "", location: "", capacity: "", type: "", details: ""});
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [updatedRoom, setUpdatedRoom] = useState({name: "", location: "", capacity: "", type: "", details: ""});
    const [selectedTab, setSelectedTab] = useState('SALA LECTURA');
    const filteredRoomsSelectedTab = rooms.filter((room) => room.type === selectedTab);
    const [expandedRooms, setExpandedRooms] = useState([]);
    const [newRoomValidations, setNewRoomValidations] = useState({
        name: true,
        location: true,
        capacity: true,
        type: true,
        details: true,
    });
    const [updatedRoomValidations, setUpdatedRoomValidations] = useState({
        name: true,
        location: true,
        capacity: true,
        type: true,
        details: true,
    });
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const {role} = storedUser || {};

    const [selectedDate, setSelectedDate] = useState(); // Stocăm data în format YYYY-MM-DD
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    useEffect(() => {
        // Fetch data from the backend
        const token = getAuthToken();

        fetch("http://localhost:8080/api/v1/rooms/all-rooms", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        })
            .then(response => response.json())
            .then(data => setRooms(data))
            .catch(error => console.error("Error fetching data:", error));
    }, []); // Empty dependency array ensures the effect runs only once on component mount

    const addRooms = () => {
        setShowAddModal(true);
    };

    const deleteRoom = (room) => {
        setSelectedRoom(room);
        setShowDeleteModal(true);
    };

    const updateRoom = (room) => {
        setSelectedRoom(room);
        setUpdatedRoom({
            name: room.name,
            location: room.location,
            capacity: room.capacity,
            type: room.type,
            details: room.details
        });
        setShowUpdateModal(true);
    };

    const closeModal = () => {
        setShowAddModal(false);
        setShowDeleteModal(false);
        setShowUpdateModal(false);
        setNewRoom({name: "", location: "", capacity: "", type: "", details: ""}); // Clear form fields on modal close
        setUpdatedRoom({name: "", location: "", capacity: "", type: "", details: ""}); // Clear form fields on modal close
        setNewRoomValidations({
            name: true,
            location: true,
            capacity: true,
            type: true,
            details: true,
        });
        setUpdatedRoomValidations({
            name: true,
            location: true,
            capacity: true,
            type: true,
            details: true,
        });
    };

    const handleDuplicateName = async (name) => {
        try {
            const token = getAuthToken();
            const response = await fetch(`http://localhost:8080/api/v1/rooms/check-duplicate-name/${name}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const result = await response.json(); // Parse the JSON response

            const isDuplicate = result.isDuplicate;
            setNewRoomValidations((prev) => ({...prev, name: !isDuplicate}));
            return isDuplicate;
        } catch (error) {
            console.error("Error checking duplicate name:", error);
            return false;
        }
    };


    const handleInputChange = (e, isUpdatedRoom = false) => {
        const {name, value} = e.target;

        // Basic validation for empty fields
        const isEmpty = value.trim() === "";
        const isInteger = name === "capacity" ? /^\d+$/.test(value) : true;

        // Update the state and validation status based on the field
        if (isUpdatedRoom) {
            setUpdatedRoom((prevState) => ({
                ...prevState,
                [name]: value,
            }));
            setUpdatedRoomValidations((prevValidations) => ({
                ...prevValidations,
                [name]: !isEmpty && isInteger,
            }));
        } else {
            setNewRoom((prevState) => ({
                ...prevState,
                [name]: value,
            }));
            setNewRoomValidations((prevValidations) => ({
                ...prevValidations,
                [name]: !isEmpty && isInteger,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Check if all fields are filled and capacity is an integer
        const isFormValid = Object.values(newRoomValidations).every(Boolean);
        if (!isFormValid) {
            console.error("Form contains errors. Please check your input.");
            return;
        }

        try {
            const isDuplicateName = await handleDuplicateName(newRoom.name);
            if (isDuplicateName) {
                setNewRoomValidations((prev) => ({...prev, name: false}));
                return;
            }
            // Make a POST request to the backend endpoint
            const token = getAuthToken();
            const response = await fetch("http://localhost:8080/api/v1/rooms/add-room", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newRoom),
            });

            if (response.ok) {
                // If successful, close the modal and refresh the room data
                closeModal();
                // Fetch updated data from the backend
                const updatedRooms = await fetch("http://localhost:8080/api/v1/rooms/all-rooms", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                })
                    .then(response => response.json())
                    .catch(error => console.error("Error fetching updated data:", error));

                setRooms(updatedRooms);
            } else {
                // Handle errors, e.g., display an error message
                console.error("Failed to add room:", response.statusText);
            }
        } catch (error) {
            console.error("Error adding room:", error);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            // Make a PUT request to the backend endpoint
            const token = getAuthToken();
            const response = await fetch(`http://localhost:8080/api/v1/rooms/update-room/${selectedRoom.id}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedRoom),
            });

            if (response.ok) {
                // If successful, close the modal and refresh the room data
                closeModal();
                // Fetch updated data from the backend
                const updatedRooms = await fetch("http://localhost:8080/api/v1/rooms/all-rooms", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                })
                    .then(response => response.json())
                    .catch(error => console.error("Error fetching updated data:", error));
                setRooms(updatedRooms);
            } else {
                // Handle errors, e.g., display an error message
                console.error("Failed to update room:", response.statusText);
            }
        } catch (error) {
            console.error("Error updating room:", error);
        }
    };

    const handleDelete = async () => {
        try {
            // Make a DELETE request to the backend endpoint
            const token = getAuthToken();
            const response = await fetch(`http://localhost:8080/api/v1/rooms/delete-room/${selectedRoom.id}`, {
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
                const updatedRooms = await fetch("http://localhost:8080/api/v1/rooms/all-rooms", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                })
                    .then(response => response.json())
                    .catch(error => console.error("Error fetching updated data:", error));
                setRooms(updatedRooms);
            } else {
                // Handle errors, e.g., display an error message
                console.error("Failed to delete room:", response.statusText);
            }
        } catch (error) {
            console.error("Error deleting room:", error);
        }
    };

    const toggleExpand = (roomId) => {
        if (expandedRooms.includes(roomId)) {
            setExpandedRooms(expandedRooms.filter((id) => id !== roomId));
        } else {
            setExpandedRooms([...expandedRooms, roomId]);
        }
    };

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

    const generateTimeOptions = () => {
        const options = [];
        for (let hour = 8; hour <= 22; hour++) { // Se oprește la ora 21 inclusiv
            for (let minute = 0; minute < 60; minute += 30) {
                // Verifică dacă ora este 21 și minutele sunt mai mult de 30, să nu adauge 21:30+
                if (hour === 22 && minute >= 30) {
                    break; // Încetează bucla de minute dacă condiția este adevărată
                }
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                options.push(timeString);
            }
        }
        return options;
    };

    const timeOptions = generateTimeOptions();
    const navigate = useNavigate();
    const filteredEndTimeOptions = startTime ? timeOptions.filter(time => time > startTime) : [];
    const handleReserve = (room) => {
        // Navighează către pagina de rezervări cu datele necesare
        navigate(`/reservations?date=${selectedDate}&startTime=${startTime}&endTime=${endTime}&roomId=${room.id}&name=${room.name}`);
    };

    const checkRoomAvailability = async () => {
        setRoomAvailabilityChecked(true);
        const token = getAuthToken();
        if (selectedDate && startTime && endTime) {
            setRooms([]); // Resetează lista de săli înainte de a prelua sălile disponibile

            try {
                const response = await fetch(`http://localhost:8080/api/v1/rooms/check-availability`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({date: selectedDate, startTime, endTime})
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

    return (
        <div className="Rooms">
            <Navbar/>
            <div className="background-home p-4">
                <h2 className="text-white mb-4">
                    Informatii despre sali
                    {role === "ADMIN" && (
                        <button type="button" className="btn btn-secondary" onClick={addRooms}>
                            Adauga sali
                        </button>
                    )}
                </h2>
                <h6 className="text-white"><i className="bi bi-info-square"></i> Salile afisate sunt cele ce pot fi
                    rezervate de utilizatori cu rolul de {role}.</h6>
                {((role === "STUDENT") || (role === "PROFESOR") || (role === "ASISTENT")) &&(
                    <div>
                        <h6 className="text-white" style={{ display: 'inline-block'}}><i className="bi bi-info-square"></i> Afla salile disponibile din data: </h6>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="form-control mx-2"
                            style={{ display: 'inline-block', width: 'auto' }}
                            min={new Date().toISOString().substring(0, 10)}
                        />
                        <h6 className="text-white" style={{ display: 'inline-block'}}> de la ora: </h6>
                        <select
                            className="form-control mx-2"
                            style={{ display: 'inline-block', width: 'auto' }}
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        >
                            <option value="" disabled>selecteaza</option>
                            {timeOptions.map((time) => (
                                <option key={time} value={time}>{time}</option>
                            ))}
                        </select>
                        <h6 className="text-white" style={{ display: 'inline-block'}}> la ora: </h6>
                        <select
                            className="form-control mx-2"
                            style={{ display: 'inline-block', width: 'auto' }}
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            disabled={!startTime}
                        >
                            {filteredEndTimeOptions.map((time) => (
                                <option key={time} value={time}>{time}</option>
                            ))}
                        </select>
                        <button type="button" className="btn btn-secondary" disabled={(!selectedDate) || (!startTime) || (!endTime)} onClick={checkRoomAvailability}>
                            Vezi sali
                        </button>
                    </div>
                )}
                {role === "ADMIN" ? (
                    <div>
                        {/* Tabs for different room types */}
                        <ul className="nav nav-tabs">
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${selectedTab === 'SALA LECTURA' ? 'active' : ''}`}
                                    style={{
                                        color: selectedTab === 'SALA LECTURA' ? 'black' : 'white',
                                        border: selectedTab === 'SALA LECTURA' ? '1px solid white' : '1px solid white',
                                    }}
                                    onClick={() => setSelectedTab('SALA LECTURA')}
                                >
                                    Sala Lectura
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${selectedTab === 'AMFITEATRU' ? 'active' : ''}`}
                                    style={{
                                        color: selectedTab === 'AMFITEATRU' ? 'black' : 'white',
                                        border: selectedTab === 'AMFITEATRU' ? '1px solid white' : '1px solid white',
                                    }}
                                    onClick={() => setSelectedTab('AMFITEATRU')}
                                >
                                    Amfiteatru
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${selectedTab === 'LABORATOR' ? 'active' : ''}`}
                                    style={{
                                        color: selectedTab === 'LABORATOR' ? 'black' : 'white',
                                        border: selectedTab === 'LABORATOR' ? '1px solid white' : '1px solid white',
                                    }}
                                    onClick={() => setSelectedTab('LABORATOR')}
                                >
                                    Laborator
                                </button>
                            </li>
                            {/* Add more tabs as needed */}
                        </ul>
                        <div className="table-responsive">
                            <table className="table table-bordered">
                                <thead className="thead" style={{ background: 'white' }}>
                                <tr>
                                    <th scope="col">Nume</th>
                                    <th scope="col">Locatie</th>
                                    <th scope="col">Capacitate</th>
                                    <th scope="col">Tip</th>
                                    <th scope="col">Actiuni</th>
                                    {/* Add more header columns as needed */}
                                </tr>
                                </thead>
                                <tbody>
                                {filteredRoomsSelectedTab.map(room => (
                                    <tr key={room.id}>
                                        <td className="text-white">{room.name}</td>
                                        <td className="text-white">{room.location}</td>
                                        <td className="text-white">{room.capacity}</td>
                                        <td className="text-white">{room.type}</td>
                                        <td className="text-white">
                                            <button type="button" className="btn btn-danger"
                                                    onClick={() => deleteRoom(room)}>
                                                Stergere
                                            </button>

                                            <button type="button" className="btn btn-warning ml-lg-2"
                                                    onClick={() => updateRoom(room)}>
                                                Actualizare
                                            </button>

                                            <button
                                                type="button"
                                                className="btn btn-light ml-lg-2"
                                                onClick={() => {
                                                    setSelectedRoomDetails(room);
                                                    setShowDetailsModal(true);
                                                }}
                                            >
                                                Detalii
                                            </button>
                                        </td>
                                        {/* Add more columns based on the data structure */}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="row mt-4">
                        {filteredRooms.map((room) => (
                            <div key={room.id} className="col-md-3 mb-3">
                                <div
                                    className="card"
                                    style={{
                                        borderRadius: '20px',
                                        position: 'relative',
                                        height: expandedRooms.includes(room.id) ? 'auto' : '230px', // Adjust the initial height as needed
                                    }}
                                >
                                    {/* Contour line styling */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '3px',
                                            left: '3px',
                                            right: '3px',
                                            bottom: '3px',
                                            border: '2px solid #007bff',
                                            borderRadius: '20px',
                                            pointerEvents: 'none',
                                        }}
                                    />
                                    <div className="card-body">
                                        <h5 className="card-title text-center">Sala {room.name}</h5>
                                        <p className="card-text">
                                            <b>Locatie:</b> {room.location}
                                        </p>
                                        <p className="card-text">
                                            <b>Capacitate:</b> {room.capacity} persoane
                                        </p>
                                        <p className="card-text">
                                            <b>Tip:</b> {room.type}
                                        </p>
                                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                            {expandedRooms.includes(room.id) ? (
                                                <>
                                                    <p className="card-text">
                                                        <b>Detalii:</b> {room.details}
                                                    </p>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: '10px' }}>
                                                        <button
                                                            type="button"
                                                            className="btn btn-link"
                                                            onClick={() => toggleExpand(room.id)}
                                                        >
                                                            Ascunde detalii
                                                        </button>
                                                        {roomAvailabilityChecked && (
                                                            <button type="button" className="btn btn-primary ml-2" onClick={() => handleReserve(room)}>
                                                                Rezerva
                                                            </button>
                                                        )}
                                                    </div>
                                                </>
                                            ) : (
                                                <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-link"
                                                        onClick={() => toggleExpand(room.id)}
                                                    >
                                                        Vezi detalii
                                                    </button>
                                                    {roomAvailabilityChecked && (
                                                        <button type="button" className="btn btn-primary ml-2" onClick={() => handleReserve(room)}>
                                                            Rezerva
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className={`modal ${showAddModal ? 'show' : ''}`} tabIndex="-1" role="dialog"
                 style={{display: showAddModal ? 'block' : 'none'}}>
                <div className="modal-dialog" role="document" style={{maxWidth: 'none', width: '70%'}}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Adauga sali</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"
                                    onClick={closeModal}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    {/* First Column */}
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="name">Nume *</label>
                                            <input
                                                type="text"
                                                className={`form-control ${(!newRoomValidations.name && 'is-invalid') || (newRoomValidations.name && 'is-valid')}`}
                                                id="name"
                                                name="name"
                                                value={newRoom.name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            {!newRoomValidations.name && (
                                                <div className="invalid-feedback">
                                                    {newRoom.name.trim() === '' ? 'Numele este obligatoriu.' : 'Numele trebuie să fie unic.'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="location">Locatie *</label>
                                            <input
                                                type="text"
                                                className={`form-control ${newRoomValidations.location ? '' : 'is-invalid'}`}
                                                id="location"
                                                name="location"
                                                value={newRoom.location}
                                                onChange={(e) => handleInputChange(e)}
                                                required
                                            />
                                            {!newRoomValidations.location && (
                                                <div className="invalid-feedback">
                                                    Locatia este obligatorie.
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="capacity">Capacitate *</label>
                                            <input
                                                type="text"
                                                className={`form-control ${newRoomValidations.capacity ? '' : 'is-invalid'}`}
                                                id="capacity"
                                                name="capacity"
                                                value={newRoom.capacity}
                                                onChange={(e) => handleInputChange(e)}
                                                required
                                            />
                                            {!newRoomValidations.capacity && (
                                                <div className="invalid-feedback">
                                                    Capacitatea trebuie să fie un numar intreg.
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="type">Tip *</label>
                                            <select
                                                className={`form-control ${newRoomValidations.type ? '' : 'is-invalid'}`}
                                                id="type"
                                                name="type"
                                                value={newRoom.type}
                                                onChange={(e) => handleInputChange(e)}
                                                required
                                            >
                                                <option value="" disabled>Selectează tipul</option>
                                                <option value="AMFITEATRU">AMFITEATRU</option>
                                                <option value="SALA LECTURA">SALA LECTURA</option>
                                                <option value="LABORATOR">LABORATOR</option>
                                                {/* Add more options as needed */}
                                            </select>
                                            {!newRoomValidations.type && (
                                                <div className="invalid-feedback">
                                                    Tipul este obligatoriu.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Second Column */}
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="details">Detalii *</label>
                                            <textarea
                                                className={`form-control ${newRoomValidations.details ? '' : 'is-invalid'}`}
                                                id="details"
                                                name="details"
                                                value={newRoom.details}
                                                onChange={(e) => handleInputChange(e)}
                                                required
                                                rows="4"  // Set the number of rows as needed
                                            />
                                            {!newRoomValidations.details && (
                                                <div className="invalid-feedback">
                                                    Detaliile sunt obligatorii.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={!Object.values(newRoomValidations).every((isValid) => isValid)}
                                >
                                    Adauga
                                </button>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={closeModal}>Anuleaza</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Room Modal */}
            <div className={`modal ${showDeleteModal ? 'show' : ''}`} tabIndex="-1" role="dialog"
                 style={{display: showDeleteModal ? 'block' : 'none'}}>
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Sterge sala</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"
                                    onClick={closeModal}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>Sunteti sigur ca doriti sa stergeti sala?</p>
                            <p><i className="bi bi-exclamation-triangle-fill"></i> Stergerea unei sali duce la stergerea rezervarilor atasate!</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-danger" onClick={handleDelete}>Sterge</button>
                            <button type="button" className="btn btn-secondary" onClick={closeModal}>Anuleaza</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Update Room Modal */}
            <div className={`modal ${showUpdateModal ? 'show' : ''}`} tabIndex="-1" role="dialog"
                 style={{display: showUpdateModal ? 'block' : 'none'}}>
                <div className="modal-dialog" role="document" style={{maxWidth: 'none', width: '70%'}}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Actualizeaza sala</h5>
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
                                            <label htmlFor="updateName">Nume *</label>
                                            <input
                                                type="text"
                                                className={`form-control ${updatedRoomValidations.name ? '' : 'is-invalid'}`}
                                                id="updateName"
                                                name="name"
                                                value={updatedRoom.name}
                                                onChange={(e) => handleInputChange(e, true)}
                                                required
                                            />
                                            {!updatedRoomValidations.name && (
                                                <div className="invalid-feedback">
                                                    Numele este obligatoriu.
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="updateLocation">Locatie *</label>
                                            <input
                                                type="text"
                                                className={`form-control ${updatedRoomValidations.location ? '' : 'is-invalid'}`}
                                                id="updateLocation"
                                                name="location"
                                                value={updatedRoom.location}
                                                onChange={(e) => handleInputChange(e, true)}
                                                required
                                            />
                                            {!updatedRoomValidations.location && (
                                                <div className="invalid-feedback">
                                                    Locatia este obligatorie.
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="updatedCapacity">Capacitate *</label>
                                            <input
                                                type="text"
                                                className={`form-control ${updatedRoomValidations.capacity ? '' : 'is-invalid'}`}
                                                id="updatedCapacity"
                                                name="capacity"
                                                value={updatedRoom.capacity}
                                                onChange={(e) => handleInputChange(e, true)}
                                                required
                                            />
                                            {!updatedRoomValidations.capacity && (
                                                <div className="invalid-feedback">
                                                    Capacitatea trebuie să fie un număr întreg.
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="type">Tip *</label>
                                            <select
                                                className={`form-control ${updatedRoomValidations.type ? '' : 'is-invalid'}`}
                                                id="type"
                                                name="type"
                                                value={updatedRoom.type}
                                                onChange={(e) => handleInputChange(e, setUpdatedRoom)}
                                                required
                                            >
                                                <option value="" disabled>Selectează tipul</option>
                                                <option value="AMFITEATRU">AMFITEATRU</option>
                                                <option value="SALA LECTURA">SALA LECTURA</option>
                                                <option value="LABORATOR">LABORATOR</option>
                                                {/* Add more options as needed */}
                                            </select>
                                            {!newRoomValidations.type && (
                                                <div className="invalid-feedback">
                                                    Tipul este obligatoriu.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* Second Column */}
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="details">Detalii *</label>
                                            <textarea
                                                className={`form-control ${updatedRoomValidations.details ? '' : 'is-invalid'}`}
                                                id="updatedDetails"
                                                name="details"
                                                value={updatedRoom.details}
                                                onChange={(e) => handleInputChange(e)}
                                                required
                                                rows="4"  // Set the number of rows as needed
                                            />
                                            {!updatedRoomValidations.details && (
                                                <div className="invalid-feedback">
                                                    Detaliile sunt obligatorii.
                                                </div>
                                            )}
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

            <div className={`modal ${showDetailsModal ? 'show' : ''}`} tabIndex="-1" role="dialog"
                 style={{display: showDetailsModal ? 'block' : 'none'}}>
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {selectedRoomDetails && (
                                    <div>
                                        <p>Facilitatile salii <b>{selectedRoomDetails.name}</b></p>
                                        {/* Add more details as needed */}
                                    </div>
                                )}
                            </h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"
                                    onClick={() => setShowDetailsModal(false)}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            {/* Display details of the selected room here */}
                            {selectedRoomDetails && (
                                <div>
                                    <p>{selectedRoomDetails.details}</p>
                                    {/* Add more details as needed */}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary"
                                    onClick={() => setShowDetailsModal(false)}>Inchide
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Rooms;

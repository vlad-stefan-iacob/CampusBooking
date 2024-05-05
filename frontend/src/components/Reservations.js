import React, {useState, useEffect} from "react";
import {Navbar} from "./Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import {getAuthToken} from "../helpers/axios_helper";
import {useLocation, useNavigate} from "react-router-dom";

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
    const [errors, setErrors] = useState({});

    const onAllUserReservations = () => {
        navigate('/my-reservations');
    };

    const onAllReservations = () => {
        navigate('/all-reservations');
    };

    const validateForm = () => {
        let formIsValid = true;
        let newErrors = {};

        if (!reservation.date) {
            formIsValid = false;
            newErrors.date = "Selectați o data!";
        }

        if (!reservation.startTime) {
            formIsValid = false;
            newErrors.startTime = "Selectati ora de inceput!";
        }

        if (!reservation.endTime) {
            formIsValid = false;
            newErrors.endTime = "Selectati ora de sfarsit!";
        }

        if (!reservation.roomId) {
            formIsValid = false;
            newErrors.roomId = "Selectati o sala!";
        }

        setErrors(newErrors);
        return formIsValid;
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

    useEffect(() => {
        const fetchAvailableRooms = async () => {
            const token = getAuthToken();
            const {date, startTime, endTime} = reservation;
            if (date && startTime && endTime) {
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
    }, [reservation.date, reservation.startTime, reservation.endTime, reservation]); // React to changes in these fields

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setReservation(prevReservation => {
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

        // Remove error for this field if any
        if (value.trim() !== '') {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleInsertReservation = async () => {
        if (!validateForm()) {
            return; // Oprire dacă formularul nu este valid
        }
        try {
            const token = getAuthToken();
            // Utilizează direct tipul sălii stocat în starea rezervării
            let url = reservation.roomType === 'SALA LECTURA'
                ? `http://localhost:8080/api/v1/reservations/reserve-reading-room/${reservation.roomId}`
                : "http://localhost:8080/api/v1/reservations/add-reservation";

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(reservation),
            });
            if (response.ok) {
                // Rezervare adăugată cu succes
                console.log("Reservation inserted successfully");
                setSuccessMessage("Rezervare adaugata cu succes!");
                setReservation({
                    roomId: "",
                    date: "",
                    startTime: "",
                    endTime: "",
                    reservationDateTime: new Date().toISOString()
                });
                setErrors({});
                setTimeout(() => {
                    window.location.reload();
                }, 5000);
            } else {
                // Gestionare erori
                console.error("Failed to insert reservation:", response.statusText);
            }
            setShowRoomModal(false); // Închide modalul de săli
            setSuccessMessage("Rezervare adaugata cu succes!");
        } catch (error) {
            console.error("Error inserting reservation:", error);
        }
    };

    const handleSelectRoom = (roomId) => {
        const room = rooms.find(room => room.id === roomId);
        if (room) {
            setReservation(prev => ({
                ...prev,
                roomId: room.id,
                roomType: room.type  // Stocăm și tipul sălii
            }));
            setErrors(prev => ({
                ...prev,
                roomId: ''  // Resetează eroarea pentru roomId dacă alegerea este validă
            }));
        } else {
            setErrors(prev => ({
                ...prev,
                roomId: 'Sala selectata nu este valida'  // Setează o eroare dacă nu se găsește sala
            }));
        }
        setShowRoomModal(false);  // Închide modalul după alegere
    };

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
    const endTimeOptions = reservation.startTime ? timeOptions.filter(time => time > reservation.startTime) : [];

    const location = useLocation();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const date = searchParams.get('date');
        const startTime = searchParams.get('startTime');
        const endTime = searchParams.get('endTime');
        const roomId = searchParams.get('roomId');
        const name = searchParams.get('name');

        if (date && startTime && endTime && roomId) {
            setReservation(prev => ({
                ...prev,
                date: date,
                startTime: startTime,
                endTime: endTime,
                roomId: roomId,
                name: name
            }));
        }
    }, [location]);

    return (
        <div className="Reservation">
            <Navbar/>
            <div className="background-home p-4 d-flex justify-content-center align-items-center">
                <div className="container">
                    <div className="card p-4" style={{maxWidth: 'none', width: '70%'}}>
                        <div className="row">
                            <button type="button" className="btn btn-secondary"
                                    style={{marginLeft: "2%", marginTop: "0px", marginBottom: "2%"}}
                                    onClick={onAllUserReservations}>
                                Rezervarile mele
                            </button>
                            {role === 'ADMIN' && (
                                <button type="button" className="btn btn-secondary"
                                        style={{marginLeft: "0px", marginTop: "0px", marginBottom: "2%"}}
                                        onClick={onAllReservations}>
                                    Toate rezervarile
                                </button>)}

                        </div>
                        <h4 className="card-title text-center mb-4"><b>Adauga o rezervare</b></h4>
                        {role === 'ADMIN' && (
                            <div>
                                <p className="text-black"><i className="bi bi-info-square"></i> Salile de tip AMFITEATRU si LABORATOR se rezerva doar integral.</p>
                                <p className="text-black"><i className="bi bi-info-square"></i> Salile de tip SALA LECTURA se rezerva pe baza numarului de locuri disponibile.</p>
                            </div>
                        )}
                        {role === 'STUDENT' && (
                            <div>
                                <p className="text-black"><i className="bi bi-info-square"></i> Salile de tip SALA LECTURA se rezerva pe baza numarului de locuri disponibile.</p>
                            </div>
                        )}
                        {role === 'PROFESOR' && (
                            <div>
                                <p className="text-black"><i className="bi bi-info-square"></i> Salile de tip AMFITEATRU se rezerva doar integral.</p>
                            </div>
                        )}
                        {role === 'ASISTENT' && (
                            <div>
                                <p className="text-black"><i className="bi bi-info-square"></i> Salile de tip LABORATOR se rezerva doar integral.</p>
                            </div>
                        )}
                        <hr style={{ backgroundColor: 'black', height: '1px', marginTop: '0px', marginBottom:'5px'}} />
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
                                        className={`form-control ${errors.date ? 'is-invalid' : ''}`}
                                        id="date"
                                        name="date"
                                        value={reservation.date}
                                        onChange={handleInputChange}
                                        min={new Date().toISOString().substring(0, 10)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    {errors.date && <div className="error-message">{errors.date}</div>}
                                </div>
                            </div>
                            {/* Second column */}
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label htmlFor="startTime">Ora de inceput</label>
                                    <select
                                        className={`form-control ${errors.startTime ? 'is-invalid' : ''}`}
                                        id="startTime"
                                        name="startTime"
                                        value={reservation.startTime}
                                        onChange={handleInputChange}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {timeOptions.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                    {errors.startTime && <div className="error-message">{errors.startTime}</div>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="endTime">Ora de sfarsit</label>
                                    <select
                                        className={`form-control ${errors.endTime ? 'is-invalid' : ''}`}
                                        id="endTime"
                                        name="endTime"
                                        value={reservation.endTime}
                                        onChange={handleInputChange}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {endTimeOptions.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                    {errors.endTime && <div className="error-message">{errors.endTime}</div>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="roomId" className="form-label">Sala</label>
                                    <div className="row align-items-center">
                                        <div className="col-sm-12 d-flex">
                                            <input
                                                type="text"
                                                className={`form-control ${errors.roomId ? 'is-invalid' : ''}`}
                                                id="roomId"
                                                name="roomId"
                                                value={reservation.name || (reservation?.roomId ? rooms.find(room => room.id === reservation.roomId)?.name : "")}
                                                placeholder={!reservation.roomId ? "Alege data si intervalul orar" : ""}
                                                readOnly
                                            />
                                            <button
                                                className="btn btn-secondary ml-2"
                                                style={{marginTop: "0px", marginBottom: "0px", marginRight:"0px"}}
                                                onClick={() => setShowRoomModal(true)}
                                                disabled={!reservation.date || !reservation.startTime || !reservation.endTime || !!reservation.roomId}
                                            >
                                                Alege
                                            </button>
                                        </div>
                                    </div>
                                    {errors.roomId && <div className="error-message">{errors.roomId}</div>}
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
                            <h5 className="modal-title">Selecteaza o sala
                            <p className="text-black mb-4"><i className="bi bi-info-square"></i> Salile afisate sunt cele disponibile in data si intervalul orar selectate.</p></h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"
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
                                            <th>Locuri disponibile</th>
                                            <th>Tip</th>
                                            <th>Selecteaza</th>
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
                        ) : (
                            <div>
                                <div className="modal-body" style={{maxHeight: '80vh', overflowY: 'auto'}}>
                                    <table className="table">
                                        <thead>
                                        <tr>
                                            <th>Nume</th>
                                            <th>Locatie</th>
                                            <th>Capacitate</th>
                                            <th>Locuri disponibile</th>
                                            <th>Tip</th>
                                            <th>Selecteaza</th>
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
                            </div>)}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Reservation;

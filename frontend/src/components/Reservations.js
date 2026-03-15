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
        capacityReserved: 1,
        eventType: "CURS",
        // status: "",
        reservationDateTime: new Date().toISOString() // Set the current date and time
    });

    const [showRoomModal, setShowRoomModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [temporaryPermissions, setTemporaryPermissions] = useState([]);

    const selectedRoom = reservation.roomId
        ? rooms.find(room => room.id === Number(reservation.roomId))
        : null;
    const resolvedRoomType = reservation.roomType || selectedRoom?.type;

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
            newErrors.date = "Selectați o dată!";
        }

        if (!reservation.startTime) {
            formIsValid = false;
            newErrors.startTime = "Selectați ora de început!";
        }

        if (!reservation.endTime) {
            formIsValid = false;
            newErrors.endTime = "Selectați ora de sfârșit!";
        }

        if (!reservation.roomId) {
            formIsValid = false;
            newErrors.roomId = "Selectați o sală!";
        }

        if (resolvedRoomType === "SALA LECTURA") {
            const maxCapacity = selectedRoom?.availableCapacity ?? selectedRoom?.capacity;
            if (!reservation.capacityReserved || reservation.capacityReserved < 1) {
                formIsValid = false;
                newErrors.capacityReserved = "Introduceți numărul de locuri!";
            } else if (maxCapacity != null && reservation.capacityReserved > maxCapacity) {
                formIsValid = false;
                newErrors.capacityReserved = `Maxim ${maxCapacity} locuri disponibile.`;
            }
        }

        if (resolvedRoomType === "AMFITEATRU" && !reservation.eventType) {
            formIsValid = false;
            newErrors.eventType = "Selectați tipul evenimentului!";
        }

        if (resolvedRoomType === "LABORATOR" && reservation.startTime && reservation.endTime) {
            const toMinutes = (time) => {
                const [h, m] = time.split(":").map(Number);
                return h * 60 + m;
            };
            const duration = toMinutes(reservation.endTime) - toMinutes(reservation.startTime);
            if (duration < 120) {
                formIsValid = false;
                newErrors.endTime = "Intervalul minim pentru laborator este de 2 ore.";
            }
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
        const token = getAuthToken();
        fetch(`http://localhost:8080/api/v1/users/temporary-permissions/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        })
            .then(response => response.json())
            .then(data => setTemporaryPermissions(data))
            .catch(error => console.error("Error fetching temporary permissions:", error));

        fetchRooms();
    }, [id]);

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
    }, [reservation.date, reservation.startTime, reservation.endTime]); // React to changes in these fields

    const filteredRooms = rooms.filter((room) => {
        if (role === 'ADMIN') {
            // Admin can see all types of rooms
            return true;
        }

        // Collect all roles and permissions
        const userRolesAndPermissions = [role, ...temporaryPermissions];

        // Determine room visibility based on roles and permissions
        if (userRolesAndPermissions.includes('STUDENT') && room.type === 'SALA LECTURA') {
            return true;
        }
        if (userRolesAndPermissions.includes('PROFESOR') && room.type === 'AMFITEATRU') {
            return true;
        }
        return userRolesAndPermissions.includes('ASISTENT') && room.type === 'LABORATOR';

    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setReservation(prevReservation => {
            const parsedValue = name === "capacityReserved" ? Number(value) : value;
            // Check if the modified field is date, startTime, or endTime
            if (['date', 'startTime', 'endTime'].includes(name) && prevReservation.roomId) {
                // If changing date/time, reset roomId
                return {
                    ...prevReservation,
                    [name]: parsedValue,
                    roomId: "",
                    roomType: "",
                    capacityReserved: 1
                };
            }
            return {
                ...prevReservation,
                [name]: parsedValue
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
            // Trimite mereu către endpoint-ul care aplică algoritmul aferent tipului de sală
            const url = "http://localhost:8080/api/v1/reservations/add-reservation";

            const capacityReserved =
                resolvedRoomType === "SALA LECTURA"
                    ? Number(reservation.capacityReserved || 1)
                    : (selectedRoom?.capacity || reservation.capacityReserved || 1);

            const payload = {
                userId: reservation.userId,
                roomId: reservation.roomId,
                date: reservation.date,
                startTime: reservation.startTime,
                endTime: reservation.endTime,
                reservationDateTime: reservation.reservationDateTime,
                capacityReserved,
                eventType: resolvedRoomType === "AMFITEATRU" ? reservation.eventType : null
            };

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });
            if (response.ok) {
                const data = await response.json();
                // Rezervare adăugată cu succes
                console.log("Reservation inserted successfully");
                if (resolvedRoomType === "LABORATOR") {
                    setSuccessMessage(
                        `Rezervare adăugată. Interval alocat: ${data.startTime} - ${data.endTime}.`
                    );
                } else if (resolvedRoomType === "AMFITEATRU") {
                    setSuccessMessage("Cererea a fost înregistrată cu status PENDING.");
                } else {
                    setSuccessMessage("Rezervare adăugată cu succes!");
                }
                setReservation({
                    userId: id,
                    roomId: "",
                    date: "",
                    startTime: "",
                    endTime: "",
                    capacityReserved: 1,
                    eventType: "CURS",
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
            setSuccessMessage("Rezervare adaugată cu succes!");
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
                roomType: room.type,  // Stocăm și tipul sălii
                capacityReserved: room.type === "SALA LECTURA" ? prev.capacityReserved || 1 : room.capacity
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
        const roomType = searchParams.get('roomType');

        if (date && startTime && endTime && roomId) {
            setReservation(prev => ({
                ...prev,
                date: date,
                startTime: startTime,
                endTime: endTime,
                roomId: Number(roomId),
                name: name,
                roomType: roomType || prev.roomType
            }));
        }
    }, [location]);

    useEffect(() => {
        if (!selectedRoom) {
            return;
        }
        setReservation(prev => {
            const next = { ...prev };
            let changed = false;

            if (prev.roomType !== selectedRoom.type) {
                next.roomType = selectedRoom.type;
                changed = true;
            }
            if (selectedRoom.type === "SALA LECTURA") {
                if (!prev.capacityReserved || prev.capacityReserved < 1) {
                    next.capacityReserved = 1;
                    changed = true;
                }
            } else if (prev.capacityReserved !== selectedRoom.capacity) {
                next.capacityReserved = selectedRoom.capacity;
                changed = true;
            }

            return changed ? next : prev;
        });
    }, [selectedRoom]);

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
                                Rezervările mele
                            </button>
                            {role === 'ADMIN' && (
                                <button type="button" className="btn btn-secondary"
                                        style={{marginLeft: "0px", marginTop: "0px", marginBottom: "2%"}}
                                        onClick={onAllReservations}>
                                    Toate rezervările
                                </button>)}

                        </div>
                        <h4 className="card-title text-center mb-4"><b>Adaugă o rezervare</b></h4>
                        <div>
                            <p className="text-black"><i className="bi bi-info-square"></i> Sălile de tip AMFITEATRU și LABORATOR se rezervă doar integral.</p>
                            <p className="text-black"><i className="bi bi-info-square"></i> Sălile de tip SALA LECTURA se rezervă pe baza numărului de locuri disponibile.</p>
                            {resolvedRoomType === "LABORATOR" && (
                                <p className="text-black"><i className="bi bi-info-square"></i> Pentru LABORATOR, algoritmul Round Robin poate aloca primul slot liber de 2 ore din intervalul selectat.</p>
                            )}
                            {resolvedRoomType === "AMFITEATRU" && (
                                <p className="text-black"><i className="bi bi-info-square"></i> Pentru AMFITEATRU, cererea este înregistrată cu status PENDING și se procesează pe baza priorității evenimentului.</p>
                            )}
                        </div>
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
                                    <label htmlFor="startTime">Ora de început</label>
                                    <select
                                        className={`form-control ${errors.startTime ? 'is-invalid' : ''}`}
                                        id="startTime"
                                        name="startTime"
                                        value={reservation.startTime}
                                        onChange={handleInputChange}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <option value="" disabled>selecteaza</option>
                                        {timeOptions.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                    {errors.startTime && <div className="error-message">{errors.startTime}</div>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="endTime">Ora de sfârșit</label>
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
                                {resolvedRoomType === "SALA LECTURA" && (
                                    <div className="form-group">
                                        <label htmlFor="capacityReserved">Locuri rezervate</label>
                                        <input
                                            type="number"
                                            className={`form-control ${errors.capacityReserved ? 'is-invalid' : ''}`}
                                            id="capacityReserved"
                                            name="capacityReserved"
                                            min="1"
                                            max={selectedRoom?.availableCapacity || selectedRoom?.capacity || 1}
                                            value={reservation.capacityReserved}
                                            onChange={handleInputChange}
                                        />
                                        {errors.capacityReserved && <div className="error-message">{errors.capacityReserved}</div>}
                                    </div>
                                )}
                                {resolvedRoomType === "AMFITEATRU" && (
                                    <div className="form-group">
                                        <label htmlFor="eventType">Tip eveniment</label>
                                        <select
                                            className={`form-control ${errors.eventType ? 'is-invalid' : ''}`}
                                            id="eventType"
                                            name="eventType"
                                            value={reservation.eventType || ""}
                                            onChange={handleInputChange}
                                        >
                                            <option value="" disabled>selecteaza</option>
                                            <option value="CURS">Curs</option>
                                            <option value="EXAMEN">Examen</option>
                                            <option value="EVENIMENT">Eveniment</option>
                                            <option value="ALTELE">Altele</option>
                                        </select>
                                        {errors.eventType && <div className="error-message">{errors.eventType}</div>}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button onClick={handleInsertReservation} className="btn btn-primary"
                                style={{marginLeft: "75%"}}>Adaugă rezervare
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
                            <h5 className="modal-title">Selectează o sală
                            <p className="text-black mb-4"><i className="bi bi-info-square"></i> Sălile afișate sunt cele disponibile în data și intervalul orar selectate.</p></h5>
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
                                                        onClick={() => handleSelectRoom(room.id)}
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
                                                        onClick={() => handleSelectRoom(room.id)}
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
    );
}

export default Reservation;

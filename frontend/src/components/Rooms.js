import React, { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';

function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [newRoom, setNewRoom] = useState({ name: "", location: "" });
    const [selectedRoom, setSelectedRoom] = useState(null);
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const { role } = storedUser || {};

    useEffect(() => {
        // Fetch data from the backend
        fetch("http://localhost:8080/api/v1/rooms/all-rooms")
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

    const closeModal = () => {
        setShowAddModal(false);
        setShowDeleteModal(false);
        setNewRoom({ name: "", location: "" }); // Clear form fields on modal close
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewRoom({ ...newRoom, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Make a POST request to the backend endpoint
            const response = await fetch("http://localhost:8080/api/v1/rooms/add-room", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Include any necessary authentication headers
                },
                body: JSON.stringify(newRoom),
            });

            if (response.ok) {
                // If successful, close the modal and refresh the room data
                closeModal();
                // Fetch updated data from the backend
                const updatedRooms = await fetch("http://localhost:8080/api/v1/rooms/all-rooms").then(response => response.json());
                setRooms(updatedRooms);
            } else {
                // Handle errors, e.g., display an error message
                console.error("Failed to add room:", response.statusText);
            }
        } catch (error) {
            console.error("Error adding room:", error);
        }
    };

    const handleDelete = async () => {
        try {
            // Make a DELETE request to the backend endpoint
            const response = await fetch(`http://localhost:8080/api/v1/rooms/delete-room/${selectedRoom.id}`, {
                method: "DELETE",
                headers: {
                    // Include any necessary authentication headers
                },
            });

            if (response.ok) {
                // If successful, close the modal and refresh the room data
                closeModal();
                // Fetch updated data from the backend
                const updatedRooms = await fetch("http://localhost:8080/api/v1/rooms/all-rooms").then(response => response.json());
                setRooms(updatedRooms);
            } else {
                // Handle errors, e.g., display an error message
                console.error("Failed to delete room:", response.statusText);
            }
        } catch (error) {
            console.error("Error deleting room:", error);
        }
    };

    return (
        <div className="Rooms">
            <Navbar />
            <div className="background-home p-4">
                <h2 className="text-white mb-4">
                    Informatii despre sali
                    {role === "ADMIN" && (
                        <button type="button" className="btn btn-secondary" onClick={addRooms}>
                            Adauga sali
                        </button>
                    )}
                </h2>
                <div className="table-responsive">
                    <table className="table table-bordered">
                        <thead className="thead-light">
                        <tr>
                            <th scope="col">Nume</th>
                            <th scope="col">Locatie</th>
                            <th scope="col">Actiuni</th>
                            {/* Add more header columns as needed */}
                        </tr>
                        </thead>
                        <tbody>
                        {rooms.map(room => (
                            <tr key={room.id}>
                                <td className="text-white">{room.name}</td>
                                <td className="text-white">{room.location}</td>
                                <td className="text-white">
                                    <button type="button" className="btn btn-danger" onClick={() => deleteRoom(room)}>
                                        Sterge sala
                                    </button>
                                </td>
                                {/* Add more columns based on the data structure */}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className={`modal ${showAddModal ? 'show' : ''}`} tabIndex="-1" role="dialog" style={{ display: showAddModal ? 'block' : 'none' }}>
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Adauga sali</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={closeModal}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name">Nume:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        name="name"
                                        value={newRoom.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="location">Locatie:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="location"
                                        name="location"
                                        value={newRoom.location}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">Adauga</button>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Room Modal */}
            <div className={`modal ${showDeleteModal ? 'show' : ''}`} tabIndex="-1" role="dialog" style={{ display: showDeleteModal ? 'block' : 'none' }}>
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Sterge sala</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={closeModal}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>Sunteti sigur ca doriti sa stergeti sala?</p>
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

export default Rooms;

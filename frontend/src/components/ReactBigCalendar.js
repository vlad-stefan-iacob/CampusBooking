import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import 'moment/locale/ro';
import { getAuthToken } from "../helpers/axios_helper";

moment.locale("ro");
const localizer = momentLocalizer(moment);

const messages = {
    allDay: 'Toata ziua',
    previous: '<< Anterior',
    next: 'Urmator >>',
    today: 'Azi',
    month: 'Luna',
    week: 'Saptamana',
    day: 'Zi',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Ora',
    event: 'Sala rezervata',
    noEventsInRange: 'Nu exista sali rezervate in aceasta perioada.'
};

export default function ReactBigCalendar() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const storedUser = JSON.parse(localStorage.getItem('user'));
    const { id, role } = storedUser || {};

    useEffect(() => {
        const fetchEvents = async () => {
            if (!id) {
                setError('User ID is undefined');
                return;
            }
            setLoading(true);
            try {
                const token = getAuthToken();
                const headers = {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                };

                let url = `http://localhost:8080/api/v1/reservations/${id}`;
                if (role === "ADMIN") {
                    url = "http://localhost:8080/api/v1/reservations/all-reservations";
                }

                const response = await fetch(url, { headers });
                if (!response.ok) {
                    throw new Error('Failed to fetch reservations');
                }
                const reservations = await response.json();
                const eventsWithRoomNames = await Promise.all(reservations.map(async reservation => {
                    try {
                        const roomResponse = await fetch(`http://localhost:8080/api/v1/rooms/room/${reservation.roomId}`, { headers });
                        if (!roomResponse.ok) {
                            throw new Error('Failed to fetch room details');
                        }

                        const userResponse = await fetch(`http://localhost:8080/api/v1/users/user/${reservation.userId}`, { headers });
                        if (!userResponse.ok) {
                            throw new Error('Failed to fetch user details');
                        }
                        const roomDetails = await roomResponse.json();
                        const userDetails = await userResponse.json();

                        const [year, month, day] = reservation.date.split('-').map(num => parseInt(num, 10));
                        const [startHour, startMinute] = reservation.startTime.split(':').map(num => parseInt(num, 10));
                        const [endHour, endMinute] = reservation.endTime.split(':').map(num => parseInt(num, 10));

                        const title = role === "ADMIN" ?
                            `Sala: ${roomDetails[0].name} (${userDetails[0].lastname} ${userDetails[0].firstname})` :
                            `Sala: ${roomDetails[0].name}`;
                        return {
                            title,
                            start: new Date(year, month - 1, day, startHour, startMinute),
                            end: new Date(year, month - 1, day, endHour, endMinute)
                        };
                    } catch (error) {
                        console.error('Failed to fetch room details', error);
                        return null;
                    }
                }));

                setEvents(eventsWithRoomNames.filter(event => event !== null));
            } catch (error) {
                console.error("Error fetching events:", error);
                setError(error.message);
            }
            setLoading(false);
        };

        fetchEvents();
    }, [id, role]);


    const minTime = new Date();
    minTime.setHours(8, 0, 0);

    const maxTime = new Date();
    maxTime.setHours(22, 0, 0);

    return (
        <div className="App">
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            <Calendar
                views={["month", "week", "day", "agenda"]}
                localizer={localizer}
                defaultDate={new Date()}
                defaultView="week"
                events={events}
                style={{ height: "100vh" }}
                messages={messages}
                min={minTime}
                max={maxTime}
            />
        </div>
    );
}

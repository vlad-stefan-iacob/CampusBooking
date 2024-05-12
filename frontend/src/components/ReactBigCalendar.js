import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import 'moment/locale/ro';
import {getAuthToken} from "../helpers/axios_helper";

moment.locale("ro");
const localizer = momentLocalizer(moment);

const messages = {
    allDay: 'Toata ziua',
    previous: 'Anterior',
    next: 'Urmator',
    today: 'Azi',
    month: 'Lună',
    week: 'Saptamana',
    day: 'Zi',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Ora',
    event: 'Sala rezervata', // Or other custom labels...
};

export default function ReactBigCalendar() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const storedUser = JSON.parse(localStorage.getItem('user'));
    const { id } = storedUser || {};

    useEffect(() => {
        const fetchEvents = async () => {
            if (!id) {
                setError('User ID is undefined');
                return;
            }
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:8080/api/v1/reservations/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch reservations');
                }
                const reservations = await response.json();
                const eventsWithRoomNames = await Promise.all(reservations.map(async reservation => {
                    try {
                        const token = getAuthToken();
                        const roomResponse = await fetch(`http://localhost:8080/api/v1/rooms/room/${reservation.roomId}`, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`,
                            },
                        });
                        if (!roomResponse.ok) {
                            throw new Error('Failed to fetch room details');
                        }
                        const roomDetails = await roomResponse.json();
                        const [year, month, day] = reservation.date.split('-').map(num => parseInt(num, 10));
                        const [startHour, startMinute] = reservation.startTime.split(':').map(num => parseInt(num, 10));
                        const [endHour, endMinute] = reservation.endTime.split(':').map(num => parseInt(num, 10));

                        return {
                            title: `Sala: ${roomDetails[0].name}`,
                            start: new Date(year, month - 1, day, startHour, startMinute),
                            end: new Date(year, month - 1, day, endHour, endMinute)
                        };
                    } catch (error) {
                        console.error('Failed to fetch room details', error);
                        return null; // Return null for this event if fetching fails
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
    }, [id]);

    const minTime = new Date();
    minTime.setHours(8, 0, 0);

    const maxTime = new Date();
    maxTime.setHours(22, 0, 0);

    return (
        <div className="App">
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            <Calendar
                views={["month", "day", "week", "agenda"]}
                selectable
                localizer={localizer}
                defaultDate={new Date()}
                defaultView="day"
                events={events}
                style={{ height: "100vh" }}
                messages={messages}
                min={minTime}
                max={maxTime}
            />
        </div>
    );
}

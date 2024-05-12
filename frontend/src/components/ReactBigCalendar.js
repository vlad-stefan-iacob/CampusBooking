import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import events from "./events";
import "react-big-calendar/lib/css/react-big-calendar.css";
import 'moment/locale/ro';

moment.locale("ro");
const localizer = momentLocalizer(moment);

const messages = {
    allDay: 'Toata ziua',
    previous: 'Anterior',
    next: 'Urmator',
    today: 'Azi',
    month: 'Luna',
    week: 'Saptamana',
    day: 'Zi',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Ora',
    event: 'Eveniment', // Or other custom labels...
};

export default function ReactBigCalendar() {
    const [eventsData] = useState(events);
    const minTime = new Date();
    minTime.setHours(8, 0, 0);

    const maxTime = new Date();
    maxTime.setHours(22, 0, 0);

    return (
        <div className="App">
            <Calendar
                views={["month", "day", "week", "agenda"]}
                selectable
                localizer={localizer}
                defaultDate={new Date()}
                defaultView="day"
                events={eventsData}
                style={{ height: "100vh" }}
                messages={messages}
                min={minTime}
                max={maxTime}
            />
        </div>
    );
}

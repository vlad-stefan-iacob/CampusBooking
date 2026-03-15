package com.licenta.backend.scheduling;

import com.licenta.backend.entities.Reservation;
import com.licenta.backend.entities.Room;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class FCFSScheduler implements SchedulingAlgorithm {

    @Override
    public boolean isReservationAllowed(List<Reservation> existing, Reservation newOne) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

        LocalTime newStart = LocalTime.parse(newOne.getStartTime(), formatter);
        LocalTime newEnd = LocalTime.parse(newOne.getEndTime(), formatter);

        int totalReserved = 0;

        for (Reservation r : existing) {
            if (!r.getDate().equals(newOne.getDate())) continue;

            LocalTime rStart = LocalTime.parse(r.getStartTime(), formatter);
            LocalTime rEnd = LocalTime.parse(r.getEndTime(), formatter);

            boolean overlap = rStart.isBefore(newEnd) && newStart.isBefore(rEnd);

            if (overlap) {
                totalReserved += r.getCapacityReserved();
            }
        }

        int roomCapacity = newOne.getRoom().getCapacity();
        int stillAvailable = roomCapacity - totalReserved;

        return stillAvailable >= newOne.getCapacityReserved();
    }
}

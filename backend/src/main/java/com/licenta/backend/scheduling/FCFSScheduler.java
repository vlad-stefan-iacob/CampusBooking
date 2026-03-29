package com.licenta.backend.scheduling;

import com.licenta.backend.entities.Reservation;
import com.licenta.backend.entities.Room;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.ZoneId;
import java.util.List;

public class FCFSScheduler implements SchedulingAlgorithm {

    private static final Logger logger = LoggerFactory.getLogger(FCFSScheduler.class);

    @Override
    public boolean isReservationAllowed(List<Reservation> existing, Reservation newOne) {
        logger.info("FCFSScheduler start: roomId={}, date={}, startTime={}, endTime={}, capacityRequested={}, existingCount={}",
                newOne.getRoom() != null ? newOne.getRoom().getId() : null,
                newOne.getDate(),
                newOne.getStartTime(),
                newOne.getEndTime(),
                newOne.getCapacityReserved(),
                existing != null ? existing.size() : 0);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

        LocalTime newStart = LocalTime.parse(newOne.getStartTime(), formatter);
        LocalTime newEnd = LocalTime.parse(newOne.getEndTime(), formatter);

        int totalReserved = 0;

        for (Reservation r : existing) {
            if (!isSameDay(r.getDate(), newOne.getDate())) continue;

            LocalTime rStart = LocalTime.parse(r.getStartTime(), formatter);
            LocalTime rEnd = LocalTime.parse(r.getEndTime(), formatter);

            boolean overlap = rStart.isBefore(newEnd) && newStart.isBefore(rEnd);

            if (overlap) {
                totalReserved += r.getCapacityReserved();
            }
        }

        int roomCapacity = newOne.getRoom().getCapacity();
        int stillAvailable = roomCapacity - totalReserved;

        boolean allowed = stillAvailable >= newOne.getCapacityReserved();
        logger.info("FCFSScheduler end: allowed={}, totalReserved={}, roomCapacity={}, stillAvailable={}",
                allowed, totalReserved, roomCapacity, stillAvailable);
        return allowed;
    }

    private boolean isSameDay(java.util.Date first, java.util.Date second) {
        if (first == null || second == null) {
            return false;
        }
        ZoneId zone = ZoneId.systemDefault();
        LocalDate firstDate = first.toInstant().atZone(zone).toLocalDate();
        LocalDate secondDate = second.toInstant().atZone(zone).toLocalDate();
        return firstDate.equals(secondDate);
    }
}

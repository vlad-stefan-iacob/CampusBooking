package com.licenta.backend.scheduling;

import com.licenta.backend.entities.Reservation;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class RoundRobinScheduler implements SchedulingAlgorithm {

    private static final Logger logger = LoggerFactory.getLogger(RoundRobinScheduler.class);
    private static final int SLOT_DURATION_MINUTES = 120;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    @Override
    public boolean isReservationAllowed(List<Reservation> existing, Reservation newOne) {
        logger.info("RoundRobinScheduler start: roomId={}, date={}, startTime={}, endTime={}, existingCount={}",
                newOne.getRoom() != null ? newOne.getRoom().getId() : null,
                newOne.getDate(),
                newOne.getStartTime(),
                newOne.getEndTime(),
                existing != null ? existing.size() : 0);
        boolean allowed = !getAvailableSlots(existing, newOne).isEmpty();
        logger.info("RoundRobinScheduler end: allowed={}", allowed);
        return allowed;
    }

    public void applyScheduling(List<Reservation> existing, Reservation newOne) {
        logger.info("RoundRobinScheduler apply start: roomId={}, date={}, requestedStart={}, requestedEnd={}",
                newOne.getRoom() != null ? newOne.getRoom().getId() : null,
                newOne.getDate(),
                newOne.getStartTime(),
                newOne.getEndTime());
        List<TimeSlot> availableSlots = getAvailableSlots(existing, newOne);

        if (availableSlots.isEmpty()) {
            throw new IllegalStateException("No available slots");
        }

        List<TimeSlot> requestedSlots = splitIntoSlots(newOne);
        if (availableSlots.size() == requestedSlots.size()) {
            logger.info("RoundRobinScheduler apply end: full interval available");
            return;
        }

        TimeSlot slot = availableSlots.get(0);
        newOne.setStartTime(slot.start.toString());
        newOne.setEndTime(slot.end.toString());
        logger.info("RoundRobinScheduler apply end: assignedStart={}, assignedEnd={}", newOne.getStartTime(), newOne.getEndTime());
    }


    private List<TimeSlot> getAvailableSlots(List<Reservation> existing, Reservation newOne) {
        Set<TimeSlot> occupied = new HashSet<>();

        for (Reservation r : existing) {
            if (!isSameDay(r.getDate(), newOne.getDate())) continue;
            occupied.addAll(splitIntoSlots(r));
        }

        List<TimeSlot> requested = splitIntoSlots(newOne);
        List<TimeSlot> available = new ArrayList<>();

        for (TimeSlot slot : requested) {
            if (!occupied.contains(slot)) {
                available.add(slot);
            }
        }

        return available;
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

    private List<TimeSlot> splitIntoSlots(Reservation r) {
        LocalTime start = LocalTime.parse(r.getStartTime(), FORMATTER);
        LocalTime end = LocalTime.parse(r.getEndTime(), FORMATTER);

        List<TimeSlot> slots = new ArrayList<>();
        while (start.isBefore(end)) {
            LocalTime slotEnd = start.plusMinutes(SLOT_DURATION_MINUTES);
            if (slotEnd.isAfter(end)) slotEnd = end;
            slots.add(new TimeSlot(start, slotEnd));
            start = slotEnd;
        }
        return slots;
    }

    private static class TimeSlot {
        LocalTime start;
        LocalTime end;

        TimeSlot(LocalTime start, LocalTime end) {
            this.start = start;
            this.end = end;
        }

        @Override
        public boolean equals(Object o) {
            if (!(o instanceof TimeSlot)) return false;
            TimeSlot other = (TimeSlot) o;
            return start.equals(other.start) && end.equals(other.end);
        }

        @Override
        public int hashCode() {
            return start.hashCode() * 31 + end.hashCode();
        }
    }
}

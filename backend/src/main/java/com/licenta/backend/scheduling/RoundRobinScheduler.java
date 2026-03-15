package com.licenta.backend.scheduling;

import com.licenta.backend.entities.Reservation;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class RoundRobinScheduler implements SchedulingAlgorithm {

    private static final int SLOT_DURATION_MINUTES = 120;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    @Override
    public boolean isReservationAllowed(List<Reservation> existing, Reservation newOne) {
        return !getAvailableSlots(existing, newOne).isEmpty();
    }

    public void applyScheduling(List<Reservation> existing, Reservation newOne) {
        List<TimeSlot> availableSlots = getAvailableSlots(existing, newOne);

        if (availableSlots.isEmpty()) {
            throw new IllegalStateException("No available slots");
        }

        TimeSlot slot = availableSlots.get(0);
        newOne.setStartTime(slot.start.toString());
        newOne.setEndTime(slot.end.toString());
    }


    private List<TimeSlot> getAvailableSlots(List<Reservation> existing, Reservation newOne) {
        Set<TimeSlot> occupied = new HashSet<>();

        for (Reservation r : existing) {
            if (!r.getDate().equals(newOne.getDate())) continue;
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
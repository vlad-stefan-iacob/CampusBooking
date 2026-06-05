package com.licenta.backend.scheduling;

import com.licenta.backend.entities.Reservation;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

public class RoundRobinScheduler implements SchedulingAlgorithm {

    private static final Logger logger = LoggerFactory.getLogger(RoundRobinScheduler.class);
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private final int slotDurationMinutes;

    public RoundRobinScheduler() {
        this(120);
    }

    public RoundRobinScheduler(Integer slotDurationMinutes) {
        this.slotDurationMinutes = slotDurationMinutes != null && slotDurationMinutes > 0 ? slotDurationMinutes : 120;
    }

    @Override
    public boolean isReservationAllowed(List<Reservation> existing, Reservation newOne) {
        logger.info("RoundRobinScheduler start: roomId={}, date={}, startTime={}, endTime={}, existingCount={}",
                newOne.getRoom() != null ? newOne.getRoom().getId() : null,
                newOne.getDate(),
                newOne.getStartTime(),
                newOne.getEndTime(),
                existing != null ? existing.size() : 0);
        boolean allowed = findAllocation(existing, newOne).isPresent();
        logger.info("RoundRobinScheduler end: allowed={}", allowed);
        return allowed;
    }

    public void applyScheduling(List<Reservation> existing, Reservation newOne) {
        logger.info("RoundRobinScheduler apply start: roomId={}, date={}, requestedStart={}, requestedEnd={}",
                newOne.getRoom() != null ? newOne.getRoom().getId() : null,
                newOne.getDate(),
                newOne.getStartTime(),
                newOne.getEndTime());
        Optional<TimeSlot> allocation = findAllocation(existing, newOne);
        if (allocation.isEmpty()) {
            throw new IllegalStateException("No available slots");
        }

        TimeSlot slot = allocation.get();
        if (slot.matches(newOne.getStartTime(), newOne.getEndTime())) {
            logger.info("RoundRobinScheduler apply end: full interval available");
            return;
        }

        newOne.setStartTime(slot.start.toString());
        newOne.setEndTime(slot.end.toString());
        logger.info("RoundRobinScheduler apply end: assignedStart={}, assignedEnd={}", newOne.getStartTime(), newOne.getEndTime());
    }


    private Optional<TimeSlot> findAllocation(List<Reservation> existing, Reservation newOne) {
        LocalTime requestedStart = LocalTime.parse(newOne.getStartTime(), FORMATTER);
        LocalTime requestedEnd = LocalTime.parse(newOne.getEndTime(), FORMATTER);
        int requestedDuration = (int) java.time.Duration.between(requestedStart, requestedEnd).toMinutes();

        if (requestedDuration < slotDurationMinutes) {
            return Optional.empty();
        }

        if (isWindowFree(existing, newOne, requestedStart, requestedEnd)) {
            return Optional.of(new TimeSlot(requestedStart, requestedEnd));
        }

        LocalTime latestStart = requestedEnd.minusMinutes(slotDurationMinutes);
        for (LocalTime candidateStart = requestedStart;
             !candidateStart.isAfter(latestStart);
             candidateStart = candidateStart.plusHours(1)) {
            LocalTime candidateEnd = candidateStart.plusMinutes(slotDurationMinutes);
            if (candidateEnd.isAfter(requestedEnd)) {
                continue;
            }
            if (isWindowFree(existing, newOne, candidateStart, candidateEnd)) {
                return Optional.of(new TimeSlot(candidateStart, candidateEnd));
            }
        }

        return Optional.empty();
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

    private boolean isWindowFree(List<Reservation> existing, Reservation request, LocalTime candidateStart, LocalTime candidateEnd) {
        if (existing == null) {
            return true;
        }

        for (Reservation reservation : existing) {
            if (!isSameDay(reservation.getDate(), request.getDate())) {
                continue;
            }
            LocalTime existingStart = LocalTime.parse(reservation.getStartTime(), FORMATTER);
            LocalTime existingEnd = LocalTime.parse(reservation.getEndTime(), FORMATTER);
            if (candidateStart.isBefore(existingEnd) && existingStart.isBefore(candidateEnd)) {
                return false;
            }
        }
        return true;
    }

    private static class TimeSlot {
        LocalTime start;
        LocalTime end;

        TimeSlot(LocalTime start, LocalTime end) {
            this.start = start;
            this.end = end;
        }

        boolean matches(String startTime, String endTime) {
            return start.toString().equals(startTime) && end.toString().equals(endTime);
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

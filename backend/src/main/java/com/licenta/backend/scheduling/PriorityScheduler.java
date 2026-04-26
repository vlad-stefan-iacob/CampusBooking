package com.licenta.backend.scheduling;

import com.licenta.backend.entities.Reservation;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalTime;
import java.util.*;

public class PriorityScheduler implements SchedulingAlgorithm {

    private static final Logger logger = LoggerFactory.getLogger(PriorityScheduler.class);

    @Override
    public boolean isReservationAllowed(List<Reservation> existingReservations, Reservation newReservation) {
        return true;
    }

    public void applyScheduling(List<Reservation> pendingReservations, List<Reservation> existingConfirmed) {
        logger.info("PriorityScheduler apply start: pending={}, accepted={}",
                pendingReservations != null ? pendingReservations.size() : 0,
                existingConfirmed != null ? existingConfirmed.size() : 0);
        pendingReservations.sort(Comparator.comparingInt(Reservation::getPriority));
        List<Reservation> accepted = new ArrayList<>(existingConfirmed);

        for (Reservation r : pendingReservations) {
            boolean conflict = false;

            for (Reservation existing : accepted) {
                if (isOverlap(existing, r)) {
                    conflict = true;
                    break;
                }
            }

            if (!conflict) {
                r.setStatus("APROBATA");
                accepted.add(r);
            } else {
                r.setStatus("RESPINSA");
            }
        }
        long acceptedCount = pendingReservations.stream().filter(r -> "APROBATA".equals(r.getStatus())).count();
        long rejectedCount = pendingReservations.stream().filter(r -> "RESPINSA".equals(r.getStatus())).count();
        logger.info("PriorityScheduler apply end: accepted={}, rejected={}", acceptedCount, rejectedCount);
    }

    private boolean isOverlap(Reservation r1, Reservation r2) {
        if (!r1.getDate().equals(r2.getDate())) return false;
        if (r1.getRoom() == null || r2.getRoom() == null) return false;
        if (!r1.getRoom().getId().equals(r2.getRoom().getId())) return false;

        LocalTime start1 = LocalTime.parse(r1.getStartTime());
        LocalTime end1 = LocalTime.parse(r1.getEndTime());
        LocalTime start2 = LocalTime.parse(r2.getStartTime());
        LocalTime end2 = LocalTime.parse(r2.getEndTime());

        return start1.isBefore(end2) && start2.isBefore(end1);
    }
}

package com.licenta.backend.scheduling;

import com.licenta.backend.entities.Reservation;

import java.time.LocalTime;
import java.util.*;

public class PriorityScheduler implements SchedulingAlgorithm {

    @Override
    public boolean isReservationAllowed(List<Reservation> existingReservations, Reservation newReservation) {
        return true; // Nu folosit în acest caz
    }

    public void applyScheduling(List<Reservation> pendingReservations, List<Reservation> existingConfirmed) {
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
                r.setStatus("ACCEPTED");
                accepted.add(r);
            } else {
                r.setStatus("REJECTED");
            }
        }
    }

    private boolean isOverlap(Reservation r1, Reservation r2) {
        if (!r1.getDate().equals(r2.getDate())) return false;

        LocalTime start1 = LocalTime.parse(r1.getStartTime());
        LocalTime end1 = LocalTime.parse(r1.getEndTime());
        LocalTime start2 = LocalTime.parse(r2.getStartTime());
        LocalTime end2 = LocalTime.parse(r2.getEndTime());

        return start1.isBefore(end2) && start2.isBefore(end1);
    }
}
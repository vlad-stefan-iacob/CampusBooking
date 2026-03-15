package com.licenta.backend.scheduling;

import com.licenta.backend.entities.Reservation;

import java.util.List;

public interface SchedulingAlgorithm {
    boolean isReservationAllowed(List<Reservation> existingReservations, Reservation newReservation);
}
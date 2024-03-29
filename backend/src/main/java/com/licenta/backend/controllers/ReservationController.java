package com.licenta.backend.controllers;

import com.licenta.backend.dto.ReservationDTO;
import com.licenta.backend.entities.Reservation;
import com.licenta.backend.services.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reservations")
public class ReservationController {
    @Autowired
    ReservationService reservationService;

    @PostMapping("/add-reservation")
    public Reservation createReservation(@RequestBody ReservationDTO reservationDTO){
        return reservationService.insertReservation(reservationDTO);
    }
}

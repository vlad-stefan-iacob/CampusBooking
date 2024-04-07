package com.licenta.backend.controllers;

import com.licenta.backend.dto.ReservationDTO;
import com.licenta.backend.dto.RoomDTO;
import com.licenta.backend.entities.Reservation;
import com.licenta.backend.entities.Room;
import com.licenta.backend.services.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reservations")
public class ReservationController {
    @Autowired
    ReservationService reservationService;

    @PostMapping("/add-reservation")
    public Reservation createReservation(@RequestBody ReservationDTO reservationDTO){
        return reservationService.insertReservation(reservationDTO);
    }
    @GetMapping("/all-reservations")
    public List<ReservationDTO> getAllReservations(){
        return reservationService.getAllReservations();
    }

    @GetMapping("/{userId}")
    public List<ReservationDTO> getReservationsByUserId(@PathVariable Integer userId){
        return reservationService.getReservationsByUserId(userId);
    }
    @DeleteMapping("/delete-reservation/{reservationId}")
    public String deleteReservation(@PathVariable Integer reservationId) {
        reservationService.deleteReservation(reservationId);
        return "Reservation deleted";
    }
    @PutMapping("/update-reservation/{reservationId}")
    public Reservation updateRoom(@PathVariable Integer reservationId, @RequestBody ReservationDTO updatedReservation) {
        return reservationService.updateReservation(reservationId, updatedReservation);
    }
}

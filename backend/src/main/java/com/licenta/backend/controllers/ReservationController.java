package com.licenta.backend.controllers;

import com.licenta.backend.converter.ReservationDTOConverter;
import com.licenta.backend.dto.ReservationDTO;
import com.licenta.backend.entities.Reservation;
import com.licenta.backend.repositories.ReservationRepository;
import com.licenta.backend.repositories.RoomRepository;
import com.licenta.backend.repositories.UserRepository;
import com.licenta.backend.services.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reservations")
public class ReservationController {
    @Autowired
    ReservationService reservationService;

    @Autowired
    UserRepository userRepository;

    @Autowired
    ReservationRepository reservationRepository;

    @Autowired
    RoomRepository roomRepository;

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
    public Reservation updateReservation(@PathVariable Integer reservationId, @RequestBody ReservationDTO updatedReservation) {
        return reservationService.updateReservation(reservationId, updatedReservation);
    }

    @PostMapping("/reserve-reading-room/{roomId}")
    public ResponseEntity<?> reserveReadingRoom(@PathVariable Integer roomId, @RequestBody ReservationDTO reservationDTO) {
        try {
            Integer availableCapacity = reservationService.checkAvailableCapacity(roomId, reservationDTO.getDate(), reservationDTO.getStartTime(), reservationDTO.getEndTime());
            if (availableCapacity >= reservationDTO.getCapacityReserved()) {
                Reservation reservation = ReservationDTOConverter.convertToEntity(reservationDTO, userRepository.findById(reservationDTO.getUserId()).orElseThrow(() -> new RuntimeException("User not found")), roomRepository.findById(roomId).orElseThrow(() -> new RuntimeException("Room not found")));
                reservation.setCapacityReserved(reservationDTO.getCapacityReserved());
                reservationRepository.save(reservation);
                return ResponseEntity.ok().body("Reservation successful with " + reservationDTO.getCapacityReserved() + " seats reserved.");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Insufficient available capacity. Only " + availableCapacity + " seats are available.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing your request: " + e.getMessage());
        }
    }

}

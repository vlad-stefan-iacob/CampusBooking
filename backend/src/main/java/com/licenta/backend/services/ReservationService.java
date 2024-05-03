package com.licenta.backend.services;

import com.licenta.backend.converter.ReservationDTOConverter;
import com.licenta.backend.dto.ReservationDTO;
import com.licenta.backend.entities.Reservation;
import com.licenta.backend.entities.Room;
import com.licenta.backend.entities.User;
import com.licenta.backend.exceptions.ReservationNotFoundException;
import com.licenta.backend.exceptions.RoomNotFoundException;
import com.licenta.backend.exceptions.UserNotFoundException;
import com.licenta.backend.repositories.ReservationRepository;
import com.licenta.backend.repositories.RoomRepository;
import com.licenta.backend.repositories.UserRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReservationService {
    @Autowired
    private ReservationRepository reservationRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private ReservationDTOConverter reservationDTOConverter;

    public List<ReservationDTO> getAllReservations() {
        return reservationRepository.findAll().stream()
                .map(ReservationDTOConverter::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ReservationDTO> getReservationsByUserId(Integer userId) {
        return reservationRepository.findByUserId(userId).stream()
                .map(ReservationDTOConverter::convertToDTO)
                .collect(Collectors.toList());
    }
    public Reservation insertReservation(ReservationDTO reservationDTO){
        Reservation reservation = new Reservation();
        reservation.setDate(reservationDTO.getDate());
        reservation.setStartTime(reservationDTO.getStartTime());
        reservation.setEndTime(reservationDTO.getEndTime());
        reservation.setReservationDateTime(new Date()); // Assuming current date/time for reservation creation
        reservation.setCapacityReserved(reservationDTO.getCapacityReserved());

        // Retrieve User entity
        User user = userRepository.findById(reservationDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Retrieve Room entity
        Room room = roomRepository.findById(reservationDTO.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        reservation.setUser(user);
        reservation.setRoom(room);

        return reservationRepository.save(reservation);
    }

    public void deleteReservation(Integer reservationId) {
        reservationRepository.deleteById(reservationId);
    }

    public Reservation updateReservation(Integer reservationId, ReservationDTO reservationDTO) {
        Optional<Reservation> existingReservation = reservationRepository.findById(reservationId);
        if (existingReservation.isPresent()) {
            Reservation reservation = existingReservation.get();
            // Update the fields of the existing reservation entity
            reservation.setDate(reservationDTO.getDate());
            reservation.setStartTime(reservationDTO.getStartTime());
            reservation.setEndTime(reservationDTO.getEndTime());
            reservation.setCapacityReserved(reservationDTO.getCapacityReserved());
            reservation.setUser(userRepository.findById(reservationDTO.getUserId()).orElseThrow(() -> new UserNotFoundException("User with ID: " + reservationDTO.getUserId() + " not found!")));
            reservation.setRoom(roomRepository.findById(reservationDTO.getRoomId()).orElseThrow(() -> new RoomNotFoundException("Room with ID: " + reservationDTO.getRoomId() + " not found!")));
            // Save and return the updated reservation entity
            return reservationRepository.save(reservation);
        } else {
            throw new ReservationNotFoundException("Reservation with ID: " + reservationId + " not found!");
        }
    }

    public Integer checkAvailableCapacity(Integer roomId, Date date, String startTime, String endTime) {
        return roomRepository.findAvailableCapacity(roomId, date, startTime, endTime);
    }

}

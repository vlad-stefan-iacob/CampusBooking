package com.licenta.backend.services;

import com.licenta.backend.converter.ReservationDTOConverter;
import com.licenta.backend.dto.ReservationDTO;
import com.licenta.backend.entities.Reservation;
import com.licenta.backend.entities.ReservationStatus;
import com.licenta.backend.entities.Room;
import com.licenta.backend.entities.User;
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
import java.util.stream.Collectors;

import static com.licenta.backend.entities.ReservationStatus.VIITOR;

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
        reservation.setStatus(ReservationStatus.valueOf(String.valueOf(VIITOR)));
        reservation.setReservationDateTime(new Date()); // Assuming current date/time for reservation creation

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
}

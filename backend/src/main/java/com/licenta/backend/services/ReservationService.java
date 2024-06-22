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

import java.text.SimpleDateFormat;
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
    private EmailService emailService;

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

    public static String formatDate(String dateString) {
        try {
            // Definește formatul inițial al datei
            SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSSSSS");
            Date date = inputFormat.parse(dateString);

            // Definește formatul dorit al datei
            SimpleDateFormat outputFormat = new SimpleDateFormat("dd-MM-yyyy");
            return outputFormat.format(date);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    public Reservation insertReservation(ReservationDTO reservationDTO) {
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

        Reservation savedReservation = reservationRepository.save(reservation);

        // Send email notification
        try {
            String to = user.getEmail();
            String subject = "Confirmarea rezervării";
            String formattedDate = formatDate(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSSSSS").format(reservation.getDate()));
            String text = String.format("""
                            Dragă %s %s,

                            Rezervarea ta pentru sala %s din data de %s de la ora %s la ora %s este confirmată.
                            Pentru modificarea sau anularea rezervării, accesează pagina Rezervări -> Rezervările mele.

                            Toate cele bune,
                            Echipa CampusBooking""",
                    user.getFirstname(), user.getLastname(), room.getName(), formattedDate, reservation.getStartTime(), reservation.getEndTime());
            emailService.sendSimpleEmail(to, subject, text);
        } catch (Exception e) {
            // Handle the exception, e.g., log it
            System.err.println("Failed to send email: " + e.getMessage());
            e.printStackTrace();
        }

        return savedReservation;
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

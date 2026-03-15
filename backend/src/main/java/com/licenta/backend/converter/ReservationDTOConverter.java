package com.licenta.backend.converter;

import com.licenta.backend.dto.ReservationDTO;
import com.licenta.backend.entities.Reservation;
import com.licenta.backend.entities.User;
import com.licenta.backend.entities.Room;
import org.springframework.stereotype.Service;

@Service
public class ReservationDTOConverter {

    public static ReservationDTO convertToDTO(Reservation reservation) {
        return ReservationDTO.builder()
                .id(reservation.getId())
                .userId(reservation.getUser().getId())
                .roomId(reservation.getRoom().getId())
                .date(reservation.getDate())
                .startTime(reservation.getStartTime())
                .endTime(reservation.getEndTime())
                .reservationDateTime(reservation.getReservationDateTime())
                .capacityReserved(reservation.getCapacityReserved())
                .priority(reservation.getPriority())
                .status(reservation.getStatus())
                .eventType(reservation.getEventType())
                .build();
    }

    public static Reservation convertToEntity(ReservationDTO dto, User user, Room room) {
        return Reservation.builder()
                .id(dto.getId())
                .user(user)
                .room(room)
                .date(dto.getDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .reservationDateTime(dto.getReservationDateTime())
                .capacityReserved(dto.getCapacityReserved()) // Include reserved capacity
                .priority(dto.getPriority())
                .status(dto.getStatus())
                .eventType(dto.getEventType())
                .build();
    }
}

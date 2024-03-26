package com.licenta.backend.converter;

import com.licenta.backend.dto.ReservationDTO;
import com.licenta.backend.entities.Reservation;
import com.licenta.backend.entities.User;
import com.licenta.backend.entities.Room;

public class ReservationDTOConverter {

    public static ReservationDTO convertToDTO(Reservation reservation) {
        return ReservationDTO.builder()
                .userId(reservation.getUser().getId())
                .roomId(reservation.getRoom().getId())
                .date(reservation.getDate())
                .startTime(reservation.getStartTime())
                .endTime(reservation.getEndTime())
                .status(reservation.getStatus())
                .build();
    }

    public static Reservation convertToEntity(ReservationDTO dto, User user, Room room) {
        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setRoom(room);
        reservation.setDate(dto.getDate());
        reservation.setStartTime(dto.getStartTime());
        reservation.setEndTime(dto.getEndTime());
        reservation.setStatus(dto.getStatus());
        return reservation;
    }
}


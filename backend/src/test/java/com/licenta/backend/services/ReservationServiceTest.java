package com.licenta.backend.services;

import com.licenta.backend.dto.ReservationDTO;
import com.licenta.backend.entities.Reservation;
import com.licenta.backend.entities.Room;
import com.licenta.backend.entities.User;
import com.licenta.backend.repositories.ReservationRepository;
import com.licenta.backend.repositories.RoomRepository;
import com.licenta.backend.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Date;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

public class ReservationServiceTest {

    private ReservationService reservationService;
    private ReservationRepository reservationRepository;
    private UserRepository userRepository;
    private RoomRepository roomRepository;
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        reservationRepository = mock(ReservationRepository.class);
        userRepository = mock(UserRepository.class);
        roomRepository = mock(RoomRepository.class);
        emailService = mock(EmailService.class);

        reservationService = new ReservationService();
        reservationService.setReservationRepository(reservationRepository);
        reservationService.setUserRepository(userRepository);
        reservationService.setRoomRepository(roomRepository);
        reservationService.setEmailService(emailService);
    }

    @Test
    void testInsertReservation_shouldSaveReservationAndSendEmail() {
        ReservationDTO dto = new ReservationDTO();
        dto.setUserId(1);
        dto.setRoomId(1);
        dto.setDate(new Date());
        dto.setStartTime("10:00");
        dto.setEndTime("12:00");
        dto.setCapacityReserved(3);

        User user = new User();
        user.setId(1);
        user.setFirstname("John");
        user.setLastname("Doe");
        user.setEmail("john@example.com");

        Room room = new Room();
        room.setId(1);
        room.setName("Sala L1");

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(roomRepository.findById(1)).thenReturn(Optional.of(room));
        when(reservationRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Reservation result = reservationService.insertReservation(dto);

        assertNotNull(result);
        assertEquals(user, result.getUser());
        assertEquals(room, result.getRoom());
        assertEquals(3, result.getCapacityReserved());

        verify(emailService).sendSimpleEmail(
                eq("john@example.com"),
                contains("Confirmarea rezervării"),
                contains("Sala L1")
        );
    }

    @Test
    void testCheckAvailableCapacity_returnsCorrectValue() {
        Date date = new Date();
        when(roomRepository.findAvailableCapacity(1, date, "10:00", "12:00")).thenReturn(8);

        Integer available = reservationService.checkAvailableCapacity(1, date, "10:00", "12:00");
        assertEquals(8, available);
    }
}

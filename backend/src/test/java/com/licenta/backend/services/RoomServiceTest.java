package com.licenta.backend.services;

import com.licenta.backend.converter.RoomDTOConverter;
import com.licenta.backend.dto.RoomDTO;
import com.licenta.backend.entities.Reservation;
import com.licenta.backend.entities.Room;
import com.licenta.backend.repositories.ReservationRepository;
import com.licenta.backend.repositories.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class RoomServiceTest {

    private RoomRepository roomRepository;
    private ReservationRepository reservationRepository;
    private RoomDTOConverter roomDTOConverter;
    private RoomService roomService;

    @BeforeEach
    void setUp() {
        roomRepository = mock(RoomRepository.class);
        reservationRepository = mock(ReservationRepository.class);
        roomDTOConverter = mock(RoomDTOConverter.class);
        roomService = new RoomService(roomRepository, reservationRepository, roomDTOConverter);
    }

    @Test
    void testFindAvailableRooms_returnsConvertedDTOs_withAvailableCapacity() throws Exception {
        // Arrange
        Date date = new SimpleDateFormat("yyyy-MM-dd").parse("2025-04-01");
        String startTime = "10:00";
        String endTime = "12:00";

        Room room = new Room();
        room.setId(1);
        room.setType("SALA LECTURA");
        room.setCapacity(20);

        Reservation existing = new Reservation();
        existing.setDate(date);
        existing.setStartTime("10:30");
        existing.setEndTime("11:30");
        existing.setCapacityReserved(6);

        RoomDTO dto = new RoomDTO();
        dto.setName("Sala L1");

        when(roomRepository.findAll()).thenReturn(List.of(room));
        when(reservationRepository.findByRoomIdAndDate(1, date)).thenReturn(List.of(existing));
        when(roomDTOConverter.convertToDTO(room)).thenReturn(dto);

        // Act
        List<RoomDTO> result = roomService.findAvailableRooms(date, startTime, endTime);

        // Assert
        assertEquals(1, result.size());
        assertEquals("Sala L1", result.get(0).getName());
        assertEquals(14, result.get(0).getAvailableCapacity());

        verify(roomRepository).findAll();
        verify(reservationRepository).findByRoomIdAndDate(1, date);
        verify(roomDTOConverter).convertToDTO(room);
    }

    @Test
    void testFindAvailableRooms_forAmfiteatru_shouldIgnoreConflicts() throws Exception {
        // definim o data si un interval orar pentru care vrem sa gasim sali disponibile
        Date date = new SimpleDateFormat("yyyy-MM-dd").parse("2025-04-01");
        String startTime = "10:00";
        String endTime = "12:00";

        // cream un obiect Room care simuleaza o sala de tip "AMFITEATRU"
        Room room = new Room();
        room.setId(2);
        room.setType("AMFITEATRU"); // tipul este esențial pentru logica testată

        // cream un DTO care va fi returnat de converter (nu conține capacitate disponibila)
        RoomDTO dto = new RoomDTO();
        dto.setName("Amfiteatru 1");

        Reservation existing = new Reservation();
        existing.setDate(date);
        existing.setStartTime("10:00");
        existing.setEndTime("12:00");

        // simulam comportamentul repository-ului: returneaza toate salile
        when(roomRepository.findAll()).thenReturn(List.of(room));
        when(reservationRepository.findByRoomIdAndDate(2, date)).thenReturn(List.of(existing));

        // simulam conversia entitatii Room in DTO
        when(roomDTOConverter.convertToDTO(room)).thenReturn(dto);

        // apelam metoda testata: ar trebui sa returneze sala dar sa nu caute capacitatea disponibila
        List<RoomDTO> result = roomService.findAvailableRooms(date, startTime, endTime);

        // verificăm ca rezultatul contine exact o sala
        assertEquals(1, result.size());

        // verificam ca numele salii este cel asteptat
        assertEquals("Amfiteatru 1", result.get(0).getName());

        // verificam ca sala NU are setata capacitatea disponibila — este ignorata pentru acest tip de sala
        assertNull(result.get(0).getAvailableCapacity());

        verify(roomRepository).findAll();
        verify(reservationRepository).findByRoomIdAndDate(2, date);
    }
}

package com.licenta.backend.services;

import com.licenta.backend.converter.RoomDTOConverter;
import com.licenta.backend.dto.RoomDTO;
import com.licenta.backend.entities.Room;
import com.licenta.backend.repositories.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.text.SimpleDateFormat;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class RoomServiceTest {

    private RoomRepository roomRepository;
    private RoomDTOConverter roomDTOConverter;
    private RoomService roomService;

    @BeforeEach
    void setUp() {
        roomRepository = mock(RoomRepository.class);
        roomDTOConverter = mock(RoomDTOConverter.class);
        roomService = new RoomService(roomRepository, roomDTOConverter);
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

        List<Room> availableRooms = List.of(room);

        RoomDTO dto = new RoomDTO();
        dto.setName("Sala L1");

        when(roomRepository.findAvailableRooms(date, startTime, endTime)).thenReturn(availableRooms);
        when(roomRepository.findAvailableCapacity(1, date, startTime, endTime)).thenReturn(5);
        when(roomDTOConverter.convertToDTO(room)).thenReturn(dto);

        // Act
        List<RoomDTO> result = roomService.findAvailableRooms(date, startTime, endTime);

        // Assert
        assertEquals(1, result.size());
        assertEquals("Sala L1", result.get(0).getName());
        assertEquals(5, result.get(0).getAvailableCapacity());

        verify(roomRepository).findAvailableRooms(date, startTime, endTime);
        verify(roomRepository).findAvailableCapacity(1, date, startTime, endTime);
        verify(roomDTOConverter).convertToDTO(room);
    }

    @Test
    void testFindAvailableRooms_forAmfiteatruOrLaborator_shouldSkipCapacityQuery() throws Exception {
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

        // simulam comportamentul repository-ului: returneaza sala de tip AMFITEATRU ca fiind disponibila
        when(roomRepository.findAvailableRooms(date, startTime, endTime)).thenReturn(List.of(room));

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

        // verificam ca metoda de calcul al capacitatii nu a fost apelata (deoarece tipul salii nu o necesita)
        verify(roomRepository, never()).findAvailableCapacity(any(), any(), any(), any());
    }
}
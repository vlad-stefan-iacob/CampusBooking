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
        Date date = new SimpleDateFormat("yyyy-MM-dd").parse("2025-04-01");
        String startTime = "10:00";
        String endTime = "12:00";

        Room room = new Room();
        room.setId(2);
        room.setType("AMFITEATRU");

        RoomDTO dto = new RoomDTO();
        dto.setName("Amfiteatru 1");

        when(roomRepository.findAvailableRooms(date, startTime, endTime)).thenReturn(List.of(room));
        when(roomDTOConverter.convertToDTO(room)).thenReturn(dto);

        List<RoomDTO> result = roomService.findAvailableRooms(date, startTime, endTime);

        assertEquals(1, result.size());
        assertEquals("Amfiteatru 1", result.get(0).getName());
        assertNull(result.get(0).getAvailableCapacity()); // capacitatea nu este setată

        verify(roomRepository, never()).findAvailableCapacity(any(), any(), any(), any());
    }
}
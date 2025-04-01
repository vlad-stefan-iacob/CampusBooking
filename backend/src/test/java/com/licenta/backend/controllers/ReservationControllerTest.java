package com.licenta.backend.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.licenta.backend.dto.ReservationDTO;
import com.licenta.backend.entities.Room;
import com.licenta.backend.entities.User;
import com.licenta.backend.repositories.RoomRepository;
import com.licenta.backend.repositories.UserRepository;
import com.licenta.backend.services.ReservationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Date;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
public class ReservationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReservationService reservationService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private RoomRepository roomRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testReserveReadingRoom_shouldSucceed() throws Exception {
        ReservationDTO dto = new ReservationDTO();
        dto.setUserId(1);
        dto.setDate(new Date());
        dto.setStartTime("10:00");
        dto.setEndTime("12:00");
        dto.setCapacityReserved(2);

        Room room = new Room();
        room.setId(1);
        room.setName("Sala L1");

        User user = new User();
        user.setId(1);
        user.setFirstname("Ana");
        user.setLastname("Pop");
        user.setEmail("ana@example.com");

        when(reservationService.checkAvailableCapacity(any(), any(), any(), any())).thenReturn(5);
        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(roomRepository.findById(1)).thenReturn(Optional.of(room));

        mockMvc.perform(post("/api/v1/reservations/reserve-reading-room/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(content().string("Reservation successful with 2 seats reserved."));
    }
}

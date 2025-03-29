package com.licenta.backend.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.licenta.backend.dto.ReservationDTO;
import com.licenta.backend.dto.RoomDTO;
import com.licenta.backend.services.RoomService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
public class RoomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RoomService roomService;

    @WithMockUser(roles = "ADMIN")
    @Test
    void testCheckDuplicateName_shouldReturnFalse() throws Exception {
        String roomName = "Sala Noua"; // asigură-te că acest nume NU există în baza de date reală de test

        mockMvc.perform(get("/api/v1/rooms/check-duplicate-name/{name}", roomName))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isDuplicate").value(false));
    }

    @WithMockUser(roles = "ADMIN")
    @Test
    void testCheckAvailability_shouldReturn200_withRooms() throws Exception {
        ReservationDTO dto = new ReservationDTO();
        dto.setDate(new SimpleDateFormat("yyyy-MM-dd").parse("2025-04-01"));
        dto.setStartTime("10:00");
        dto.setEndTime("12:00");

        RoomDTO roomDTO = new RoomDTO();
        roomDTO.setName("Sala A");
        roomDTO.setAvailableCapacity(5);
        roomDTO.setType("SALA LECTURA");

        Mockito.when(roomService.findAvailableRooms(
                dto.getDate(), dto.getStartTime(), dto.getEndTime()
        )).thenReturn(List.of(roomDTO)); // ✅ NE-GOALĂ!

        mockMvc.perform(post("/api/v1/rooms/check-availability")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Sala A"))
                .andExpect(jsonPath("$[0].availableCapacity").value(5));
    }


    @WithMockUser(roles = "ADMIN")
    @Test
    void testCheckAvailability_shouldReturn204_whenNoRooms() throws Exception {
        ReservationDTO dto = new ReservationDTO();
        dto.setDate(new SimpleDateFormat("yyyy-MM-dd").parse("1999-01-01"));
        dto.setStartTime("00:00");
        dto.setEndTime("01:00");

        Mockito.when(roomService.findAvailableRooms(dto.getDate(), dto.getStartTime(), dto.getEndTime()))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(post("/api/v1/rooms/check-availability")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNoContent());
    }


}
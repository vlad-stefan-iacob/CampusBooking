package com.licenta.backend.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.licenta.backend.entities.Room;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class RoomSchedulingPolicyServiceTest {

    private RoomSchedulingPolicyService service;

    @BeforeEach
    void setUp() {
        service = new RoomSchedulingPolicyService();
        ReflectionTestUtils.setField(service, "objectMapper", new ObjectMapper());
    }

    @Test
    void getAllowedAlgorithms_shouldIncludePriorityForLaboratory() {
        List<String> algorithms = service.getAllowedAlgorithms("LABORATOR");

        assertEquals(List.of("FCFS", "ROUND_ROBIN", "PRIORITY"), algorithms);
    }

    @Test
    void applyDefaults_shouldInitializePriorityRulesForLaboratory() {
        Room room = new Room();
        room.setType("LABORATOR");
        room.setSchedulingAlgorithm("PRIORITY");

        service.applyDefaults(room);

        assertEquals("PRIORITY", room.getSchedulingAlgorithm());
        assertNull(room.getRoundRobinSlotMinutes());
        assertFalse(service.getEventPriorityRuleDTOs(room).isEmpty());
    }
}

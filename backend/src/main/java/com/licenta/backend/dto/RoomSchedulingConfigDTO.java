package com.licenta.backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class RoomSchedulingConfigDTO {
    private Integer roomId;
    private String roomName;
    private String roomType;
    private String schedulingAlgorithm;
    private Integer roundRobinSlotMinutes;
    private List<EventPriorityRuleDTO> eventPriorityRules;
    private List<String> allowedAlgorithms;
}

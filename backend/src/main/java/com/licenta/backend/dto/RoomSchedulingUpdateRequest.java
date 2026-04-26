package com.licenta.backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class RoomSchedulingUpdateRequest {
    private String schedulingAlgorithm;
    private Integer roundRobinSlotMinutes;
    private List<EventPriorityRuleDTO> eventPriorityRules;
}

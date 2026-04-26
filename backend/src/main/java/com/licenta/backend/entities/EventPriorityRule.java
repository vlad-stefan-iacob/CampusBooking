package com.licenta.backend.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventPriorityRule {
    private String eventType;
    private Integer priority;
}

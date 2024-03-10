package com.licenta.backend.dto;

import lombok.Data;

@Data
public class RoomDTO {
    private Integer id;
    private String name;
    private String location;
    private Integer capacity;
    private String type;
    private String details;
}

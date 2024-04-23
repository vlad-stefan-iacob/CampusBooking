package com.licenta.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDTO {
    private Integer id;
    private Integer userId;
    private Integer roomId;
    private Date date;
    private String startTime;
    private String endTime;
    private Date reservationDateTime;
}

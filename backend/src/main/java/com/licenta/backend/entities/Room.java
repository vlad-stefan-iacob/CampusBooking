package com.licenta.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="room")
public class Room {
    @Id
    @GeneratedValue
    private Integer id;

    @Column(unique = true)
    private String name;

    private String location;
    private Integer capacity;
    private String type;

    @Column(length = 10000)
    private String details;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reservation> reservations;  // Lista de rezervări atașate sălii

    private Integer availableCapacity;
}

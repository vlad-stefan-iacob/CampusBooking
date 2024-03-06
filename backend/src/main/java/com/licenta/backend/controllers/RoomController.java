package com.licenta.backend.controllers;

import com.licenta.backend.entities.Room;
import com.licenta.backend.services.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/rooms")
public class RoomController {
    @Autowired
    RoomService roomService;

    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ASISTENT', 'PROFESOR')")
    @GetMapping("/all-rooms")
    public List<Room> getAllRooms(){
        return roomService.getAllRooms();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ASISTENT', 'PROFESOR')")
    @GetMapping("/room/{roomId}")
    public Optional<Room> getRoomById(@PathVariable Integer roomId){
        return roomService.getRoomById(roomId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/add-room")
    public Room createRoom(@RequestBody Room room) {
        return roomService.insertRoom(room);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/update-room/{roomId}")
    public Room updateRoom(@PathVariable Integer roomId, @RequestBody Room updatedRoom) {
        return roomService.updateRoom(roomId, updatedRoom);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete-room/{roomId}")
    public String deleteRoom(@PathVariable Integer roomId) {
        roomService.deleteRoom(roomId);
        return "Room deleted";
    }
}

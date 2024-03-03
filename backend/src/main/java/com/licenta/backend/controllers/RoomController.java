package com.licenta.backend.controllers;

import com.licenta.backend.entities.Room;
import com.licenta.backend.services.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/rooms")
public class RoomController {
    @Autowired
    RoomService roomService;

    @GetMapping("/all-rooms")
    public List<Room> getAllRooms(){
        return roomService.getAllRooms();
    }

    @GetMapping("/room/{roomId}")
    public Optional<Room> getRoomById(@PathVariable Integer roomId){
        return roomService.getRoomById(roomId);
    }

    @PostMapping("/add-room")
    public Room createRoom(@RequestBody Room room) {
        return roomService.insertRoom(room);
    }
    @DeleteMapping("/delete-room/{roomId}")
    public String deleteRoom(@PathVariable Integer roomId) {
        roomService.deleteRoom(roomId);
        return "Room deleted";
    }
}

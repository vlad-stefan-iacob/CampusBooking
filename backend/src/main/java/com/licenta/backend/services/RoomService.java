package com.licenta.backend.services;

import com.licenta.backend.entities.Room;
import com.licenta.backend.repositories.RoomRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomService {
    @Autowired
    RoomRepository roomRepository;

    public List<Room> getAllRooms(){
        return roomRepository.findAll();
    }

    public Optional<Room> getRoomById(Integer roomId){
        return roomRepository.findById(roomId);
    }

    public Room insertRoom(Room room){
        return roomRepository.save(room);
    }
    public void deleteRoom(Integer roomId){
        roomRepository.deleteById(roomId);
    }
}

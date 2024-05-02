package com.licenta.backend.services;

import com.licenta.backend.converter.RoomDTOConverter;
import com.licenta.backend.dto.RoomDTO;
import com.licenta.backend.dto.UserDTO;
import com.licenta.backend.entities.Room;
import com.licenta.backend.entities.User;
import com.licenta.backend.exceptions.RoomNotFoundException;
import com.licenta.backend.repositories.RoomRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomService {
    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private RoomDTOConverter roomDTOConverter;

    public List<RoomDTO> getAllRooms(){
        List<Room> rooms = roomRepository.findAll();
        return rooms.stream()
                .map(roomDTOConverter::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<RoomDTO> getRoomById(Integer roomId) {
        Optional<Room> rooms = roomRepository.findById(roomId);
        return rooms.stream()
                .map(roomDTOConverter::convertToDTO)
                .collect(Collectors.toList());
    }

    public Room insertRoom(RoomDTO roomDTO){
        Room room = roomDTOConverter.convertToEntity(roomDTO);
        return roomRepository.save(room);
    }

    public Room updateRoom(Integer roomId, RoomDTO roomDTO){
        Optional<Room> existingRoom = roomRepository.findById(roomId);
        if (existingRoom.isPresent()){
            Room room = existingRoom.get();
            room.setName(roomDTO.getName());
            room.setLocation(roomDTO.getLocation());
            room.setType(roomDTO.getType());
            room.setCapacity(roomDTO.getCapacity());
            room.setDetails(roomDTO.getDetails());
            return roomRepository.save(room);
        } else {
            throw new RoomNotFoundException("Room with ID: " + roomId + " not found!");
        }
    }
    public void deleteRoom(Integer roomId){
        roomRepository.deleteById(roomId);
    }

    public List<RoomDTO> findAvailableRooms(Date date, String startTime, String endTime) {
        List<Room> rooms = roomRepository.findAvailableRooms(date, startTime, endTime);
        return rooms.stream()
                .map(roomDTOConverter::convertToDTO)
                .collect(Collectors.toList());
    }
}

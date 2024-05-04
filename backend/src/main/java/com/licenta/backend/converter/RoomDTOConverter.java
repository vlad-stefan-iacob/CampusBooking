package com.licenta.backend.converter;

import com.licenta.backend.dto.RoomDTO;
import com.licenta.backend.entities.Room;
import org.springframework.stereotype.Service;

@Service
public class RoomDTOConverter {

    public RoomDTO convertToDTO(Room room){
        RoomDTO roomDTO = new RoomDTO();
        roomDTO.setId(room.getId());
        roomDTO.setName(room.getName());
        roomDTO.setLocation(room.getLocation());
        roomDTO.setCapacity(room.getCapacity());
        roomDTO.setType(room.getType());
        roomDTO.setDetails(room.getDetails());
        roomDTO.setAvailableCapacity(room.getAvailableCapacity());

        return roomDTO;
    }

    public Room convertToEntity(RoomDTO roomDTO) {
        Room room = new Room();
        room.setId(roomDTO.getId());
        room.setName(roomDTO.getName());
        room.setLocation(roomDTO.getLocation());
        room.setCapacity(roomDTO.getCapacity());
        room.setType(roomDTO.getType());
        room.setDetails(roomDTO.getDetails());
        room.setAvailableCapacity(roomDTO.getAvailableCapacity());

        return room;
    }
}

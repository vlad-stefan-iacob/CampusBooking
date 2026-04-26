package com.licenta.backend.converter;

import com.licenta.backend.dto.EventPriorityRuleDTO;
import com.licenta.backend.dto.RoomDTO;
import com.licenta.backend.entities.Room;
import com.licenta.backend.services.RoomSchedulingPolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RoomDTOConverter {

    @Autowired
    private RoomSchedulingPolicyService roomSchedulingPolicyService;

    public RoomDTO convertToDTO(Room room){
        roomSchedulingPolicyService.applyDefaults(room);

        RoomDTO roomDTO = new RoomDTO();
        roomDTO.setId(room.getId());
        roomDTO.setName(room.getName());
        roomDTO.setLocation(room.getLocation());
        roomDTO.setCapacity(room.getCapacity());
        roomDTO.setType(room.getType());
        roomDTO.setDetails(room.getDetails());
        roomDTO.setAvailableCapacity(room.getAvailableCapacity());
        roomDTO.setSchedulingAlgorithm(room.getSchedulingAlgorithm());
        roomDTO.setRoundRobinSlotMinutes(room.getRoundRobinSlotMinutes());
        roomDTO.setEventPriorityRules(roomSchedulingPolicyService.getEventPriorityRuleDTOs(room));
        roomDTO.setAllowedAlgorithms(roomSchedulingPolicyService.getAllowedAlgorithms(room.getType()));

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
        room.setSchedulingAlgorithm(roomDTO.getSchedulingAlgorithm());
        room.setRoundRobinSlotMinutes(roomDTO.getRoundRobinSlotMinutes());
        roomSchedulingPolicyService.setEventPriorityRulesFromDTOs(room, roomDTO.getEventPriorityRules());

        return room;
    }
}

package com.licenta.backend.services;

import com.licenta.backend.converter.RoomDTOConverter;
import com.licenta.backend.dto.RoomDTO;
import com.licenta.backend.entities.Reservation;
import com.licenta.backend.entities.Room;
import com.licenta.backend.exceptions.RoomNotFoundException;
import com.licenta.backend.repositories.ReservationRepository;
import com.licenta.backend.repositories.RoomRepository;
import com.licenta.backend.scheduling.SchedulingAlgorithm;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;
import java.util.ArrayList;
import java.time.ZoneId;
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
    private ReservationRepository reservationRepository;

    @Autowired
    private RoomDTOConverter roomDTOConverter;

    @Autowired
    private RoomSchedulingPolicyService roomSchedulingPolicyService;

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
        roomSchedulingPolicyService.validate(room);
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
            room.setSchedulingAlgorithm(existingSchedulingValue(roomDTO.getSchedulingAlgorithm(), room.getSchedulingAlgorithm()));
            room.setRoundRobinSlotMinutes(existingSchedulingValue(
                    roomDTO.getRoundRobinSlotMinutes(),
                    room.getRoundRobinSlotMinutes()
            ));
            roomSchedulingPolicyService.setEventPriorityRulesFromDTOs(
                    room,
                    roomDTO.getEventPriorityRules() != null
                            ? roomDTO.getEventPriorityRules()
                            : roomSchedulingPolicyService.getEventPriorityRuleDTOs(room)
            );
            roomSchedulingPolicyService.validate(room);
            return roomRepository.save(room);
        } else {
            throw new RoomNotFoundException("Room with ID: " + roomId + " not found!");
        }
    }
    public void deleteRoom(Integer roomId){
        roomRepository.deleteById(roomId);
    }

    public List<RoomDTO> findAvailableRooms(Date date, String startTime, String endTime) {
        Date normalizedDate = normalizeDate(date);
        List<Room> rooms = roomRepository.findAll();
        List<RoomDTO> available = new ArrayList<>();

        for (Room room : rooms) {
            roomSchedulingPolicyService.applyDefaults(room);
            List<Reservation> existing = reservationRepository.findByRoomIdAndDate(room.getId(), normalizedDate);

            Reservation candidate = new Reservation();
            candidate.setDate(normalizedDate);
            candidate.setStartTime(startTime);
            candidate.setEndTime(endTime);
            candidate.setRoom(room);
            if ("SALA LECTURA".equalsIgnoreCase(room.getType())) {
                candidate.setCapacityReserved(1);
            } else {
                candidate.setCapacityReserved(room.getCapacity());
            }

            SchedulingAlgorithm scheduler = roomSchedulingPolicyService.buildScheduler(room);
            boolean allowed = scheduler == null || scheduler.isReservationAllowed(existing, candidate);
            if (!allowed) {
                continue;
            }

            RoomDTO roomDTO = roomDTOConverter.convertToDTO(room);
            if ("SALA LECTURA".equalsIgnoreCase(room.getType())) {
                roomDTO.setAvailableCapacity(
                        computeAvailableCapacity(room, existing, startTime, endTime)
                );
            }
            available.add(roomDTO);
        }

        return available;
    }

    private int computeAvailableCapacity(Room room, List<Reservation> existing, String startTime, String endTime) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        LocalTime requestedStart = LocalTime.parse(startTime, formatter);
        LocalTime requestedEnd = LocalTime.parse(endTime, formatter);

        int totalReserved = 0;
        for (Reservation reservation : existing) {
            LocalTime rStart = LocalTime.parse(reservation.getStartTime(), formatter);
            LocalTime rEnd = LocalTime.parse(reservation.getEndTime(), formatter);
            boolean overlap = rStart.isBefore(requestedEnd) && requestedStart.isBefore(rEnd);
            if (overlap) {
                totalReserved += reservation.getCapacityReserved();
            }
        }

        int available = room.getCapacity() - totalReserved;
        return Math.max(available, 0);
    }

    private Date normalizeDate(Date date) {
        if (date == null) {
            return null;
        }
        LocalDate localDate = date.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
        return Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }

    private <T> T existingSchedulingValue(T incomingValue, T fallbackValue) {
        return incomingValue != null ? incomingValue : fallbackValue;
    }

}

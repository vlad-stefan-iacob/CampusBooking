package com.licenta.backend.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.licenta.backend.dto.EventPriorityRuleDTO;
import com.licenta.backend.dto.RoomSchedulingConfigDTO;
import com.licenta.backend.dto.RoomSchedulingUpdateRequest;
import com.licenta.backend.entities.EventPriorityRule;
import com.licenta.backend.entities.Reservation;
import com.licenta.backend.entities.Room;
import com.licenta.backend.exceptions.RoomNotFoundException;
import com.licenta.backend.repositories.RoomRepository;
import com.licenta.backend.scheduling.FCFSScheduler;
import com.licenta.backend.scheduling.PriorityScheduler;
import com.licenta.backend.scheduling.RoundRobinScheduler;
import com.licenta.backend.scheduling.SchedulingAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

@Service
public class RoomSchedulingPolicyService {

    private static final String FCFS = "FCFS";
    private static final String ROUND_ROBIN = "ROUND_ROBIN";
    private static final String PRIORITY = "PRIORITY";

    private static final Map<String, List<String>> ALLOWED_ALGORITHMS_BY_ROOM_TYPE = Map.of(
            "SALA LECTURA", List.of(FCFS),
            "LABORATOR", List.of(FCFS, ROUND_ROBIN),
            "AMFITEATRU", List.of(FCFS, PRIORITY)
    );

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private ObjectMapper objectMapper;

    public List<String> getAllowedAlgorithms(String roomType) {
        String normalizedType = normalizeRoomType(roomType);
        List<String> allowedAlgorithms = ALLOWED_ALGORITHMS_BY_ROOM_TYPE.get(normalizedType);
        if (allowedAlgorithms == null || allowedAlgorithms.isEmpty()) {
            return List.of(FCFS);
        }
        return allowedAlgorithms;
    }

    public void applyDefaults(Room room) {
        if (room == null) {
            return;
        }

        List<String> allowedAlgorithms = getAllowedAlgorithms(room.getType());
        String normalizedAlgorithm = normalizeAlgorithm(room.getSchedulingAlgorithm());
        if (normalizedAlgorithm == null || !allowedAlgorithms.contains(normalizedAlgorithm)) {
            room.setSchedulingAlgorithm(allowedAlgorithms.get(0));
        } else {
            room.setSchedulingAlgorithm(normalizedAlgorithm);
        }

        if (ROUND_ROBIN.equals(room.getSchedulingAlgorithm())) {
            if (room.getRoundRobinSlotMinutes() == null || room.getRoundRobinSlotMinutes() <= 0) {
                room.setRoundRobinSlotMinutes(120);
            }
        } else {
            room.setRoundRobinSlotMinutes(null);
        }

        if (PRIORITY.equals(room.getSchedulingAlgorithm())) {
            List<EventPriorityRule> rules = getEventPriorityRules(room);
            if (rules.isEmpty()) {
                setEventPriorityRules(room, defaultPriorityRules());
            } else {
                setEventPriorityRules(room, new ArrayList<>(rules));
            }
        } else {
            setEventPriorityRules(room, List.of());
        }
    }

    public SchedulingAlgorithm buildScheduler(Room room) {
        applyDefaults(room);
        return switch (room.getSchedulingAlgorithm()) {
            case ROUND_ROBIN -> new RoundRobinScheduler(room.getRoundRobinSlotMinutes());
            case PRIORITY -> new PriorityScheduler();
            default -> new FCFSScheduler();
        };
    }

    public boolean usesPriorityScheduling(Room room) {
        applyDefaults(room);
        return PRIORITY.equals(room.getSchedulingAlgorithm());
    }

    public RoomSchedulingConfigDTO toSchedulingConfig(Room room) {
        applyDefaults(room);
        RoomSchedulingConfigDTO configDTO = new RoomSchedulingConfigDTO();
        configDTO.setRoomId(room.getId());
        configDTO.setRoomName(room.getName());
        configDTO.setRoomType(room.getType());
        configDTO.setSchedulingAlgorithm(room.getSchedulingAlgorithm());
        configDTO.setRoundRobinSlotMinutes(room.getRoundRobinSlotMinutes());
        configDTO.setEventPriorityRules(getEventPriorityRuleDTOs(room));
        configDTO.setAllowedAlgorithms(getAllowedAlgorithms(room.getType()));
        return configDTO;
    }

    public List<RoomSchedulingConfigDTO> getAllSchedulingConfigurations() {
        return roomRepository.findAll().stream()
                .map(this::toSchedulingConfig)
                .toList();
    }

    public RoomSchedulingConfigDTO updateSchedulingConfiguration(Integer roomId, RoomSchedulingUpdateRequest request) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RoomNotFoundException("Room with ID: " + roomId + " not found!"));

        room.setSchedulingAlgorithm(normalizeAlgorithm(request.getSchedulingAlgorithm()));
        room.setRoundRobinSlotMinutes(request.getRoundRobinSlotMinutes());
        setEventPriorityRulesFromDTOs(room, request.getEventPriorityRules());

        validate(room);
        Room savedRoom = roomRepository.save(room);
        return toSchedulingConfig(savedRoom);
    }

    public void validate(Room room) {
        applyDefaults(room);
        List<String> allowedAlgorithms = getAllowedAlgorithms(room.getType());
        if (!allowedAlgorithms.contains(room.getSchedulingAlgorithm())) {
            throw new IllegalArgumentException(
                    "Algoritmul " + room.getSchedulingAlgorithm() + " nu este permis pentru tipul de sală " + room.getType()
            );
        }

        if (ROUND_ROBIN.equals(room.getSchedulingAlgorithm())) {
            Integer slotMinutes = room.getRoundRobinSlotMinutes();
            if (slotMinutes == null || slotMinutes < 30) {
                throw new IllegalArgumentException("Pentru Round Robin, slotul minim este de 30 de minute.");
            }
        }

        if (PRIORITY.equals(room.getSchedulingAlgorithm())) {
            List<EventPriorityRule> normalizedRules = getEventPriorityRules(room);
            validatePriorityRules(normalizedRules);
            setEventPriorityRules(room, normalizedRules);
        }
    }

    public int resolvePriority(Reservation reservation, Room room) {
        applyDefaults(room);
        String eventType = reservation.getEventType() != null ? reservation.getEventType().trim().toUpperCase(Locale.ROOT) : "";
        return getEventPriorityRules(room).stream()
                .filter(rule -> eventType.equals(normalizeEventType(rule.getEventType())))
                .map(EventPriorityRule::getPriority)
                .filter(Objects::nonNull)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Tipul de eveniment nu este configurat pentru această sală."));
    }

    public String normalizeAlgorithm(String algorithm) {
        if (algorithm == null || algorithm.isBlank()) {
            return null;
        }
        return algorithm.trim().toUpperCase(Locale.ROOT).replace(' ', '_');
    }

    private String normalizeRoomType(String roomType) {
        if (roomType == null) {
            return "";
        }
        return roomType.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeEventType(String eventType) {
        if (eventType == null) {
            return "";
        }
        return eventType.trim().toUpperCase(Locale.ROOT);
    }

    private List<EventPriorityRule> defaultPriorityRules() {
        return new ArrayList<>(List.of(
                new EventPriorityRule("EXAMEN", 1),
                new EventPriorityRule("CURS", 2),
                new EventPriorityRule("EVENIMENT", 3)
        ));
    }

    private void validatePriorityRules(List<EventPriorityRule> rules) {
        if (rules == null || rules.isEmpty()) {
            throw new IllegalArgumentException("Pentru Priority Scheduling trebuie definite reguli de prioritizare.");
        }

        Map<String, Integer> normalizedRules = new LinkedHashMap<>();
        for (EventPriorityRule rule : rules) {
            if (rule == null || rule.getEventType() == null || rule.getEventType().isBlank()) {
                throw new IllegalArgumentException("Fiecare regulă de prioritate trebuie să aibă un tip de eveniment.");
            }
            if (rule.getPriority() == null || rule.getPriority() < 1) {
                throw new IllegalArgumentException("Fiecare regulă de prioritate trebuie să aibă un nivel >= 1.");
            }

            String normalizedEventType = normalizeEventType(rule.getEventType());
            if (normalizedRules.containsKey(normalizedEventType)) {
                throw new IllegalArgumentException("Tipurile de eveniment configurate pentru Priority Scheduling trebuie să fie unice.");
            }
            normalizedRules.put(normalizedEventType, rule.getPriority());
        }

        List<EventPriorityRule> normalizedList = normalizedRules.entrySet().stream()
                .map(entry -> new EventPriorityRule(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparingInt(EventPriorityRule::getPriority))
                .toList();
        if (!rules.equals(normalizedList)) {
            rules.clear();
            rules.addAll(normalizedList);
        }
    }

    public List<EventPriorityRuleDTO> getEventPriorityRuleDTOs(Room room) {
        return getEventPriorityRules(room).stream().map(rule -> {
            EventPriorityRuleDTO dto = new EventPriorityRuleDTO();
            dto.setEventType(rule.getEventType());
            dto.setPriority(rule.getPriority());
            return dto;
        }).toList();
    }

    public void setEventPriorityRulesFromDTOs(Room room, List<EventPriorityRuleDTO> rules) {
        if (rules == null) {
            setEventPriorityRules(room, List.of());
            return;
        }
        setEventPriorityRules(room, new ArrayList<>(rules.stream()
                .map(rule -> new EventPriorityRule(rule.getEventType(), rule.getPriority()))
                .toList()));
    }

    private List<EventPriorityRule> getEventPriorityRules(Room room) {
        String rawConfig = room.getEventPriorityRulesConfig();
        if (rawConfig == null || rawConfig.isBlank()) {
            return new ArrayList<>();
        }
        try {
            return new ArrayList<>(objectMapper.readValue(rawConfig, new TypeReference<List<EventPriorityRule>>() {}));
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Configurația de priorități a sălii nu poate fi citită.", exception);
        }
    }

    private void setEventPriorityRules(Room room, List<EventPriorityRule> rules) {
        try {
            room.setEventPriorityRulesConfig(objectMapper.writeValueAsString(rules == null ? List.of() : rules));
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Configurația de priorități a sălii nu poate fi salvată.", exception);
        }
    }
}

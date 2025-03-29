package com.licenta.backend.repositories;

import com.licenta.backend.entities.Room;
import com.licenta.backend.entities.Reservation;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
public class RoomRepositoryTest {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    private final SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");

    @BeforeEach
    void setUp() {
        // curăță baza de date înainte de fiecare test dacă vrei
    }

    @Test
    void testFindAvailableRooms_shouldReturnAvailableRoom() throws Exception {
        Date date = sdf.parse("2025-04-01");

        Room room = new Room();
        room.setName("Sala L1");
        room.setType("SALA LECTURA");
        room.setCapacity(10);
        room.setLocation("Etaj 1");

        room = roomRepository.save(room);

        // nu adăugăm nicio rezervare, deci ar trebui să fie disponibilă

        List<Room> result = roomRepository.findAvailableRooms(date, "10:00", "12:00");

        assertFalse(result.isEmpty());
        assertEquals("Sala L1", result.get(0).getName());
    }

    @Test
    void testFindAvailableCapacity_shouldReturnCorrectValue() throws Exception {
        Date date = sdf.parse("2025-04-01");

        Room room = new Room();
        room.setName("Sala L2");
        room.setType("SALA LECTURA");
        room.setCapacity(20);
        room.setLocation("Etaj 2");

        room = roomRepository.save(room);

        Reservation reservation = new Reservation();
        reservation.setRoom(room);
        reservation.setDate(date);
        reservation.setStartTime("10:00");
        reservation.setEndTime("12:00");
        reservation.setCapacityReserved(5);

        reservationRepository.save(reservation);

        Integer availableCapacity = roomRepository.findAvailableCapacity(room.getId(), date, "10:00", "12:00");

        assertEquals(15, availableCapacity); // 20 - 5
    }
}

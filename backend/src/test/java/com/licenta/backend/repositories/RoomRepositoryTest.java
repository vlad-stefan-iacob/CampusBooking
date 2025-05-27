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
        // parsam data pentru care vom verifica disponibilitatea salii
        Date date = sdf.parse("2025-04-01");

        // cream o sala fictiva (mock) cu 20 locuri, de tip sala de lectura
        Room room = new Room();
        room.setName("Sala L2");
        room.setType("SALA LECTURA");
        room.setCapacity(20);
        room.setLocation("Etaj 2");

        // salvam sala in baza de date de tip H2
        room = roomRepository.save(room);

        // cream o rezervare in acea sala, in aceeasi zi si interval orar
        Reservation reservation = new Reservation();
        reservation.setRoom(room);
        reservation.setDate(date);
        reservation.setStartTime("10:00");
        reservation.setEndTime("12:00");
        reservation.setCapacityReserved(5);

        // salvam rezervarea in baza de date
        reservationRepository.save(reservation);

        // apelam metoda din repository care trebuie sa calculeze cate locuri mai sunt disponibile
        Integer availableCapacity = roomRepository.findAvailableCapacity(room.getId(), date, "10:00", "12:00");

        // verificam daca rezultatul este corect: 20 total - 5 rezervate = 15 disponibile
        assertEquals(15, availableCapacity);
    }
}

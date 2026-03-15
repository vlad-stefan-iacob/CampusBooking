package com.licenta.backend.scheduling;

import com.licenta.backend.entities.Reservation;
import com.licenta.backend.entities.Room;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class FCFSSchedulerTest {

    private final FCFSScheduler scheduler = new FCFSScheduler();
    private final SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");

    private Room salaLectura;

    @BeforeEach
    public void setup() {
        salaLectura = new Room();
        salaLectura.setCapacity(20);
    }

    private Reservation create(String start, String end, int seats) throws Exception {
        Reservation r = new Reservation();
        r.setDate(formatter.parse("2026-01-22"));
        r.setStartTime(start);
        r.setEndTime(end);
        r.setCapacityReserved(seats);
        r.setRoom(salaLectura);
        return r;
    }

    @Test
    public void testSingleReservationAccepted() throws Exception {
        Reservation r = create("10:00", "12:00", 10);

        boolean result = scheduler.isReservationAllowed(List.of(), r);

        assertTrue(result);
    }

    @Test
    public void testOverlappingWithinCapacity() throws Exception {
        Reservation r1 = create("10:00", "12:00", 10);
        Reservation r2 = create("10:30", "11:30", 8); // total 18 < 20

        List<Reservation> existing = new ArrayList<>();
        existing.add(r1);

        boolean result = scheduler.isReservationAllowed(existing, r2);

        assertTrue(result);
    }

    @Test
    public void testOverlappingExceedsCapacity() throws Exception {
        Reservation r1 = create("10:00", "12:00", 10);
        Reservation r2 = create("10:30", "11:30", 11); // total 21 > 20

        List<Reservation> existing = new ArrayList<>();
        existing.add(r1);

        boolean result = scheduler.isReservationAllowed(existing, r2);

        assertFalse(result);
    }

    @Test
    public void testNonOverlappingReservationAccepted() throws Exception {
        Reservation r1 = create("08:00", "09:00", 15);
        Reservation r2 = create("09:00", "10:00", 10); // nu se suprapune

        List<Reservation> existing = new ArrayList<>();
        existing.add(r1);

        boolean result = scheduler.isReservationAllowed(existing, r2);

        assertTrue(result);
    }

    @Test
    public void testMultipleOverlappingReservations() throws Exception {
        Reservation r1 = create("10:00", "12:00", 10);
        Reservation r2 = create("10:30", "11:30", 5);
        Reservation r3 = create("11:00", "12:30", 6); // overlap cu r1, r2 → total = 21 > 20

        List<Reservation> existing = List.of(r1, r2);

        boolean result = scheduler.isReservationAllowed(existing, r3);

        assertFalse(result);
    }
}


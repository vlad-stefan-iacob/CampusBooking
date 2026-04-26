package com.licenta.backend.scheduling;

import com.licenta.backend.entities.Reservation;
import com.licenta.backend.entities.Room;
import org.junit.jupiter.api.Test;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class PrioritySchedulerTest {

    private final PriorityScheduler scheduler = new PriorityScheduler();
    private final SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");

    private Reservation create(String start, String end, int priority) throws Exception {
        Reservation r = new Reservation();
        Room room = new Room();
        room.setId(1);
        r.setDate(formatter.parse("2026-01-20"));
        r.setStartTime(start);
        r.setEndTime(end);
        r.setPriority(priority);
        r.setRoom(room);
        return r;
    }

    @Test
    public void testSingleReservationAccepted() throws Exception {
        List<Reservation> pending = new ArrayList<>(List.of(create("10:00", "12:00", 1)));
        List<Reservation> confirmed = new ArrayList<>();

        scheduler.applyScheduling(pending, confirmed);

        assertEquals("APROBATA", pending.get(0).getStatus());
    }

    @Test
    public void testConflictResolvedByPriority() throws Exception {
        Reservation high = create("10:00", "12:00", 1); // 1 - CURS
        Reservation low = create("10:30", "11:30", 3); // 3 - EVENIMENT

        List<Reservation> pending = new ArrayList<>(List.of(low, high));
        List<Reservation> confirmed = new ArrayList<>();

        scheduler.applyScheduling(pending, confirmed);

        assertEquals("APROBATA", high.getStatus()); // cererea high este acceptata
        assertEquals("RESPINSA", low.getStatus()); // cererea low este respinsa
    }

    @Test
    public void testNoConflictMultipleAccepted() throws Exception {
        Reservation r1 = create("08:00", "10:00", 2);
        Reservation r2 = create("10:00", "12:00", 1);
        Reservation r3 = create("12:00", "14:00", 3);

        List<Reservation> pending = new ArrayList<>(List.of(r1, r2, r3));
        List<Reservation> confirmed = new ArrayList<>();

        scheduler.applyScheduling(pending, confirmed);

        assertEquals("APROBATA", r1.getStatus());
        assertEquals("APROBATA", r2.getStatus());
        assertEquals("APROBATA", r3.getStatus());
    }

    @Test
    public void testConflictWithExistingAccepted() throws Exception {
        Reservation confirmed = create("10:00", "12:00", 1);
        confirmed.setStatus("APROBATA");

        Reservation pending = create("11:00", "13:00", 2);

        List<Reservation> pendingList = new ArrayList<>(List.of(pending));
        List<Reservation> accepted = new ArrayList<>(List.of(confirmed));

        scheduler.applyScheduling(pendingList, accepted);

        assertEquals("RESPINSA", pending.getStatus());
    }
}

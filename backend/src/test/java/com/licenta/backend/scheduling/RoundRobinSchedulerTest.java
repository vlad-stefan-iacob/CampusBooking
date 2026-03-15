package com.licenta.backend.scheduling;

import com.licenta.backend.entities.Reservation;
import org.junit.jupiter.api.Test;

import java.text.SimpleDateFormat;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class RoundRobinSchedulerTest {

    private final RoundRobinScheduler scheduler = new RoundRobinScheduler();

    private Reservation create(String start, String end) throws Exception {
        Reservation r = new Reservation();
        r.setDate(new SimpleDateFormat("yyyy-MM-dd").parse("2026-01-10"));
        r.setStartTime(start);
        r.setEndTime(end);
        return r;
    }

    @Test
    public void testPartialAcceptanceAndAdjustment() throws Exception {
        Reservation existing = create("10:00", "12:00");
        Reservation newOne = create("10:00", "14:00");

        boolean allowed = scheduler.isReservationAllowed(List.of(existing), newOne);
        assertTrue(allowed);

        scheduler.applyScheduling(List.of(existing), newOne);

        assertEquals("12:00", newOne.getStartTime());
        assertEquals("14:00", newOne.getEndTime());
    }

    @Test
    public void testFullAcceptance() throws Exception {
        Reservation existing = create("08:00", "09:00");
        Reservation newOne = create("09:00", "11:00");

        scheduler.applyScheduling(List.of(existing), newOne);

        assertEquals("09:00", newOne.getStartTime());
        assertEquals("11:00", newOne.getEndTime());
    }

    @Test
    public void testFullRejection() throws Exception {
        Reservation existing = create("10:00", "12:00");
        Reservation newOne = create("10:00", "12:00");

        assertFalse(scheduler.isReservationAllowed(List.of(existing), newOne));
    }
}

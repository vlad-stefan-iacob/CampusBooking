package com.licenta.backend.scheduling;

import com.licenta.backend.entities.Reservation;
import com.licenta.backend.repositories.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

@Component
public class PrioritySchedulerTask {

    @Autowired
    private ReservationRepository reservationRepository;

    private final PriorityScheduler scheduler = new PriorityScheduler();

    @Scheduled(cron = "0 0 18 * * *", zone = "Europe/Bucharest") // ruleaza in fiecare zi la 18:00
    public void runPriorityScheduling() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        Date targetDate = Date.from(tomorrow.atStartOfDay(ZoneId.systemDefault()).toInstant());

        List<Reservation> pending = reservationRepository.findByDateAndStatus(targetDate, "PENDING");
        List<Reservation> accepted = reservationRepository.findByDateAndStatus(targetDate, "ACCEPTED");

        scheduler.applyScheduling(pending, accepted);
        reservationRepository.saveAll(pending);
    }
}

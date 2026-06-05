package com.licenta.backend.scheduling;

import com.licenta.backend.entities.Reservation;
import com.licenta.backend.repositories.ReservationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    private static final Logger logger = LoggerFactory.getLogger(PrioritySchedulerTask.class);

    @Scheduled(cron = "0 0 18 * * *", zone = "Europe/Bucharest") // ruleaza in fiecare minut
    public void runPriorityScheduling() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        ZoneId zoneId = ZoneId.systemDefault();
        Date startOfDay = Date.from(tomorrow.atStartOfDay(zoneId).toInstant());
        Date endOfDay = Date.from(tomorrow.plusDays(1).atStartOfDay(zoneId).toInstant());

        List<Reservation> pending = reservationRepository.findByDateRangeAndStatus(startOfDay, endOfDay, "ASTEPTARE");
        pending.addAll(reservationRepository.findByDateRangeAndStatus(startOfDay, endOfDay, "PENDING"));

        List<Reservation> accepted = reservationRepository.findByDateRangeAndStatus(startOfDay, endOfDay, "APROBATA");
        accepted.addAll(reservationRepository.findByDateRangeAndStatus(startOfDay, endOfDay, "ACCEPTED"));

        logger.info("PrioritySchedulerTask start: targetDate={}, pending={}, accepted={}",
                startOfDay, pending.size(), accepted.size());
        for (Reservation reservation : pending) {
            logger.info("Pending: id={}, roomId={}, userId={}, startTime={}, endTime={}, priority={}, eventType={}",
                    reservation.getId(),
                    reservation.getRoom() != null ? reservation.getRoom().getId() : null,
                    reservation.getUser() != null ? reservation.getUser().getId() : null,
                    reservation.getStartTime(),
                    reservation.getEndTime(),
                    reservation.getPriority(),
                    reservation.getEventType());
        }

        scheduler.applyScheduling(pending, accepted);
        reservationRepository.saveAll(pending);

        long acceptedCount = pending.stream().filter(r -> "APROBATA".equals(r.getStatus())).count();
        long rejectedCount = pending.stream().filter(r -> "RESPINSA".equals(r.getStatus())).count();
        logger.info("PrioritySchedulerTask end: accepted={}, rejected={}", acceptedCount, rejectedCount);
    }
}

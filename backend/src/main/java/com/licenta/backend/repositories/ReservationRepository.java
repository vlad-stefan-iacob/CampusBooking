package com.licenta.backend.repositories;

import com.licenta.backend.entities.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation,Integer> {
    List<Reservation> findByUserId(Integer userId);

    List<Reservation> findByRoomIdAndDate(Integer roomId, Date date);
    List<Reservation> findByDateAndStatus(Date date, String status);

    @Query("SELECT r FROM Reservation r WHERE r.status = :status AND r.date >= :start AND r.date < :end")
    List<Reservation> findByDateRangeAndStatus(
            @Param("start") Date start,
            @Param("end") Date end,
            @Param("status") String status
    );

}

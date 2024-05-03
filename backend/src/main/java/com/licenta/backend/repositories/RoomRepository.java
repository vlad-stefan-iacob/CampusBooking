package com.licenta.backend.repositories;

import com.licenta.backend.entities.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;

public interface RoomRepository extends JpaRepository<Room,Integer> {
    boolean existsByName(String name);

    @Query("SELECT r FROM Room r WHERE NOT EXISTS (SELECT 1 FROM Reservation res WHERE res.room = r AND NOT (res.endTime <= :startTime OR res.startTime >= :endTime) AND res.date = :date)")
    List<Room> findAvailableRooms(@Param("date") Date date, @Param("startTime") String startTime, @Param("endTime") String endTime);

    @Query("SELECT r.capacity - COALESCE((SELECT SUM(res.capacityReserved) FROM Reservation res WHERE res.room = r AND res.date = :date AND NOT (res.endTime <= :startTime OR res.startTime >= :endTime)), 0) AS availableCapacity FROM Room r WHERE r.id = :roomId")
    Integer findAvailableCapacity(@Param("roomId") Integer roomId, @Param("date") Date date, @Param("startTime") String startTime, @Param("endTime") String endTime);
}

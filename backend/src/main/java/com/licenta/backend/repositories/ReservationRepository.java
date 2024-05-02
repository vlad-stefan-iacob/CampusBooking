package com.licenta.backend.repositories;

import com.licenta.backend.entities.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation,Integer> {
    List<Reservation> findByUserId(Integer userId);
}

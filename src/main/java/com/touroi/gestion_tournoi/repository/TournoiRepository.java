package com.touroi.gestion_tournoi.repository;

import com.touroi.gestion_tournoi.model.Tournoi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TournoiRepository 
    extends JpaRepository<Tournoi, Long> {
}
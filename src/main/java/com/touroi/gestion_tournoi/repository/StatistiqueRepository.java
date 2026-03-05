package com.touroi.gestion_tournoi.repository;

import com.touroi.gestion_tournoi.model.Statistique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StatistiqueRepository 
    extends JpaRepository<Statistique, Long> {
    
    List<Statistique> findByJoueurId(Long joueurId);
    List<Statistique> findByMatchId(Long matchId);
}
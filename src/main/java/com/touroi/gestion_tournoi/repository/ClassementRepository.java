package com.touroi.gestion_tournoi.repository;

import com.touroi.gestion_tournoi.model.Classement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClassementRepository 
    extends JpaRepository<Classement, Long> {
    
    List<Classement> findByGroupeIdOrderByPointsDescButsMarquesDesc(
        Long groupeId);
    Optional<Classement> findByEquipeId(Long equipeId);
}
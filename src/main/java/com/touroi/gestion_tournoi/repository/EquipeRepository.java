package com.touroi.gestion_tournoi.repository;

import com.touroi.gestion_tournoi.model.Equipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EquipeRepository 
    extends JpaRepository<Equipe, Long> {
    
    List<Equipe> findByGroupeId(Long groupeId);
    int countByGroupeId(Long groupeId);
}
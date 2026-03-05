package com.touroi.gestion_tournoi.repository;

import com.touroi.gestion_tournoi.model.Joueur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JoueurRepository 
    extends JpaRepository<Joueur, Long> {
    
    List<Joueur> findByEquipeId(Long equipeId);
}
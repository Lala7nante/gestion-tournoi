package com.touroi.gestion_tournoi.repository;

import com.touroi.gestion_tournoi.model.Groupe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GroupeRepository 
    extends JpaRepository<Groupe, Long> {
    
    List<Groupe> findByTournoiId(Long tournoiId);
    int countByTournoiId(Long tournoiId);
}
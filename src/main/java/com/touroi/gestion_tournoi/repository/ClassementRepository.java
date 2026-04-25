package com.touroi.gestion_tournoi.repository;

import com.touroi.gestion_tournoi.model.Classement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassementRepository extends JpaRepository<Classement, Long> {

    // Récupérer le classement d'un groupe trié par points puis buts marqués
    List<Classement> findByGroupeIdOrderByPointsDescButsMarquesDesc(Long groupeId);

    // Trouver le classement d'une équipe
    Optional<Classement> findByEquipeId(Long equipeId);

    // Trouver le classement d'une équipe dans un groupe précis
    Optional<Classement> findByEquipeIdAndGroupeId(Long equipeId, Long groupeId);

    // Récupérer la liste des groupes existants dans les classements
    @Query("SELECT DISTINCT c.groupe.id FROM Classement c")
    List<Long> findDistinctGroupeIds();

    // Récupérer tous les classements d'un groupe (utile pour reset classement)
    List<Classement> findByGroupeId(Long groupeId);
}
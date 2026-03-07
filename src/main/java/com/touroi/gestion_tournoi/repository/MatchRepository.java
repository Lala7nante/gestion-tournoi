package com.touroi.gestion_tournoi.repository;

import com.touroi.gestion_tournoi.model.MatchFootball;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<MatchFootball, Long> {

    List<MatchFootball> findByPhase(MatchFootball.Phase phase);

    List<MatchFootball> findByEquipeDomicileIdOrEquipeExterieurId(
            Long domId, Long extId);
    List<MatchFootball> findByPhaseAndStatut(MatchFootball.Phase phase, MatchFootball.Statut statut);

    List<MatchFootball> findByStatutOrderByDateMatchDesc(MatchFootball.Statut statut);
    List<MatchFootball> findByStatutOrderByDateMatchAsc(MatchFootball.Statut statut);
}
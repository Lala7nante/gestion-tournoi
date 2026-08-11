package com.touroi.gestion_tournoi.repository;

import com.touroi.gestion_tournoi.model.But;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ButRepository extends JpaRepository<But, Long> {

    // Récupère les buts d'un match, triés par minute
    List<But> findByMatchIdOrderByMinuteAsc(Long matchId);

    // Top buteurs pour un tournoi (via groupe)
    @Query("SELECT b.buteur, COUNT(b.id) as totalButs " +
           "FROM But b " +
           "JOIN b.match m " +
           "JOIN m.equipeDomicile e " +
           "JOIN e.groupe g " +
           "WHERE g.tournoi.id = :tournoiId " +
           "GROUP BY b.buteur " +
           "ORDER BY totalButs DESC")
    List<Object[]> findTopButeursByTournoi(@Param("tournoiId") Long tournoiId);

    // Top passeurs pour un tournoi (via groupe)
    @Query("SELECT b.passeur, COUNT(b.id) as totalPasses " +
           "FROM But b " +
           "JOIN b.match m " +
           "JOIN m.equipeDomicile e " +
           "JOIN e.groupe g " +
           "WHERE g.tournoi.id = :tournoiId " +
           "AND b.passeur IS NOT NULL " +
           "GROUP BY b.passeur " +
           "ORDER BY totalPasses DESC")
    List<Object[]> findTopPasseursByTournoi(@Param("tournoiId") Long tournoiId);

    // Top buteurs pour une ligue (via match.tournoi directement, sans groupe)
    @Query("SELECT b.buteur, COUNT(b.id) as totalButs " +
           "FROM But b " +
           "JOIN b.match m " +
           "WHERE m.tournoi.id = :tournoiId " +
           "GROUP BY b.buteur " +
           "ORDER BY totalButs DESC")
    List<Object[]> findTopButeursByLigue(@Param("tournoiId") Long tournoiId);

    // Top passeurs pour une ligue (via match.tournoi directement, sans groupe)
    @Query("SELECT b.passeur, COUNT(b.id) as totalPasses " +
           "FROM But b " +
           "JOIN b.match m " +
           "WHERE m.tournoi.id = :tournoiId " +
           "AND b.passeur IS NOT NULL " +
           "GROUP BY b.passeur " +
           "ORDER BY totalPasses DESC")
    List<Object[]> findTopPasseursByLigue(@Param("tournoiId") Long tournoiId);
}
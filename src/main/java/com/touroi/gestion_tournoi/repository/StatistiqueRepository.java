package com.touroi.gestion_tournoi.repository;

import com.touroi.gestion_tournoi.model.Joueur;
import com.touroi.gestion_tournoi.model.Statistique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StatistiqueRepository extends JpaRepository<Statistique, Long> {

    List<Statistique> findByJoueurId(Long joueurId);
    List<Statistique> findByMatchId(Long matchId);

    // ✅ Top 10 buteurs par tournoi
    @Query("SELECT s.joueur, SUM(s.buts) as totalButs " +
           "FROM Statistique s " +
           "WHERE s.match.phase IS NOT NULL " +
           "AND s.joueur.equipe.groupe.tournoi.id = :tournoiId " +
           "GROUP BY s.joueur " +
           "ORDER BY totalButs DESC")
    List<Object[]> findTopButeursByTournoi(Long tournoiId);

       @Query("SELECT s.joueur, SUM(s.passesDecisives) as totalPasses " +
             "FROM Statistique s " +
             "WHERE s.joueur.equipe.groupe.tournoi.id = :tournoiId " +
             "GROUP BY s.joueur " +
             "HAVING SUM(s.passesDecisives) > 0 " +
             "ORDER BY totalPasses DESC")
       List<Object[]> findTopPasseursByTournoi(Long tournoiId);
 
     @Query("SELECT s.joueur, SUM(s.cartonsJaunes) as jaunes, SUM(s.cartonsRouges) as rouges " +
       "FROM Statistique s " +
       "WHERE s.joueur.equipe.groupe.tournoi.id = :tournoiId " +
       "GROUP BY s.joueur " +
       "HAVING SUM(s.cartonsJaunes) > 0 OR SUM(s.cartonsRouges) > 0 " +
       "ORDER BY rouges DESC, jaunes DESC")
      List<Object[]> findTopCartonsByTournoi(Long tournoiId);

      List<Statistique> findByJoueurIdAndMatchId(Long joueurId, Long matchId);

    // ✅ Homme du match (buts + passes) par tournoi
    @Query("SELECT s.joueur, SUM(s.buts + s.passesDecisives) as total " +
           "FROM Statistique s " +
           "WHERE s.joueur.equipe.groupe.tournoi.id = :tournoiId " +
           "GROUP BY s.joueur " +
           "ORDER BY total DESC")
    List<Object[]> findHommesDuMatchByTournoi(Long tournoiId);

      // ✅ Meilleur club — finalistes par ordre (Champion, Finaliste, 3e place)
         @Query("SELECT m.equipeDomicile, m.scoreExterieur, m.scoreDomicile, m.phase " +
             "FROM MatchFootball m " +
             "WHERE m.phase IN ('FINALE', 'TROISIEME') " +
             "AND m.statut = 'TERMINE' " +
             "AND m.equipeDomicile.groupe.tournoi.id = :tournoiId " +
             "OR (m.phase IN ('FINALE', 'TROISIEME') " +
             "AND m.statut = 'TERMINE' " +
             "AND m.equipeExterieur.groupe.tournoi.id = :tournoiId)")
         List<Object[]> findMeilleurClubByTournoi(Long tournoiId);

       // ✅ Joueurs ayant stat
       @Query("SELECT DISTINCT s.joueur FROM Statistique s ORDER BY s.joueur.nom ASC")
       List<Joueur> findJoueursAvecStats();
}
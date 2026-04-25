
package com.touroi.gestion_tournoi.service;
 
import com.touroi.gestion_tournoi.model.Equipe;
import com.touroi.gestion_tournoi.model.Joueur;
import com.touroi.gestion_tournoi.model.MatchFootball;
import com.touroi.gestion_tournoi.model.Statistique;
import com.touroi.gestion_tournoi.repository.ButRepository;
import com.touroi.gestion_tournoi.repository.MatchRepository;
import com.touroi.gestion_tournoi.repository.StatistiqueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
 
import java.util.ArrayList;
import java.util.List;
 
@Service
public class StatistiqueService {
 
    @Autowired
    private MatchRepository matchRepository;
 
    @Autowired
    private StatistiqueRepository statistiqueRepository;
 
    @Autowired
    private ButRepository butRepository; // ✅ Ajout ButRepository
 
    @Autowired
    private JoueurService joueurService;
 
    @Autowired
    private MatchService matchService;
 
    public List<Statistique> findByJoueur(Long joueurId) {
        return statistiqueRepository.findByJoueurId(joueurId);
    }
 
    public List<Statistique> findByMatch(Long matchId) {
        return statistiqueRepository.findByMatchId(matchId);
    }
 
    public Statistique save(Statistique stat, Long joueurId, Long matchId) {
        Joueur joueur = joueurService.findById(joueurId);
        MatchFootball match = matchService.findById(matchId);
 
        List<Statistique> existing = statistiqueRepository.findByJoueurIdAndMatchId(joueurId, matchId);
        if (!existing.isEmpty()) {
            throw new RuntimeException(
                joueur.getPrenom() + " " + joueur.getNom() +
                " a déjà une statistique pour ce match !");
        }
 
        stat.setJoueur(joueur);
        stat.setMatch(match);
        return statistiqueRepository.save(stat);
    }
 
    public Statistique update(Long id, Statistique stat) {
        Statistique existing = statistiqueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Statistique introuvable !"));
        existing.setButs(stat.getButs());
        existing.setPassesDecisives(stat.getPassesDecisives());
        existing.setCartonsJaunes(stat.getCartonsJaunes());
        existing.setCartonsRouges(stat.getCartonsRouges());
        existing.setMinutesJouees(stat.getMinutesJouees());
        existing.setButsEnPenalty(stat.getButsEnPenalty());
        existing.setButsSurCoupFranc(stat.getButsSurCoupFranc());
        existing.setDribblesReussis(stat.getDribblesReussis());
        return statistiqueRepository.save(existing);
    }
 
    public void delete(Long id) {
        statistiqueRepository.deleteById(id);
    }
 
    public List<Joueur> findJoueursAvecStats() {
        return statistiqueRepository.findJoueursAvecStats();
    }
 
    // ✅ Top 10 buteurs — utilise butRepository (table "buts")
    public List<Object[]> getTopButeurs(Long tournoiId) {
        return butRepository.findTopButeursByTournoi(tournoiId)
                .stream().limit(10).toList();
    }
 
    // ✅ Top 10 passeurs — utilise butRepository (table "buts")
    public List<Object[]> getTopPasseurs(Long tournoiId) {
        return butRepository.findTopPasseursByTournoi(tournoiId)
                .stream().limit(10).toList();
    }
 
    // ✅ Top cartons — reste sur statistiqueRepository
    public List<Object[]> getTopCartons(Long tournoiId) {
        return statistiqueRepository.findTopCartonsByTournoi(tournoiId)
                .stream().limit(10).toList();
    }
 
    // ✅ Homme du match — reste sur statistiqueRepository
    public List<Object[]> getHommesDuMatch(Long tournoiId) {
        return statistiqueRepository.findHommesDuMatchByTournoi(tournoiId)
                .stream().limit(10).toList();
    }
 
    public List<String[]> getMeilleurClub(Long tournoiId) {
        List<String[]> result = new ArrayList<>();
 
        // Finale
        List<MatchFootball> finales = matchRepository
            .findByPhaseAndStatut(MatchFootball.Phase.FINALE, MatchFootball.Statut.TERMINE);
 
        for (MatchFootball f : finales) {
            if (!f.getEquipeDomicile().getGroupe().getTournoi().getId().equals(tournoiId)) continue;
 
            Equipe champion, finaliste;
            int scoreDom = f.getScoreDomicile();
            int scoreExt = f.getScoreExterieur();
 
            if (scoreDom > scoreExt) {
                champion = f.getEquipeDomicile();
                finaliste = f.getEquipeExterieur();
            } else if (scoreExt > scoreDom) {
                champion = f.getEquipeExterieur();
                finaliste = f.getEquipeDomicile();
            } else {
                if (f.getScorePenDomicile() > f.getScorePenExterieur()) {
                    champion = f.getEquipeDomicile();
                    finaliste = f.getEquipeExterieur();
                } else {
                    champion = f.getEquipeExterieur();
                    finaliste = f.getEquipeDomicile();
                }
            }
            result.add(new String[]{"🏆 Champion", champion.getNom()});
            result.add(new String[]{"🥈 Finaliste", finaliste.getNom()});
        }
 
        // 3e place
        List<MatchFootball> troisiemes = matchRepository
            .findByPhaseAndStatut(MatchFootball.Phase.TROISIEME, MatchFootball.Statut.TERMINE);
 
        for (MatchFootball t : troisiemes) {
            if (!t.getEquipeDomicile().getGroupe().getTournoi().getId().equals(tournoiId)) continue;
 
            Equipe troisieme;
            if (t.getScoreDomicile() > t.getScoreExterieur()) {
                troisieme = t.getEquipeDomicile();
            } else if (t.getScoreExterieur() > t.getScoreDomicile()) {
                troisieme = t.getEquipeExterieur();
            } else {
                if (t.getScorePenDomicile() > t.getScorePenExterieur()) {
                    troisieme = t.getEquipeDomicile();
                } else {
                    troisieme = t.getEquipeExterieur();
                }
            }
            result.add(new String[]{"🥉 3ème Place", troisieme.getNom()});
        }
 
        return result;
    }
}

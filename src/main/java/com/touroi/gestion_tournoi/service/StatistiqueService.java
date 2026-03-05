package com.touroi.gestion_tournoi.service;

import com.touroi.gestion_tournoi.model.Joueur;
import com.touroi.gestion_tournoi.model.MatchFootball;
import com.touroi.gestion_tournoi.model.Statistique;
import com.touroi.gestion_tournoi.repository.StatistiqueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class StatistiqueService {

    @Autowired
    private StatistiqueRepository statistiqueRepository;

    @Autowired
    private JoueurService joueurService;

    @Autowired
    private MatchService matchService;

    // Mijery statistiques per joueur
    public List<Statistique> findByJoueur(Long joueurId) {
        return statistiqueRepository.findByJoueurId(joueurId);
    }

    // Mijery statistiques per match
    public List<Statistique> findByMatch(Long matchId) {
        return statistiqueRepository.findByMatchId(matchId);
    }

    // Manampy statistique
    public Statistique save(Statistique stat,
                             Long joueurId, Long matchId) {
        Joueur joueur = joueurService.findById(joueurId);
        MatchFootball match = matchService.findById(matchId);
        stat.setJoueur(joueur);
        stat.setMatch(match);
        return statistiqueRepository.save(stat);
    }

    // Manova statistique
    public Statistique update(Long id, Statistique stat) {
        Statistique existing = statistiqueRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Statistique tsy hita!"));
        existing.setButs(stat.getButs());
        existing.setPassesDecisives(stat.getPassesDecisives());
        existing.setCartonsJaunes(stat.getCartonsJaunes());
        existing.setCartonsRouges(stat.getCartonsRouges());
        existing.setMinutesJouees(stat.getMinutesJouees());
        return statistiqueRepository.save(existing);
    }

    // Mamafa statistique
    public void delete(Long id) {
        statistiqueRepository.deleteById(id);
    }
}
package com.touroi.gestion_tournoi.service;

import com.touroi.gestion_tournoi.model.Equipe;
import com.touroi.gestion_tournoi.model.MatchFootball;
import com.touroi.gestion_tournoi.repository.MatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MatchService {

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private EquipeService equipeService;

    @Autowired
    private ClassementService classementService;

    // Lister tous les matchs
    public List<MatchFootball> findAll() {
        return matchRepository.findAll();
    }

    // Lister matchs par phase
    public List<MatchFootball> findByPhase(MatchFootball.Phase phase) {
        return matchRepository.findByPhase(phase);
    }

    // Trouver un match
    public MatchFootball findById(Long id) {
        return matchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Match introuvable !"));
    }

    // Créer un match
    public MatchFootball save(MatchFootball match, Long domId, Long extId) {
        Equipe dom = equipeService.findById(domId);
        Equipe ext = equipeService.findById(extId);

        if (domId.equals(extId)) {
            throw new RuntimeException("Impossible de faire jouer une équipe contre elle-même !");
        }

        if (match.getPhase() == MatchFootball.Phase.GROUPE) {
            if (!dom.getGroupe().getId().equals(ext.getGroupe().getId())) {
                throw new RuntimeException("Phase Groupe : les deux équipes doivent être dans le même groupe !");
            }
        }

        match.setEquipeDomicile(dom);
        match.setEquipeExterieur(ext);
        return matchRepository.save(match);
    }

    // Enregistrer score + stats
    public MatchFootball enregistrerScore(Long matchId,
            int scoreDom, int scoreExt,
            boolean prolongation, int scoreProlDom, int scoreProlExt,
            boolean penalty, int scorePenDom, int scorePenExt,
            // ✅ Stats équipe Domicile
            int tirsDomicile, int tirsCadresDomicile,
            int possessionDomicile, int passesDomicile,
            int fautesDomicile, int cartonsJaunesDomicile,
            int cartonsRougesDomicile, int cornersDomicile,
            int horsJeuDomicile,
            // ✅ Stats équipe Extérieur
            int tirsExterieur, int tirsCadresExterieur,
            int possessionExterieur, int passesExterieur,
            int fautesExterieur, int cartonsJaunesExterieur,
            int cartonsRougesExterieur, int cornersExterieur,
            int horsJeuExterieur) {

        MatchFootball match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match introuvable !"));

        // Raha efa TERMINE — tsy ovaina
        if (MatchFootball.Statut.TERMINE.equals(match.getStatut())) {
            return match;
        }

        // Score
        match.setScoreDomicile(scoreDom);
        match.setScoreExterieur(scoreExt);
        match.setProlongation(prolongation);
        match.setScoreProlDomicile(scoreProlDom);
        match.setScoreProlExterieur(scoreProlExt);
        match.setPenalty(penalty);
        match.setScorePenDomicile(scorePenDom);
        match.setScorePenExterieur(scorePenExt);
        match.setStatut(MatchFootball.Statut.TERMINE);

        // ✅ Stats Domicile
        match.setTirsDomicile(tirsDomicile);
        match.setTirsCadresDomicile(tirsCadresDomicile);
        match.setPossessionDomicile(possessionDomicile);
        match.setPassesDomicile(passesDomicile);
        match.setFautesDomicile(fautesDomicile);
        match.setCartonsJaunesDomicile(cartonsJaunesDomicile);
        match.setCartonsRougesDomicile(cartonsRougesDomicile);
        match.setCornersDomicile(cornersDomicile);
        match.setHorsJeuDomicile(horsJeuDomicile);

        // ✅ Stats Extérieur
        match.setTirsExterieur(tirsExterieur);
        match.setTirsCadresExterieur(tirsCadresExterieur);
        match.setPossessionExterieur(possessionExterieur);
        match.setPassesExterieur(passesExterieur);
        match.setFautesExterieur(fautesExterieur);
        match.setCartonsJaunesExterieur(cartonsJaunesExterieur);
        match.setCartonsRougesExterieur(cartonsRougesExterieur);
        match.setCornersExterieur(cornersExterieur);
        match.setHorsJeuExterieur(horsJeuExterieur);

        MatchFootball saved = matchRepository.save(match);

        // Update classement Phase GROUPE
        if (match.getPhase() == MatchFootball.Phase.GROUPE) {
            classementService.updateClassement(saved);
        }

        return saved;
    }

    // Supprimer match
    public void delete(Long id) {
        MatchFootball match = findById(id);
        if (match.getStatut() == MatchFootball.Statut.TERMINE) {
            throw new RuntimeException("Impossible de supprimer un match terminé !");
        }
        matchRepository.deleteById(id);
    }
}
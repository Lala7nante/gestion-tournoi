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

    // Mijery match rehetra
    public List<MatchFootball> findAll() {
        return matchRepository.findAll();
    }

    // Mijery match per phase
    public List<MatchFootball> findByPhase(MatchFootball.Phase phase) {
        return matchRepository.findByPhase(phase);
    }

    // Mijery match iray
    public MatchFootball findById(Long id) {
        return matchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Match tsy hita!"));
    }

    // Mamorona match vaovao
    public MatchFootball save(MatchFootball match, Long domId, Long extId) {
        Equipe dom = equipeService.findById(domId);
        Equipe ext = equipeService.findById(extId);

        if (domId.equals(extId)) {
            throw new RuntimeException("Tsy azo mifanandrina amin'ny tenany!");
        }

        if (match.getPhase() == MatchFootball.Phase.GROUPE) {
            if (!dom.getGroupe().getId().equals(ext.getGroupe().getId())) {
                throw new RuntimeException(
                        "Phase Groupe: ekipa iray groupe ihany no mifanandrina!");
            }
        }

        match.setEquipeDomicile(dom);
        match.setEquipeExterieur(ext);
        return matchRepository.save(match);
    }

    // Asiana Score — Update Classement AUTOMATIQUE
    public MatchFootball enregistrerScore(Long matchId,
            int scoreDom, int scoreExt,
            boolean prolongation, int scoreProlDom, int scoreProlExt,
            boolean penalty, int scorePenDom, int scorePenExt) {

        // ✅ Valiana mivantana avy amin'ny base — azo antoka kokoa
        MatchFootball match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match tsy hita!"));

        // ✅ Raha efa TERMINE — tsy ovaina ny classement
        if (MatchFootball.Statut.TERMINE.equals(match.getStatut())) {
            return match;
        }

        match.setScoreDomicile(scoreDom);
        match.setScoreExterieur(scoreExt);
        match.setProlongation(prolongation);
        match.setScoreProlDomicile(scoreProlDom);
        match.setScoreProlExterieur(scoreProlExt);
        match.setPenalty(penalty);
        match.setScorePenDomicile(scorePenDom);
        match.setScorePenExterieur(scorePenExt);
        match.setStatut(MatchFootball.Statut.TERMINE);

        MatchFootball saved = matchRepository.save(match);

        // ✅ Update classement SEULEMENT Phase GROUPE
        if (match.getPhase() == MatchFootball.Phase.GROUPE) {
            classementService.updateClassement(saved);
        }

        return saved;
    }

    // Mamafa match
    public void delete(Long id) {
        matchRepository.deleteById(id);
    }
}
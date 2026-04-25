package com.touroi.gestion_tournoi.service;

import com.touroi.gestion_tournoi.model.Classement;
import com.touroi.gestion_tournoi.model.Equipe;
import com.touroi.gestion_tournoi.model.MatchFootball;
import com.touroi.gestion_tournoi.repository.ClassementRepository;
import com.touroi.gestion_tournoi.repository.MatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;

@Service
public class ClassementService {

    @Autowired
    private ClassementRepository classementRepository;

    @Autowired
    private MatchRepository matchRepository;

    public List<Classement> findByGroupe(Long groupeId) {
        return classementRepository
                .findByGroupeIdOrderByPointsDescButsMarquesDesc(groupeId);
    }

    public List<Long> findAllGroupeIds() {
        return classementRepository.findDistinctGroupeIds();
    }

    @Transactional
    public void updateClassement(MatchFootball match) {
        Long groupeId = match.getEquipeDomicile().getGroupe().getId();
        Classement cDom = classementRepository
                .findByEquipeIdAndGroupeId(
                        match.getEquipeDomicile().getId(), groupeId)
                .orElseThrow(() -> new RuntimeException("Classement Dom tsy hita!"));
        Classement cExt = classementRepository
                .findByEquipeIdAndGroupeId(
                        match.getEquipeExterieur().getId(), groupeId)
                .orElseThrow(() -> new RuntimeException("Classement Ext tsy hita!"));

        resetClassement(cDom);
        resetClassement(cExt);

        List<MatchFootball> matchsDom = matchRepository
                .findByEquipeDomicileIdOrEquipeExterieurId(
                        match.getEquipeDomicile().getId(),
                        match.getEquipeDomicile().getId());
        List<MatchFootball> matchsExt = matchRepository
                .findByEquipeDomicileIdOrEquipeExterieurId(
                        match.getEquipeExterieur().getId(),
                        match.getEquipeExterieur().getId());

        for (MatchFootball m : matchsDom) {
            if (m.getStatut() == MatchFootball.Statut.TERMINE
                    && m.getPhase() == MatchFootball.Phase.GROUPE) {
                calculerStats(cDom, m, match.getEquipeDomicile().getId());
            }
        }
        for (MatchFootball m : matchsExt) {
            if (m.getStatut() == MatchFootball.Statut.TERMINE
                    && m.getPhase() == MatchFootball.Phase.GROUPE) {
                calculerStats(cExt, m, match.getEquipeExterieur().getId());
            }
        }

        classementRepository.save(cDom);
        classementRepository.save(cExt);
    }

    private void resetClassement(Classement c) {
        c.setPoints(0);
        c.setVictoires(0);
        c.setNuls(0);
        c.setDefaites(0);
        c.setButsMarques(0);
        c.setButsEncaisses(0);
    }

    private void calculerStats(Classement c, MatchFootball m, Long equipeId) {
        boolean isDomicile = m.getEquipeDomicile().getId().equals(equipeId);
        int scorePour = isDomicile ? m.getScoreDomicile() : m.getScoreExterieur();
        int scoreContre = isDomicile ? m.getScoreExterieur() : m.getScoreDomicile();

        c.setButsMarques(c.getButsMarques() + scorePour);
        c.setButsEncaisses(c.getButsEncaisses() + scoreContre);

        if (scorePour > scoreContre) {
            c.setPoints(c.getPoints() + 3);
            c.setVictoires(c.getVictoires() + 1);
        } else if (scoreContre > scorePour) {
            c.setDefaites(c.getDefaites() + 1);
        } else {
            c.setPoints(c.getPoints() + 1);
            c.setNuls(c.getNuls() + 1);
        }
    }

    @Transactional
    public void recalculerDepuisMatchs(Long groupeId) {
        List<Classement> classements = classementRepository.findByGroupeId(groupeId);

        for (Classement c : classements) {
            Long equipeId = c.getEquipe().getId();

            List<MatchFootball> matchs = matchRepository
                    .findByEquipeDomicileIdOrEquipeExterieurId(equipeId, equipeId);

            for (MatchFootball m : matchs) {
                if (m.getStatut() == MatchFootball.Statut.TERMINE
                        && m.getPhase() == MatchFootball.Phase.GROUPE) {
                    calculerStats(c, m, equipeId);
                }
            }

            classementRepository.save(c);
        }
    }

    @Transactional
    public void resetAllByGroupe(Long groupeId) {
        List<Classement> classements = classementRepository.findByGroupeId(groupeId);

        for (Classement c : classements) {
            resetClassement(c);
        }
        classementRepository.saveAll(classements);

        recalculerDepuisMatchs(groupeId);
    }

    public List<Equipe> getEquipesQualifiees() {
        List<Long> groupeIds = classementRepository.findDistinctGroupeIds();
        List<Equipe> qualifiees = new ArrayList<>();

        for (Long groupeId : groupeIds) {
            List<Classement> classementGroupe = classementRepository
                    .findByGroupeIdOrderByPointsDescButsMarquesDesc(groupeId);

            if (classementGroupe.size() >= 2) {
                qualifiees.add(classementGroupe.get(0).getEquipe());
                qualifiees.add(classementGroupe.get(1).getEquipe());
            } else if (classementGroupe.size() == 1) {
                qualifiees.add(classementGroupe.get(0).getEquipe());
            }
        }
        return qualifiees;
    }
}
package com.touroi.gestion_tournoi.service;

import com.touroi.gestion_tournoi.model.Classement;
import com.touroi.gestion_tournoi.model.MatchFootball;
import com.touroi.gestion_tournoi.repository.ClassementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ClassementService {

    @Autowired
    private ClassementRepository classementRepository;

    // Mijery classement per groupe — trié automatique
    public List<Classement> findByGroupe(Long groupeId) {
        return classementRepository
            .findByGroupeIdOrderByPointsDescButsMarquesDesc(groupeId);
    }

    // Update AUTOMATIQUE rehefa TERMINE ny match (Phase GROUPE)
    public void updateClassement(MatchFootball match) {

        Classement cDom = classementRepository
            .findByEquipeId(match.getEquipeDomicile().getId())
            .orElseThrow(() -> new RuntimeException("Classement tsy hita!"));

        Classement cExt = classementRepository
            .findByEquipeId(match.getEquipeExterieur().getId())
            .orElseThrow(() -> new RuntimeException("Classement tsy hita!"));

        int scoreDom = match.getScoreDomicile();
        int scoreExt = match.getScoreExterieur();

        // Update buts rehetra
        cDom.setButsMarques(cDom.getButsMarques() + scoreDom);
        cDom.setButsEncaisses(cDom.getButsEncaisses() + scoreExt);
        cExt.setButsMarques(cExt.getButsMarques() + scoreExt);
        cExt.setButsEncaisses(cExt.getButsEncaisses() + scoreDom);

        // Ekipa Domicile MENAKA
        if (scoreDom > scoreExt) {
            cDom.setPoints(cDom.getPoints() + 3);
            cDom.setVictoires(cDom.getVictoires() + 1);
            cExt.setDefaites(cExt.getDefaites() + 1);
        }
        // Ekipa Extérieur MENAKA
        else if (scoreExt > scoreDom) {
            cExt.setPoints(cExt.getPoints() + 3);
            cExt.setVictoires(cExt.getVictoires() + 1);
            cDom.setDefaites(cDom.getDefaites() + 1);
        }
        // NUL
        else {
            cDom.setPoints(cDom.getPoints() + 1);
            cDom.setNuls(cDom.getNuls() + 1);
            cExt.setPoints(cExt.getPoints() + 1);
            cExt.setNuls(cExt.getNuls() + 1);
        }

        classementRepository.save(cDom);
        classementRepository.save(cExt);
    }
}


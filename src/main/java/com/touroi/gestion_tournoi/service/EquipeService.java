package com.touroi.gestion_tournoi.service;

import com.touroi.gestion_tournoi.model.Classement;
import com.touroi.gestion_tournoi.model.Equipe;
import com.touroi.gestion_tournoi.model.Groupe;
import com.touroi.gestion_tournoi.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class EquipeService {

    @Autowired private EquipeRepository equipeRepository;
    @Autowired private GroupeService groupeService;
    @Autowired private ClassementRepository classementRepository;
    @Autowired private GroupeRepository groupeRepository;
    @Autowired private MatchRepository matchRepository;

    // Lister toutes les équipes
    public List<Equipe> findAll() {
        return equipeRepository.findAll();
    }

    // Lister les équipes d'un groupe
    public List<Equipe> findByGroupe(Long groupeId) {
        return equipeRepository.findByGroupeId(groupeId);
    }

    // Trouver une équipe
    public Equipe findById(Long id) {
        return equipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Équipe introuvable !"));
    }

    // Ajouter une équipe dans un groupe
    public Equipe save(Equipe equipe, Long groupeId) {
        Groupe groupe = groupeService.findById(groupeId);
        int count = equipeRepository.countByGroupeId(groupeId);
        if (count >= 4) {
            throw new RuntimeException("Ce groupe est complet (4 équipes maximum) !");
        }
        equipe.setGroupe(groupe);
        Equipe savedEquipe = equipeRepository.save(equipe);
        Classement classement = new Classement();
        classement.setEquipe(savedEquipe);
        classement.setGroupe(groupe);
        classementRepository.save(classement);
        return savedEquipe;
    }

    // Modifier une équipe
    public Equipe update(Long id, Equipe equipe) {
        Equipe existing = findById(id);
        existing.setNom(equipe.getNom());
        existing.setVille(equipe.getVille());
        existing.setCoach(equipe.getCoach());
        return equipeRepository.save(existing);
    }

    // Supprimer une équipe (cascade : matchs → classement → équipe)
    @Transactional
    public void delete(Long id) {
        matchRepository.deleteAll(
            matchRepository.findByEquipeDomicileIdOrEquipeExterieurId(id, id)
        );
        classementRepository.findByEquipeId(id)
            .ifPresent(classementRepository::delete);
        equipeRepository.deleteById(id);
    }

    // Lister tous les groupes (pour le dropdown)
    public List<Groupe> findAllGroupes() {
        return groupeRepository.findAll();
    }
}
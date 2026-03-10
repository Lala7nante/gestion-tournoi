package com.touroi.gestion_tournoi.service;

import com.touroi.gestion_tournoi.model.Equipe;
import com.touroi.gestion_tournoi.model.Groupe;
import com.touroi.gestion_tournoi.model.Tournoi;
import com.touroi.gestion_tournoi.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class GroupeService {

    @Autowired private GroupeRepository groupeRepository;
    @Autowired private TournoiService tournoiService;
    @Autowired private EquipeRepository equipeRepository;
    @Autowired private MatchRepository matchRepository;
    @Autowired private ClassementRepository classementRepository;

    // Lister les groupes d'un tournoi
    public List<Groupe> findByTournoi(Long tournoiId) {
        return groupeRepository.findByTournoiId(tournoiId);
    }

    // Trouver un groupe
    public Groupe findById(Long id) {
        return groupeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Groupe introuvable !"));
    }

    // Créer un groupe — nom automatique A, B, C...
    public Groupe save(Long tournoiId) {
        Tournoi tournoi = tournoiService.findById(tournoiId);
        int existingGroupes = groupeRepository.countByTournoiId(tournoiId);
        if (existingGroupes >= tournoi.getNbGroupes()) {
            throw new RuntimeException("Le nombre maximum de groupes est atteint !");
        }
        char nom = (char) ('A' + existingGroupes);
        Groupe groupe = new Groupe();
        groupe.setNom(nom);
        groupe.setTournoi(tournoi);
        return groupeRepository.save(groupe);
    }

    // Supprimer un groupe (cascade : matchs → classements → équipes → groupe)
    @Transactional
    public void delete(Long id) {
        List<Equipe> equipes = equipeRepository.findByGroupeId(id);
        for (Equipe equipe : equipes) {
            matchRepository.deleteAll(
                matchRepository.findByEquipeDomicileIdOrEquipeExterieurId(
                    equipe.getId(), equipe.getId()
                )
            );
            classementRepository.findByEquipeId(equipe.getId())
                .ifPresent(classementRepository::delete);
        }
        equipeRepository.deleteAll(equipes);
        groupeRepository.deleteById(id);
    }

    // Lister tous les groupes
    public List<Groupe> findAll() {
        return groupeRepository.findAll();
    }
}
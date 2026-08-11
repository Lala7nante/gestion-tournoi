package com.touroi.gestion_tournoi.service;

import com.touroi.gestion_tournoi.model.Equipe;
import com.touroi.gestion_tournoi.model.Groupe;
import com.touroi.gestion_tournoi.model.Tournoi;
import com.touroi.gestion_tournoi.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;

@Service
public class TournoiService {

    @Autowired private TournoiRepository tournoiRepository;
    @Autowired private GroupeRepository groupeRepository;
    @Autowired private EquipeRepository equipeRepository;
    @Autowired private MatchRepository matchRepository;
    @Autowired private ClassementRepository classementRepository;

    public List<Tournoi> findAll() {
        return tournoiRepository.findAll();
    }

    public Tournoi findById(Long id) {
        return tournoiRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tournoi introuvable !"));
    }

    public Tournoi save(Tournoi tournoi) {
        if (tournoi.getType() == Tournoi.TypeTournoi.COUPE) {
            // Validation COUPE
            if (tournoi.getNbGroupes() == null || tournoi.getNbGroupes() <= 0) {
                throw new RuntimeException("Le nombre de groupes est invalide !");
            }
            Tournoi savedTournoi = tournoiRepository.save(tournoi);

            // Création automatique des groupes A→L
            int nombreGroupes = Math.min(savedTournoi.getNbGroupes(), 12);
            List<Groupe> groupes = new ArrayList<>();
            for (int i = 0; i < nombreGroupes; i++) {
                Groupe g = new Groupe();
                g.setNom((char) ('A' + i));
                g.setTournoi(savedTournoi);
                groupes.add(g);
            }
            groupeRepository.saveAll(groupes);
            return savedTournoi;

        } else {
            // LIGUE — tsy mila groupes
            if (tournoi.getSaison() == null || tournoi.getSaison().isBlank()) {
                throw new RuntimeException("La saison est obligatoire pour une ligue !");
            }
            if (tournoi.getTypeMatch() == null) {
                throw new RuntimeException("Le type de match est obligatoire pour une ligue !");
            }
            return tournoiRepository.save(tournoi);
        }
    }

    public Groupe saveGroupe(Groupe g) {
        return groupeRepository.save(g);
    }

    public Tournoi update(Long id, Tournoi tournoi) {
        Tournoi existing = findById(id);
        existing.setNom(tournoi.getNom());
        existing.setDescription(tournoi.getDescription());
        existing.setDateDebut(tournoi.getDateDebut());
        existing.setDateFin(tournoi.getDateFin());
        existing.setStatut(tournoi.getStatut());

        // Update miankina amin'ny type
        if (existing.getType() == Tournoi.TypeTournoi.COUPE) {
            existing.setNbGroupes(tournoi.getNbGroupes());
        } else {
            existing.setSaison(tournoi.getSaison());
            existing.setTypeMatch(tournoi.getTypeMatch());
        }

        return tournoiRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        List<Groupe> groupes = groupeRepository.findByTournoiId(id);
        for (Groupe groupe : groupes) {
            List<Equipe> equipes = equipeRepository.findByGroupeId(groupe.getId());
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
        }
        groupeRepository.deleteAll(groupes);
        tournoiRepository.deleteById(id);
    }
}
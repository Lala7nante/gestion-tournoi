package com.touroi.gestion_tournoi.service;

import com.touroi.gestion_tournoi.model.Classement;
import com.touroi.gestion_tournoi.model.Equipe;
import com.touroi.gestion_tournoi.model.Groupe;
import com.touroi.gestion_tournoi.model.Tournoi;
import com.touroi.gestion_tournoi.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class EquipeService {

    @Autowired private EquipeRepository equipeRepository;
    @Autowired private GroupeService groupeService;
    @Autowired private GroupeRepository groupeRepository;
    @Autowired private ClassementRepository classementRepository;
    @Autowired private MatchRepository matchRepository;
    @Autowired private TournoiRepository tournoiRepository;

    public List<Equipe> findAll() {
        return equipeRepository.findAll();
    }

    public Equipe findById(Long id) {
        return equipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Équipe introuvable !"));
    }

    public List<Equipe> findByGroupe(Long groupeId) {
        return equipeRepository.findByGroupeId(groupeId);
    }

    public List<Equipe> findByTournoi(Long tournoiId) {
        return equipeRepository.findByTournoiId(tournoiId);
    }

    // ── COUPE ──
    public Equipe saveInCoupe(Equipe equipe, Long groupeId) {
        Groupe groupe = groupeService.findById(groupeId);
        Long tournoiId = groupe.getTournoi().getId();

        // Max 4 equipes par groupe
        int count = equipeRepository.countByGroupeId(groupeId);
        if (count >= 4) {
            throw new RuntimeException("Ce groupe est complet (4 équipes maximum) !");
        }

        // Nom dupliqué dans le même tournoi
        boolean nomExiste = equipeRepository.findAll().stream()
                .filter(e -> e.getGroupe() != null
                        && e.getGroupe().getTournoi().getId().equals(tournoiId))
                .anyMatch(e -> e.getNom().equalsIgnoreCase(equipe.getNom().trim()));
        if (nomExiste) {
            throw new RuntimeException("Une équipe avec ce nom existe déjà dans ce tournoi !");
        }

        // Coach dupliqué dans le même tournoi
        boolean coachExiste = equipeRepository.findAll().stream()
                .filter(e -> e.getGroupe() != null
                        && e.getGroupe().getTournoi().getId().equals(tournoiId))
                .anyMatch(e -> equipe.getCoach() != null
                        && e.getCoach() != null
                        && e.getCoach().equalsIgnoreCase(equipe.getCoach().trim()));
        if (coachExiste) {
            throw new RuntimeException("Un coach ne peut pas entraîner deux équipes dans le même tournoi !");
        }

        equipe.setNom(equipe.getNom().trim());
        equipe.setGroupe(groupe);
        equipe.setTournoi(null);
        Equipe savedEquipe = equipeRepository.save(equipe);

        // Classement automatique
        Classement classement = new Classement();
        classement.setEquipe(savedEquipe);
        classement.setGroupe(groupe);
        classementRepository.save(classement);

        return savedEquipe;
    }

    // ── LIGUE ──
    public Equipe saveInLigue(Equipe equipe, Long tournoiId) {
        Tournoi tournoi = tournoiRepository.findById(tournoiId)
                .orElseThrow(() -> new RuntimeException("Tournoi introuvable !"));

        if (tournoi.getType() != Tournoi.TypeTournoi.LIGUE) {
            throw new RuntimeException("Ce tournoi n'est pas une ligue !");
        }

        // Nom dupliqué dans la même ligue
        boolean nomExiste = equipeRepository.findByTournoiId(tournoiId).stream()
                .anyMatch(e -> e.getNom().equalsIgnoreCase(equipe.getNom().trim()));
        if (nomExiste) {
            throw new RuntimeException("Une équipe avec ce nom existe déjà dans cette ligue !");
        }

        // Coach dupliqué dans la même ligue
        boolean coachExiste = equipeRepository.findByTournoiId(tournoiId).stream()
                .anyMatch(e -> equipe.getCoach() != null
                        && e.getCoach() != null
                        && e.getCoach().equalsIgnoreCase(equipe.getCoach().trim()));
        if (coachExiste) {
            throw new RuntimeException("Un coach ne peut pas entraîner deux équipes dans cette ligue !");
        }

        equipe.setNom(equipe.getNom().trim());
        equipe.setTournoi(tournoi);
        equipe.setGroupe(null);
        return equipeRepository.save(equipe);
    }

    public Equipe update(Long id, Equipe equipe) {
        Equipe existing = findById(id);
        existing.setNom(equipe.getNom());
        existing.setVille(equipe.getVille());
        existing.setCoach(equipe.getCoach());
        return equipeRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        matchRepository.deleteAll(
            matchRepository.findByEquipeDomicileIdOrEquipeExterieurId(id, id)
        );
        classementRepository.findByEquipeId(id)
                .ifPresent(classementRepository::delete);
        equipeRepository.deleteById(id);
    }

    public List<Groupe> findAllGroupes() {
        return groupeRepository.findAll();
    }
}
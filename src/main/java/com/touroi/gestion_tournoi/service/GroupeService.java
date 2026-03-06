package com.touroi.gestion_tournoi.service;

import com.touroi.gestion_tournoi.model.Groupe;
import com.touroi.gestion_tournoi.model.Tournoi;
import com.touroi.gestion_tournoi.repository.GroupeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class GroupeService {

    @Autowired
    private GroupeRepository groupeRepository;

    @Autowired
    private TournoiService tournoiService;

    // Mijery groupe rehetra amin'ny tournoi
    public List<Groupe> findByTournoi(Long tournoiId) {
        return groupeRepository.findByTournoiId(tournoiId);
    }

    // Mijery groupe iray
    public Groupe findById(Long id) {
        return groupeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Groupe tsy hita!"));
    }

    // Mamorona groupe — nom AUTOMATIQUE A, B, C...
    public Groupe save(Long tournoiId) {
        Tournoi tournoi = tournoiService.findById(tournoiId);

        // Validation: tsy azo mamorona groupe raha efa feno
        int existingGroupes = groupeRepository.countByTournoiId(tournoiId);
        if (existingGroupes >= tournoi.getNbGroupes()) {
            throw new RuntimeException("Le nombre maximum de groupes est atteint !");
        }

        // Nom automatique: A, B, C...
        char nom = (char) ('A' + existingGroupes);

        Groupe groupe = new Groupe();
        groupe.setNom(nom);
        groupe.setTournoi(tournoi);

        return groupeRepository.save(groupe);
    }

    // Mamafa groupe
    public void delete(Long id) {
        groupeRepository.deleteById(id);
    }

    public List<Groupe> findAll() {
    return groupeRepository.findAll();
}
}
package com.touroi.gestion_tournoi.service;

import com.touroi.gestion_tournoi.model.Tournoi;
import com.touroi.gestion_tournoi.repository.TournoiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TournoiService {

    @Autowired
    private TournoiRepository tournoiRepository;

    // Mijery lista tournoi rehetra
    public List<Tournoi> findAll() {
        return tournoiRepository.findAll();
    }

    // Mijery tournoi iray
    public Tournoi findById(Long id) {
        return tournoiRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Tournoi tsy hita!"));
    }

    // Mamorona tournoi vaovao
    public Tournoi save(Tournoi tournoi) {
        // Validation: nb_groupes * 4 = multiple de 4
        if (tournoi.getNbGroupes() <= 0) {
            throw new RuntimeException("Nb groupes tsy mety!");
        }
        return tournoiRepository.save(tournoi);
    }

    // Manova tournoi
    public Tournoi update(Long id, Tournoi tournoi) {
        Tournoi existing = findById(id);
        existing.setNom(tournoi.getNom());
        existing.setDescription(tournoi.getDescription());
        existing.setDateDebut(tournoi.getDateDebut());
        existing.setDateFin(tournoi.getDateFin());
        existing.setNbGroupes(tournoi.getNbGroupes());
        existing.setStatut(tournoi.getStatut());
        return tournoiRepository.save(existing);
    }

    // Mamafa tournoi
    public void delete(Long id) {
        tournoiRepository.deleteById(id);
    }
}

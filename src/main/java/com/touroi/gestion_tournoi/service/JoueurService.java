package com.touroi.gestion_tournoi.service;

import com.touroi.gestion_tournoi.model.Equipe;
import com.touroi.gestion_tournoi.model.Joueur;
import com.touroi.gestion_tournoi.repository.JoueurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class JoueurService {

    @Autowired
    private JoueurRepository joueurRepository;

    @Autowired
    private EquipeService equipeService;

    // Mijery joueur rehetra amin'ny ekipa
    public List<Joueur> findByEquipe(Long equipeId) {
        return joueurRepository.findByEquipeId(equipeId);
    }

    // Mijery joueur rehetra
    public List<Joueur> findAll() {
        return joueurRepository.findAll();
    }

    // Mijery joueur iray
    public Joueur findById(Long id) {
        return joueurRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Joueur tsy hita!"));
    }

    // Manampy joueur
    public Joueur save(Joueur joueur, Long equipeId) {
        Equipe equipe = equipeService.findById(equipeId);
        joueur.setEquipe(equipe);
        return joueurRepository.save(joueur);
    }

    // Manova joueur
    public Joueur update(Long id, Joueur joueur) {
        Joueur existing = findById(id);
        existing.setNom(joueur.getNom());
        existing.setPrenom(joueur.getPrenom());
        existing.setAge(joueur.getAge());
        existing.setPoste(joueur.getPoste());
        return joueurRepository.save(existing);
    }

    // Mamafa joueur
    public void delete(Long id) {
        joueurRepository.deleteById(id);
    }
}
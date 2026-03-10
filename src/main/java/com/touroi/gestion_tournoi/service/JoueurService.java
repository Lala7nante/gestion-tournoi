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

    // Lister les joueurs d'une équipe
    public List<Joueur> findByEquipe(Long equipeId) {
        return joueurRepository.findByEquipeId(equipeId);
    }

    // Lister tous les joueurs
    public List<Joueur> findAll() {
        return joueurRepository.findAll();
    }

    // Trouver un joueur
    public Joueur findById(Long id) {
        return joueurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Joueur introuvable !"));
    }

    // Ajouter un joueur
    public Joueur save(Joueur joueur, Long equipeId) {
        Equipe equipe = equipeService.findById(equipeId);
        joueur.setEquipe(equipe);
        return joueurRepository.save(joueur);
    }

    // Modifier un joueur
    public Joueur update(Long id, Joueur joueur) {
        Joueur existing = findById(id);
        existing.setNom(joueur.getNom());
        existing.setPrenom(joueur.getPrenom());
        existing.setNumero(joueur.getNumero());
        existing.setPoste(joueur.getPoste());
        return joueurRepository.save(existing);
    }

    // Supprimer un joueur
    public void delete(Long id) {
        joueurRepository.deleteById(id);
    }
}
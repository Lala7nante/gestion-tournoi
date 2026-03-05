package com.touroi.gestion_tournoi.service;

import com.touroi.gestion_tournoi.model.Classement;
import com.touroi.gestion_tournoi.model.Equipe;
import com.touroi.gestion_tournoi.model.Groupe;
import com.touroi.gestion_tournoi.repository.ClassementRepository;
import com.touroi.gestion_tournoi.repository.EquipeRepository;
import com.touroi.gestion_tournoi.repository.GroupeRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EquipeService {

    @Autowired
    private EquipeRepository equipeRepository;

    @Autowired
    private GroupeService groupeService;

    @Autowired
    private ClassementRepository classementRepository;

    @Autowired
    private GroupeRepository groupeRepository;
    

    // Mijery ekipa rehetra
    public List<Equipe> findAll() {
        return equipeRepository.findAll();
    }

    // Mijery ekipa rehetra amin'ny groupe
    public List<Equipe> findByGroupe(Long groupeId) {
        return equipeRepository.findByGroupeId(groupeId);
    }

    // Mijery ekipa iray
    public Equipe findById(Long id) {
        return equipeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Equipe tsy hita!"));
    }

    // Manampy ekipa ao anatin'ny groupe
    public Equipe save(Equipe equipe, Long groupeId) {
        Groupe groupe = groupeService.findById(groupeId);

        // Validation: tsy azo asiana raha efa feno 4
        int count = equipeRepository.countByGroupeId(groupeId);
        if (count >= 4) {
            throw new RuntimeException("Efa feno 4 ny ekipa amin'ity groupe ity!");
        }

        equipe.setGroupe(groupe);
        Equipe savedEquipe = equipeRepository.save(equipe);

        // Mamorona classement automatique ho an'ny ekipa vaovao
        Classement classement = new Classement();
        classement.setEquipe(savedEquipe);
        classement.setGroupe(groupe);
        classementRepository.save(classement);

        return savedEquipe;
    }

    // Manova ekipa
    public Equipe update(Long id, Equipe equipe) {
        Equipe existing = findById(id);
        existing.setNom(equipe.getNom());
        existing.setVille(equipe.getVille());
        existing.setCoach(equipe.getCoach());
        return equipeRepository.save(existing);
    }

    // Mamafa ekipa
    public void delete(Long id) {
        equipeRepository.deleteById(id);
    }

    // Mijery groupes rehetra (ho an'ny dropdown)
    public List<Groupe> findAllGroupes() {
        return groupeRepository.findAll();
    }
}
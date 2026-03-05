package com.touroi.gestion_tournoi.controller;

import com.touroi.gestion_tournoi.model.Joueur;
import com.touroi.gestion_tournoi.service.EquipeService;
import com.touroi.gestion_tournoi.service.JoueurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/equipes/{equipeId}/joueurs")
public class JoueurController {

    @Autowired
    private JoueurService joueurService;

    @Autowired
    private EquipeService equipeService;

    // Lista joueur amin'ny ekipa
    @GetMapping
    public String index(@PathVariable Long equipeId, Model model) {
        model.addAttribute("equipe", equipeService.findById(equipeId));
        model.addAttribute("joueurs", joueurService.findByEquipe(equipeId));
        return "joueur/index";
    }

    // Formulaire manampy joueur
    @GetMapping("/new")
    public String newForm(@PathVariable Long equipeId, Model model) {
        model.addAttribute("equipe", equipeService.findById(equipeId));
        model.addAttribute("joueur", new Joueur());
        model.addAttribute("postes", Joueur.Poste.values());
        return "joueur/form";
    }

    // Manampy joueur
    @PostMapping
    public String save(@PathVariable Long equipeId,
                       @ModelAttribute Joueur joueur) {
        joueurService.save(joueur, equipeId);
        return "redirect:/equipes/" + equipeId + "/joueurs";
    }

    // Formulaire manova joueur
    @GetMapping("/{id}/edit")
    public String editForm(@PathVariable Long equipeId,
                           @PathVariable Long id, Model model) {
        model.addAttribute("equipe", equipeService.findById(equipeId));
        model.addAttribute("joueur", joueurService.findById(id));
        model.addAttribute("postes", Joueur.Poste.values());
        return "joueur/form";
    }

    // Manova joueur
    @PostMapping("/{id}")
    public String update(@PathVariable Long equipeId,
                         @PathVariable Long id,
                         @ModelAttribute Joueur joueur) {
        joueurService.update(id, joueur);
        return "redirect:/equipes/" + equipeId + "/joueurs";
    }

    // Mamafa joueur
    @GetMapping("/{id}/delete")
    public String delete(@PathVariable Long equipeId,
                         @PathVariable Long id) {
        joueurService.delete(id);
        return "redirect:/equipes/" + equipeId + "/joueurs";
    }
}

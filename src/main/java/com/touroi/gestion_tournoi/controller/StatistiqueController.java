package com.touroi.gestion_tournoi.controller;

import com.touroi.gestion_tournoi.model.Statistique;
import com.touroi.gestion_tournoi.service.JoueurService;
import com.touroi.gestion_tournoi.service.MatchService;
import com.touroi.gestion_tournoi.service.StatistiqueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class StatistiqueController {

    @Autowired
    private StatistiqueService statistiqueService;

    @Autowired
    private JoueurService joueurService;

    @Autowired
    private MatchService matchService;

    // Page principale statistiques
    @GetMapping("/statistiques")
    public String index(Model model) {
        model.addAttribute("joueurs", joueurService.findAll());
        return "statistique/index";
    }

    // Statistiques per joueur
    @GetMapping("/statistiques/joueur/{joueurId}")
    public String byJoueur(@PathVariable Long joueurId, Model model) {
        model.addAttribute("joueur", joueurService.findById(joueurId));
        model.addAttribute("statistiques", statistiqueService.findByJoueur(joueurId));
        return "statistique/joueur";
    }

    // Statistiques per match
    @GetMapping("/statistiques/match/{matchId}")
    public String byMatch(@PathVariable Long matchId, Model model) {
        model.addAttribute("match", matchService.findById(matchId));
        model.addAttribute("statistiques", statistiqueService.findByMatch(matchId));
        return "statistique/match";
    }

    // Formulaire manampy statistique
    @GetMapping("/statistiques/new")
    public String newForm(Model model) {
        model.addAttribute("statistique", new Statistique());
        model.addAttribute("joueurs", joueurService.findAll());
        model.addAttribute("matchs", matchService.findAll());
        return "statistique/form";
    }

    // Manampy statistique
    @PostMapping("/statistiques")
    public String save(@ModelAttribute Statistique stat,
                       @RequestParam Long joueurId,
                       @RequestParam Long matchId) {
        statistiqueService.save(stat, joueurId, matchId);
        return "redirect:/statistiques/match/" + matchId;
    }

    // Mamafa statistique
    @GetMapping("/statistiques/{id}/delete")
    public String delete(@PathVariable Long id,
                         @RequestParam Long matchId) {
        statistiqueService.delete(id);
        return "redirect:/statistiques/match/" + matchId;
    }
}
package com.touroi.gestion_tournoi.controller;

import com.touroi.gestion_tournoi.model.Statistique;
import com.touroi.gestion_tournoi.service.JoueurService;
import com.touroi.gestion_tournoi.service.MatchService;
import com.touroi.gestion_tournoi.service.StatistiqueService;
import com.touroi.gestion_tournoi.service.TournoiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class StatistiqueController {

    @Autowired
    private StatistiqueService statistiqueService;

    @Autowired
    private JoueurService joueurService;

    @Autowired
    private MatchService matchService;

    @Autowired
    private TournoiService tournoiService;

    
    // Page principale statistiques
    @GetMapping("/statistiques")
    public String index(Model model) {
       model.addAttribute("tournois", tournoiService.findAll());
       // ✅ Joueurs manana stat ihany — fa tsy rehetra
       model.addAttribute("joueurs", statistiqueService.findJoueursAvecStats());
       return "statistique/index";
     }

    // ✅ Classements par tournoi
    @GetMapping("/statistiques/tournoi/{tournoiId}")
    public String byTournoi(@PathVariable Long tournoiId, Model model) {
        model.addAttribute("tournoi", tournoiService.findById(tournoiId));
        model.addAttribute("topButeurs", statistiqueService.getTopButeurs(tournoiId));
        model.addAttribute("topPasseurs", statistiqueService.getTopPasseurs(tournoiId));
        model.addAttribute("topCartons", statistiqueService.getTopCartons(tournoiId));
        model.addAttribute("hommesDuMatch", statistiqueService.getHommesDuMatch(tournoiId));
       model.addAttribute("meilleurClub", statistiqueService.getMeilleurClub(tournoiId));
        return "statistique/tournoi";
    }

    // Statistiques par joueur
    @GetMapping("/statistiques/joueur/{joueurId}")
    public String byJoueur(@PathVariable Long joueurId, Model model) {
        model.addAttribute("joueur", joueurService.findById(joueurId));
        model.addAttribute("statistiques", statistiqueService.findByJoueur(joueurId));
        return "statistique/joueur";
    }

    // Statistiques par match
    @GetMapping("/statistiques/match/{matchId}")
    public String byMatch(@PathVariable Long matchId, Model model) {
        model.addAttribute("match", matchService.findById(matchId));
        model.addAttribute("statistiques", statistiqueService.findByMatch(matchId));
        return "statistique/match";
    }

    // Formulaire nouvelle statistique
    @GetMapping("/statistiques/new")
    public String newForm(Model model) {
        model.addAttribute("statistique", new Statistique());
        model.addAttribute("joueurs", joueurService.findAll());
        model.addAttribute("matchs", matchService.findAll());
        return "statistique/form";
    }

    // Sauvegarder statistique
    @PostMapping("/statistiques")
    public String save(@ModelAttribute Statistique stat,
                   @RequestParam Long joueurId,
                   @RequestParam Long matchId,
                   RedirectAttributes redirectAttributes) {
         try {
              statistiqueService.save(stat, joueurId, matchId);
        } catch (RuntimeException e) {
             redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
         return "redirect:/statistiques/new";
        }
         return "redirect:/statistiques/match/" + matchId;
      }

    // Supprimer statistique
    @GetMapping("/statistiques/{id}/delete")
    public String delete(@PathVariable Long id,
                         @RequestParam Long matchId) {
        statistiqueService.delete(id);
        return "redirect:/statistiques/match/" + matchId;
    }
}
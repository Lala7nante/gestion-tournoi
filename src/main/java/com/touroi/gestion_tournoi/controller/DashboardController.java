package com.touroi.gestion_tournoi.controller;

import com.touroi.gestion_tournoi.model.MatchFootball;
import com.touroi.gestion_tournoi.repository.*;
import com.touroi.gestion_tournoi.service.StatistiqueService;
import com.touroi.gestion_tournoi.service.TournoiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {

    @Autowired private TournoiRepository tournoiRepository;
    @Autowired private MatchRepository matchRepository;
    @Autowired private EquipeRepository equipeRepository;
    @Autowired private GroupeRepository groupeRepository;
    @Autowired private StatistiqueService statistiqueService;
    @Autowired private TournoiService tournoiService;

    @GetMapping("/")
    public String home() { return "redirect:/dashboard"; }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {

        // Stats générales
        model.addAttribute("nbTournois", tournoiRepository.count());
        model.addAttribute("nbGroupes", groupeRepository.count());
        model.addAttribute("nbEquipes", equipeRepository.count());
        model.addAttribute("nbMatchs", matchRepository.count());

        // Derniers résultats
        model.addAttribute("derniersResultats",
            matchRepository.findByStatutOrderByDateMatchDesc(
                MatchFootball.Statut.TERMINE).stream().limit(5).toList());

        // Prochains matchs
        model.addAttribute("prochainsMatchs",
            matchRepository.findByStatutOrderByDateMatchAsc(
                MatchFootball.Statut.PREVU).stream().limit(5).toList());

        // Top buteur + Homme du tournoi + Champions
        tournoiService.findAll().stream().findFirst().ifPresent(t -> {
            var topButeurs = statistiqueService.getTopButeurs(t.getId());
            var hommes = statistiqueService.getHommesDuMatch(t.getId());
            if (!topButeurs.isEmpty()) model.addAttribute("topButeur", topButeurs.get(0));
            if (!hommes.isEmpty()) model.addAttribute("hommeTournoi", hommes.get(0));

            // ✅ Champions — 3 premiers
            var champions = statistiqueService.getMeilleurClub(t.getId());
            model.addAttribute("champions", champions);
        });

        return "dashboard";
    }
}
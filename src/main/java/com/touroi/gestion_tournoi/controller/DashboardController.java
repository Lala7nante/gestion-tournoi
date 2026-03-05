package com.touroi.gestion_tournoi.controller;

import com.touroi.gestion_tournoi.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {

    @Autowired
    private TournoiRepository tournoiRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private EquipeRepository equipeRepository;

    @Autowired
    private JoueurRepository joueurRepository;

    @Autowired
    private GroupeRepository groupeRepository;

    @GetMapping("/")
    public String home() {
        return "redirect:/dashboard";
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAttribute("nbTournois", tournoiRepository.count());
        model.addAttribute("nbGroupes", groupeRepository.count());
        model.addAttribute("nbEquipes", equipeRepository.count());
        model.addAttribute("nbJoueurs", joueurRepository.count());
        model.addAttribute("nbMatchs", matchRepository.count());
        return "dashboard";
    }
}
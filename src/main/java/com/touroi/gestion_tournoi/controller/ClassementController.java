package com.touroi.gestion_tournoi.controller;

import com.touroi.gestion_tournoi.service.ClassementService;
import com.touroi.gestion_tournoi.service.GroupeService;
import com.touroi.gestion_tournoi.service.TournoiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class ClassementController {

    @Autowired
    private ClassementService classementService;

    @Autowired
    private GroupeService groupeService;

    @Autowired
    private TournoiService tournoiService;

    // Classement global — misafidy tournoi aloha
    @GetMapping("/classement")
    public String index(Model model) {
        model.addAttribute("tournois", tournoiService.findAll());
        return "classement/index";
    }

    // Classement per groupe
    @GetMapping("/groupes/{groupeId}/classement")
    public String byGroupe(@PathVariable Long groupeId, Model model) {
        model.addAttribute("groupe", groupeService.findById(groupeId));
        model.addAttribute("classements", classementService.findByGroupe(groupeId));
        return "classement/detail";
    }
}
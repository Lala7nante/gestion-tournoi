package com.touroi.gestion_tournoi.controller;

import com.touroi.gestion_tournoi.model.Classement;
import com.touroi.gestion_tournoi.model.Groupe;
import com.touroi.gestion_tournoi.model.Tournoi;
import com.touroi.gestion_tournoi.service.ClassementService;
import com.touroi.gestion_tournoi.service.GroupeService;
import com.touroi.gestion_tournoi.service.TournoiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class ClassementController {

    @Autowired
    private ClassementService classementService;
    @Autowired
    private GroupeService groupeService;
    @Autowired
    private TournoiService tournoiService;

    // ✅ Ilay method soloina
    @GetMapping("/classement")
    public String index(Model model) {
        List<Tournoi> tournois = tournoiService.findAll();
        model.addAttribute("tournois", tournois);

        Map<Long, List<Classement>> classementMap = new HashMap<>();
        for (Tournoi t : tournois) {
            for (Groupe g : t.getGroupes()) {
                classementMap.put(g.getId(), classementService.findByGroupe(g.getId()));
            }
        }
        model.addAttribute("classementMap", classementMap);
        return "classement/index";
    }

    // Classement per groupe — tsy ovaina
    @GetMapping("/groupes/{groupeId}/classement")
    public String byGroupe(@PathVariable Long groupeId, Model model) {
        model.addAttribute("groupe", groupeService.findById(groupeId));
        model.addAttribute("classements", classementService.findByGroupe(groupeId));
        return "classement/detail";
    }
}
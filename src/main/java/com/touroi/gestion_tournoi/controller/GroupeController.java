package com.touroi.gestion_tournoi.controller;

import com.touroi.gestion_tournoi.service.GroupeService;
import com.touroi.gestion_tournoi.service.TournoiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/tournois/{tournoiId}/groupes")
public class GroupeController {

    @Autowired
    private GroupeService groupeService;

    @Autowired
    private TournoiService tournoiService;

    // Lista groupe amin'ny tournoi
    @GetMapping
    public String index(@PathVariable Long tournoiId, Model model) {
        model.addAttribute("tournoi", tournoiService.findById(tournoiId));
        model.addAttribute("groupes", groupeService.findByTournoi(tournoiId));
        return "groupe/index";
    }

    // Mamorona groupe — nom automatique
    @PostMapping
    public String save(@PathVariable Long tournoiId) {
        groupeService.save(tournoiId);
        return "redirect:/tournois/" + tournoiId + "/groupes";
    }

    // Mamafa groupe
    @GetMapping("/{id}/delete")
    public String delete(@PathVariable Long tournoiId,
                         @PathVariable Long id) {
        groupeService.delete(id);
        return "redirect:/tournois/" + tournoiId + "/groupes";
    }
}
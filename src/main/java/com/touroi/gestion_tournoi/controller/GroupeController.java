package com.touroi.gestion_tournoi.controller;

import com.touroi.gestion_tournoi.service.GroupeService;
import com.touroi.gestion_tournoi.service.TournoiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/tournois/{tournoiId}/groupes")
public class GroupeController {

    @Autowired
    private GroupeService groupeService;

    @Autowired
    private TournoiService tournoiService;

    @GetMapping
    public String index(@PathVariable Long tournoiId, Model model) {
        model.addAttribute("tournoi", tournoiService.findById(tournoiId));
        model.addAttribute("groupes", groupeService.findByTournoi(tournoiId));
        return "groupe/index";
    }

    // ✅ Mampiseho message raha feno ny groupe
    @PostMapping
    public String save(@PathVariable Long tournoiId,
                       RedirectAttributes redirectAttributes) {
        try {
            groupeService.save(tournoiId);
        } catch (RuntimeException e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/tournois/" + tournoiId + "/groupes";
    }

    @GetMapping("/{id}/delete")
    public String delete(@PathVariable Long tournoiId,
                         @PathVariable Long id) {
        groupeService.delete(id);
        return "redirect:/tournois/" + tournoiId + "/groupes";
    }
}
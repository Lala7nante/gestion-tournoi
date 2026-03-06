package com.touroi.gestion_tournoi.controller;

import com.touroi.gestion_tournoi.model.Equipe;
import com.touroi.gestion_tournoi.service.EquipeService;
import com.touroi.gestion_tournoi.service.GroupeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class EquipeController {

    @Autowired
    private EquipeService equipeService;

    @Autowired
    private GroupeService groupeService;

    // Lister toutes les équipes
    @GetMapping("/equipes")
    public String findAll(Model model) {
        model.addAttribute("equipes", equipeService.findAll());
        return "equipe/index_all";
    }

    // Formulaire nouvelle équipe
    @GetMapping("/equipes/new")
    public String newFormGlobal(Model model) {
        model.addAttribute("equipe", new Equipe());
        model.addAttribute("groupes", groupeService.findAll());
        return "equipe/form_global";
    }

    // Sauvegarder nouvelle équipe
    @PostMapping("/equipes")
    public String saveGlobal(@ModelAttribute Equipe equipe,
                             @RequestParam Long groupeId,
                             RedirectAttributes redirectAttributes) {
        try {
            equipeService.save(equipe, groupeId);
        } catch (RuntimeException e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/equipes/new";
        }
        return "redirect:/equipes";
    }

    // Formulaire modifier équipe
    @GetMapping("/equipes/{id}/edit")
    public String editFormGlobal(@PathVariable Long id, Model model) {
        model.addAttribute("equipe", equipeService.findById(id));
        model.addAttribute("groupes", groupeService.findAll());
        return "equipe/form_global";
    }

    // Modifier équipe
    @PostMapping("/equipes/{id}")
    public String updateGlobal(@PathVariable Long id,
                               @ModelAttribute Equipe equipe) {
        equipeService.update(id, equipe);
        return "redirect:/equipes";
    }

    // Supprimer équipe
    @GetMapping("/equipes/{id}/delete")
    public String deleteGlobal(@PathVariable Long id) {
        equipeService.delete(id);
        return "redirect:/equipes";
    }
}
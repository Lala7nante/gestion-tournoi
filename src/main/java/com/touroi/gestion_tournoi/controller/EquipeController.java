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

    @Autowired private EquipeService equipeService;
    @Autowired private GroupeService groupeService;

    // Lister toutes les équipes
    @GetMapping("/equipes")
    public String findAll(Model model) {
        model.addAttribute("equipes", equipeService.findAll());
        return "equipe/index_all";
    }

    // Lister les équipes d'un groupe
    @GetMapping("/groupes/{groupeId}/equipes")
    public String findByGroupe(@PathVariable Long groupeId, Model model) {
        model.addAttribute("equipes", equipeService.findByGroupe(groupeId));
        model.addAttribute("groupe", groupeService.findById(groupeId));
        return "equipe/index";
    }

    // Formulaire nouvelle équipe (depuis groupe)
    @GetMapping("/groupes/{groupeId}/equipes/new")
    public String newForm(@PathVariable Long groupeId, Model model) {
        model.addAttribute("equipe", new Equipe());
        model.addAttribute("groupe", groupeService.findById(groupeId));
        return "equipe/form";
    }

    // Sauvegarder nouvelle équipe (depuis groupe)
    @PostMapping("/groupes/{groupeId}/equipes")
    public String save(@PathVariable Long groupeId,
                       @ModelAttribute Equipe equipe,
                       RedirectAttributes redirectAttributes) {
        try {
            equipeService.save(equipe, groupeId);
        } catch (RuntimeException e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/groupes/" + groupeId + "/equipes/new";
        }
        return "redirect:/groupes/" + groupeId + "/equipes";
    }

    // Formulaire modifier équipe (depuis groupe)
    @GetMapping("/groupes/{groupeId}/equipes/{id}/edit")
    public String editForm(@PathVariable Long groupeId,
                           @PathVariable Long id, Model model) {
        model.addAttribute("equipe", equipeService.findById(id));
        model.addAttribute("groupe", groupeService.findById(groupeId));
        return "equipe/form";
    }

    // Modifier équipe (depuis groupe)
    @PostMapping("/groupes/{groupeId}/equipes/{id}")
    public String update(@PathVariable Long groupeId,
                         @PathVariable Long id,
                         @ModelAttribute Equipe equipe) {
        equipeService.update(id, equipe);
        return "redirect:/groupes/" + groupeId + "/equipes";
    }

    // Supprimer équipe (depuis groupe)
    @GetMapping("/groupes/{groupeId}/equipes/{id}/delete")
    public String delete(@PathVariable Long groupeId,
                         @PathVariable Long id,
                         RedirectAttributes redirectAttributes) {
        try {
            equipeService.delete(id);
        } catch (RuntimeException e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/groupes/" + groupeId + "/equipes";
    }

    // Formulaire nouvelle équipe (global)
    @GetMapping("/equipes/new")
    public String newFormGlobal(Model model) {
        model.addAttribute("equipe", new Equipe());
        model.addAttribute("groupes", groupeService.findAll());
        return "equipe/form_global";
    }

    // Sauvegarder nouvelle équipe (global)
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

    // Formulaire modifier équipe (global)
    @GetMapping("/equipes/{id}/edit")
    public String editFormGlobal(@PathVariable Long id, Model model) {
        model.addAttribute("equipe", equipeService.findById(id));
        model.addAttribute("groupes", groupeService.findAll());
        return "equipe/form_global";
    }

    // Modifier équipe (global)
    @PostMapping("/equipes/{id}")
    public String updateGlobal(@PathVariable Long id,
                               @ModelAttribute Equipe equipe) {
        equipeService.update(id, equipe);
        return "redirect:/equipes";
    }

    // Supprimer équipe (global)
    @GetMapping("/equipes/{id}/delete")
    public String deleteGlobal(@PathVariable Long id,
                               RedirectAttributes redirectAttributes) {
        try {
            equipeService.delete(id);
        } catch (RuntimeException e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/equipes";
    }
}
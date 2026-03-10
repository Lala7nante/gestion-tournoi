package com.touroi.gestion_tournoi.controller;

import com.touroi.gestion_tournoi.model.Tournoi;
import com.touroi.gestion_tournoi.service.TournoiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/tournois")
public class TournoiController {

    @Autowired
    private TournoiService tournoiService;

    // Lista tournoi rehetra
    @GetMapping
    public String index(Model model) {
        model.addAttribute("tournois", tournoiService.findAll());
        return "tournoi/index";
    }

    // Formulaire mamorona tournoi
    @GetMapping("/new")
    public String newForm(Model model) {
        model.addAttribute("tournoi", new Tournoi());
        return "tournoi/form";
    }

    // Mamorona tournoi
    @PostMapping
    public String save(@ModelAttribute Tournoi tournoi) {
        tournoiService.save(tournoi);
        return "redirect:/tournois";
    }

    // Formulaire manova tournoi
    @GetMapping("/{id}/edit")
    public String editForm(@PathVariable Long id, Model model) {
        model.addAttribute("tournoi", tournoiService.findById(id));
        return "tournoi/form";
    }

    // Manova tournoi
    @PostMapping("/{id}")
    public String update(@PathVariable Long id,
                         @ModelAttribute Tournoi tournoi) {
        tournoiService.update(id, tournoi);
        return "redirect:/tournois";
    }

    // Mamafa tournoi
    @GetMapping("/{id}/delete")
    public String delete(@PathVariable Long id,
                     RedirectAttributes redirectAttributes) {
        try {
            tournoiService.delete(id);
        } catch (RuntimeException e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/tournois";
        }

    // Détails tournoi
    @GetMapping("/{id}")
    public String detail(@PathVariable Long id, Model model) {
        model.addAttribute("tournoi", tournoiService.findById(id));
        return "tournoi/detail";
    }
}

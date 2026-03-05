package com.touroi.gestion_tournoi.controller;

import com.touroi.gestion_tournoi.model.MatchFootball;
import com.touroi.gestion_tournoi.service.EquipeService;
import com.touroi.gestion_tournoi.service.MatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class MatchController {

    @Autowired
    private MatchService matchService;

    @Autowired
    private EquipeService equipeService;

    // Lista match rehetra
    @GetMapping("/matchs")
    public String findAll(Model model) {
        model.addAttribute("matchs", matchService.findAll());
        return "match/index";
    }

    // Formulaire mamorona match
    @GetMapping("/matchs/new")
    public String newForm(Model model) {
        model.addAttribute("match", new MatchFootball());
        model.addAttribute("equipes", equipeService.findAll());
        model.addAttribute("phases", MatchFootball.Phase.values());
        return "match/form";
    }

    // Mamorona match
    @PostMapping("/matchs")
    public String save(@ModelAttribute MatchFootball match,
                       @RequestParam Long domId,
                       @RequestParam Long extId) {
        matchService.save(match, domId, extId);
        return "redirect:/matchs";
    }

    // Formulaire asiana score
    @GetMapping("/matchs/{id}/score")
    public String scoreForm(@PathVariable Long id, Model model) {
        model.addAttribute("match", matchService.findById(id));
        return "match/score";
    }

    // Asiana score
    @PostMapping("/matchs/{id}/score")
    public String enregistrerScore(
            @PathVariable Long id,
            @RequestParam int scoreDom,
            @RequestParam int scoreExt,
            @RequestParam(defaultValue = "false") boolean prolongation,
            @RequestParam(defaultValue = "0") int scoreProlDom,
            @RequestParam(defaultValue = "0") int scoreProlExt,
            @RequestParam(defaultValue = "false") boolean penalty,
            @RequestParam(defaultValue = "0") int scorePenDom,
            @RequestParam(defaultValue = "0") int scorePenExt) {
        matchService.enregistrerScore(id,
                scoreDom, scoreExt,
                prolongation, scoreProlDom, scoreProlExt,
                penalty, scorePenDom, scorePenExt);
        return "redirect:/matchs";
    }

    // Mamafa match
    @GetMapping("/matchs/{id}/delete")
    public String delete(@PathVariable Long id) {
        matchService.delete(id);
        return "redirect:/matchs";
    }
}
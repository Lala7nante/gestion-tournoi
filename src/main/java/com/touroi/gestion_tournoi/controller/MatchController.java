package com.touroi.gestion_tournoi.controller;

import com.touroi.gestion_tournoi.model.MatchFootball;
import com.touroi.gestion_tournoi.service.EquipeService;
import com.touroi.gestion_tournoi.service.MatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class MatchController {

    @Autowired
    private MatchService matchService;

    @Autowired
    private EquipeService equipeService;

    // Lister tous les matchs
    @GetMapping("/matchs")
    public String findAll(Model model) {
        model.addAttribute("matchs", matchService.findAll());
        return "match/index";
    }

    // Formulaire nouveau match
    @GetMapping("/matchs/new")
    public String newForm(Model model) {
        model.addAttribute("match", new MatchFootball());
        model.addAttribute("equipes", equipeService.findAll());
        model.addAttribute("phases", MatchFootball.Phase.values());
        return "match/form";
    }

    // Créer match
    @PostMapping("/matchs")
    public String save(@ModelAttribute MatchFootball match,
                       @RequestParam Long domId,
                       @RequestParam Long extId,
                       RedirectAttributes redirectAttributes) {
        try {
            matchService.save(match, domId, extId);
        } catch (RuntimeException e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/matchs/new";
        }
        return "redirect:/matchs";
    }

    // Formulaire score
    @GetMapping("/matchs/{id}/score")
    public String scoreForm(@PathVariable Long id, Model model) {
        model.addAttribute("match", matchService.findById(id));
        return "match/score";
    }

    // Enregistrer score + stats
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
            @RequestParam(defaultValue = "0") int scorePenExt,
            // ✅ Stats Domicile
            @RequestParam(defaultValue = "0") int tirsDomicile,
            @RequestParam(defaultValue = "0") int tirsCadresDomicile,
            @RequestParam(defaultValue = "50") int possessionDomicile,
            @RequestParam(defaultValue = "0") int passesDomicile,
            @RequestParam(defaultValue = "0") int fautesDomicile,
            @RequestParam(defaultValue = "0") int cartonsJaunesDomicile,
            @RequestParam(defaultValue = "0") int cartonsRougesDomicile,
            @RequestParam(defaultValue = "0") int cornersDomicile,
            @RequestParam(defaultValue = "0") int horsJeuDomicile,
            // ✅ Stats Extérieur
            @RequestParam(defaultValue = "0") int tirsExterieur,
            @RequestParam(defaultValue = "0") int tirsCadresExterieur,
            @RequestParam(defaultValue = "50") int possessionExterieur,
            @RequestParam(defaultValue = "0") int passesExterieur,
            @RequestParam(defaultValue = "0") int fautesExterieur,
            @RequestParam(defaultValue = "0") int cartonsJaunesExterieur,
            @RequestParam(defaultValue = "0") int cartonsRougesExterieur,
            @RequestParam(defaultValue = "0") int cornersExterieur,
            @RequestParam(defaultValue = "0") int horsJeuExterieur) {

        matchService.enregistrerScore(id,
                scoreDom, scoreExt,
                prolongation, scoreProlDom, scoreProlExt,
                penalty, scorePenDom, scorePenExt,
                tirsDomicile, tirsCadresDomicile,
                possessionDomicile, passesDomicile,
                fautesDomicile, cartonsJaunesDomicile,
                cartonsRougesDomicile, cornersDomicile,
                horsJeuDomicile,
                tirsExterieur, tirsCadresExterieur,
                possessionExterieur, passesExterieur,
                fautesExterieur, cartonsJaunesExterieur,
                cartonsRougesExterieur, cornersExterieur,
                horsJeuExterieur);

        return "redirect:/matchs";
    }

    // Supprimer match
    @GetMapping("/matchs/{id}/delete")
    public String delete(@PathVariable Long id,
                         RedirectAttributes redirectAttributes) {
        try {
            matchService.delete(id);
        } catch (RuntimeException e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/matchs";
    }
    @PostMapping("/matchs/{id}/stats")
public String updateStats(
        @PathVariable Long id,
        @RequestParam int tirsDomicile,
        @RequestParam int tirsCadresDomicile,
        @RequestParam int possessionDomicile,
        @RequestParam int passesDomicile,
        @RequestParam int fautesDomicile,
        @RequestParam int cartonsJaunesDomicile,
        @RequestParam int cartonsRougesDomicile,
        @RequestParam int cornersDomicile,
        @RequestParam int horsJeuDomicile,
        @RequestParam int tirsExterieur,
        @RequestParam int tirsCadresExterieur,
        @RequestParam int possessionExterieur,
        @RequestParam int passesExterieur,
        @RequestParam int fautesExterieur,
        @RequestParam int cartonsJaunesExterieur,
        @RequestParam int cartonsRougesExterieur,
        @RequestParam int cornersExterieur,
        @RequestParam int horsJeuExterieur) {

    matchService.updateStats(id,
            tirsDomicile, tirsCadresDomicile, possessionDomicile,
            passesDomicile, fautesDomicile, cartonsJaunesDomicile,
            cartonsRougesDomicile, cornersDomicile, horsJeuDomicile,
            tirsExterieur, tirsCadresExterieur, possessionExterieur,
            passesExterieur, fautesExterieur, cartonsJaunesExterieur,
            cartonsRougesExterieur, cornersExterieur, horsJeuExterieur);

    return "redirect:/statistiques/match/" + id;
}
}
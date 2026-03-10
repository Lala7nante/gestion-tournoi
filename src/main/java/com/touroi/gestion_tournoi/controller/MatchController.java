package com.touroi.gestion_tournoi.controller;

import com.touroi.gestion_tournoi.model.MatchFootball;
import com.touroi.gestion_tournoi.service.EquipeService;
import com.touroi.gestion_tournoi.service.MatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;

@Controller
public class MatchController {

    @Autowired
    private MatchService matchService;

    @Autowired
    private EquipeService equipeService;

    @GetMapping("/matchs")
    public String findAll(Model model) {
        model.addAttribute("matchs", matchService.findAll());
        return "match/index";
    }

    @GetMapping("/matchs/new")
    public String newForm(Model model) {
        model.addAttribute("match", new MatchFootball());
        model.addAttribute("equipes", equipeService.findAll());
        model.addAttribute("phases", MatchFootball.Phase.values());
        return "match/form";
    }

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

    @GetMapping("/matchs/{id}/score")
    public String scoreForm(@PathVariable Long id, Model model) {
        model.addAttribute("match", matchService.findById(id));
        return "match/score";
    }

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
            @RequestParam(defaultValue = "0") int tirsDomicile,
            @RequestParam(defaultValue = "0") int tirsCadresDomicile,
            @RequestParam(defaultValue = "50") int possessionDomicile,
            @RequestParam(defaultValue = "0") int passesDomicile,
            @RequestParam(defaultValue = "0") int fautesDomicile,
            @RequestParam(defaultValue = "0") int cartonsJaunesDomicile,
            @RequestParam(defaultValue = "0") int cartonsRougesDomicile,
            @RequestParam(defaultValue = "0") int cornersDomicile,
            @RequestParam(defaultValue = "0") int horsJeuDomicile,
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

    @GetMapping("/matchs/tirage")
    public String tirageForm(Model model) {
        List<MatchFootball> quart    = matchService.findByPhase(MatchFootball.Phase.QUART);
        List<MatchFootball> round16  = matchService.findByPhase(MatchFootball.Phase.ROUND_16);
        List<MatchFootball> demi     = matchService.findByPhase(MatchFootball.Phase.DEMI);
        List<MatchFootball> finale   = matchService.findByPhase(MatchFootball.Phase.FINALE);
        List<MatchFootball> troisieme = matchService.findByPhase(MatchFootball.Phase.TROISIEME);

        // Tirage voalohany efa nisy ve?
        boolean tirageDejaFait = !quart.isEmpty() || !round16.isEmpty();

        // Phase ankehitriny miseho
        List<MatchFootball> matchsAnkehitriny;
        if (!demi.isEmpty())          matchsAnkehitriny = demi;
        else if (!quart.isEmpty())    matchsAnkehitriny = quart;
        else if (!round16.isEmpty())  matchsAnkehitriny = round16;
        else                          matchsAnkehitriny = new ArrayList<>();

        // Mampiseho bouton "phase suivante" ve?
        boolean tousFinis = !matchsAnkehitriny.isEmpty() && matchsAnkehitriny.stream()
                .allMatch(m -> m.getStatut() == MatchFootball.Statut.TERMINE);
        boolean finaleExiste = !finale.isEmpty();

        model.addAttribute("tirageDejaFait", tirageDejaFait);
        model.addAttribute("matchsAnkehitriny", matchsAnkehitriny);
        model.addAttribute("matchsDemi", demi);
        model.addAttribute("matchsFinale", finale);
        model.addAttribute("matchsTroisieme", troisieme);
        model.addAttribute("peutGenererSuivante", tousFinis && !finaleExiste);
        return "match/tirage";
    }

    @PostMapping("/matchs/tirage")
    public String lancerTirage(
            @RequestParam(required = false) LocalDate dateMatch,
            @RequestParam(required = false) String lieu,
            RedirectAttributes redirectAttributes) {
        try {
            List<MatchFootball> matchsGeneres = matchService.genererTirage(dateMatch, lieu);
            redirectAttributes.addFlashAttribute("successMessage",
                "✅ Tirage effectué ! " + matchsGeneres.size() + " matchs générés.");
        } catch (RuntimeException e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/matchs/tirage";
    }

    // ✅ VAOVAO : Générer phase suivante
    @PostMapping("/matchs/phase-suivante")
    public String genererPhaseSuivante(
            @RequestParam(required = false) LocalDate dateMatch,
            @RequestParam(required = false) String lieu,
            RedirectAttributes redirectAttributes) {
        try {
            List<MatchFootball> matchsGeneres = matchService.genererPhaseManaraka(dateMatch, lieu);
            redirectAttributes.addFlashAttribute("successMessage",
                "Phase suivante générée ! " + matchsGeneres.size() + " matchs créés.");
        } catch (RuntimeException e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/matchs/tirage";
    }
}
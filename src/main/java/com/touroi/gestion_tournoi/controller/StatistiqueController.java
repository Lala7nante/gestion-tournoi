package com.touroi.gestion_tournoi.controller;

import com.touroi.gestion_tournoi.model.Statistique;
import com.touroi.gestion_tournoi.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/statistiques")
public class StatistiqueController {

    @Autowired private StatistiqueService statistiqueService;
    @Autowired private TournoiService tournoiService;

    // Statistiques d'un tournoi (coupe) par ID
    @GetMapping("/tournoi/{tournoiId}")
    public Map<String, Object> byTournoi(@PathVariable Long tournoiId) {
        Map<String, Object> data = new HashMap<>();
        data.put("tournoi",       tournoiService.findById(tournoiId));
        data.put("topButeurs",    statistiqueService.getTopButeurs(tournoiId));
        data.put("topPasseurs",   statistiqueService.getTopPasseurs(tournoiId));
        data.put("hommesDuMatch", statistiqueService.getHommesDuMatch(tournoiId));
        data.put("meilleurClub",  statistiqueService.getMeilleurClub(tournoiId));
        data.put("joueurs",       statistiqueService.findJoueursAvecStats());
        return data;
    }

    // Statistiques d'une ligue par ID (sans groupe, query directe via match.tournoi)
    @GetMapping("/ligue/{ligueId}")
    public Map<String, Object> byLigue(@PathVariable Long ligueId) {
        Map<String, Object> data = new HashMap<>();
        data.put("topButeurs",  statistiqueService.getTopButeursLigue(ligueId));
        data.put("topPasseurs", statistiqueService.getTopPasseursLigue(ligueId));
        return data;
    }

    // Statistiques d'un joueur par ID
    @GetMapping("/joueur/{joueurId}")
    public ResponseEntity<?> byJoueur(@PathVariable Long joueurId) {
        return ResponseEntity.ok(statistiqueService.findByJoueur(joueurId));
    }

    // Statistiques d'un match par ID
    @GetMapping("/match/{matchId}")
    public ResponseEntity<?> byMatch(@PathVariable Long matchId) {
        return ResponseEntity.ok(statistiqueService.findByMatch(matchId));
    }

    // Enregistrer une nouvelle statistique
    @PostMapping
    public ResponseEntity<?> save(@RequestBody Statistique stat,
                                   @RequestParam Long joueurId,
                                   @RequestParam Long matchId) {
        try {
            return ResponseEntity.ok(statistiqueService.save(stat, joueurId, matchId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Supprimer une statistique par ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        statistiqueService.delete(id);
        return ResponseEntity.ok("Statistique supprimée");
    }
}
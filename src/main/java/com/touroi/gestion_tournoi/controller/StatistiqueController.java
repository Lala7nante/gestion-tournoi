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

    // GET /api/statistiques/tournoi/{tournoiId}
    @GetMapping("/tournoi/{tournoiId}")
    public Map<String, Object> byTournoi(@PathVariable Long tournoiId) {
        Map<String, Object> data = new HashMap<>();
        data.put("tournoi",       tournoiService.findById(tournoiId));
        data.put("topButeurs",    statistiqueService.getTopButeurs(tournoiId));
        data.put("topPasseurs",   statistiqueService.getTopPasseurs(tournoiId));
        data.put("topCartons",    statistiqueService.getTopCartons(tournoiId));
        data.put("hommesDuMatch", statistiqueService.getHommesDuMatch(tournoiId));
        data.put("meilleurClub",  statistiqueService.getMeilleurClub(tournoiId));
        data.put("joueurs",       statistiqueService.findJoueursAvecStats());
        return data;
    }

    // GET /api/statistiques/joueur/{joueurId}
    @GetMapping("/joueur/{joueurId}")
    public ResponseEntity<?> byJoueur(@PathVariable Long joueurId) {
        return ResponseEntity.ok(statistiqueService.findByJoueur(joueurId));
    }

    // GET /api/statistiques/match/{matchId}
    @GetMapping("/match/{matchId}")
    public ResponseEntity<?> byMatch(@PathVariable Long matchId) {
        return ResponseEntity.ok(statistiqueService.findByMatch(matchId));
    }

    // POST /api/statistiques
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

    // DELETE /api/statistiques/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        statistiqueService.delete(id);
        return ResponseEntity.ok("Statistique supprimée");
    }
}
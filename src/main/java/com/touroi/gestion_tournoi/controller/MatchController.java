package com.touroi.gestion_tournoi.controller;

import com.touroi.gestion_tournoi.model.MatchFootball;
import com.touroi.gestion_tournoi.service.MatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/matchs")
public class MatchController {

    @Autowired private MatchService matchService;


    // GET /api/matchs
    @GetMapping
    public List<MatchFootball> findAll() {
        return matchService.findAll();
    }

    // POST /api/matchs
    @PostMapping
    public ResponseEntity<?> save(@RequestBody Map<String, Object> body) {
        try {
            MatchFootball match = new MatchFootball();
            Long domId = Long.valueOf(body.get("domId").toString());
            Long extId = Long.valueOf(body.get("extId").toString());
            return ResponseEntity.ok(matchService.save(match, domId, extId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /api/matchs/{id}/score
    @PutMapping("/{id}/score")
    public ResponseEntity<?> enregistrerScore(@PathVariable Long id,
                                               @RequestBody Map<String, Object> body) {
        matchService.enregistrerScore(id,
            toInt(body, "scoreDom"),         toInt(body, "scoreExt"),
            toBool(body, "prolongation"),    toInt(body, "scoreProlDom"),
            toInt(body, "scoreProlExt"),     toBool(body, "penalty"),
            toInt(body, "scorePenDom"),      toInt(body, "scorePenExt"),
            toInt(body, "tirsDomicile"),     toInt(body, "tirsCadresDomicile"),
            toInt(body, "possessionDomicile"), toInt(body, "passesDomicile"),
            toInt(body, "fautesDomicile"),   toInt(body, "cartonsJaunesDomicile"),
            toInt(body, "cartonsRougesDomicile"), toInt(body, "cornersDomicile"),
            toInt(body, "horsJeuDomicile"),  toInt(body, "tirsExterieur"),
            toInt(body, "tirsCadresExterieur"), toInt(body, "possessionExterieur"),
            toInt(body, "passesExterieur"),  toInt(body, "fautesExterieur"),
            toInt(body, "cartonsJaunesExterieur"), toInt(body, "cartonsRougesExterieur"),
            toInt(body, "cornersExterieur"), toInt(body, "horsJeuExterieur"));
        return ResponseEntity.ok("Score enregistré");
    }

    // DELETE /api/matchs/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            matchService.delete(id);
            return ResponseEntity.ok("Match supprimé");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/matchs/tirage
    @GetMapping("/tirage")
    public Map<String, Object> tirage() {
        Map<String, Object> data = new HashMap<>();
        List<MatchFootball> quart     = matchService.findByPhase(MatchFootball.Phase.QUART);
        List<MatchFootball> round16   = matchService.findByPhase(MatchFootball.Phase.ROUND_16);
        List<MatchFootball> demi      = matchService.findByPhase(MatchFootball.Phase.DEMI);
        List<MatchFootball> finale    = matchService.findByPhase(MatchFootball.Phase.FINALE);
        List<MatchFootball> troisieme = matchService.findByPhase(MatchFootball.Phase.TROISIEME);

        data.put("tirageDejaFait", !quart.isEmpty() || !round16.isEmpty());
        data.put("matchsDemi",      demi);
        data.put("matchsFinale",    finale);
        data.put("matchsTroisieme", troisieme);
        data.put("peutGenererSuivante",
            !demi.isEmpty() && demi.stream().allMatch(m -> m.getStatut() == MatchFootball.Statut.TERMINE)
            && finale.isEmpty());
        return data;
    }

    // POST /api/matchs/tirage
    @PostMapping("/tirage")
    public ResponseEntity<?> lancerTirage(@RequestBody(required = false) Map<String, Object> body) {
        try {
            LocalDate date = body != null && body.get("dateMatch") != null
                ? LocalDate.parse(body.get("dateMatch").toString()) : null;
            String lieu = body != null ? (String) body.get("lieu") : null;
            List<MatchFootball> matchs = matchService.genererTirage(date, lieu);
            return ResponseEntity.ok(matchs.size() + " matchs générés");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // POST /api/matchs/phase-suivante
    @PostMapping("/phase-suivante")
    public ResponseEntity<?> genererPhaseSuivante(
            @RequestBody(required = false) Map<String, Object> body) {
        try {
            LocalDate date = body != null && body.get("dateMatch") != null
                ? LocalDate.parse(body.get("dateMatch").toString()) : null;
            String lieu = body != null ? (String) body.get("lieu") : null;
            List<MatchFootball> matchs = matchService.genererPhaseManaraka(date, lieu);
            return ResponseEntity.ok(matchs.size() + " matchs créés");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Helper methods
    private int toInt(Map<String, Object> m, String k) {
        return m.containsKey(k) ? Integer.parseInt(m.get(k).toString()) : 0;
    }
    private boolean toBool(Map<String, Object> m, String k) {
        return m.containsKey(k) && Boolean.parseBoolean(m.get(k).toString());
    }
}
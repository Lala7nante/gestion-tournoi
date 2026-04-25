package com.touroi.gestion_tournoi.controller;

import com.touroi.gestion_tournoi.service.GroupeService;
import com.touroi.gestion_tournoi.service.ClassementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class GroupeController {

    @Autowired
    private GroupeService groupeService;

    @Autowired
    private ClassementService classementService;

    // GET /api/groupes
    @GetMapping("/api/groupes")
    public ResponseEntity<?> findAll() {
        return ResponseEntity.ok(groupeService.findAll());
    }

    // GET /api/tournois/{tournoiId}/groupes
    @GetMapping("/api/tournois/{tournoiId}/groupes")
    public ResponseEntity<?> index(@PathVariable Long tournoiId) {
        return ResponseEntity.ok(groupeService.findByTournoi(tournoiId));
    }

    // POST /api/tournois/{tournoiId}/groupes
    @PostMapping("/api/tournois/{tournoiId}/groupes")
    public ResponseEntity<?> save(@PathVariable Long tournoiId) {
        try {
            return ResponseEntity.ok(groupeService.save(tournoiId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/tournois/{tournoiId}/groupes/{id}
    @DeleteMapping("/api/tournois/{tournoiId}/groupes/{id}")
    public ResponseEntity<?> delete(@PathVariable Long tournoiId,
                                    @PathVariable Long id) {
        groupeService.delete(id);
        return ResponseEntity.ok("Groupe supprimé");
    }

    // 🔥 RESET CLASSEMENT PAR GROUPE (IMPORTANT)
    @PutMapping("/api/groupes/{groupeId}/reset-classement")
    public ResponseEntity<?> resetClassement(@PathVariable Long groupeId) {
        try {
            classementService.resetAllByGroupe(groupeId);
            return ResponseEntity.ok("Classement réinitialisé avec succès");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
package com.touroi.gestion_tournoi.controller;

import com.touroi.gestion_tournoi.service.GroupeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tournois/{tournoiId}/groupes")
public class GroupeController {

    @Autowired private GroupeService groupeService;


    // GET /api/tournois/{tournoiId}/groupes
    @GetMapping
    public ResponseEntity<?> index(@PathVariable Long tournoiId) {
        return ResponseEntity.ok(groupeService.findByTournoi(tournoiId));
    }

    // POST /api/tournois/{tournoiId}/groupes
    @PostMapping
    public ResponseEntity<?> save(@PathVariable Long tournoiId) {
        try {
            return ResponseEntity.ok(groupeService.save(tournoiId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/tournois/{tournoiId}/groupes/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long tournoiId,
                                     @PathVariable Long id) {
        groupeService.delete(id);
        return ResponseEntity.ok("Groupe supprimé");
    }
}
package com.touroi.gestion_tournoi.controller;

import com.touroi.gestion_tournoi.model.Equipe;
import com.touroi.gestion_tournoi.service.EquipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class EquipeController {

    @Autowired private EquipeService equipeService;
    // GET /api/equipes
    @GetMapping("/equipes")
    public List<Equipe> findAll() {
        return equipeService.findAll();
    }

    // GET /api/groupes/{groupeId}/equipes
    @GetMapping("/groupes/{groupeId}/equipes")
    public List<Equipe> findByGroupe(@PathVariable Long groupeId) {
        return equipeService.findByGroupe(groupeId);
    }

    // POST /api/groupes/{groupeId}/equipes
    @PostMapping("/groupes/{groupeId}/equipes")
    public ResponseEntity<?> save(@PathVariable Long groupeId,
                                   @RequestBody Equipe equipe) {
        try {
            return ResponseEntity.ok(equipeService.save(equipe, groupeId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /api/equipes/{id}
    @PutMapping("/equipes/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                     @RequestBody Equipe equipe) {
        try {
            return ResponseEntity.ok(equipeService.update(id, equipe));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/equipes/{id}
    @DeleteMapping("/equipes/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            equipeService.delete(id);
            return ResponseEntity.ok("Equipe supprimée");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/equipes/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id) {
       try {
         return ResponseEntity.ok(equipeService.findById(id));
       } catch (RuntimeException e) {
         return ResponseEntity.badRequest().body(e.getMessage());
       }
    }
}
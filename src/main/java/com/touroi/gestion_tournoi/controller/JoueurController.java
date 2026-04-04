package com.touroi.gestion_tournoi.controller;

import com.touroi.gestion_tournoi.model.Joueur;
import com.touroi.gestion_tournoi.service.JoueurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/equipes/{equipeId}/joueurs")
public class JoueurController {

    @Autowired private JoueurService joueurService;

    // GET /api/equipes/{equipeId}/joueurs
    @GetMapping
    public List<Joueur> index(@PathVariable Long equipeId) {
        return joueurService.findByEquipe(equipeId);
    }

    // POST /api/equipes/{equipeId}/joueurs
    @PostMapping
    public ResponseEntity<?> save(@PathVariable Long equipeId,
                                   @RequestBody Joueur joueur) {
        return ResponseEntity.ok(joueurService.save(joueur, equipeId));
    }

    // PUT /api/equipes/{equipeId}/joueurs/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long equipeId,
                                     @PathVariable Long id,
                                     @RequestBody Joueur joueur) {
        return ResponseEntity.ok(joueurService.update(id, joueur));
    }

    // DELETE /api/equipes/{equipeId}/joueurs/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long equipeId,
                                     @PathVariable Long id) {
        joueurService.delete(id);
        return ResponseEntity.ok("Joueur supprimé");
    }
}
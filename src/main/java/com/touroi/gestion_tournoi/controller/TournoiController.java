package com.touroi.gestion_tournoi.controller;
import com.touroi.gestion_tournoi.model.Tournoi;
import com.touroi.gestion_tournoi.service.TournoiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/tournois")
public class TournoiController {
    @Autowired
    private TournoiService tournoiService;
    // Liste de tous les tournois
    @GetMapping
    public List<Tournoi> index() {
        return tournoiService.findAll();
    }
    // Détails d'un tournoi
    @GetMapping("/{id}")
    public ResponseEntity<?> detail(@PathVariable Long id) {
        return ResponseEntity.ok(tournoiService.findById(id));
    }
    // Ajouter un tournoi
    @PostMapping
    public ResponseEntity<?> save(@RequestBody Tournoi tournoi) {
        Tournoi savedTournoi = tournoiService.save(tournoi);
        return ResponseEntity.ok(savedTournoi);
    }
    // Modifier un tournoi
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Tournoi tournoi) {
        Tournoi updated = tournoiService.update(id, tournoi);
        return ResponseEntity.ok(updated);
    }
    // Supprimer un tournoi
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            tournoiService.delete(id);
            return ResponseEntity.ok("Tournoi supprimé");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
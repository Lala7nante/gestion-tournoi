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

    @Autowired private TournoiService tournoiService;

    // GET /api/tournois
    @GetMapping
    public List<Tournoi> index() {
        return tournoiService.findAll();
    }

    // GET /api/tournois/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> detail(@PathVariable Long id) {
        return ResponseEntity.ok(tournoiService.findById(id));
    }

    // POST /api/tournois
    @PostMapping
    public ResponseEntity<?> save(@RequestBody Tournoi tournoi) {
        return ResponseEntity.ok(tournoiService.save(tournoi));
    }

    // PUT /api/tournois/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                     @RequestBody Tournoi tournoi) {
        return ResponseEntity.ok(tournoiService.update(id, tournoi));
    }

    // DELETE /api/tournois/{id}
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
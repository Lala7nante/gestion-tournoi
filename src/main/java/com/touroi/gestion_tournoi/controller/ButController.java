package com.touroi.gestion_tournoi.controller;

import com.touroi.gestion_tournoi.model.But;
import com.touroi.gestion_tournoi.service.ButService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class ButController {

    @Autowired private ButService butService;

    // GET /api/matchs/{id}/buts
    @GetMapping("/api/matchs/{id}/buts")
    public ResponseEntity<List<But>> findByMatch(@PathVariable Long id) {
        return ResponseEntity.ok(butService.findByMatch(id));
    }

    // POST /api/matchs/{id}/buts
    @PostMapping(
        value = "/api/matchs/{id}/buts",
        consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.ALL_VALUE}
    )
    public ResponseEntity<?> save(@PathVariable Long id,
                                   @RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(butService.save(id, body));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/buts/{id}
    @DeleteMapping("/api/buts/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            butService.delete(id);
            return ResponseEntity.ok("But supprimé");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
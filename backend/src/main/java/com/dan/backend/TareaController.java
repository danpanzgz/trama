// TareaController.java
package com.dan.backend;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tareas")
public class TareaController {

    private final TareaRepository repo;

    public TareaController(TareaRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Tarea> listar() {
        return repo.findAll();
    }

    @PostMapping
    public Tarea crear(@RequestBody Tarea tarea) {
        return repo.save(tarea);
    }
}
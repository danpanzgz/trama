package com.dan.backend;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
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

    @PutMapping("/{id}")
    public Tarea actualizar(@PathVariable Long id, @RequestBody Tarea datos) {
        Tarea tarea = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        tarea.setTitulo(datos.getTitulo());
        tarea.setDescripcion(datos.getDescripcion());
        tarea.setFechaVencimiento(datos.getFechaVencimiento());
        tarea.setEstado(datos.getEstado());
        tarea.setPrioridad(datos.getPrioridad());
        return repo.save(tarea);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void borrar(@PathVariable Long id) {
        repo.deleteById(id);
    }
}
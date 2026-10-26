package com.dan.backend;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/proyectos")
public class ProyectoController {

    private final ProyectoRepository proyectos;
    private final TareaRepository tareas;

    public ProyectoController(ProyectoRepository proyectos, TareaRepository tareas) {
        this.proyectos = proyectos;
        this.tareas = tareas;
    }

    @GetMapping
    public List<Proyecto> listar() {
        return proyectos.findAll();
    }

    @PostMapping
    public Proyecto crear(@RequestBody Proyecto proyecto) {
        return proyectos.save(proyecto);
    }

    @GetMapping("/{id}")
    public Proyecto obtener(@PathVariable Long id) {
        return proyectos.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/{id}/tareas")
    public List<Tarea> listarTareas(@PathVariable Long id) {
        return tareas.findByProyectoId(id);
    }

    @PostMapping("/{id}/tareas")
    public Tarea crearTarea(@PathVariable Long id, @RequestBody Tarea tarea) {
        tarea.setProyecto(obtener(id));
        return tareas.save(tarea);
    }
}
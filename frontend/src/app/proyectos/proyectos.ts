import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Proyecto } from '../core/models/proyecto.model';
import { Tarea } from '../core/models/tarea.model';
import { ProyectoService } from '../core/services/proyecto.service';

@Component({
  imports: [RouterLink],
  selector: 'app-proyectos',
  styleUrl: './proyectos.css',
  templateUrl: './proyectos.html',
})
export class Proyectos {
  private readonly service = inject(ProyectoService);

  readonly proyectos = signal<Proyecto[]>([]);
  readonly estadisticas = signal<Record<number, { total: number; completadas: number }>>({});
  readonly busqueda = signal('');
  readonly proyectosVisibles = computed(() => {
    const termino = this.busqueda().trim().toLocaleLowerCase();
    return this.proyectos().filter((proyecto) =>
      `${proyecto.nombre} ${proyecto.clave || ''}`.toLocaleLowerCase().includes(termino),
    );
  });
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.cargar();
  }

  crear(nombre: string, formulario: HTMLFormElement): void {
    const limpio = nombre.trim();
    if (!limpio || this.guardando()) return;
    if (this.proyectos().some((proyecto) => proyecto.nombre.toLocaleLowerCase() === limpio.toLocaleLowerCase())) {
      this.error.set('Ya existe un proyecto con ese nombre.');
      return;
    }

    const clave = limpio
      .split(/\s+/)
      .map((palabra) => palabra[0])
      .join('')
      .slice(0, 4)
      .toUpperCase();

    this.error.set(null);
    this.guardando.set(true);
    this.service.crear({ nombre: limpio, clave: clave || 'PROY' }).subscribe({
      next: (proyecto) => {
        this.proyectos.update((proyectos) => [...proyectos, proyecto]);
        this.estadisticas.update((estadisticas) => ({
          ...estadisticas,
          [proyecto.id]: { total: 0, completadas: 0 },
        }));
        this.guardando.set(false);
        formulario.reset();
      },
      error: () => {
        this.error.set('No se pudo crear el proyecto. Comprueba que el servidor esté disponible e inténtalo de nuevo.');
        this.guardando.set(false);
      },
    });
  }

  private cargar(): void {
    this.service.listar().subscribe({
      next: (proyectos) => {
        this.proyectos.set(proyectos);
        if (!proyectos.length) {
          this.cargando.set(false);
          return;
        }
        this.service.listarTodasLasTareas(proyectos).subscribe({
          next: (tareasPorProyecto) => {
            const estadisticas: Record<number, { total: number; completadas: number }> = {};
            proyectos.forEach((proyecto, indice) => {
              const tareas: Tarea[] = tareasPorProyecto[indice];
              estadisticas[proyecto.id] = {
                total: tareas.length,
                completadas: tareas.filter((tarea) => tarea.estado === 'HECHA').length,
              };
            });
            this.estadisticas.set(estadisticas);
            this.cargando.set(false);
          },
          error: () => {
            this.error.set('No se pudieron cargar los resúmenes de tareas de los proyectos.');
            this.cargando.set(false);
          },
        });
      },
      error: () => {
        this.error.set('No se pudieron cargar los proyectos. Comprueba que el servidor esté disponible.');
        this.cargando.set(false);
      },
    });
  }
}

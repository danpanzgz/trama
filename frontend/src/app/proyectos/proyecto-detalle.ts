import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Estado, Tarea } from '../core/models/tarea.model';
import { Proyecto } from '../core/models/proyecto.model';
import { ProyectoService } from '../core/services/proyecto.service';
import { TareaService } from '../core/services/tarea.service';
import { etiquetaVencimiento, vencimientoAtrasado } from '../core/utils/fecha-vencimiento';
import { TareaEditor } from '../shared/tarea-editor/tarea-editor';

@Component({
  selector: 'app-proyecto-detalle',
  imports: [RouterLink, TareaEditor],
  templateUrl: './proyecto-detalle.html',
  styleUrl: './proyecto-detalle.css',
})
export class ProyectoDetalle {
  private readonly route = inject(ActivatedRoute);
  private readonly proyectosApi = inject(ProyectoService);
  private readonly tareasApi = inject(TareaService);

  readonly columnas: { estado: Estado; nombre: string }[] = [
    { estado: 'POR_HACER', nombre: 'Por hacer' },
    { estado: 'EN_CURSO', nombre: 'En curso' },
    { estado: 'HECHA', nombre: 'Completadas' },
  ];
  readonly proyecto = signal<Proyecto | null>(null);
  readonly tareas = signal<Tarea[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly editando = signal<Tarea | null>(null);
  readonly error = signal<string | null>(null);

  private proyectoId: number | null = null;

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id < 1) {
      this.error.set('El identificador del proyecto no es válido.');
      this.cargando.set(false);
      return;
    }

    this.proyectoId = id;
    this.cargar();
  }

  delEstado(estado: Estado): Tarea[] {
    return this.tareas().filter((tarea) => tarea.estado === estado);
  }

  crear(titulo: string, descripcion: string, prioridad: string, fecha: string, formulario: HTMLFormElement): void {
    const nombre = titulo.trim();
    if (!nombre || this.guardando() || this.proyectoId === null) return;
    if (!['BAJA', 'MEDIA', 'ALTA'].includes(prioridad)) {
      this.error.set('Selecciona una prioridad válida.');
      return;
    }
    if (fecha && !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      this.error.set('Introduce una fecha límite válida.');
      return;
    }

    this.error.set(null);
    this.guardando.set(true);
    this.tareasApi.crear({
      titulo: nombre,
      descripcion: descripcion.trim() || undefined,
      fechaVencimiento: fecha || undefined,
      estado: 'POR_HACER',
      prioridad: prioridad as Tarea['prioridad'],
    }, this.proyectoId).subscribe({
      next: (tarea) => {
        this.tareas.update((tareas) => [...tareas, tarea]);
        this.guardando.set(false);
        formulario.reset();
      },
      error: () => {
        this.error.set('No se pudo crear la tarea. Vuelve a intentarlo.');
        this.guardando.set(false);
      },
    });
  }

  etiquetaFecha(tarea: Tarea): string | null {
    return etiquetaVencimiento(tarea.fechaVencimiento, tarea.estado);
  }

  estaVencida(tarea: Tarea): boolean {
    return vencimientoAtrasado(tarea.fechaVencimiento, tarea.estado);
  }

  cantidadVencidas(): number {
    return this.tareas().filter((tarea) => this.estaVencida(tarea)).length;
  }

  mover(tarea: Tarea, direccion: number): void {
    const orden = this.columnas.map((columna) => columna.estado);
    const nuevoEstado = orden[orden.indexOf(tarea.estado) + direccion];
    if (!nuevoEstado || tarea.id === undefined) return;

    this.tareasApi.actualizar({ ...tarea, estado: nuevoEstado }).subscribe({
      next: (actualizada) => this.reemplazar(actualizada),
      error: () => this.error.set('No se pudo cambiar el estado de la tarea.'),
    });
  }

  borrar(tarea: Tarea): void {
    if (tarea.id === undefined || !window.confirm(`¿Eliminar "${tarea.titulo}"?`)) return;

    this.tareasApi.borrar(tarea.id).subscribe({
      next: () => this.tareas.update((tareas) => tareas.filter((actual) => actual.id !== tarea.id)),
      error: () => this.error.set('No se pudo eliminar la tarea.'),
    });
  }

  guardarEdicion(tarea: Tarea): void {
    if (tarea.id === undefined) return;

    this.tareasApi.actualizar(tarea).subscribe({
      next: (actualizada) => {
        this.reemplazar(actualizada);
        this.editando.set(null);
      },
      error: () => this.error.set('No se pudieron guardar los cambios de la tarea.'),
    });
  }

  private cargar(): void {
    const proyectoId = this.proyectoId;
    if (proyectoId === null) return;
    this.cargando.set(true);
    this.error.set(null);

    this.proyectosApi.obtener(proyectoId).subscribe({
      next: (proyecto) => {
        this.proyecto.set(proyecto);
        this.proyectosApi.listarTareas(proyectoId).subscribe({
          next: (tareas) => {
            this.tareas.set(tareas);
            this.cargando.set(false);
          },
          error: () => {
            this.error.set('No se pudieron cargar las tareas de este proyecto.');
            this.cargando.set(false);
          },
        });
      },
      error: () => {
        this.error.set('No se encontró el proyecto o el servidor no está disponible.');
        this.cargando.set(false);
      },
    });
  }

  private reemplazar(actualizada: Tarea): void {
    this.tareas.update((tareas) =>
      tareas.map((actual) => actual.id === actualizada.id ? actualizada : actual),
    );
  }
}

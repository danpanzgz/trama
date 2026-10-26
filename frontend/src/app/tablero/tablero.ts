import { Component, ElementRef, HostListener, ViewChild, computed, inject, signal } from '@angular/core';
import { Proyecto } from '../core/models/proyecto.model';
import { Estado, Prioridad, Tarea } from '../core/models/tarea.model';
import { ProyectoService } from '../core/services/proyecto.service';
import { TareaService } from '../core/services/tarea.service';
import { etiquetaVencimiento, venceHoy, vencimientoAtrasado } from '../core/utils/fecha-vencimiento';
import { TareaEditor } from '../shared/tarea-editor/tarea-editor';

const COLUMNAS: { estado: Estado; nombre: string; ayuda: string }[] = [
  { estado: 'POR_HACER', nombre: 'Por hacer', ayuda: 'Pendientes de empezar' },
  { estado: 'EN_CURSO', nombre: 'En curso', ayuda: 'Trabajo activo' },
  { estado: 'HECHA', nombre: 'Hechas', ayuda: 'Tareas finalizadas' },
];

@Component({
  imports: [TareaEditor],
  selector: 'app-tablero',
  styleUrl: './tablero.css',
  templateUrl: './tablero.html',
})
export class Tablero {
  private readonly service = inject(TareaService);
  private readonly proyectosService = inject(ProyectoService);

  @ViewChild('titulo') private tituloInput?: ElementRef<HTMLInputElement>;
  @ViewChild('buscar') private busquedaInput?: ElementRef<HTMLInputElement>;

  readonly columnas = COLUMNAS;
  readonly tareas = signal<Tarea[]>([]);
  readonly proyectos = signal<Proyecto[]>([]);
  readonly busqueda = signal('');
  readonly prioridadFiltro = signal<'TODAS' | Prioridad>('TODAS');
  readonly estadoFiltro = signal<'TODOS' | Estado>('TODOS');
  readonly fechaFiltro = signal<'TODAS' | 'HOY' | 'VENCIDAS'>('TODAS');
  readonly editando = signal<Tarea | null>(null);
  readonly arrastrando = signal<number | null>(null);
  readonly zonaDeSoltado = signal<Estado | null>(null);
  readonly anuncio = signal('');
  readonly tareasVisibles = computed(() => {
    const termino = this.busqueda().trim().toLocaleLowerCase();
    const prioridad = this.prioridadFiltro();
    const estado = this.estadoFiltro();
    const fecha = this.fechaFiltro();
    return this.tareas().filter((tarea) =>
      (!termino || `${tarea.titulo} ${tarea.descripcion || ''}`.toLocaleLowerCase().includes(termino)) &&
      (prioridad === 'TODAS' || tarea.prioridad === prioridad) &&
      (estado === 'TODOS' || tarea.estado === estado) &&
      (fecha === 'TODAS' ||
        (fecha === 'HOY' && venceHoy(tarea.fechaVencimiento)) ||
        (fecha === 'VENCIDAS' && vencimientoAtrasado(tarea.fechaVencimiento, tarea.estado))),
    ).sort((a, b) => (a.fechaVencimiento || '9999-12-31').localeCompare(b.fechaVencimiento || '9999-12-31'));
  });
  readonly vencidas = computed(() => this.tareas().filter((tarea) =>
    vencimientoAtrasado(tarea.fechaVencimiento, tarea.estado),
  ).length);
  readonly porcentajeCompletado = computed(() => this.tareas().length
    ? Math.round(this.cantidadEstado('HECHA') / this.tareas().length * 100)
    : 0);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.cargar();
    this.proyectosService.listar().subscribe({
      next: (proyectos) => this.proyectos.set(proyectos),
      error: () => this.error.set('No se pudieron cargar los proyectos para vincular tareas.'),
    });
  }

  delEstado(estado: Estado): Tarea[] {
    return this.tareasVisibles().filter((tarea) => tarea.estado === estado);
  }

  setPrioridadFiltro(valor: string): void {
    if (valor === 'TODAS' || ['BAJA', 'MEDIA', 'ALTA'].includes(valor)) {
      this.prioridadFiltro.set(valor as 'TODAS' | Prioridad);
    }
  }

  setEstadoFiltro(valor: string): void {
    if (valor === 'TODOS' || this.columnas.some((columna) => columna.estado === valor)) {
      this.estadoFiltro.set(valor as 'TODOS' | Estado);
    }
  }

  setFechaFiltro(valor: string): void {
    if (valor === 'TODAS' || valor === 'HOY' || valor === 'VENCIDAS') {
      this.fechaFiltro.set(valor);
    }
  }

  limpiarFiltros(): void {
    this.busqueda.set('');
    this.prioridadFiltro.set('TODAS');
    this.estadoFiltro.set('TODOS');
    this.fechaFiltro.set('TODAS');
  }

  @HostListener('window:keydown', ['$event'])
  manejarAtajo(evento: KeyboardEvent): void {
    const elementoActivo = document.activeElement;
    const escribiendo = elementoActivo instanceof HTMLElement &&
      (['INPUT', 'TEXTAREA', 'SELECT'].includes(elementoActivo.tagName) || elementoActivo.isContentEditable);
    const tecla = evento.key.toLocaleLowerCase();

    if (evento.key === 'Escape' && this.editando()) {
      this.editando.set(null);
      return;
    }

    if (evento.ctrlKey && evento.shiftKey && tecla === 'e') {
      evento.preventDefault();
      this.exportarCsv();
    } else if (!escribiendo && !evento.ctrlKey && !evento.altKey && !evento.metaKey && tecla === 'n') {
      evento.preventDefault();
      this.tituloInput?.nativeElement.focus();
    } else if (!escribiendo && evento.key === '/') {
      evento.preventDefault();
      this.busquedaInput?.nativeElement.focus();
    }
  }

  generarCsv(): string {
    const filas = [
      ['Título', 'Descripción', 'Estado', 'Prioridad', 'Fecha límite'],
      ...this.tareasVisibles().map((tarea) => [
        tarea.titulo,
        tarea.descripcion || '',
        this.columnas.find((columna) => columna.estado === tarea.estado)?.nombre || tarea.estado,
        tarea.prioridad,
        tarea.fechaVencimiento || '',
      ]),
    ];
    return `\uFEFF${filas.map((fila) => fila.map((valor) => this.celdaCsv(valor)).join(',')).join('\r\n')}`;
  }

  exportarCsv(): void {
    const archivo = new Blob([this.generarCsv()], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `trama-tareas-${new Date().toISOString().slice(0, 10)}.csv`;
    enlace.click();
    URL.revokeObjectURL(url);
  }

  iniciarArrastre(evento: DragEvent, tarea: Tarea): void {
    if (tarea.id === undefined) {
      evento.preventDefault();
      return;
    }
    this.arrastrando.set(tarea.id);
    evento.dataTransfer?.setData('text/plain', String(tarea.id));
    if (evento.dataTransfer) evento.dataTransfer.effectAllowed = 'move';
  }

  permitirSoltar(evento: DragEvent, estado: Estado): void {
    if (this.arrastrando() === null) return;
    evento.preventDefault();
    this.zonaDeSoltado.set(estado);
    if (evento.dataTransfer) evento.dataTransfer.dropEffect = 'move';
  }

  soltar(evento: DragEvent, estado: Estado): void {
    evento.preventDefault();
    const id = this.arrastrando();
    const tarea = this.tareas().find((actual) => actual.id === id);
    this.arrastrando.set(null);
    this.zonaDeSoltado.set(null);
    if (tarea && tarea.estado !== estado) this.cambiarEstado(tarea, estado);
  }

  finalizarArrastre(): void {
    this.arrastrando.set(null);
    this.zonaDeSoltado.set(null);
  }

  hayFiltros(): boolean {
    return Boolean(this.busqueda().trim()) ||
      this.prioridadFiltro() !== 'TODAS' ||
      this.estadoFiltro() !== 'TODOS' ||
      this.fechaFiltro() !== 'TODAS';
  }

  etiquetaFecha(tarea: Tarea): string | null {
    return etiquetaVencimiento(tarea.fechaVencimiento, tarea.estado);
  }

  estaVencida(tarea: Tarea): boolean {
    return vencimientoAtrasado(tarea.fechaVencimiento, tarea.estado);
  }

  cantidadEstado(estado: Estado): number {
    return this.tareas().filter((tarea) => tarea.estado === estado).length;
  }

  crear(
    titulo: string,
    descripcion: string,
    prioridad: string,
    proyecto: string,
    fecha: string,
    formulario: HTMLFormElement,
  ): void {
    const nombre = titulo.trim();
    if (!nombre || this.guardando()) return;
    const proyectoId = proyecto ? Number(proyecto) : undefined;
    if (proyecto && (
      proyectoId === undefined ||
      !Number.isInteger(proyectoId) ||
      proyectoId < 1
    )) {
      this.error.set('Selecciona un proyecto válido.');
      return;
    }
    if (!['BAJA', 'MEDIA', 'ALTA'].includes(prioridad)) {
      this.error.set('Selecciona una prioridad válida.');
      return;
    }

    this.error.set(null);
    const fechaIntroducida = fecha ? new Date(`${fecha}T00:00:00`) : null;
    const fechaValida = !fecha || (
      /^\d{4}-\d{2}-\d{2}$/.test(fecha) &&
      fechaIntroducida !== null &&
      !Number.isNaN(fechaIntroducida.getTime()) &&
      `${fechaIntroducida.getFullYear()}-${String(fechaIntroducida.getMonth() + 1).padStart(2, '0')}-${String(fechaIntroducida.getDate()).padStart(2, '0')}` === fecha
    );
    if (!fechaValida) {
      this.error.set('Introduce una fecha límite válida.');
      return;
    }
    this.guardando.set(true);

    this.service
      .crear({
        titulo: nombre,
        descripcion: descripcion.trim() || undefined,
        fechaVencimiento: fecha || undefined,
        estado: 'POR_HACER',
        prioridad: prioridad as Prioridad,
      }, proyectoId)
      .subscribe({
        next: (tarea) => {
          this.tareas.update((tareas) => [...tareas, tarea]);
          this.guardando.set(false);
          formulario.reset();
        },
        error: () => {
          this.error.set('No se pudo crear la tarea. Comprueba que el servidor esté disponible e inténtalo de nuevo.');
          this.guardando.set(false);
        },
      });
  }

  mover(tarea: Tarea, direccion: number): void {
    const orden = this.columnas.map((columna) => columna.estado);
    const nuevoEstado = orden[orden.indexOf(tarea.estado) + direccion];
    if (!nuevoEstado || tarea.id === undefined) return;

    this.cambiarEstado(tarea, nuevoEstado);
  }

  completar(tarea: Tarea): void {
    this.cambiarEstado(tarea, tarea.estado === 'HECHA' ? 'POR_HACER' : 'HECHA');
  }

  private cambiarEstado(tarea: Tarea, estado: Estado): void {
    if (tarea.id === undefined) return;

    this.error.set(null);
    this.service.actualizar({ ...tarea, estado }).subscribe({
      next: (actualizada) => {
        this.tareas.update((tareas) =>
          tareas.map((actual) => actual.id === actualizada.id ? actualizada : actual),
        );
        const nombreEstado = this.columnas.find((columna) => columna.estado === estado)?.nombre || estado;
        this.anuncio.set(`${actualizada.titulo} movida a ${nombreEstado}.`);
      },
      error: () => this.error.set('No se pudo mover la tarea. Vuelve a intentarlo.'),
    });
  }

  private celdaCsv(valor: string): string {
    const seguro = /^\s*[=+\-@]/.test(valor) ? `'${valor}` : valor;
    return `"${seguro.replaceAll('"', '""')}"`;
  }

  borrar(tarea: Tarea): void {
    if (tarea.id === undefined || !window.confirm(`¿Eliminar "${tarea.titulo}"?`)) return;

    this.error.set(null);
    this.service.borrar(tarea.id).subscribe({
      next: () => this.tareas.update((tareas) => tareas.filter((actual) => actual.id !== tarea.id)),
      error: () => this.error.set('No se pudo eliminar la tarea. Vuelve a intentarlo.'),
    });
  }

  guardarEdicion(tarea: Tarea): void {
    if (tarea.id === undefined) return;

    this.service.actualizar(tarea).subscribe({
      next: (actualizada) => {
        this.tareas.update((tareas) =>
          tareas.map((actual) => actual.id === actualizada.id ? actualizada : actual),
        );
        this.editando.set(null);
      },
      error: () => this.error.set('No se pudieron guardar los cambios de la tarea.'),
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.service.listar().subscribe({
      next: (tareas) => {
        this.tareas.set(tareas);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las tareas. Comprueba que el servidor esté disponible.');
        this.cargando.set(false);
      },
    });
  }
}

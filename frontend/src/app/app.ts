import { Component, inject, signal } from '@angular/core';
import { Estado, Prioridad, Tarea, TareaService } from './tarea';

const COLUMNAS: { estado: Estado; nombre: string }[] = [
  { estado: 'POR_HACER', nombre: 'Por hacer' },
  { estado: 'EN_CURSO', nombre: 'En curso' },
  { estado: 'HECHA', nombre: 'Hecha' },
];

@Component({
  selector: 'app-root',
  template: `
    <h1>Tablero</h1>

    <div class="nueva">
      <input #titulo placeholder="Nueva tarea" />
      <select #prioridad>
        <option value="BAJA">Baja</option>
        <option value="MEDIA" selected>Media</option>
        <option value="ALTA">Alta</option>
      </select>
      <button (click)="crear(titulo.value, prioridad.value); titulo.value = ''">Crear</button>
    </div>

    <div class="tablero">
      @for (col of columnas; track col.estado) {
        <section class="columna">
          <h2>{{ col.nombre }} ({{ delEstado(col.estado).length }})</h2>
          @for (t of delEstado(col.estado); track t.id) {
            <article class="tarjeta">
              <strong>{{ t.titulo }}</strong>
              <span [class]="'prio ' + t.prioridad">{{ t.prioridad }}</span>
              <div class="acciones">
                <button (click)="mover(t, -1)" [disabled]="t.estado === 'POR_HACER'">←</button>
                <button (click)="mover(t, 1)" [disabled]="t.estado === 'HECHA'">→</button>
                <button (click)="borrar(t)">🗑</button>
              </div>
            </article>
          }
        </section>
      }
    </div>
  `,
  styles: `
    .nueva { margin-bottom: 1rem; display: flex; gap: .5rem; }
    .tablero { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .columna { background: #f1f2f4; border-radius: 8px; padding: .75rem; min-height: 200px; }
    .tarjeta { background: white; border-radius: 6px; padding: .6rem; margin-bottom: .6rem;
               box-shadow: 0 1px 2px rgba(0,0,0,.2); display: flex; flex-direction: column; gap: .4rem; }
    .acciones { display: flex; gap: .3rem; }
    .prio { font-size: .7rem; padding: 2px 6px; border-radius: 4px; width: fit-content; color: white; }
    .BAJA { background: #36b37e; }
    .MEDIA { background: #ff991f; }
    .ALTA { background: #de350b; }
  `,
})
export class App {
  private service = inject(TareaService);
  columnas = COLUMNAS;
  tareas = signal<Tarea[]>([]);

  constructor() {
    this.cargar();
  }

  cargar() {
    this.service.listar().subscribe((r) => this.tareas.set(r));
  }

  delEstado(estado: Estado) {
    return this.tareas().filter((t) => t.estado === estado);
  }

  crear(titulo: string, prioridad: string) {
    if (!titulo.trim()) return;
    this.service
      .crear({ titulo, estado: 'POR_HACER', prioridad: prioridad as Prioridad })
      .subscribe(() => this.cargar());
  }

  mover(t: Tarea, direccion: number) {
    const orden = this.columnas.map((c) => c.estado);
    const nuevo = orden[orden.indexOf(t.estado) + direccion];
    if (!nuevo) return;
    this.service.actualizar({ ...t, estado: nuevo }).subscribe(() => this.cargar());
  }

  borrar(t: Tarea) {
    this.service.borrar(t.id!).subscribe(() => this.cargar());
  }
}
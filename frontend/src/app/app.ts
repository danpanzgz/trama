import { Component, inject, signal } from '@angular/core';
import { Tarea, TareaService } from './tarea';

@Component({
  selector: 'app-root',
  template: `
    <h1>Tareas</h1>
    <input #titulo placeholder="Nueva tarea" />
    <button (click)="crear(titulo.value); titulo.value = ''">Añadir</button>
    <ul>
      @for (t of tareas(); track t.id) {
        <li>{{ t.titulo }}</li>
      }
    </ul>
  `,
})
export class App {
  private service = inject(TareaService);
  tareas = signal<Tarea[]>([]);

  constructor() {
    this.cargar();
  }

  cargar() {
    this.service.listar().subscribe((r) => this.tareas.set(r));
  }

  crear(titulo: string) {
    if (!titulo.trim()) return;
    this.service.crear({ titulo, hecha: false }).subscribe(() => this.cargar());
  }
}
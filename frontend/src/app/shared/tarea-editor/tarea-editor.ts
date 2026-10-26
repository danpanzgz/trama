import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Prioridad, Tarea } from '../../core/models/tarea.model';

@Component({
  selector: 'app-tarea-editor',
  templateUrl: './tarea-editor.html',
  styleUrl: './tarea-editor.css',
})
export class TareaEditor {
  @Input({ required: true }) tarea!: Tarea;
  @Output() readonly guardar = new EventEmitter<Tarea>();
  @Output() readonly cancelar = new EventEmitter<void>();

  enviar(titulo: string, descripcion: string, prioridad: string, fechaVencimiento: string): void {
    const nombre = titulo.trim();
    if (!nombre || !['BAJA', 'MEDIA', 'ALTA'].includes(prioridad)) return;

    this.guardar.emit({
      ...this.tarea,
      titulo: nombre,
      descripcion: descripcion.trim() || undefined,
      fechaVencimiento: fechaVencimiento || undefined,
      prioridad: prioridad as Prioridad,
    });
  }
}

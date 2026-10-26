import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export type Estado = 'POR_HACER' | 'EN_CURSO' | 'HECHA';
export type Prioridad = 'BAJA' | 'MEDIA' | 'ALTA';

export interface Tarea {
  id?: number;
  titulo: string;
  descripcion?: string;
  estado: Estado;
  prioridad: Prioridad;
}

@Injectable({ providedIn: 'root' })
export class TareaService {
  private http = inject(HttpClient);

  listar() {
    return this.http.get<Tarea[]>('/api/tareas');
  }

  crear(tarea: Tarea) {
    return this.http.post<Tarea>('/api/tareas', tarea);
  }

  actualizar(tarea: Tarea) {
    return this.http.put<Tarea>(`/api/tareas/${tarea.id}`, tarea);
  }

  borrar(id: number) {
    return this.http.delete<void>(`/api/tareas/${id}`);
  }
}
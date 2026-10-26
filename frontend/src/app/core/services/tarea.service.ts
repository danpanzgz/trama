import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Tarea } from '../models/tarea.model';

@Injectable({ providedIn: 'root' })
export class TareaService {
  private readonly http = inject(HttpClient);

  listar() {
    return this.http.get<Tarea[]>('/api/tareas');
  }

  crear(tarea: Tarea, proyectoId?: number) {
    if (proyectoId !== undefined) {
      return this.http.post<Tarea>(`/api/proyectos/${proyectoId}/tareas`, tarea);
    }

    return this.http.post<Tarea>('/api/tareas', tarea);
  }

  actualizar(tarea: Tarea) {
    return this.http.put<Tarea>(`/api/tareas/${tarea.id}`, tarea);
  }

  borrar(id: number) {
    return this.http.delete<void>(`/api/tareas/${id}`);
  }
}

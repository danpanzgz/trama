import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { Proyecto } from '../models/proyecto.model';
import { Tarea } from '../models/tarea.model';

@Injectable({ providedIn: 'root' })
export class ProyectoService {
  private readonly http = inject(HttpClient);

  listar() {
    return this.http.get<Proyecto[]>('/api/proyectos');
  }

  obtener(id: number) {
    return this.http.get<Proyecto>(`/api/proyectos/${id}`);
  }

  listarTareas(id: number) {
    return this.http.get<Tarea[]>(`/api/proyectos/${id}/tareas`);
  }

  listarTodasLasTareas(proyectos: Proyecto[]): Observable<Tarea[][]> {
    return forkJoin(proyectos.map((proyecto) => this.listarTareas(proyecto.id)));
  }

  crear(proyecto: Omit<Proyecto, 'id'>) {
    return this.http.post<Proyecto>('/api/proyectos', proyecto);
  }
}

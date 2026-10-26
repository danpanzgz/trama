import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface Tarea {
  id?: number;
  titulo: string;
  hecha: boolean;
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
}
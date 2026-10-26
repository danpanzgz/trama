export type Estado = 'POR_HACER' | 'EN_CURSO' | 'HECHA';
export type Prioridad = 'BAJA' | 'MEDIA' | 'ALTA';

export interface Tarea {
  id?: number;
  titulo: string;
  descripcion?: string;
  fechaVencimiento?: string;
  estado: Estado;
  prioridad: Prioridad;
}

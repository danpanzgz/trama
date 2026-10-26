import { Routes } from '@angular/router';
import { Proyectos } from './proyectos/proyectos';
import { ProyectoDetalle } from './proyectos/proyecto-detalle';
import { Tablero } from './tablero/tablero';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tablero' },
  { path: 'tablero', component: Tablero, title: 'Tareas | Trama' },
  { path: 'proyectos', component: Proyectos, title: 'Proyectos | Trama' },
  { path: 'proyectos/:id', component: ProyectoDetalle, title: 'Proyecto | Trama' },
  { path: '**', redirectTo: 'tablero' },
];

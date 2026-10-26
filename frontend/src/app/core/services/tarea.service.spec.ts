import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Tarea } from '../models/tarea.model';
import { TareaService } from './tarea.service';

describe('TareaService', () => {
  let service: TareaService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TareaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists tasks from the API', () => {
    const tareas: Tarea[] = [
      { id: 1, titulo: 'Preparar tablero', estado: 'POR_HACER', prioridad: 'MEDIA' },
    ];

    service.listar().subscribe((resultado) => expect(resultado).toEqual(tareas));

    const request = http.expectOne('/api/tareas');
    expect(request.request.method).toBe('GET');
    request.flush(tareas);
  });

  it('creates a task using the API', () => {
    const tarea: Tarea = { titulo: 'Preparar tablero', estado: 'POR_HACER', prioridad: 'ALTA' };

    service.crear(tarea).subscribe((resultado) => expect(resultado).toEqual({ ...tarea, id: 2 }));

    const request = http.expectOne('/api/tareas');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(tarea);
    request.flush({ ...tarea, id: 2 });
  });

  it('creates a task under the selected project', () => {
    const tarea: Tarea = { titulo: 'Preparar tablero', estado: 'POR_HACER', prioridad: 'ALTA' };

    service.crear(tarea, 7).subscribe();

    const request = http.expectOne('/api/proyectos/7/tareas');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(tarea);
    request.flush({ ...tarea, id: 2 });
  });

  it('sends an optional due date when creating a task', () => {
    const tarea: Tarea = {
      titulo: 'Entregar propuesta',
      fechaVencimiento: '2026-11-03',
      estado: 'POR_HACER',
      prioridad: 'ALTA',
    };

    service.crear(tarea).subscribe();

    const request = http.expectOne('/api/tareas');
    expect(request.request.body.fechaVencimiento).toBe('2026-11-03');
    request.flush({ ...tarea, id: 4 });
  });
});

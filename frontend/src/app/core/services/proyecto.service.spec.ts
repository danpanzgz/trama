import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProyectoService } from './proyecto.service';

describe('ProyectoService', () => {
  let service: ProyectoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProyectoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the tasks belonging to a project', () => {
    const tareas = [
      { id: 3, titulo: 'Preparar presentación', estado: 'POR_HACER', prioridad: 'ALTA' },
    ];

    service.listarTareas(12).subscribe((resultado) => expect(resultado).toEqual(tareas));

    const request = http.expectOne('/api/proyectos/12/tareas');
    expect(request.request.method).toBe('GET');
    request.flush(tareas);
  });
});

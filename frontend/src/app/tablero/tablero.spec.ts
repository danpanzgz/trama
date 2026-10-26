import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { vi } from 'vitest';
import { Tablero } from './tablero';

describe('Tablero', () => {
  let component: Tablero;
  let fixture: ComponentFixture<Tablero>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tablero],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Tablero);
    component = fixture.componentInstance;
    fixture.detectChanges();
    http.expectOne('/api/tareas').flush([]);
    http.expectOne('/api/proyectos').flush([]);
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filters tasks by title and priority', () => {
    component.tareas.set([
      { id: 1, titulo: 'Preparar demo', estado: 'POR_HACER', prioridad: 'ALTA' },
      { id: 2, titulo: 'Revisar notas', estado: 'EN_CURSO', prioridad: 'BAJA' },
    ]);

    component.busqueda.set('demo');
    expect(component.tareasVisibles().map((tarea) => tarea.id)).toEqual([1]);

    component.busqueda.set('');
    component.setPrioridadFiltro('BAJA');
    expect(component.tareasVisibles().map((tarea) => tarea.id)).toEqual([2]);
  });

  it('filters overdue tasks without showing completed work as overdue', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const fechaVencimiento = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    component.tareas.set([
      { id: 1, titulo: 'Pendiente atrasada', fechaVencimiento, estado: 'POR_HACER', prioridad: 'ALTA' },
      { id: 2, titulo: 'Tarea terminada', fechaVencimiento, estado: 'HECHA', prioridad: 'MEDIA' },
    ]);

    component.setFechaFiltro('VENCIDAS');

    expect(component.tareasVisibles().map((tarea) => tarea.id)).toEqual([1]);
  });

  it('exports visible tasks as escaped CSV and protects spreadsheet formulas', () => {
    component.tareas.set([
      {
        id: 1,
        titulo: '=HYPERLINK("https://example.com")',
        descripcion: 'Nota, con "comillas"',
        estado: 'EN_CURSO',
        prioridad: 'ALTA',
        fechaVencimiento: '2026-08-03',
      },
      { id: 2, titulo: 'Otra tarea', estado: 'POR_HACER', prioridad: 'BAJA' },
    ]);
    component.busqueda.set('HYPERLINK');

    const filas = component.generarCsv().replace('\uFEFF', '').split('\r\n');

    expect(filas).toHaveLength(2);
    expect(filas[0]).toBe('"Título","Descripción","Estado","Prioridad","Fecha límite"');
    expect(filas[1]).toContain(`"'=HYPERLINK(""https://example.com"")"`);
    expect(filas[1]).toContain('"Nota, con ""comillas"""');
    expect(filas[1]).toContain('"En curso","ALTA","2026-08-03"');
  });

  it('does not leave the create form busy after an invalid due date', () => {
    component.crear(
      'Tarea válida',
      '',
      'MEDIA',
      '',
      '2026-02-31',
      document.createElement('form'),
    );

    expect(component.guardando()).toBe(false);
    expect(component.error()).toBe('Introduce una fecha límite válida.');
    http.expectNone('/api/tareas');
  });

  it('focuses the search field with the slash shortcut', () => {
    const evento = new KeyboardEvent('keydown', { key: '/' });

    component.manejarAtajo(evento);

    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('[aria-label="Buscar tareas"]'));
  });

  it('moves a task to the dropped column and announces the change', () => {
    const tarea = { id: 7, titulo: 'Preparar informe', estado: 'POR_HACER' as const, prioridad: 'MEDIA' as const };
    component.tareas.set([tarea]);
    component.arrastrando.set(tarea.id);
    const evento = { preventDefault: vi.fn() } as unknown as DragEvent;

    component.soltar(evento, 'EN_CURSO');

    expect(evento.preventDefault).toHaveBeenCalled();
    expect(component.arrastrando()).toBeNull();
    const request = http.expectOne('/api/tareas/7');
    expect(request.request.method).toBe('PUT');
    request.flush({ ...tarea, estado: 'EN_CURSO' });
    expect(component.tareas()[0].estado).toBe('EN_CURSO');
    expect(component.anuncio()).toBe('Preparar informe movida a En curso.');
  });
});

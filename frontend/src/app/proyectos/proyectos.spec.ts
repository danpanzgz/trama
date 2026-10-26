import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Proyectos } from './proyectos';

describe('Proyectos', () => {
  let component: Proyectos;
  let fixture: ComponentFixture<Proyectos>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Proyectos],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Proyectos);
    component = fixture.componentInstance;
    fixture.detectChanges();
    http.expectOne('/api/proyectos').flush([]);
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

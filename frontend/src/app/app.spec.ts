import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach } from 'vitest';
import { App } from './app';

@Component({ template: '<h1>Trama</h1>' })
class TestPage {}

describe('App', () => {
  beforeEach(async () => {
    localStorage.removeItem('trama-tema');
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([{ path: '**', component: TestPage }])],
    })
      .compileComponents();
  });

  afterEach(() => {
    localStorage.removeItem('trama-tema');
    document.documentElement.dataset['theme'] = 'claro';
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand')?.textContent).toContain('trama');
  });

  it('toggles and persists the selected theme', () => {
    const fixture = TestBed.createComponent(App);

    fixture.componentInstance.alternarTema();

    expect(fixture.componentInstance.tema()).toBe('oscuro');
    expect(localStorage.getItem('trama-tema')).toBe('oscuro');
    expect(document.documentElement.dataset['theme']).toBe('oscuro');
  });
});

import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly fechaActual = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  readonly tema = signal<'claro' | 'oscuro'>(this.leerTema());

  constructor() {
    this.aplicarTema(this.tema());
  }

  alternarTema(): void {
    const nuevoTema = this.tema() === 'claro' ? 'oscuro' : 'claro';
    this.tema.set(nuevoTema);
    this.aplicarTema(nuevoTema);
    localStorage.setItem('trama-tema', nuevoTema);
  }

  private leerTema(): 'claro' | 'oscuro' {
    return localStorage.getItem('trama-tema') === 'oscuro' ? 'oscuro' : 'claro';
  }

  private aplicarTema(tema: 'claro' | 'oscuro'): void {
    document.documentElement.dataset['theme'] = tema;
  }
}

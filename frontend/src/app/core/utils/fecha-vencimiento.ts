import { Estado } from '../models/tarea.model';

function fechaLocalActual(): string {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
}

function diasHasta(fecha: string): number {
  const [año, mes, dia] = fecha.split('-').map(Number);
  const limite = Date.UTC(año, mes - 1, dia);
  const [hoyAño, hoyMes, hoyDia] = fechaLocalActual().split('-').map(Number);
  const hoy = Date.UTC(hoyAño, hoyMes - 1, hoyDia);
  return Math.round((limite - hoy) / 86_400_000);
}

export function etiquetaVencimiento(fecha?: string, estado?: Estado): string | null {
  if (!fecha) return null;

  const dias = diasHasta(fecha);
  const fechaCorta = formatearFecha(fecha);
  if (estado === 'HECHA') return `Fecha límite ${fechaCorta}`;
  if (dias < 0) return `Vencida hace ${Math.abs(dias)} d`;
  if (dias === 0) return 'Vence hoy';
  if (dias === 1) return 'Vence mañana';

  return `Vence ${fechaCorta}`;
}

function formatearFecha(fecha: string): string {
  const [año, mes, dia] = fecha.split('-').map(Number);
  const fechaUtc = new Date(Date.UTC(año, mes - 1, dia));
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(fechaUtc);
}

export function vencimientoAtrasado(fecha: string | undefined, estado: Estado): boolean {
  return Boolean(fecha && estado !== 'HECHA' && diasHasta(fecha) < 0);
}

export function venceHoy(fecha?: string): boolean {
  return Boolean(fecha && diasHasta(fecha) === 0);
}

import { etiquetaVencimiento, vencimientoAtrasado } from './fecha-vencimiento';

describe('fecha-vencimiento', () => {
  it('does not show a due date when none is set', () => {
    expect(etiquetaVencimiento()).toBeNull();
  });

  it('shows overdue dates only for unfinished tasks', () => {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const fecha = `${ayer.getFullYear()}-${String(ayer.getMonth() + 1).padStart(2, '0')}-${String(ayer.getDate()).padStart(2, '0')}`;

    expect(etiquetaVencimiento(fecha)).toContain('Vencida hace 1 d');
    expect(vencimientoAtrasado(fecha, 'POR_HACER')).toBe(true);
    expect(vencimientoAtrasado(fecha, 'HECHA')).toBe(false);
  });

  it('labels today and tomorrow without shifting the calendar date', () => {
    const date = (offset: number) => {
      const value = new Date();
      value.setDate(value.getDate() + offset);
      return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
    };

    expect(etiquetaVencimiento(date(0))).toBe('Vence hoy');
    expect(etiquetaVencimiento(date(1))).toBe('Vence mañana');
  });
});

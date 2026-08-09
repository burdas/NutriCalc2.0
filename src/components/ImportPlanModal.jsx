import { useMemo } from 'react';
import { Modal, Button } from '@heroui/react';
import { CalendarCheck } from 'lucide-react';
import { roundKcal } from '../utils/calculations';

const DAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

function buildSummary(plan) {
  return DAYS.map((day) => {
    const meals = [];
    const dayPlan = plan[day];
    if (dayPlan) {
      for (const slot of Object.keys(dayPlan)) {
        for (const meal of dayPlan[slot] || []) {
          if (meal && (meal.nombre || meal.calorias)) {
            meals.push({ ...meal, slot });
          }
        }
      }
    }
    const totalKcal = roundKcal(meals.reduce((acc, m) => acc + (m.calorias || 0), 0));
    return { day, meals, totalKcal };
  }).filter((d) => d.meals.length > 0);
}

export function ImportPlanModal({ plan, isOpen, onCancel, onConfirm }) {
  const summary = useMemo(() => (plan ? buildSummary(plan) : []), [plan]);
  const totalMeals = summary.reduce((acc, d) => acc + d.meals.length, 0);

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <Modal.Container size="md">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <div className="flex flex-col gap-1 pr-8">
              <Modal.Heading>Plan compartido detectado</Modal.Heading>
              <p className="text-xs text-muted">
                El enlace que has abierto contiene un plan de comidas de otra persona
              </p>
            </div>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/10 p-3">
              <CalendarCheck className="size-8 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-semibold">{totalMeals} comidas en {summary.length} días</p>
                <p className="text-xs text-muted">
                  ¿Quieres cargarlo? Reemplazará tu plan actual.
                </p>
              </div>
            </div>

            <div className="flex max-h-64 flex-col gap-2 overflow-y-auto rounded-lg border border-border/20 bg-surface-secondary p-3">
              {summary.length === 0 ? (
                <p className="text-xs text-muted">El plan no contiene comidas registradas.</p>
              ) : (
                summary.map(({ day, meals, totalKcal }) => (
                  <div key={day} className="flex items-center justify-between gap-3 rounded-lg bg-content1 px-3 py-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="w-16 shrink-0 text-sm font-semibold capitalize">{day}</span>
                      <div className="flex min-w-0 flex-wrap gap-1">
                        {meals.map((m) => (
                          <span key={m.id} className="max-w-40 truncate rounded-full bg-surface px-2 py-0.5 text-xs text-muted ring-1 ring-border/40">
                            {m.nombre || 'Sin nombre'}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-muted">
                      {totalKcal} kcal
                    </span>
                  </div>
                ))
              )}
            </div>
          </Modal.Body>
          <Modal.Footer className="flex justify-end gap-2">
            <Button variant="tertiary" size="sm" onPress={onCancel}>
              Ignorar
            </Button>
            <Button variant="primary" size="sm" onPress={onConfirm} isDisabled={summary.length === 0}>
              Cargar plan
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

import { Modal, Button } from '@heroui/react';
import { Sparkles, AlertTriangle } from 'lucide-react';

export function GenerateDietModal({ isOpen, onClose, onConfirm, target, macros, hasMeals }) {
  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Modal.Container size="md">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <div className="flex flex-col gap-1 pr-8">
              <Modal.Heading>Generar dieta automática</Modal.Heading>
              <p className="text-xs text-muted">
                Se creará un plan completo para los 7 días de la semana
              </p>
            </div>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/10 p-3">
              <Sparkles className="mt-0.5 size-8 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-semibold">Objetivo diario</p>
                <p className="text-xs text-muted">
                  Las comidas se ajustan para acercarse a estas cifras en cada día.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-lg border border-border/20 bg-surface-secondary px-3 py-2">
                <span className="block text-[10px] font-medium uppercase tracking-wider text-muted">Calorías</span>
                <p className="mt-1 text-lg font-bold tabular-nums leading-none">{target}</p>
                <span className="text-xs font-medium text-muted">kcal</span>
              </div>
              <div className="rounded-lg border border-border/20 bg-surface-secondary px-3 py-2">
                <span className="block text-[10px] font-medium uppercase tracking-wider text-muted">Proteínas</span>
                <p className="mt-1 text-lg font-bold tabular-nums leading-none">{macros.proteinG}</p>
                <span className="text-xs font-medium text-muted">g</span>
              </div>
              <div className="rounded-lg border border-border/20 bg-surface-secondary px-3 py-2">
                <span className="block text-[10px] font-medium uppercase tracking-wider text-muted">Carbos</span>
                <p className="mt-1 text-lg font-bold tabular-nums leading-none">{macros.carbG}</p>
                <span className="text-xs font-medium text-muted">g</span>
              </div>
              <div className="rounded-lg border border-border/20 bg-surface-secondary px-3 py-2">
                <span className="block text-[10px] font-medium uppercase tracking-wider text-muted">Grasas</span>
                <p className="mt-1 text-lg font-bold tabular-nums leading-none">{macros.fatG}</p>
                <span className="text-xs font-medium text-muted">g</span>
              </div>
            </div>

            {hasMeals && (
              <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-3">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
                <p className="text-xs text-foreground">
                  Generar la dieta reemplazará las comidas que ya tienes registradas en el planificador.
                </p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="flex justify-end gap-2">
            <Button variant="tertiary" size="sm" onPress={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onPress={onConfirm}>
              <Sparkles className="size-4" />
              Generar dieta
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

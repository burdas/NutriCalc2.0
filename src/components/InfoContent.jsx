import { Card } from '@heroui/react';
import {
  Calculator, Activity, Target, PieChart, AlertTriangle,
} from 'lucide-react';
import { ACTIVITY_OPTIONS } from '../utils/calculations';

const FACTORS = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, extra: 1.9 };

export function InfoContent() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <Card.Header>
          <Calculator />
          <div>
            <Card.Title>Fórmula Mifflin-St Jeor (TMB)</Card.Title>
            <Card.Description>
              Tasa Metabólica Basal — calorías en reposo absoluto
            </Card.Description>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="flex flex-col gap-3 text-sm">
            <div className="rounded-lg bg-surface p-3 font-mono text-sm">
              <p className="mb-1 font-semibold">Hombres:</p>
              <p>TMB = 10 × peso(kg) + 6.25 × altura(cm) − 5 × edad + 5</p>
            </div>
            <div className="rounded-lg bg-surface p-3 font-mono text-sm">
              <p className="mb-1 font-semibold">Mujeres:</p>
              <p>TMB = 10 × peso(kg) + 6.25 × altura(cm) − 5 × edad − 161</p>
            </div>
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Activity />
          <div>
            <Card.Title>Gasto Energético Total (TDEE)</Card.Title>
            <Card.Description>
              TMB × factor según tu nivel de actividad física
            </Card.Description>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 gap-2">
            {ACTIVITY_OPTIONS.map((opt) => (
              <div key={opt.id} className="rounded-lg bg-surface p-3 text-sm">
                <span className="font-medium">{opt.label}</span>
                <p className="text-muted text-xs">{opt.desc}</p>
                <p className="font-mono text-xs text-[var(--foreground)]/60">
                  Factor: {FACTORS[opt.id]}
                </p>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Target />
          <div>
            <Card.Title>Calorías Objetivo</Card.Title>
            <Card.Description>
              TDEE ajustado según tu meta
            </Card.Description>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="flex flex-col gap-2 text-sm">
            <div className="rounded-lg bg-surface p-3">
              <span className="font-medium">Perder peso</span>
              <p className="font-mono text-xs text-[var(--foreground)]/60">
                TDEE − 350 kcal (déficit calórico)
              </p>
            </div>
            <div className="rounded-lg bg-surface p-3">
              <span className="font-medium">Mantener peso</span>
              <p className="font-mono text-xs text-[var(--foreground)]/60">
                TDEE (mantenimiento)
              </p>
            </div>
            <div className="rounded-lg bg-surface p-3">
              <span className="font-medium">Ganar músculo</span>
              <p className="font-mono text-xs text-[var(--foreground)]/60">
                TDEE + 350 kcal (superávit calórico)
              </p>
            </div>
            <p className="text-muted mt-1 text-xs">
              Los valores de ajuste (+350/−350) se pueden personalizar en
              Configuración &gt; Ajuste de meta.
            </p>
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <PieChart />
          <div>
            <Card.Title>Macronutrientes</Card.Title>
            <Card.Description>
              Distribución de proteína, grasa y carbohidratos
            </Card.Description>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="flex flex-col gap-2 text-sm">
            <div className="rounded-lg bg-surface p-3">
              <span className="font-medium">Proteína</span>
              <p className="font-mono text-xs text-[var(--foreground)]/60">
                g/kg de peso × 4 kcal/g (por defecto 1.8 g/kg)
              </p>
            </div>
            <div className="rounded-lg bg-surface p-3">
              <span className="font-medium">Grasa</span>
              <p className="font-mono text-xs text-[var(--foreground)]/60">
                % de calorías objetivo ÷ 9 kcal/g (por defecto 25%)
              </p>
            </div>
            <div className="rounded-lg bg-surface p-3">
              <span className="font-medium">Carbohidratos</span>
              <p className="font-mono text-xs text-[var(--foreground)]/60">
                Calorías restantes ÷ 4 kcal/g
              </p>
            </div>
            <p className="text-muted mt-1 text-xs">
              Los perfiles (equilibrado, keto, alta proteína, etc.) se
              configuran en Configuración &gt; Perfil de macros.
            </p>
          </div>
        </Card.Content>
      </Card>

      <div className="col-span-full flex items-start gap-2 rounded-lg bg-surface p-3 text-sm">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
        <p className="text-muted text-xs">
          Estos valores son estimaciones basadas en fórmulas poblacionales.
          No reemplazan la consulta con un nutricionista o médico profesional.
        </p>
      </div>
    </div>
  );
}

import { Card } from '@heroui/react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg bg-[var(--background)] px-3 py-2 text-sm shadow-lg ring-1 ring-[var(--foreground)]/10">
      <span className="font-medium">{d.name}</span> — {d.grams}g ({d.pct}%)
    </div>
  );
}

export function CalorieResults({ bmr, tdee, targetCalories, macros }) {
  if (!targetCalories) return null;

  const { proteinG, fatG, carbG } = macros;
  const proteinCal = proteinG * 4;
  const fatCal = fatG * 9;
  const carbCal = carbG * 4;
  const totalMacroCal = proteinCal + fatCal + carbCal;

  const pct = (cal) => Math.round((cal / totalMacroCal) * 100);

  const data = [
    { name: 'Proteína', value: proteinG, grams: proteinG, pct: pct(proteinCal), color: '#3b82f6' },
    { name: 'Grasa', value: fatG, grams: fatG, pct: pct(fatCal), color: '#f59e0b' },
    { name: 'Carbohidratos', value: carbG, grams: carbG, pct: pct(carbCal), color: '#10b981' },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 lg:justify-between lg:gap-0">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card variant="secondary">
          <Card.Header>
            <Card.Description>TMB</Card.Description>
            <Card.Title className="text-3xl font-bold">{bmr}</Card.Title>
          </Card.Header>
          <Card.Content>
            <p className="text-muted text-sm">Tasa Metabólica Basal</p>
          </Card.Content>
        </Card>

        <Card variant="secondary">
          <Card.Header>
            <Card.Description>TDEE</Card.Description>
            <Card.Title className="text-3xl font-bold">{tdee}</Card.Title>
          </Card.Header>
          <Card.Content>
            <p className="text-muted text-sm">Gasto Energético Total</p>
          </Card.Content>
        </Card>

        <Card variant="tertiary">
          <Card.Header>
            <Card.Description>Calorías objetivo</Card.Description>
            <Card.Title className="text-3xl font-bold">{targetCalories}</Card.Title>
          </Card.Header>
          <Card.Content>
            <p className="text-muted text-sm">Ajustadas por objetivo</p>
          </Card.Content>
        </Card>
      </div>

      <Card>
        <Card.Header>
          <Card.Title>Macronutrientes sugeridos</Card.Title>
          <Card.Description>Distribución aproximada para tu objetivo</Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="flex flex-col items-center gap-6 sm:grid sm:grid-cols-2 sm:items-center">
            <div className="flex h-56 w-full justify-center">
              <ResponsiveContainer width={224} height={224}>
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    strokeWidth={0}
                  >
                    {data.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-3">
              {data.map((d) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="min-w-[100px] text-sm font-medium">{d.name}</span>
                  <span className="text-sm tabular-nums text-[var(--foreground)]/70">
                    {d.grams}g ({d.pct}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}

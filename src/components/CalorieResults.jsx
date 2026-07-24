import { Card } from '@heroui/react';

export function CalorieResults({ bmr, tdee, targetCalories, macros }) {
  if (!targetCalories) return null;

  const { proteinG, fatG, carbG } = macros;
  const proteinCal = proteinG * 4;
  const fatCal = fatG * 9;
  const carbCal = carbG * 4;
  const totalMacroCal = proteinCal + fatCal + carbCal;

  const pct = (cal) => Math.round((cal / totalMacroCal) * 100);

  return (
    <div className="flex flex-col gap-4">
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
          <div className="flex flex-col gap-3">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium">Proteína</span>
                <span>{proteinG}g ({pct(proteinCal)}%)</span>
              </div>
              <div className="bg-surface-secondary h-2 w-full rounded-full">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all"
                  style={{ width: `${pct(proteinCal)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium">Grasa</span>
                <span>{fatG}g ({pct(fatCal)}%)</span>
              </div>
              <div className="bg-surface-secondary h-2 w-full rounded-full">
                <div
                  className="h-2 rounded-full bg-amber-500 transition-all"
                  style={{ width: `${pct(fatCal)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium">Carbohidratos</span>
                <span>{carbG}g ({pct(carbCal)}%)</span>
              </div>
              <div className="bg-surface-secondary h-2 w-full rounded-full">
                <div
                  className="h-2 rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${pct(carbCal)}%` }}
                />
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}

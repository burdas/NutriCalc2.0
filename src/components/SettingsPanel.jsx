import { Card, Button, NumberField, Label, Tag, TagGroup } from '@heroui/react';
import { RotateCcw } from 'lucide-react';
import { MACRO_PRESETS } from '../utils/defaults';

export function SettingsPanel({ config, setConfig, resetConfig }) {
  const preset = config.macroPreset;
  const isCustom = preset === 'custom';
  const macro = isCustom
    ? { ...MACRO_PRESETS.custom, ...config.customMacros }
    : MACRO_PRESETS[preset];

  const setGoalAdj = (key, value) => {
    setConfig({
      goalAdjustments: { ...config.goalAdjustments, [key]: value ?? 0 },
    });
  };

  const setPreset = (id) => {
    setConfig({ macroPreset: id });
  };

  const setCustomMacro = (key, value) => {
    setConfig({
      macroPreset: 'custom',
      customMacros: { ...config.customMacros, [key]: value },
    });
  };

  return (
    <>
      <Card>
        <Card.Header>
          <Card.Title>Ajuste de meta</Card.Title>
          <Card.Description>
            Define cuántas calorías restar o sumar según el objetivo
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NumberField
              value={config.goalAdjustments.lose}
              onChange={(v) => setGoalAdj('lose', v)}
              minValue={-1000}
              maxValue={0}
              step={50}
              variant="secondary"
            >
              <Label>Perder peso</Label>
              <NumberField.Group>
                <NumberField.DecrementButton />
                <NumberField.Input placeholder="-350" />
                <NumberField.IncrementButton />
              </NumberField.Group>
            </NumberField>
            <NumberField
              value={config.goalAdjustments.gain}
              onChange={(v) => setGoalAdj('gain', v ?? 0)}
              minValue={0}
              maxValue={1000}
              step={50}
              variant="secondary"
            >
              <Label>Ganar músculo</Label>
              <NumberField.Group>
                <NumberField.DecrementButton />
                <NumberField.Input placeholder="350" />
                <NumberField.IncrementButton />
              </NumberField.Group>
            </NumberField>
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Perfil de macros</Card.Title>
          <Card.Description>
            Elige una distribución predefinida o personaliza la tuya
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="flex flex-col gap-4">
            <TagGroup
              selectedKeys={new Set([preset])}
              selectionMode="single"
              onSelectionChange={(keys) => {
                if (keys !== 'all') {
                  const [id] = keys;
                  if (id) setPreset(id);
                }
              }}
              variant="surface"
              size="lg"
            >
              <TagGroup.List>
                {Object.entries(MACRO_PRESETS).map(([id, p]) => (
                  <Tag key={id} id={id} className={(rp) => !rp.isSelected && !rp.isHovered ? 'bg-surface-secondary' : ''}>
                    {p.label}
                  </Tag>
                ))}
              </TagGroup.List>
            </TagGroup>

            <div className="relative min-h-[120px]">
              <div className={`transition-opacity duration-200 ${isCustom ? 'opacity-0 pointer-events-none absolute inset-0' : 'opacity-100 relative'}`}>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-surface p-3">
                    <span className="text-muted">Proteína</span>
                    <p className="text-lg font-semibold">{macro.proteinPerKg} g/kg</p>
                  </div>
                  <div className="rounded-lg bg-surface p-3">
                    <span className="text-muted">Grasa</span>
                    <p className="text-lg font-semibold">{Math.round(macro.fatPercent * 100)}%</p>
                  </div>
                </div>
              </div>
              <div className={`transition-opacity duration-200 ${isCustom ? 'opacity-100 relative' : 'opacity-0 pointer-events-none absolute inset-0'}`}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <NumberField
                    value={config.customMacros?.proteinPerKg ?? 1.8}
                    onChange={(v) => setCustomMacro('proteinPerKg', v)}
                    minValue={0.5}
                    maxValue={4}
                    step={0.1}
                    formatOptions={{ style: 'decimal', minimumFractionDigits: 1, maximumFractionDigits: 1 }}
                    variant="secondary"
                  >
                    <Label>Proteína (g/kg)</Label>
                    <NumberField.Group>
                      <NumberField.DecrementButton />
                      <NumberField.Input placeholder="1.8" />
                      <NumberField.IncrementButton />
                    </NumberField.Group>
                  </NumberField>
                  <NumberField
                    value={config.customMacros?.fatPercent != null ? config.customMacros.fatPercent * 100 : 25}
                    onChange={(v) => setCustomMacro('fatPercent', (v ?? 25) / 100)}
                    minValue={5}
                    maxValue={80}
                    step={1}
                    variant="secondary"
                  >
                    <Label>Grasa (%)</Label>
                    <NumberField.Group>
                      <NumberField.DecrementButton />
                      <NumberField.Input placeholder="25" />
                      <NumberField.IncrementButton />
                    </NumberField.Group>
                  </NumberField>
                </div>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>

      <Button variant="tertiary" onPress={resetConfig}>
        <RotateCcw />
        Restablecer valores por defecto
      </Button>
    </>
  );
}

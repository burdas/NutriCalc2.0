import { useState } from 'react';
import { Card, Button, NumberField, Label, Tag, TagGroup } from '@heroui/react';
import { RotateCcw, Key } from 'lucide-react';
import { MACRO_PRESETS } from '../utils/defaults';

export function SettingsPanel({ config, setConfig, resetConfig }) {
  const [apiKeyMasked, setApiKeyMasked] = useState(config.geminiApiKey ? '••••••••••••••••••••' : '');
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

      <Card>
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <Key className="size-4 text-accent" />
            Clave API de Google AI Studio (Gemini)
          </Card.Title>
          <Card.Description>
            Introduce tu clave de Gemini para la generación automática de dietas
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="flex flex-col gap-2">
            <input
              type="password"
              autoComplete="new-password"
              value={apiKeyMasked}
              onChange={(e) => {
                const val = e.target.value;
                setApiKeyMasked(val);
                if (!val.includes('•')) {
                  setConfig({ geminiApiKey: val });
                }
              }}
              onFocus={() => {
                if (apiKeyMasked.includes('•')) {
                  setApiKeyMasked('');
                  setConfig({ geminiApiKey: '' });
                }
              }}
              placeholder="Introduce tu Gemini API Key..."
              className="w-full rounded-lg border border-border/30 bg-surface-secondary px-3 py-2 text-xs text-foreground font-mono focus:border-accent focus:outline-none"
            />
            <p className="text-[11px] text-muted">
              Puedes obtener una clave gratuita en <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-accent underline">Google AI Studio</a>.
            </p>
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

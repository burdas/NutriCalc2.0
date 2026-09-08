import { useState, useEffect } from 'react';
import { Modal, Button } from '@heroui/react';
import { Sparkles, AlertTriangle, Loader2, Key, Bot, Zap, Check, ArrowRight } from 'lucide-react';
import { DIET_TYPES } from '../utils/defaults';

export function GenerateDietModal({
  isOpen,
  onClose,
  onConfirmLocal,
  onConfirmAI,
  target,
  macros,
  hasMeals,
  config = {},
  setConfig = () => {},
}) {
  const [mode, setMode] = useState('ai'); // 'ai' | 'local'
  const [dietType, setDietType] = useState(config.dietType || 'balanced');
  const [allergies, setAllergies] = useState(config.allergies || '');
  const [customPrompt, setCustomPrompt] = useState(config.customPrompt || '');
  const [apiKey, setApiKey] = useState(config.geminiApiKey || '');
  const [maskedKey, setMaskedKey] = useState(config.geminiApiKey ? '••••••••••••••••••••' : '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setDietType(config.dietType || 'balanced');
      setAllergies(config.allergies || '');
      setCustomPrompt(config.customPrompt || '');
      const currentKey = config.geminiApiKey || '';
      setApiKey(currentKey);
      setMaskedKey(currentKey ? '••••••••••••••••••••' : '');
      setErrorMsg(null);
      setStatusText('');
      setIsLoading(false);
      setShowKeyInput(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleGenerate = async () => {
    if (isLoading) return;
    setErrorMsg(null);

    // Save preferences to config
    setConfig({
      dietType,
      allergies,
      customPrompt,
      geminiApiKey: apiKey,
    });

    if (mode === 'local') {
      onConfirmLocal();
      onClose();
      return;
    }

    if (!apiKey || !apiKey.trim()) {
      setErrorMsg('Por favor introduce una clave de API de Google AI Studio (Gemini).');
      setShowKeyInput(true);
      return;
    }

    setIsLoading(true);
    setStatusText('Iniciando conexión con Google AI Studio...');

    try {
      const selectedDietLabel = DIET_TYPES[dietType]?.label || dietType;
      await onConfirmAI({
        apiKey: apiKey.trim(),
        dietType: selectedDietLabel,
        allergies,
        customPrompt,
        onProgress: (msg) => setStatusText(msg),
      });
      setIsLoading(false);
      onClose();
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Error al generar la dieta con IA.');
    }
  };

  const handleFallbackLocal = () => {
    onConfirmLocal();
    onClose();
  };

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => { if (!open && !isLoading) onClose(); }}>
      <Modal.Container size="lg">
        <Modal.Dialog className="max-h-[90vh] overflow-y-auto">
          <Modal.CloseTrigger isDisabled={isLoading} />
          <Modal.Header>
            <div className="flex flex-col gap-1 pr-8">
              <Modal.Heading className="flex items-center gap-2">
                <Sparkles className="size-5 text-accent" />
                Generar dieta personalizada
              </Modal.Heading>
              <p className="text-xs text-muted">
                Planificación automática semanal basada en tus objetivos nutricionales
              </p>
            </div>
          </Modal.Header>

          <Modal.Body className="flex flex-col gap-4 py-2">
            {/* Target Macros Banner */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-lg border border-border/20 bg-surface-secondary px-3 py-2">
                <span className="block text-[10px] font-medium uppercase tracking-wider text-muted">Calorías</span>
                <p className="mt-1 text-base font-bold tabular-nums leading-none text-accent">{target} <span className="text-xs font-normal text-muted">kcal</span></p>
              </div>
              <div className="rounded-lg border border-border/20 bg-surface-secondary px-3 py-2">
                <span className="block text-[10px] font-medium uppercase tracking-wider text-muted">Proteínas</span>
                <p className="mt-1 text-base font-bold tabular-nums leading-none">{macros.proteinG} <span className="text-xs font-normal text-muted">g</span></p>
              </div>
              <div className="rounded-lg border border-border/20 bg-surface-secondary px-3 py-2">
                <span className="block text-[10px] font-medium uppercase tracking-wider text-muted">Carbos</span>
                <p className="mt-1 text-base font-bold tabular-nums leading-none">{macros.carbG} <span className="text-xs font-normal text-muted">g</span></p>
              </div>
              <div className="rounded-lg border border-border/20 bg-surface-secondary px-3 py-2">
                <span className="block text-[10px] font-medium uppercase tracking-wider text-muted">Grasas</span>
                <p className="mt-1 text-base font-bold tabular-nums leading-none">{macros.fatG} <span className="text-xs font-normal text-muted">g</span></p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex rounded-lg border border-border/30 bg-surface-secondary p-1">
              <button
                type="button"
                onClick={() => setMode('ai')}
                disabled={isLoading}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-xs font-medium transition-colors ${
                  mode === 'ai'
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                <Bot className="size-4" />
                Inteligencia Artificial (Gemini)
              </button>
              <button
                type="button"
                onClick={() => setMode('local')}
                disabled={isLoading}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-xs font-medium transition-colors ${
                  mode === 'local'
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                <Zap className="size-4" />
                Rápido (Base local)
              </button>
            </div>

            {/* In Progress Status Banner */}
            {isLoading && (
              <div className="flex items-center gap-3 rounded-lg border border-accent/40 bg-accent/10 p-3.5 animate-pulse">
                <Loader2 className="size-5 shrink-0 animate-spin text-accent" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-accent">Creando tu menú semanal personalizado...</span>
                  <span className="text-[11px] text-muted">{statusText || 'Procesando con IA de Google Gemini'}</span>
                </div>
              </div>
            )}

            {mode === 'ai' && (
              <div className={`flex flex-col gap-4 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>
                {/* Tipo de dieta */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Estilo de alimentación / Tipo de dieta
                  </label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {Object.entries(DIET_TYPES).map(([id, item]) => {
                      const isSelected = dietType === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setDietType(id)}
                          disabled={isLoading}
                          className={`flex text-left flex-col gap-0.5 rounded-lg border p-2.5 transition-all ${
                            isSelected
                              ? 'border-accent bg-accent/10 ring-1 ring-accent'
                              : 'border-border/30 bg-surface-secondary hover:border-border'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold">{item.label}</span>
                            {isSelected && <Check className="size-3.5 text-accent" />}
                          </div>
                          <span className="text-[11px] text-muted line-clamp-2">{item.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Alergias o restricciones */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Alergias, intolerancias o alimentos no deseados
                  </label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    disabled={isLoading}
                    placeholder="Ej. Sin gluten, sin frutos secos, sin marisco, odio el brócoli..."
                    className="w-full rounded-lg border border-border/30 bg-surface-secondary px-3 py-2 text-xs text-foreground placeholder:text-muted/60 focus:border-accent focus:outline-none"
                  />
                </div>

                {/* Pautas o instrucciones adicionales */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Pautas o instrucciones adicionales para el LLM
                  </label>
                  <textarea
                    rows={3}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    disabled={isLoading}
                    placeholder="Ej. Querría desayunos con avena y fruta. Comidas que se puedan llevar en tupper. Cenas ligeras fáciles de preparar en menos de 15 minutos."
                    className="w-full rounded-lg border border-border/30 bg-surface-secondary px-3 py-2 text-xs text-foreground placeholder:text-muted/60 focus:border-accent focus:outline-none resize-y min-h-[76px] max-h-[200px]"
                  />
                </div>

                {/* API Key options */}
                <div className="rounded-lg border border-border/20 bg-surface-secondary/50 p-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <Key className="size-3.5 text-accent" />
                      <span>API Key de Google AI Studio</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowKeyInput(!showKeyInput)}
                      className="text-[11px] font-medium text-accent hover:underline"
                    >
                      {showKeyInput ? 'Ocultar' : 'Configurar / Cambiar'}
                    </button>
                  </div>

                  {showKeyInput && (
                    <div className="mt-2.5 flex flex-col gap-1">
                      <input
                        type="password"
                        autoComplete="new-password"
                        value={maskedKey}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMaskedKey(val);
                          if (!val.includes('•')) {
                            setApiKey(val);
                          }
                        }}
                        onFocus={() => {
                          if (maskedKey.includes('•')) {
                            setMaskedKey('');
                            setApiKey('');
                          }
                        }}
                        disabled={isLoading}
                        placeholder="Introduce tu Gemini API Key..."
                        className="w-full rounded-md border border-border/30 bg-surface px-2.5 py-1.5 text-xs text-foreground font-mono focus:border-accent focus:outline-none"
                      />
                      <p className="text-[10px] text-muted">
                        Obtén tu clave gratuita en <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-accent underline">aistudio.google.com</a>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {mode === 'local' && (
              <div className="rounded-lg border border-border/30 bg-surface-secondary p-4 text-xs text-muted leading-relaxed">
                <p className="font-medium text-foreground mb-1">Generador local rápido</p>
                Selecciona platos variados de la base de datos integrada ajustando las porciones para alcanzar tus macros objetivo. Es instantáneo y no requiere conexión con IA.
              </div>
            )}

            {/* Error Message & Local Fallback Option */}
            {errorMsg && (
              <div className="flex flex-col gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
                <div className="mt-1 flex items-center justify-between border-t border-destructive/20 pt-2">
                  <span className="text-[11px] text-muted">¿Prefieres no esperar a la IA?</span>
                  <button
                    type="button"
                    onClick={handleFallbackLocal}
                    className="flex items-center gap-1 rounded bg-surface-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-surface transition-colors"
                  >
                    <Zap className="size-3 text-accent" />
                    Generar al instante con base local
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Overwrite Warning */}
            {hasMeals && (
              <div className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 p-2.5">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                <p className="text-xs text-foreground">
                  Se reemplazará la planificación actual de tus 7 días.
                </p>
              </div>
            )}
          </Modal.Body>

          <Modal.Footer className="flex justify-end gap-2 pt-2">
            <Button variant="tertiary" size="sm" onPress={onClose} isDisabled={isLoading}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onPress={handleGenerate}
              isDisabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>{statusText || 'Diseñando dieta...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  <span>Generar dieta</span>
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

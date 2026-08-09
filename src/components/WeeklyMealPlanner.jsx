import { useState, useEffect } from 'react';
import { Card, RadioGroup, Radio, Drawer, Button, NumberField, Label, ComboBox, Input, ListBox, TextField, Chip, Dropdown } from '@heroui/react';
import { calculateCalories, roundKcal, roundMacro } from '../utils/calculations';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronUp, GripVertical, Plus, X, Pencil, Files, Move, MoreVertical } from 'lucide-react';
import { useOpenFoodFacts } from '../hooks/useOpenFoodFacts';

const DAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const DAY_ABBR = {
  lunes: 'Lu',
  martes: 'Ma',
  miércoles: 'Mi',
  jueves: 'Ju',
  viernes: 'Vi',
  sábado: 'Sá',
  domingo: 'Do',
};
const MEAL_SLOTS = ['desayuno', 'comida', 'merienda', 'cena', 'otros'];
const SLOT_LABELS = {
  desayuno: 'Desayuno',
  comida: 'Comida',
  merienda: 'Merienda',
  cena: 'Cena',
  otros: 'Otros',
};

function containerId(day, slot) {
  return `${day}::${slot}`;
}

function MacroMetric({ label, value, unit, emphasis = false }) {
  return (
    <div className={`rounded-lg border border-border/20 px-3 py-2 ${emphasis ? 'bg-accent/10' : 'bg-surface-secondary'}`}>
      <span className="block text-[10px] font-medium uppercase tracking-wider text-muted">{label}</span>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-lg font-bold tabular-nums leading-none">{value}</span>
        <span className="text-xs font-medium text-muted">{unit}</span>
      </div>
    </div>
  );
}

function SectionHeader({ title, description }) {
  return (
    <div className="flex flex-col gap-0.5">
      <h3 className="text-sm font-semibold">{title}</h3>
      {description ? <p className="text-xs text-muted">{description}</p> : null}
    </div>
  );
}

function useDrawerPlacement() {
  const [placement, setPlacement] = useState(() => {
    if (typeof window === 'undefined') return 'right';
    return window.matchMedia('(max-width: 639px)').matches ? 'bottom' : 'right';
  });

  useEffect(() => {
    const media = window.matchMedia('(max-width: 639px)');
    const updatePlacement = () => setPlacement(media.matches ? 'bottom' : 'right');

    updatePlacement();
    media.addEventListener('change', updatePlacement);
    return () => media.removeEventListener('change', updatePlacement);
  }, []);

  return placement;
}

function IngredientRow({ ing, isExpanded, onToggle, onUpdate, onRemove }) {
  const { results, loading, error, search, clear } = useOpenFoodFacts();
  const isFoundFood = Boolean(ing.productCode || ing.imagen);
  const factor = (ing.cantidad || 100) / 100;
  const baseCalories = ing.calorias || 0;
  const calories = roundKcal((ing.calorias || 0) * factor);
  const protein = roundMacro((ing.proteinas || 0) * factor);
  const carbs = roundMacro((ing.carbohidratos || 0) * factor);
  const fat = roundMacro((ing.grasas || 0) * factor);

  const macroChips = (
    <div className="mt-1 flex flex-wrap gap-1 sm:flex-nowrap">
      <Chip size="sm" className="bg-surface text-foreground ring-1 ring-border/40 px-2 py-1">
        <Chip.Label>{calories} kcal</Chip.Label>
      </Chip>
      <Chip size="sm" className="bg-surface text-foreground ring-1 ring-border/40 px-2 py-1">
        <Chip.Label>P {protein}g</Chip.Label>
      </Chip>
      <Chip size="sm" className="bg-surface text-foreground ring-1 ring-border/40 px-2 py-1">
        <Chip.Label>C {carbs}g</Chip.Label>
      </Chip>
      <Chip size="sm" className="bg-surface text-foreground ring-1 ring-border/40 px-2 py-1">
        <Chip.Label>G {fat}g</Chip.Label>
      </Chip>
    </div>
  );

  return (
    <div className="rounded-lg border border-border/20 bg-surface-secondary">
      <div className="grid gap-3 p-3 sm:grid-cols-[auto_minmax(0,1fr)_130px_auto] sm:items-center">
        <div className="flex items-center gap-3 sm:contents">
          {ing.imagen ? (
            <img
              src={ing.imagen}
              alt=""
              className="size-12 shrink-0 rounded-lg bg-surface-tertiary object-cover"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          ) : (
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-surface-tertiary text-xs font-semibold text-muted">
              {ing.nombre ? ing.nombre.trim().slice(0, 1).toUpperCase() : '+'}
            </div>
          )}

          <div className="min-w-0 flex-1 sm:hidden">
            <p className={`truncate text-sm font-medium ${ing.nombre ? '' : 'italic text-muted'}`}>
              {ing.nombre || 'Nuevo ingrediente'}
            </p>
            {macroChips}
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:hidden">
            <button
              type="button"
              onClick={onToggle}
              className="cursor-pointer rounded-full p-2 text-muted transition-colors hover:bg-accent/10 hover:text-accent"
              aria-label={isExpanded ? 'Ocultar detalles del ingrediente' : 'Editar detalles del ingrediente'}
              aria-expanded={isExpanded}
            >
              {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
            <button
              type="button"
              onClick={() => onRemove(ing.id)}
              className="cursor-pointer rounded-full p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
              aria-label="Eliminar ingrediente"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="hidden min-w-0 overflow-hidden sm:block">
          <p className={`truncate text-sm font-medium ${ing.nombre ? '' : 'italic text-muted'}`}>
            {ing.nombre || 'Nuevo ingrediente'}
          </p>
          {macroChips}
        </div>

        <NumberField
          value={ing.cantidad ?? 100}
          minValue={1}
          step={1}
          onChange={(v) => onUpdate(ing.id, 'cantidad', v)}
          className="w-full"
          aria-label={`Cantidad en gramos de ${ing.nombre || 'ingrediente'}`}
        >
          <Label className="text-xs font-medium text-muted">Cantidad (g)</Label>
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input className="h-9 text-sm" />
            <NumberField.IncrementButton />
          </NumberField.Group>
        </NumberField>

        <div className="hidden items-center justify-end gap-1 sm:flex">
          <button
            type="button"
            onClick={onToggle}
            className="cursor-pointer rounded-full p-2 text-muted transition-colors hover:bg-accent/10 hover:text-accent"
            aria-label={isExpanded ? 'Ocultar detalles del ingrediente' : 'Editar detalles del ingrediente'}
            aria-expanded={isExpanded}
          >
            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
          <button
            type="button"
            onClick={() => onRemove(ing.id)}
            className="cursor-pointer rounded-full p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
            aria-label="Eliminar ingrediente"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {isExpanded ? (
        <div className="border-t border-border/20 p-3 pt-4">
          <div className="grid gap-3">
            <ComboBox
              allowsCustomValue
              allowsEmptyCollection
              menuTrigger="input"
              defaultFilter={() => true}
              inputValue={ing.nombre}
              onInputChange={(value) => {
                onUpdate(ing.id, 'nombre', value);
                if (value !== ing.nombre && isFoundFood) {
                  onUpdate(ing.id, 'productCode', '');
                  onUpdate(ing.id, 'imagen', '');
                }
                if (value.length >= 2) {
                  search(value);
                } else {
                  clear();
                }
              }}
              onSelectionChange={(key) => {
                if (key) {
                  const p = results.find(r => r.code === key);
                  if (p) {
                    onUpdate(ing.id, 'nombre', p.product_name);
                    onUpdate(ing.id, 'calorias', p.calorias);
                    onUpdate(ing.id, 'proteinas', p.proteinas);
                    onUpdate(ing.id, 'carbohidratos', p.carbohidratos);
                    onUpdate(ing.id, 'grasas', p.grasas);
                    onUpdate(ing.id, 'imagen', p.image_url || '');
                    onUpdate(ing.id, 'productCode', p.code);
                  }
                }
              }}
              className="w-full"
            >
              <Label className="text-xs">Alimento</Label>
              <ComboBox.InputGroup>
                <Input placeholder="Buscar alimento..." />
                <ComboBox.Trigger />
              </ComboBox.InputGroup>
              <ComboBox.Popover>
                <ListBox renderEmptyState={() => (
                  <div className="flex flex-col items-center justify-center gap-2 px-2 py-4">
                    {loading ? (
                      <span className="text-xs text-muted">Buscando...</span>
                    ) : error ? (
                      <>
                        <span className="text-center text-xs text-danger">{error}</span>
                        <button
                          type="button"
                          onClick={() => search(ing.nombre)}
                          className="cursor-pointer text-xs font-medium text-accent hover:underline"
                        >
                          Reintentar
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-muted">Sin resultados</span>
                    )}
                  </div>
                )}>
                  {results.map((p) => (
                    <ListBox.Item key={p.code} id={p.code} textValue={p.product_name}>
                      <div className="flex items-center gap-2">
                        {p.image_url && (
                          <img
                            src={p.image_url}
                            alt=""
                            className="size-10 shrink-0 rounded-lg bg-surface-tertiary object-cover"
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        )}
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <span className="truncate text-sm font-medium">{p.product_name}</span>
                          {p.brands && <span className="truncate text-[10px] text-muted">{p.brands}</span>}
                          <span className="text-[10px] text-muted">
                            {p.calorias} kcal · P {p.proteinas}g · C {p.carbohidratos}g · G {p.grasas}g
                          </span>
                        </div>
                      </div>
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </ComboBox.Popover>
            </ComboBox>

            <div className="rounded-lg border border-border/20 bg-surface px-3 py-2.5">
              {isFoundFood ? (
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted">Macros por 100 g</span>
                  <div className="flex flex-wrap items-center gap-x-3">
                    <span className="text-sm font-semibold tabular-nums text-muted">{baseCalories} kcal</span>
                    <span className="flex items-baseline gap-1">
                      <span className="text-sm font-semibold tabular-nums">{ing.proteinas || 0}g</span>
                      <span className="text-xs text-muted">prot</span>
                    </span>
                    <span className="flex items-baseline gap-1">
                      <span className="text-sm font-semibold tabular-nums">{ing.carbohidratos || 0}g</span>
                      <span className="text-xs text-muted">carb</span>
                    </span>
                    <span className="flex items-baseline gap-1">
                      <span className="text-sm font-semibold tabular-nums">{ing.grasas || 0}g</span>
                      <span className="text-xs text-muted">gras</span>
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-2.5 flex items-center justify-between gap-3">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted">Macros por 100 g</span>
                    <span className="text-sm font-semibold tabular-nums text-muted">{baseCalories} kcal</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <NumberField
                    value={ing.proteinas || 0}
                    onChange={(v) => onUpdate(ing.id, 'proteinas', v ?? 0)}
                    minValue={0}
                    variant="secondary"
                  >
                    <Label className="text-xs">Proteínas</Label>
                    <NumberField.Group className="h-8">
                      <NumberField.DecrementButton />
                      <NumberField.Input className="text-xs" placeholder="0" />
                      <NumberField.IncrementButton />
                    </NumberField.Group>
                  </NumberField>
                  <NumberField
                    value={ing.carbohidratos || 0}
                    onChange={(v) => onUpdate(ing.id, 'carbohidratos', v ?? 0)}
                    minValue={0}
                    variant="secondary"
                  >
                    <Label className="text-xs">Carbohidratos</Label>
                    <NumberField.Group className="h-8">
                      <NumberField.DecrementButton />
                      <NumberField.Input className="text-xs" placeholder="0" />
                      <NumberField.IncrementButton />
                    </NumberField.Group>
                  </NumberField>
                  <NumberField
                    value={ing.grasas || 0}
                    onChange={(v) => onUpdate(ing.id, 'grasas', v ?? 0)}
                    minValue={0}
                    variant="secondary"
                  >
                    <Label className="text-xs">Grasas</Label>
                    <NumberField.Group className="h-8">
                      <NumberField.DecrementButton />
                      <NumberField.Input className="text-xs" placeholder="0" />
                      <NumberField.IncrementButton />
                    </NumberField.Group>
                  </NumberField>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MealEditorDrawer({ meal, day, slot, onUpdateBulk, onUpdateIngredients, isOpen, onClose }) {
  const [nombre, setNombre] = useState(meal.nombre);
  const [proteinas, setProteinas] = useState(meal.proteinas);
  const [carbohidratos, setCarbohidratos] = useState(meal.carbohidratos);
  const [grasas, setGrasas] = useState(meal.grasas);
  const [ingredients, setIngredients] = useState(meal.ingredients || []);
  const [expandedIngredientId, setExpandedIngredientId] = useState(null);
  const drawerPlacement = useDrawerPlacement();

  const calorias = calculateCalories(proteinas, carbohidratos, grasas);

  useEffect(() => {
    if (ingredients.length > 0) {
      let prot = 0, carb = 0, gras = 0;
      for (const ing of ingredients) {
        const factor = (ing.cantidad || 100) / 100;
        prot += (ing.proteinas || 0) * factor;
        carb += (ing.carbohidratos || 0) * factor;
        gras += (ing.grasas || 0) * factor;
      }
      setProteinas(roundMacro(prot));
      setCarbohidratos(roundMacro(carb));
      setGrasas(roundMacro(gras));
    }
  }, [ingredients]);

  function handleSave() {
    onUpdateBulk(day, slot, meal.id, {
      nombre,
      calorias: roundKcal(calorias),
      proteinas: roundMacro(proteinas),
      carbohidratos: roundMacro(carbohidratos),
      grasas: roundMacro(grasas),
    });
    onUpdateIngredients(day, slot, meal.id, ingredients);
    onClose();
  }

  function handleCancel() {
    setNombre(meal.nombre);
    setProteinas(meal.proteinas);
    setCarbohidratos(meal.carbohidratos);
    setGrasas(meal.grasas);
    setIngredients(meal.ingredients || []);
    setExpandedIngredientId(null);
    onClose();
  }

  function addIngredient() {
    const id = 'i_' + Date.now() + Math.random();
    setIngredients([...ingredients, { id, nombre: '', imagen: '', calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0, cantidad: 100 }]);
    setExpandedIngredientId(id);
  }

  function removeIngredient(id) {
    setIngredients(ingredients.filter(i => i.id !== id));
    if (expandedIngredientId === id) {
      setExpandedIngredientId(null);
    }
  }

  function updateIngredient(id, field, value) {
    setIngredients(prev => prev.map(i => {
      if (i.id !== id) return i;
      const updated = { ...i, [field]: value };
      updated.calorias = roundKcal(calculateCalories(updated.proteinas, updated.carbohidratos, updated.grasas));
      return updated;
    }));
  }

  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={(open) => { if (!open) handleCancel(); }}>
      <Drawer.Content placement={drawerPlacement}>
        <Drawer.Dialog className="sm:w-[min(720px,calc(100vw-2rem))]">
          <Drawer.CloseTrigger />
          <Drawer.Handle className="sm:hidden" />
          <Drawer.Header className="border-b border-border/20">
            <div className="flex flex-col gap-1 pr-8">
              <Drawer.Heading>Editar comida</Drawer.Heading>
              <p className="text-xs capitalize text-muted">
                {day} · {SLOT_LABELS[slot]}
              </p>
            </div>
          </Drawer.Header>
          <Drawer.Body className="flex flex-col gap-5 overflow-y-auto">
            <section className="flex flex-col gap-3">
              <TextField
                value={nombre}
                onChange={setNombre}
                variant="secondary"
                fullWidth
              >
                <Label>Nombre</Label>
                <Input placeholder="¿Qué comiste?" />
              </TextField>
            </section>

            <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MacroMetric label="Calorías" value={roundKcal(calorias)} unit="kcal" emphasis />
              <MacroMetric label="Proteínas" value={roundMacro(proteinas)} unit="g" />
              <MacroMetric label="Carbos" value={roundMacro(carbohidratos)} unit="g" />
              <MacroMetric label="Grasas" value={roundMacro(grasas)} unit="g" />
            </section>

            <section className={`flex flex-col gap-3 ${ingredients.length > 0 ? 'opacity-70' : ''}`}>
              <SectionHeader
                title="Macros"
                description={ingredients.length > 0 ? 'Calculados automáticamente desde los ingredientes.' : 'Introduce los macros totales de la comida.'}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <NumberField value={proteinas} onChange={setProteinas} minValue={0} isDisabled={ingredients.length > 0} variant="secondary">
                  <Label>Proteínas</Label>
                  <NumberField.Group>
                    <NumberField.DecrementButton />
                    <NumberField.Input placeholder="0" />
                    <NumberField.IncrementButton />
                  </NumberField.Group>
                </NumberField>
                <NumberField value={carbohidratos} onChange={setCarbohidratos} minValue={0} isDisabled={ingredients.length > 0} variant="secondary">
                  <Label>Carbohidratos</Label>
                  <NumberField.Group>
                    <NumberField.DecrementButton />
                    <NumberField.Input placeholder="0" />
                    <NumberField.IncrementButton />
                  </NumberField.Group>
                </NumberField>
                <NumberField value={grasas} onChange={setGrasas} minValue={0} isDisabled={ingredients.length > 0} variant="secondary">
                  <Label>Grasas</Label>
                  <NumberField.Group>
                    <NumberField.DecrementButton />
                    <NumberField.Input placeholder="0" />
                    <NumberField.IncrementButton />
                  </NumberField.Group>
                </NumberField>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <SectionHeader
                  title="Ingredientes"
                  description="Busca un alimento o escríbelo manualmente con sus macros."
                />
                {ingredients.length > 0 ? (
                  <Chip size="sm" variant="secondary" className="ring-1 ring-border/40">
                    <Chip.Label>{ingredients.length}</Chip.Label>
                  </Chip>
                ) : null}
              </div>

              {ingredients.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {ingredients.map((ing) => (
                    <IngredientRow
                      key={ing.id}
                      ing={ing}
                      isExpanded={expandedIngredientId === ing.id}
                      onToggle={() => setExpandedIngredientId(expandedIngredientId === ing.id ? null : ing.id)}
                      onUpdate={updateIngredient}
                      onRemove={removeIngredient}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border/40 bg-surface-secondary px-4 py-5 text-center">
                  <p className="text-sm font-medium">Sin ingredientes</p>
                  <p className="mt-1 text-xs text-muted">Puedes guardar macros manuales o construir la comida por ingredientes.</p>
                </div>
              )}

              <button
                onClick={addIngredient}
                className="flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border/40 px-3 py-2 text-xs text-muted transition-colors hover:border-accent/40 hover:text-accent"
              >
                <Plus className="size-3.5" />
                Añadir ingrediente
              </button>
            </section>
          </Drawer.Body>
          <Drawer.Footer className="sticky bottom-0 flex justify-end gap-2 border-t border-border/20 bg-content1">
            <Button variant="tertiary" size="sm" onPress={handleCancel}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onPress={handleSave}>
              Guardar
            </Button>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}

function MoveMealDrawer({ meal, day, slot, mealPlan, isOpen, onClose, onMove }) {
  const [destDay, setDestDay] = useState(day);
  const [destSlot, setDestSlot] = useState(slot);
  const drawerPlacement = useDrawerPlacement();

  useEffect(() => {
    if (isOpen) {
      setDestDay(day);
      setDestSlot(slot);
    }
  }, [isOpen, day, slot]);

  const canMove = destDay !== day || destSlot !== slot;

  function handleMove() {
    const srcArr = mealPlan[day][slot];
    const index = srcArr.findIndex((m) => m.id === meal.id);
    if (index === -1) return;
    onMove(day, slot, index, destDay, destSlot);
    onClose();
  }

  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Drawer.Content placement={drawerPlacement}>
        <Drawer.Dialog className="sm:w-[min(720px,calc(100vw-2rem))]">
          <Drawer.CloseTrigger />
          <Drawer.Handle className="sm:hidden" />
          <Drawer.Header className="border-b border-border/20">
            <div className="flex flex-col gap-1 pr-8">
              <Drawer.Heading>Mover comida</Drawer.Heading>
              <p className="text-xs capitalize text-muted">
                {meal.nombre || 'Sin nombre'} · {day} · {SLOT_LABELS[slot]}
              </p>
            </div>
          </Drawer.Header>
          <Drawer.Body className="flex flex-col gap-5 overflow-y-auto">
            <section className="flex flex-col gap-3">
              <SectionHeader title="Día" description="Selecciona el día de destino." />
              <RadioGroup value={destDay} onChange={setDestDay} aria-label="Día de destino">
                <div className="radio-pill-group grid w-full grid-cols-7 gap-1 rounded-full bg-surface-secondary p-1.5">
                  {DAYS.map((d) => (
                    <Radio key={d} value={d} className="flex items-center">
                      <Radio.Content className="flex w-full cursor-pointer items-center justify-center rounded-full py-1.5 text-xs font-medium text-foreground/60 transition-colors data-[selected=true]:bg-surface-tertiary data-[selected=true]:text-surface-tertiary-foreground data-[selected=true]:shadow-sm">
                        {DAY_ABBR[d]}
                      </Radio.Content>
                    </Radio>
                  ))}
                </div>
              </RadioGroup>
            </section>

            <section className="flex flex-col gap-3">
              <SectionHeader title="Momento del día" description="Selecciona la comida de destino." />
              <RadioGroup value={destSlot} onChange={setDestSlot} aria-label="Momento del día de destino">
                <div className="radio-pill-group grid w-full grid-cols-5 gap-1 rounded-full bg-surface-secondary p-1.5">
                  {MEAL_SLOTS.map((s) => (
                    <Radio key={s} value={s} className="flex items-center">
                      <Radio.Content className="flex w-full cursor-pointer items-center justify-center rounded-full py-1.5 text-xs font-medium text-foreground/60 transition-colors data-[selected=true]:bg-surface-tertiary data-[selected=true]:text-surface-tertiary-foreground data-[selected=true]:shadow-sm">
                        {SLOT_LABELS[s]}
                      </Radio.Content>
                    </Radio>
                  ))}
                </div>
              </RadioGroup>
            </section>
          </Drawer.Body>
          <Drawer.Footer className="sticky bottom-0 flex justify-end gap-2 border-t border-border/20 bg-content1">
            <Button variant="tertiary" size="sm" onPress={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" isDisabled={!canMove} onPress={handleMove}>
              Mover
            </Button>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}

function SortableMealCard({ meal, day, slot, mealPlan, onMoveMeal, onRemove, onDuplicateMeal, onUpdateBulk, onUpdateIngredients }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortDragging,
  } = useSortable({ id: meal.id, data: { day, slot, type: 'meal' } });

  const [editOpen, setEditOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [marqueeHover, setMarqueeHover] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortDragging ? 0.4 : 1,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="rounded-xl border bg-content1 shadow-sm"
      >
        <div className="flex items-stretch">
          <button
            {...attributes}
            {...listeners}
            className="flex cursor-grab items-center rounded-l-xl px-1.5 text-muted hover:text-foreground active:cursor-grabbing touch-none"
            aria-label="Arrastrar comida"
          >
            <GripVertical className="size-4" />
          </button>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 px-2 py-2.5">
            <div className="flex items-center gap-1.5">
              <p className={`min-w-0 flex-1 truncate text-sm font-medium ${meal.nombre ? 'text-foreground' : 'italic text-muted/50'}`}>
                {meal.nombre || 'Sin nombre'}
              </p>
              <button
                onClick={() => setMoveOpen(true)}
                className="cursor-pointer rounded-full p-1.5 text-muted hover:bg-accent/10 hover:text-accent transition-colors lg:hidden"
                aria-label="Mover a otro día"
              >
                <Move className="size-3.5" />
              </button>
              <button
                onClick={() => setEditOpen(true)}
                className="cursor-pointer rounded-full p-1.5 text-muted hover:bg-accent/10 hover:text-accent transition-colors lg:hidden"
                aria-label="Editar comida"
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                onClick={() => onDuplicateMeal(day, slot, meal.id)}
                className="cursor-pointer rounded-full p-1.5 text-muted hover:bg-accent/10 hover:text-accent transition-colors lg:hidden"
                aria-label="Duplicar comida"
              >
                <Files className="size-3.5" />
              </button>
              <button
                onClick={() => onRemove(day, slot, meal.id)}
                className="cursor-pointer rounded-full p-1.5 text-muted hover:bg-danger/10 hover:text-danger transition-colors lg:hidden"
                aria-label="Eliminar comida"
              >
                <X className="size-3.5" />
              </button>
              <Dropdown>
                <Dropdown.Trigger>
                  <button
                    type="button"
                    className="hidden cursor-pointer rounded-full p-1.5 text-muted transition-colors hover:bg-accent/10 hover:text-accent lg:inline-flex"
                    aria-label="Más acciones"
                  >
                    <MoreVertical className="size-3.5" />
                  </button>
                </Dropdown.Trigger>
                <Dropdown.Popover placement="bottom end">
                  <Dropdown.Menu onAction={(key) => {
                    switch (key) {
                      case 'edit':
                        setEditOpen(true);
                        break;
                      case 'move':
                        setMoveOpen(true);
                        break;
                      case 'duplicate':
                        onDuplicateMeal(day, slot, meal.id);
                        break;
                      case 'delete':
                        onRemove(day, slot, meal.id);
                        break;
                    }
                  }}>
                    <Dropdown.Item id="edit" textValue="Editar comida">
                      <Pencil className="size-4 shrink-0 text-muted" />
                      <Label>Editar</Label>
                    </Dropdown.Item>
                    <Dropdown.Item id="move" textValue="Mover a otro día">
                      <Move className="size-4 shrink-0 text-muted" />
                      <Label>Mover a otro día</Label>
                    </Dropdown.Item>
                    <Dropdown.Item id="duplicate" textValue="Duplicar comida">
                      <Files className="size-4 shrink-0 text-muted" />
                      <Label>Duplicar</Label>
                    </Dropdown.Item>
                    <Dropdown.Item id="delete" textValue="Eliminar comida" variant="danger">
                      <X className="size-4 shrink-0 text-danger" />
                      <Label>Eliminar</Label>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            </div>
            <div
              className="overflow-hidden whitespace-nowrap"
              onMouseEnter={() => setMarqueeHover(true)}
              onMouseLeave={() => setMarqueeHover(false)}
            >
              <span
                className="inline-block text-xs text-muted"
                style={{ animation: marqueeHover ? 'marquee 6s linear infinite' : 'none' }}
              >
                {roundKcal(meal.calorias)} cal &middot; {roundMacro(meal.proteinas)}g prot &middot; {roundMacro(meal.carbohidratos)}g carb &middot; {roundMacro(meal.grasas)}g gras
              </span>
            </div>
          </div>
        </div>
      </div>
      <MealEditorDrawer
        meal={meal}
        day={day}
        slot={slot}
        onUpdateBulk={onUpdateBulk}
        onUpdateIngredients={onUpdateIngredients}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
      />
      <MoveMealDrawer
        meal={meal}
        day={day}
        slot={slot}
        mealPlan={mealPlan}
        isOpen={moveOpen}
        onClose={() => setMoveOpen(false)}
        onMove={onMoveMeal}
      />
    </>
  );
}

function MealCardPreview({ meal }) {
  return (
    <div className="rounded-xl border bg-content1 shadow-lg ring-2 ring-accent">
      <div className="flex items-stretch">
        <div className="flex items-center rounded-l-xl px-1.5 text-muted">
          <GripVertical className="size-4" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 px-2 py-2.5">
          <p className={`min-w-0 flex-1 truncate text-sm font-medium ${meal.nombre ? 'text-foreground' : 'italic text-muted/50'}`}>
            {meal.nombre || 'Sin nombre'}
          </p>
          <div className="overflow-hidden whitespace-nowrap">
            <span className="inline-block text-xs text-muted" style={{ animation: 'marquee 6s linear infinite' }}>
              {roundKcal(meal.calorias)} cal &middot; {roundMacro(meal.proteinas)}g prot &middot; {roundMacro(meal.carbohidratos)}g carb &middot; {roundMacro(meal.grasas)}g gras
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MealSlot({ day, slot, meals, mealPlan, onAddMeal, onRemoveMeal, onDuplicateMeal, onMoveMeal, onUpdateMealBulk, onUpdateMealIngredients }) {
  const mealIds = meals.map((m) => m.id);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-muted">{SLOT_LABELS[slot]}</span>
      <SortableContext items={mealIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2" id={containerId(day, slot)}>
          {meals.map((meal) => (
            <SortableMealCard
              key={meal.id}
              meal={meal}
              day={day}
              slot={slot}
              mealPlan={mealPlan}
              onMoveMeal={onMoveMeal}
              onRemove={onRemoveMeal}
              onDuplicateMeal={onDuplicateMeal}
              onUpdateBulk={onUpdateMealBulk}
              onUpdateIngredients={onUpdateMealIngredients}
            />
          ))}
        </div>
      </SortableContext>
      <button
        onClick={() => onAddMeal(day, slot)}
        className="cursor-pointer flex items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border/40 px-3 py-2 text-xs text-muted transition-colors hover:border-accent/40 hover:text-accent"
      >
        <Plus className="size-3.5" />
        Añadir comida
      </button>
    </div>
  );
}

function DayColumn({ day, mealPlan, onAddMeal, onRemoveMeal, onDuplicateMeal, onMoveMeal, onUpdateMealBulk, onUpdateMealIngredients, dailyTotals, target, macros }) {
  const totals = dailyTotals[day];
  const progress = target ? Math.min(Math.round((totals.calorias / target) * 100), 100) : 0;

  return (
    <Card className="min-w-0">
      <Card.Header className="flex flex-col gap-1 pb-2">
        <Card.Title className="text-sm capitalize">{day}</Card.Title>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span>
            {roundKcal(totals.calorias)} / {target || '—'} kcal
          </span>
        </div>
        {target > 0 && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--background)]">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </Card.Header>
      <Card.Content className="flex flex-col gap-4 py-2">
        {MEAL_SLOTS.map((slot) => (
          <MealSlot
            key={slot}
            day={day}
            slot={slot}
            meals={mealPlan[day][slot]}
            mealPlan={mealPlan}
            onAddMeal={onAddMeal}
                    onRemoveMeal={onRemoveMeal}
                    onDuplicateMeal={onDuplicateMeal}
                    onMoveMeal={onMoveMeal}
                    onUpdateMealBulk={onUpdateMealBulk}
            onUpdateMealIngredients={onUpdateMealIngredients}
          />
        ))}
      </Card.Content>
      <Card.Footer className="flex flex-col gap-1 pt-2 text-xs">
        <div className="flex w-full justify-between">
          <span className="text-muted">Total</span>
          <span className="font-semibold">{roundKcal(totals.calorias)} kcal</span>
        </div>
        {macros && (
          <>
            <div className="flex w-full justify-between text-muted">
              <span>Proteínas</span>
              <span>
                {roundMacro(totals.proteinas)} / {macros.proteinG}g
              </span>
            </div>
            <div className="flex w-full justify-between text-muted">
              <span>Carbohidratos</span>
              <span>
                {roundMacro(totals.carbohidratos)} / {macros.carbG}g
              </span>
            </div>
            <div className="flex w-full justify-between text-muted">
              <span>Grasas</span>
              <span>
                {roundMacro(totals.grasas)} / {macros.fatG}g
              </span>
            </div>
          </>
        )}
      </Card.Footer>
    </Card>
  );
}

export function WeeklyMealPlanner({ mealPlan, onAddMeal, onRemoveMeal, onDuplicateMeal, onMoveMeal, onUpdateMealBulk, onUpdateMealIngredients, dailyTotals, target, macros }) {
  const [selectedDay, setSelectedDay] = useState('lunes');
  const [activeMeal, setActiveMeal] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  function findContainer(mealId) {
    for (const day of DAYS) {
      for (const slot of MEAL_SLOTS) {
        const meals = mealPlan[day][slot];
        const idx = meals.findIndex((m) => m.id === mealId);
        if (idx !== -1) return { day, slot, index: idx };
      }
    }
    return null;
  }

  function handleDragStart(event) {
    const mealId = event.active.id;
    const found = findContainer(mealId);
    if (!found) return;
    setActiveMeal(mealPlan[found.day][found.slot][found.index]);
  }

  function handleDragEnd(event) {
    setActiveMeal(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id;
    const overId = over.id;

    const src = findContainer(activeId);
    if (!src) return;

    let destDay = src.day;
    let destSlot = src.slot;
    let destIndex;

    const overStr = String(overId);
    if (overStr.includes('::')) {
      const [d, s] = overStr.split('::');
      destDay = d;
      destSlot = s;
      destIndex = mealPlan[d][s].length;
    } else {
      const overMeal = findContainer(overId);
      if (!overMeal) return;
      destDay = overMeal.day;
      destSlot = overMeal.slot;
      destIndex = overMeal.index;
    }

    if (src.day === destDay && src.slot === destSlot && src.index === destIndex) return;
    if (src.day === destDay && src.slot === destSlot && src.index < destIndex) {
      destIndex = Math.max(0, destIndex - 1);
    }

    onMoveMeal(src.day, src.slot, src.index, destDay, destSlot, destIndex);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <section className="pb-12 animate-[fadeInUp_0.5s_ease-out_0.7s_both]">
        <div className="mb-6">
          <h2 className="text-xl font-bold">Planificador semanal de comidas</h2>
          <p className="text-muted text-sm">
            Registra tus comidas diarias y compáralas con tus objetivos calóricos y de macronutrientes
          </p>
        </div>

        <RadioGroup
          value={selectedDay}
          onChange={setSelectedDay}
          className="mb-4 lg:hidden"
        >
          <div className="radio-pill-group grid w-full grid-cols-7 gap-1 rounded-full bg-surface-secondary p-1.5">
            {DAYS.map((day) => (
              <Radio key={day} value={day} className="flex items-center">
                <Radio.Content className="flex w-full cursor-pointer items-center justify-center rounded-full py-1.5 text-xs font-medium text-foreground/60 transition-colors data-[selected=true]:bg-surface-tertiary data-[selected=true]:text-surface-tertiary-foreground data-[selected=true]:shadow-sm">
                  {DAY_ABBR[day]}
                </Radio.Content>
              </Radio>
            ))}
          </div>
        </RadioGroup>

        <div className="hidden overflow-x-auto pb-4 lg:block">
          <div className="flex gap-4">
            {DAYS.map((day) => (
              <div key={day} className="min-w-[200px] flex-1">
                <DayColumn
                  day={day}
                  mealPlan={mealPlan}
                  onAddMeal={onAddMeal}
                  onRemoveMeal={onRemoveMeal}
                  onDuplicateMeal={onDuplicateMeal}
                  onMoveMeal={onMoveMeal}
                  onUpdateMealBulk={onUpdateMealBulk}
                  onUpdateMealIngredients={onUpdateMealIngredients}
                  dailyTotals={dailyTotals}
                  target={target}
                  macros={macros}
                />
              </div>
            ))}
          </div>
        </div>

        <div key={selectedDay} className="animate-[fadeIn_0.2s_ease-out] lg:hidden">
          <DayColumn
            day={selectedDay}
            mealPlan={mealPlan}
            onAddMeal={onAddMeal}
            onRemoveMeal={onRemoveMeal}
            onDuplicateMeal={onDuplicateMeal}
            onMoveMeal={onMoveMeal}
            onUpdateMealBulk={onUpdateMealBulk}
            onUpdateMealIngredients={onUpdateMealIngredients}
            dailyTotals={dailyTotals}
            target={target}
            macros={macros}
          />
        </div>
      </section>

      <DragOverlay>
        {activeMeal ? <MealCardPreview meal={activeMeal} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

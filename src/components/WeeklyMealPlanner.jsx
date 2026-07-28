import { useState, useEffect } from 'react';
import { Card, RadioGroup, Radio, Modal, Button, NumberField, Label } from '@heroui/react';
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
import { GripVertical, Plus, X, Pencil } from 'lucide-react';

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

function EditModal({ meal, day, slot, onUpdateBulk, onUpdateIngredients, isOpen, onClose }) {
  const [nombre, setNombre] = useState(meal.nombre);
  const [calorias, setCalorias] = useState(meal.calorias);
  const [proteinas, setProteinas] = useState(meal.proteinas);
  const [carbohidratos, setCarbohidratos] = useState(meal.carbohidratos);
  const [grasas, setGrasas] = useState(meal.grasas);
  const [ingredients, setIngredients] = useState(meal.ingredients || []);

  useEffect(() => {
    if (ingredients.length > 0) {
      let cal = 0, prot = 0, carb = 0, gras = 0;
      for (const ing of ingredients) {
        cal += ing.calorias || 0;
        prot += ing.proteinas || 0;
        carb += ing.carbohidratos || 0;
        gras += ing.grasas || 0;
      }
      setCalorias(cal);
      setProteinas(prot);
      setCarbohidratos(carb);
      setGrasas(gras);
    }
  }, [ingredients]);

  function handleSave() {
    onUpdateBulk(day, slot, meal.id, { nombre, calorias, proteinas, carbohidratos, grasas });
    onUpdateIngredients(day, slot, meal.id, ingredients);
    onClose();
  }

  function handleCancel() {
    setNombre(meal.nombre);
    setCalorias(meal.calorias);
    setProteinas(meal.proteinas);
    setCarbohidratos(meal.carbohidratos);
    setGrasas(meal.grasas);
    setIngredients(meal.ingredients || []);
    onClose();
  }

  function addIngredient() {
    setIngredients([...ingredients, { id: 'i_' + Date.now() + Math.random(), nombre: '', calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 }]);
  }

  function removeIngredient(id) {
    setIngredients(ingredients.filter(i => i.id !== id));
  }

  function updateIngredient(id, field, value) {
    setIngredients(ingredients.map(i => i.id === id ? { ...i, [field]: value } : i));
  }

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Modal.Container size="sm">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Editar comida</Modal.Heading>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted">Nombre</span>
              <input
                type="text"
                placeholder="¿Qué comiste?"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full rounded-md border border-border/40 bg-field px-3 py-2 text-sm text-field-foreground placeholder:text-muted/50 outline-none transition-colors focus:border-accent"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumberField value={calorias} onChange={setCalorias} minValue={0} isDisabled={ingredients.length > 0} variant="secondary">
                <Label>Calorías</Label>
                <NumberField.Group>
                  <NumberField.DecrementButton />
                  <NumberField.Input placeholder="0" />
                  <NumberField.IncrementButton />
                </NumberField.Group>
              </NumberField>
              <NumberField value={proteinas} onChange={setProteinas} minValue={0} isDisabled={ingredients.length > 0} variant="secondary">
                <Label>Proteínas</Label>
                <NumberField.Group>
                  <NumberField.DecrementButton />
                  <NumberField.Input placeholder="0" />
                  <NumberField.IncrementButton />
                </NumberField.Group>
              </NumberField>
            </div>
            <div className="grid grid-cols-2 gap-3">
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

            {ingredients.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted">Ingredientes</span>
                </div>
                {ingredients.map((ing) => (
                  <div key={ing.id} className="rounded-lg border border-border/20 bg-surface-secondary p-2">
                    <div className="mb-1.5 flex items-center justify-between">
                      <input
                        type="text"
                        placeholder="Alimento"
                        value={ing.nombre}
                        onChange={(e) => updateIngredient(ing.id, 'nombre', e.target.value)}
                        className="min-w-0 flex-1 rounded-md border border-border/40 bg-field px-3 py-1.5 text-sm text-field-foreground placeholder:text-muted/50 outline-none transition-colors focus:border-accent"
                      />
                      <button
                        onClick={() => removeIngredient(ing.id)}
                        className="ml-1 cursor-pointer rounded-full p-1 text-muted hover:bg-danger/10 hover:text-danger transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <NumberField value={ing.calorias} onChange={(v) => updateIngredient(ing.id, 'calorias', v)} minValue={0} variant="secondary">
                        <Label>Cal</Label>
                        <NumberField.Group>
                          <NumberField.DecrementButton />
                          <NumberField.Input placeholder="0" />
                          <NumberField.IncrementButton />
                        </NumberField.Group>
                      </NumberField>
                      <NumberField value={ing.proteinas} onChange={(v) => updateIngredient(ing.id, 'proteinas', v)} minValue={0} variant="secondary">
                        <Label>Prot</Label>
                        <NumberField.Group>
                          <NumberField.DecrementButton />
                          <NumberField.Input placeholder="0" />
                          <NumberField.IncrementButton />
                        </NumberField.Group>
                      </NumberField>
                      <NumberField value={ing.carbohidratos} onChange={(v) => updateIngredient(ing.id, 'carbohidratos', v)} minValue={0} variant="secondary">
                        <Label>Carb</Label>
                        <NumberField.Group>
                          <NumberField.DecrementButton />
                          <NumberField.Input placeholder="0" />
                          <NumberField.IncrementButton />
                        </NumberField.Group>
                      </NumberField>
                      <NumberField value={ing.grasas} onChange={(v) => updateIngredient(ing.id, 'grasas', v)} minValue={0} variant="secondary">
                        <Label>Gras</Label>
                        <NumberField.Group>
                          <NumberField.DecrementButton />
                          <NumberField.Input placeholder="0" />
                          <NumberField.IncrementButton />
                        </NumberField.Group>
                      </NumberField>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={addIngredient}
              className="flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border/40 px-3 py-2 text-xs text-muted transition-colors hover:border-accent/40 hover:text-accent"
            >
              <Plus className="size-3.5" />
              Añadir ingrediente
            </button>
          </Modal.Body>
          <Modal.Footer className="flex justify-end gap-2">
            <Button variant="tertiary" size="sm" onPress={handleCancel}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onPress={handleSave}>
              Guardar
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

function SortableMealCard({ meal, day, slot, onRemove, onUpdateBulk, onUpdateIngredients }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortDragging,
  } = useSortable({ id: meal.id, data: { day, slot, type: 'meal' } });

  const [editOpen, setEditOpen] = useState(false);
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
                onClick={() => setEditOpen(true)}
                className="cursor-pointer rounded-full p-1.5 text-muted hover:bg-accent/10 hover:text-accent transition-colors"
                aria-label="Editar comida"
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                onClick={() => onRemove(day, slot, meal.id)}
                className="cursor-pointer rounded-full p-1.5 text-muted hover:bg-danger/10 hover:text-danger transition-colors"
                aria-label="Eliminar comida"
              >
                <X className="size-3.5" />
              </button>
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
                {meal.calorias || 0} cal &middot; {meal.proteinas || 0}g prot &middot; {meal.carbohidratos || 0}g carb &middot; {meal.grasas || 0}g gras
              </span>
            </div>
          </div>
        </div>
      </div>
      <EditModal
        meal={meal}
        day={day}
        slot={slot}
        onUpdateBulk={onUpdateBulk}
        onUpdateIngredients={onUpdateIngredients}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
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
              {meal.calorias || 0} cal &middot; {meal.proteinas || 0}g prot &middot; {meal.carbohidratos || 0}g carb &middot; {meal.grasas || 0}g gras
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MealSlot({ day, slot, meals, onAddMeal, onRemoveMeal, onUpdateMealBulk, onUpdateMealIngredients }) {
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
              onRemove={onRemoveMeal}
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

function DayColumn({ day, mealPlan, onAddMeal, onRemoveMeal, onUpdateMealBulk, onUpdateMealIngredients, dailyTotals, target, macros }) {
  const totals = dailyTotals[day];
  const progress = target ? Math.min(Math.round((totals.calorias / target) * 100), 100) : 0;

  return (
    <Card className="min-w-0">
      <Card.Header className="flex flex-col gap-1 pb-2">
        <Card.Title className="text-sm capitalize">{day}</Card.Title>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span>
            {totals.calorias} / {target || '—'} kcal
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
            onAddMeal={onAddMeal}
            onRemoveMeal={onRemoveMeal}
            onUpdateMealBulk={onUpdateMealBulk}
            onUpdateMealIngredients={onUpdateMealIngredients}
          />
        ))}
      </Card.Content>
      <Card.Footer className="flex flex-col gap-1 pt-2 text-xs">
        <div className="flex w-full justify-between">
          <span className="text-muted">Total</span>
          <span className="font-semibold">{totals.calorias} kcal</span>
        </div>
        {macros && (
          <>
            <div className="flex w-full justify-between text-muted">
              <span>Proteínas</span>
              <span>
                {totals.proteinas} / {macros.proteinG}g
              </span>
            </div>
            <div className="flex w-full justify-between text-muted">
              <span>Carbohidratos</span>
              <span>
                {totals.carbohidratos} / {macros.carbG}g
              </span>
            </div>
            <div className="flex w-full justify-between text-muted">
              <span>Grasas</span>
              <span>
                {totals.grasas} / {macros.fatG}g
              </span>
            </div>
          </>
        )}
      </Card.Footer>
    </Card>
  );
}

export function WeeklyMealPlanner({ mealPlan, onAddMeal, onRemoveMeal, onMoveMeal, onUpdateMealBulk, onUpdateMealIngredients, dailyTotals, target, macros }) {
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
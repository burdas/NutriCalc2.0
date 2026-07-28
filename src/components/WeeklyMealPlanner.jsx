import { useState } from 'react';
import { Card, RadioGroup, Radio } from '@heroui/react';

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

function NumberInput({ value, onChange, label }) {
  return (
    <div className="flex items-center gap-0.5">
      <input
        type="number"
        min={0}
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full min-w-0 rounded-md border border-border/40 bg-field px-1 py-0.5 text-xs tabular-nums text-field-foreground outline-none transition-colors focus:border-accent [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="whitespace-nowrap text-[10px] text-muted">{label}</span>
    </div>
  );
}

function MealSlot({ day, slot, meal, onUpdateMeal }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-muted">{SLOT_LABELS[slot]}</span>
      <input
        type="text"
        placeholder="¿Qué comiste?"
        value={meal.nombre}
        onChange={(e) => onUpdateMeal(day, slot, 'nombre', e.target.value)}
        className="w-full rounded-md border border-border/40 bg-field px-2 py-1 text-xs text-field-foreground placeholder:text-muted/50 outline-none transition-colors focus:border-accent"
      />
      <div className="grid grid-cols-4 gap-1">
        <NumberInput
          value={meal.calorias}
          onChange={(v) => onUpdateMeal(day, slot, 'calorias', v)}
          label="cal"
        />
        <NumberInput
          value={meal.proteinas}
          onChange={(v) => onUpdateMeal(day, slot, 'proteinas', v)}
          label="p"
        />
        <NumberInput
          value={meal.carbohidratos}
          onChange={(v) => onUpdateMeal(day, slot, 'carbohidratos', v)}
          label="c"
        />
        <NumberInput
          value={meal.grasas}
          onChange={(v) => onUpdateMeal(day, slot, 'grasas', v)}
          label="g"
        />
      </div>
    </div>
  );
}

function DayColumn({ day, mealPlan, onUpdateMeal, dailyTotals, target, macros }) {
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
      <Card.Content className="flex flex-col gap-3 py-2">
        {MEAL_SLOTS.map((slot) => (
          <MealSlot
            key={slot}
            day={day}
            slot={slot}
            meal={mealPlan[day][slot]}
            onUpdateMeal={onUpdateMeal}
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

export function WeeklyMealPlanner({ mealPlan, onUpdateMeal, dailyTotals, target, macros }) {
  const [selectedDay, setSelectedDay] = useState('lunes');

  return (
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
                onUpdateMeal={onUpdateMeal}
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
          onUpdateMeal={onUpdateMeal}
          dailyTotals={dailyTotals}
          target={target}
          macros={macros}
        />
      </div>
    </section>
  );
}

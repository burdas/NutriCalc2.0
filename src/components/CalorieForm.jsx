import { NumberField, Label, Select, ListBox, RadioGroup, Radio } from '@heroui/react';
import { Mars, Venus } from 'lucide-react';
import { ACTIVITY_OPTIONS, GOAL_OPTIONS } from '../utils/calculations';

export function CalorieForm({ values, onChange }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <NumberField
          value={values.age}
          onChange={(v) => onChange({ ...values, age: v })}
          minValue={10}
          maxValue={120}
          variant="secondary"
        >
          <Label>Edad</Label>
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input placeholder="30" />
            <NumberField.IncrementButton />
          </NumberField.Group>
        </NumberField>
        <NumberField
          value={values.weight}
          onChange={(v) => onChange({ ...values, weight: v })}
          minValue={20}
          maxValue={300}
          step={1}
          variant="secondary"
        >
          <Label>Peso (kg)</Label>
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input placeholder="70" />
            <NumberField.IncrementButton />
          </NumberField.Group>
        </NumberField>
        <NumberField
          value={values.height}
          onChange={(v) => onChange({ ...values, height: v })}
          minValue={100}
          maxValue={250}
          variant="secondary"
        >
          <Label>Altura (cm)</Label>
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input placeholder="175" />
            <NumberField.IncrementButton />
          </NumberField.Group>
        </NumberField>
      </div>

      <RadioGroup
        value={values.sex}
        onChange={(v) => onChange({ ...values, sex: v })}
        variant="secondary"
      >
        <Label className="mb-2">Sexo</Label>
        <div className="radio-pill-group grid w-full grid-cols-2 gap-1 rounded-full bg-surface-secondary p-1.5">
          <Radio value="male" className="flex h-full w-full items-center">
            <Radio.Content className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium text-foreground/60 transition-all data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent-soft-foreground data-[selected=true]:shadow-sm">
              <Mars className="size-4" />
              Hombre
            </Radio.Content>
          </Radio>
          <Radio value="female" className="flex h-full w-full items-center">
            <Radio.Content className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium text-foreground/60 transition-all data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent-soft-foreground data-[selected=true]:shadow-sm">
              <Venus className="size-4" />
              Mujer
            </Radio.Content>
          </Radio>
        </div>
      </RadioGroup>

      <div className="flex flex-col gap-1">
        <Label>Nivel de actividad</Label>
        <Select
          selectedKey={values.activity || null}
          onSelectionChange={(key) => onChange({ ...values, activity: key })}
          placeholder="Selecciona tu nivel"
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {ACTIVITY_OPTIONS.map((opt) => (
                <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
                  <div className="flex flex-col">
                    <span>{opt.label}</span>
                    <span className="text-muted text-xs">{opt.desc}</span>
                  </div>
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label>Objetivo</Label>
        <Select
          selectedKey={values.goal || null}
          onSelectionChange={(key) => onChange({ ...values, goal: key })}
          placeholder="Selecciona tu objetivo"
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {GOAL_OPTIONS.map((opt) => (
                <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
                  <div className="flex flex-col">
                    <span>{opt.label}</span>
                    <span className="text-muted text-xs">{opt.desc}</span>
                  </div>
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>
    </div>
  );
}

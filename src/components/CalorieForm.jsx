import { NumberField, Label, Select, ListBox, RadioGroup, Radio } from '@heroui/react';
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
        orientation="horizontal"
      >
        <Label>Sexo</Label>
        <Radio value="male">
          <Radio.Content>
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            Hombre
          </Radio.Content>
        </Radio>
        <Radio value="female">
          <Radio.Content>
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            Mujer
          </Radio.Content>
        </Radio>
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

import { Input, Label, Select, ListBox, RadioGroup, Radio } from '@heroui/react';
import { ACTIVITY_OPTIONS, GOAL_OPTIONS } from '../utils/calculations';

export function CalorieForm({ values, onChange }) {
  const handleInput = (field) => (e) => {
    onChange({ ...values, [field]: e.target.value === '' ? '' : Number(e.target.value) });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="age">Edad</Label>
          <Input
            id="age"
            type="number"
            min={10}
            max={120}
            placeholder="30"
            value={values.age === '' ? '' : String(values.age)}
            onChange={handleInput('age')}
            variant="secondary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="weight">Peso (kg)</Label>
          <Input
            id="weight"
            type="number"
            min={20}
            max={300}
            step={0.1}
            placeholder="70"
            value={values.weight === '' ? '' : String(values.weight)}
            onChange={handleInput('weight')}
            variant="secondary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="height">Altura (cm)</Label>
          <Input
            id="height"
            type="number"
            min={100}
            max={250}
            placeholder="175"
            value={values.height === '' ? '' : String(values.height)}
            onChange={handleInput('height')}
            variant="secondary"
          />
        </div>
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

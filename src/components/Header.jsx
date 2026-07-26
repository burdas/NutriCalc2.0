import { Button, RadioGroup, Radio } from '@heroui/react';
import { Info, Settings, Sun, Moon } from 'lucide-react';

export function Header({ isDark, onToggleDark, onOpenSettings, onOpenInfo }) {
  return (
    <header className="flex items-center justify-between py-6 animate-[fadeIn_0.6s_ease-out]">
      <div>
        <h1 className="text-2xl font-bold">Calculadora de Calorías</h1>
        <p className="text-muted text-sm">Fórmula Mifflin-St Jeor</p>
      </div>
      <div className="flex items-center gap-2">
        <Button isIconOnly variant="tertiary" onPress={onOpenInfo}>
          <Info />
        </Button>
        <Button isIconOnly variant="tertiary" onPress={onOpenSettings}>
          <Settings />
        </Button>
        <RadioGroup
        value={isDark ? 'dark' : 'light'}
        onChange={(v) => {
          if ((v === 'dark') !== isDark) onToggleDark();
        }}
        aria-label="modo oscuro"
      >
        <div className="radio-pill-group grid grid-cols-2 gap-1 rounded-full bg-surface p-1">
          <Radio value="light" className="flex h-full w-full items-center">
            <Radio.Content className="flex w-full cursor-pointer items-center justify-center rounded-full p-2 text-sm font-medium text-foreground/60 transition-all aspect-square data-[selected=true]:bg-surface-secondary data-[selected=true]:text-foreground data-[selected=true]:shadow-sm">
              <Sun className="size-4" />
            </Radio.Content>
          </Radio>
          <Radio value="dark" className="flex h-full w-full items-center">
            <Radio.Content className="flex w-full cursor-pointer items-center justify-center rounded-full p-2 text-sm font-medium text-foreground/60 transition-all aspect-square data-[selected=true]:bg-surface-secondary data-[selected=true]:text-foreground data-[selected=true]:shadow-sm">
              <Moon className="size-4" />
            </Radio.Content>
          </Radio>
        </div>
      </RadioGroup>
      </div>
    </header>
  );
}

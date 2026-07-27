import { useMemo, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Target, Calendar, AlertTriangle } from 'lucide-react';

const CALORIES_PER_KG = 7700;

function generateData(currentWeight, targetWeight, dailyAdjustment) {
  const diff = targetWeight - currentWeight;
  const totalCalories = Math.abs(diff) * CALORIES_PER_KG;
  const daysNeeded = Math.ceil(totalCalories / Math.abs(dailyAdjustment));

  const maxPoints = 60;
  const step = daysNeeded > maxPoints ? Math.ceil(daysNeeded / maxPoints) : 1;

  const data = [];
  for (let day = 0; day <= daysNeeded; day += step) {
    const progress = day / daysNeeded;
    const weight = currentWeight + diff * progress;
    const date = new Date(Date.now() + day * 86400000);
    data.push({
      day,
      weight: Math.round(weight * 10) / 10,
      dateLabel: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      fullDate: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
    });
  }

  const last = data[data.length - 1];
  if (last.weight !== targetWeight) {
    const targetDate = new Date(Date.now() + daysNeeded * 86400000);
    data.push({
      day: daysNeeded,
      weight: targetWeight,
      dateLabel: targetDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      fullDate: targetDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
    });
  }

  return { data, daysNeeded };
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg bg-[var(--background)] px-3 py-2 text-sm shadow-lg ring-1 ring-[var(--foreground)]/10">
      <p className="font-bold tabular-nums">{d.weight} kg</p>
      <p className="text-muted text-xs">{d.fullDate}</p>
    </div>
  );
}

export function WeightProjection({ currentWeight, goal, goalAdjustment, targetWeight }) {
  const chartRef = useRef(null);

  const result = useMemo(() => {
    if (!currentWeight || targetWeight === undefined || targetWeight === null) return {};

    if (goalAdjustment === 0 || goal === 'maintain') {
      return { warning: 'maintain' };
    }

    const diff = targetWeight - currentWeight;

    if (Math.abs(diff) < 0.1) {
      return { warning: 'same' };
    }

    if (goal === 'lose' && diff > 0) {
      return { warning: 'lose' };
    }
    if (goal === 'gain' && diff < 0) {
      return { warning: 'gain' };
    }

    return { projection: generateData(currentWeight, targetWeight, goalAdjustment) };
  }, [currentWeight, targetWeight, goalAdjustment, goal]);

  useEffect(() => {
    const container = chartRef.current;
    if (!container) return;

    const timer = setTimeout(() => {
      const path = container.querySelector('.recharts-line-curve');
      if (!path) return;

      const length = path.getTotalLength();
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;

      requestAnimationFrame(() => {
        path.style.transition = 'stroke-dashoffset 2s ease-in-out';
        path.style.strokeDashoffset = '0';
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [result.projection?.data]);

  if (targetWeight === undefined || targetWeight === null) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-surface-secondary p-4 text-sm text-[var(--foreground)]/60">
        <Target className="size-5 shrink-0" />
        <span>Ingresa tu peso objetivo para ver la proyección</span>
      </div>
    );
  }

  if (result.warning === 'maintain') {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-surface-secondary p-4 text-sm">
        <AlertTriangle className="size-5 shrink-0 text-warning" />
        <span>Tu objetivo actual es "mantener peso", no hay ajuste calórico para proyectar cambios.</span>
      </div>
    );
  }

  if (result.warning === 'lose') {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-warning/10 p-4 text-sm">
        <AlertTriangle className="size-5 shrink-0 text-warning" />
        <span>
          Tu objetivo es <strong>perder peso</strong>, pero tu peso objetivo es mayor al actual. ¿Seguro que es correcto?
        </span>
      </div>
    );
  }

  if (result.warning === 'gain') {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-warning/10 p-4 text-sm">
        <AlertTriangle className="size-5 shrink-0 text-warning" />
        <span>
          Tu objetivo es <strong>ganar músculo</strong>, pero tu peso objetivo es menor al actual. ¿Seguro que es correcto?
        </span>
      </div>
    );
  }

  if (result.warning === 'same') {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-surface-secondary p-4 text-sm">
        <Target className="size-5 shrink-0 text-success" />
        <span>¡Ya has alcanzado tu peso objetivo!</span>
      </div>
    );
  }

  if (result.projection) {
    return (
      <div ref={chartRef} className="relative h-72 w-full">
        <div className={`absolute top-8 z-10 flex items-center gap-2 rounded-xl bg-[var(--background)]/90 px-4 py-2 shadow-sm ring-1 ring-[var(--foreground)]/10 backdrop-blur-sm ${goal === 'gain' ? 'left-14' : 'right-14'}`}>
          <Calendar className="size-4 text-[var(--foreground)]/70" />
          <span className="text-sm font-semibold tabular-nums">
            {result.projection.daysNeeded} días (
            {new Date(Date.now() + result.projection.daysNeeded * 86400000)
              .toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            )
          </span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={result.projection.data} margin={{ top: 20, right: 48, left: 3, bottom: 10 }}>
            <CartesianGrid stroke="var(--foreground)" strokeOpacity={0.08} strokeDasharray="3 3" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 12, fill: 'var(--foreground)', fillOpacity: 0.6 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={50}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fontSize: 12, fill: 'var(--foreground)', fillOpacity: 0.6 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}`}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: '#3b82f6' }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
}

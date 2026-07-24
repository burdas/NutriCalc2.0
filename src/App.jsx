import { useState, useMemo } from 'react';
import { Card } from '@heroui/react';
import { Header } from './components/Header';
import { CalorieForm } from './components/CalorieForm';
import { CalorieResults } from './components/CalorieResults';
import { useDarkMode } from './hooks/useDarkMode';
import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacros,
} from './utils/calculations';

const DEFAULT_VALUES = {
  age: '',
  weight: '',
  height: '',
  sex: 'male',
  activity: '',
  goal: '',
};

function App() {
  const { isDark, toggle: toggleDark } = useDarkMode();
  const [values, setValues] = useState(DEFAULT_VALUES);

  const results = useMemo(() => {
    const { age, weight, height, sex, activity, goal } = values;
    if (!age || !weight || !height || !activity || !goal) return null;

    const bmr = Math.round(calculateBMR(weight, height, age, sex));
    const tdee = calculateTDEE(bmr, activity);
    const targetCalories = calculateTargetCalories(tdee, goal);
    const macros = calculateMacros(targetCalories, weight);

    return { bmr, tdee, targetCalories, macros };
  }, [values]);

  return (
    <div className="mx-auto max-w-2xl px-4">
      <Header isDark={isDark} onToggleDark={toggleDark} />

      <main className="flex flex-col gap-8 pb-12">
        <Card>
          <Card.Header>
            <Card.Title>Tus datos</Card.Title>
            <Card.Description>
              Completa los campos para calcular tus calorías diarias
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <CalorieForm values={values} onChange={setValues} />
          </Card.Content>
        </Card>

        {results && <CalorieResults {...results} />}
      </main>
    </div>
  );
}

export default App;

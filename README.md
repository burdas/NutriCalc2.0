# NutriCalc 2.0 — Calculadora de Calorías

Calcula tus necesidades calóricas diarias y distribución de macronutrientes usando la fórmula **Mifflin-St Jeor**. Incluye proyección de peso a lo largo del tiempo con gráficos interactivos.

## Funcionalidades

- **Cálculo de calorías**: BMR, TDEE y calorías objetivo ajustadas por meta (perder peso, mantener, ganar músculo)
- **Macronutrientes**: distribución visual con gráfico de donut y desglose en gramos y porcentajes
- **Proyección de peso**: gráfico de línea que estima el peso a futuro según el déficit/superávit diario
- **Panel de configuración**: ajuste manual de déficit/superávit y perfiles de macros (Balanceado, Alta Proteína, Baja en Carbos, Keto, Personalizado)
- **Modo oscuro**: alternancia entre tema claro/oscuro con persistencia en `localStorage`
- **Persistencia de datos**: formulario, peso objetivo y configuración se guardan automáticamente

## Stack

| Tecnología | Versión |
|---|---|
| React | 19 |
| Vite | 8 |
| HeroUI | 3 |
| Tailwind CSS | 4 |
| Recharts | 3 |
| Lucide React | 1 |

## Scripts

```bash
npm run dev      # Inicia servidor de desarrollo
npm run build    # Compila para producción
npm run preview  # Previsualiza build de producción
npm run lint     # Ejecuta Oxlint
```

import clsx from "clsx";
import { WeatherConditionKey } from "../types/weather";
import { conditionDisplay } from "../constants/conditions";

interface ConditionTogglesProps {
  selected: WeatherConditionKey[];
  onChange: (next: WeatherConditionKey[]) => void;
}

const CONDITIONS: WeatherConditionKey[] = [
  "very_hot",
  "very_cold",
  "very_wet",
  "very_windy",
  "very_uncomfortable"
];

export const ConditionToggles = ({ selected, onChange }: ConditionTogglesProps) => {
  const toggleCondition = (condition: WeatherConditionKey) => {
    const isSelected = selected.includes(condition);
    const next = isSelected
      ? selected.filter((c) => c !== condition)
      : [...selected, condition];
    onChange(next);
  };

  return (
    <fieldset className="space-y-3">
      <legend className="text-lg font-semibold text-slate-800">Weather risks</legend>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {CONDITIONS.map((condition) => {
          const isActive = selected.includes(condition);
          const meta = conditionDisplay(condition);
          return (
            <label
              key={condition}
              className={clsx(
                "relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl border px-3 py-2 text-sm shadow-sm transition",
                "hover:shadow-md focus-within:ring-2 focus-within:ring-brand-light",
                isActive
                  ? [
                      "border-transparent text-slate-900",
                      "bg-gradient-to-br", // gradient using meta classes
                      meta.gradient
                    ]
                  : [
                      "bg-white/90",
                      "border-slate-200/80",
                      "hover:border-brand-light"
                    ]
              )}
            >
              <span
                aria-hidden
                className={clsx(
                  "flex h-8 w-8 items-center justify-center rounded-full text-base",
                  isActive ? "bg-white/80" : meta.softBg,
                  isActive ? "shadow" : "shadow-inner",
                  meta.text
                )}
              >
                {meta.icon}
              </span>
              <input
                type="checkbox"
                className="sr-only"
                checked={isActive}
                onChange={() => toggleCondition(condition)}
              />
              <span className="font-medium text-slate-700">
                {meta.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};

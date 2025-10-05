import clsx from "clsx";

interface RiskGaugeProps {
  value: number;
  strokeClass: string;
  label: string;
}

export const RiskGauge = ({ value, strokeClass, label }: RiskGaugeProps) => {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clamped / 100);

  return (
    <figure className="relative flex h-28 w-28 items-center justify-center">
      <svg
        className="h-full w-full"
        viewBox="0 0 120 120"
        role="img"
        aria-label={`${label} historical likelihood ${clamped}%`}
      >
        <circle
          className="fill-none stroke-slate-200"
          strokeWidth={14}
          cx={60}
          cy={60}
          r={radius}
        />
        <circle
          className={clsx(
            "fill-none stroke-linecap-round transition-[stroke-dashoffset] duration-700 ease-out",
            strokeClass
          )}
          strokeWidth={14}
          cx={60}
          cy={60}
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <figcaption className="pointer-events-none absolute text-center">
        <span className="block text-lg font-semibold text-slate-800">{clamped}%</span>
        <span className="block text-[11px] font-medium uppercase tracking-wide text-slate-500">historical odds</span>
      </figcaption>
    </figure>
  );
};

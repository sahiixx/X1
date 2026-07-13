import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';

interface StatCounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  format?: "number" | "percent";
}

export function StatCounter({ end, suffix = "", prefix = "", format = "number" }: StatCounterProps) {
  const { count, ref } = useAnimatedCounter(end);

  const displayCount = format === "percent" ? (count / 10).toFixed(1) : count.toLocaleString();

  return (
    <div ref={ref} className="inline-block">
      {prefix}{displayCount}{suffix}
    </div>
  );
}

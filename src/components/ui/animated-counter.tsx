"use client";

import { useState, useEffect } from "react";

export function useCounter(target: number, duration = 1600, delay = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number | null = null;
    let raf: number;
    const timer = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));
        if (progress < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, delay]);
  return count;
}

export function AnimatedStats() {
  const semesters = useCounter(6, 1400, 200);
  const statuses = useCounter(3, 1000, 500);
  const percent = useCounter(100, 1800, 300);

  const stats = [
    { value: semesters, suffix: "", label: "Semesters Tracked" },
    { value: statuses, suffix: "", label: "Progress Statuses" },
    { value: percent, suffix: "%", label: "Data Driven" },
  ];

  return (
    <div className="flex gap-13 flex-wrap">
      {stats.map(({ value, suffix, label }) => (
        <div key={label}>
          <div className="text-white text-[40px] font-black tracking-tight leading-none tabular-nums min-w-[72px]">
            {value}
            {suffix}
          </div>
          <div className="text-white/55 text-sm mt-1">{label}</div>
        </div>
      ))}
    </div>
  );
}

import { ArrowUp, Minus, ArrowDown } from "lucide-react";

const map = {
  improving: {
    label: "Improving",
    className: "text-green-900 bg-green-100",
    icon: <ArrowUp size={13} />,
  },
  stable: {
    label: "Stable",
    className: "text-amber-700 bg-amber-50",
    icon: <Minus size={13} />,
  },
  declining: {
    label: "Declining",
    className: "text-red-700 bg-red-50",
    icon: <ArrowDown size={13} />,
  },
};

export function StatusBadge({
  status,
}: {
  status: "improving" | "stable" | "declining";
}) {
  const s = map[status] || map.stable;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${s.className}`}
    >
      {s.icon} {s.label}
    </span>
  );
}

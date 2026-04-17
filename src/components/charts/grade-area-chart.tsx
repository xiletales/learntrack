"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Grade } from "@/lib/types";

export function GradeAreaChart({ grades }: { grades: Grade[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={grades}>
        <defs>
          <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2d7a35" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#2d7a35" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#cde5d2" />
        <XAxis dataKey="semester" tick={{ fontSize: 10 }} />
        <YAxis domain={[40, 100]} tick={{ fontSize: 10 }} />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="avg"
          stroke="#2d7a35"
          strokeWidth={2.5}
          fill="url(#colorAvg)"
          dot={{ r: 4, fill: "#2d7a35" }}
          name="Average"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

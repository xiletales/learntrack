"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import type { StudentWithData } from "@/lib/types";
import { semesterOptions } from "@/lib/constants";

const COLORS = ["#2d7a35", "#2196f3", "#e91e63", "#ff9800", "#9c27b0", "#00bcd4", "#795548"];

export function ClassAvgChart({ students }: { students: StudentWithData[] }) {
  const chartData = semesterOptions.map((sem) => {
    const row: Record<string, string | number> = { semester: sem };
    for (const s of students) {
      const grade = s.grades.find((g) => g.semester === sem);
      if (grade) row[s.name] = Number(grade.avg.toFixed(1));
    }
    return row;
  }).filter((row) => Object.keys(row).length > 1);

  if (chartData.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#cde5d2" />
        <XAxis dataKey="semester" tick={{ fontSize: 9 }} />
        <YAxis domain={[40, 100]} tick={{ fontSize: 10 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {students.map((s, i) => (
          <Line
            key={s.id}
            type="monotone"
            dataKey={s.name}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

"use client";

import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import type { Grade } from "@/lib/types";
import { SUBJECT_KEYS, SUBJECT_LABELS } from "@/lib/types";

const SUBJECT_COLORS: Record<string, string> = {
  matematika_umum: "#2d7a2f",
  matematika_peminatan: "#1b5e20",
  bahasa_indonesia: "#43a047",
  bahasa_inggris: "#66bb6a",
  fisika: "#2196f3",
  kimia: "#9c27b0",
  biologi: "#e91e63",
  sejarah: "#ff9800",
  informatika: "#00bcd4",
  pai: "#795548",
  pjok: "#607d8b",
};

type ViewKey = "avg" | typeof SUBJECT_KEYS[number];

const viewOptions: { key: ViewKey; label: string }[] = [
  { key: "avg", label: "Average" },
  ...SUBJECT_KEYS.map((k) => ({ key: k as ViewKey, label: SUBJECT_LABELS[k] })),
];

export function GradeLineChart({ grades }: { grades: Grade[] }) {
  const [view, setView] = useState<ViewKey>("avg");

  return (
    <div>
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {viewOptions.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`px-3 py-1.5 rounded-full border-[1.5px] text-xs font-semibold cursor-pointer transition-all ${
              view === v.key
                ? "border-green-700 bg-green-700 text-white"
                : "border-emerald-200 bg-white text-gray-500"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={grades}>
          <CartesianGrid strokeDasharray="3 3" stroke="#cde5d2" />
          <XAxis dataKey="semester" tick={{ fontSize: 10 }} />
          <YAxis domain={[40, 100]} tick={{ fontSize: 10 }} />
          <Tooltip />
          <Legend />
          {view === "avg" ? (
            <Line type="monotone" dataKey="avg" stroke="#2d7a35" strokeWidth={3} dot={{ r: 5, fill: "#2d7a35" }} name="Average" />
          ) : (
            <Line type="monotone" dataKey={view} stroke={SUBJECT_COLORS[view] || "#5aad6a"} strokeWidth={3} dot={{ r: 5, fill: SUBJECT_COLORS[view] || "#5aad6a" }} name={SUBJECT_LABELS[view as typeof SUBJECT_KEYS[number]]} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AllSubjectsChart({ grades }: { grades: Grade[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={grades}>
        <CartesianGrid strokeDasharray="3 3" stroke="#cde5d2" />
        <XAxis dataKey="semester" tick={{ fontSize: 9 }} />
        <YAxis domain={[40, 100]} tick={{ fontSize: 10 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {SUBJECT_KEYS.map((key) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={SUBJECT_COLORS[key]}
            strokeWidth={1.5}
            dot={{ r: 2 }}
            name={SUBJECT_LABELS[key]}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

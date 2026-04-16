"use client";

import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { BarChart2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatus } from "@/lib/utils";
import { SUBJECT_KEYS, SUBJECT_LABELS } from "@/lib/types";
import type { StudentWithData } from "@/lib/types";

const COLORS = [
  "#2d7a2f", "#1b5e20", "#43a047", "#66bb6a", "#2196f3",
  "#9c27b0", "#e91e63", "#ff9800", "#00bcd4", "#795548", "#607d8b",
];

export function TeacherProgressChart({ students }: { students: StudentWithData[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const student = selected ? students.find((s) => s.id === selected) : null;

  return (
    <div>
      <div className="flex gap-2.5 flex-wrap mb-6">
        {students.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelected(selected === s.id ? null : s.id)}
            className={`px-4 py-2 rounded-[10px] border-[1.5px] text-[13px] font-semibold cursor-pointer transition-all ${
              selected === s.id
                ? "border-green-700 bg-green-700 text-white"
                : "border-emerald-200 bg-white text-gray-800"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>
      {student ? (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3.5 p-4 bg-green-50 rounded-xl">
            <div className="w-[46px] h-[46px] rounded-full bg-green-700 text-white flex items-center justify-center font-bold text-lg">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="text-[17px] font-bold text-gray-800">{student.name}</div>
              <div className="text-[13px] text-gray-500">
                Class {student.class} &bull; {student.school_year}
              </div>
            </div>
            <StatusBadge status={getStatus(student.grades)} />
          </div>
          <Card>
            <h3 className="text-[15px] font-bold text-gray-800 mb-4">
              Grade Progress &mdash; {student.name}
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={student.grades}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cde5d2" />
                <XAxis dataKey="semester" tick={{ fontSize: 9 }} />
                <YAxis domain={[40, 100]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="avg" stroke="#000" strokeWidth={2.5} dot={{ r: 4 }} name="Rata-rata" />
                {SUBJECT_KEYS.map((key, i) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={COLORS[i]}
                    strokeWidth={1.2}
                    dot={{ r: 2 }}
                    name={SUBJECT_LABELS[key]}
                    strokeDasharray="4 2"
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      ) : (
        <Card className="text-center py-12">
          <BarChart2 size={48} className="text-emerald-200 mx-auto mb-3.5" />
          <p className="text-gray-500">Select a student above to view their progress chart.</p>
        </Card>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar,
} from "recharts";
import { ChevronDown, BarChart2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { getStatus } from "@/lib/utils";
import { SUBJECT_KEYS, SUBJECT_LABELS } from "@/lib/types";
import type { StudentWithData } from "@/lib/types";

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

export function StudentDataClient({ students }: { students: StudentWithData[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showChart, setShowChart] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
    if (expanded === id) setShowChart(null);
  };

  const toggleChart = (id: string) => setShowChart((prev) => (prev === id ? null : id));

  return (
    <div>
      <h1 className="text-[26px] font-extrabold text-green-900 mb-1.5">Student Data</h1>
      <p className="text-gray-500 mb-6">Click on a student to see their grades and charts.</p>

      <div className="flex flex-col gap-2">
        {students.map((s) => {
          const isOpen = expanded === s.id;
          const chartOpen = showChart === s.id;
          const status = getStatus(s.grades);

          const subjectBarData = s.grades.length > 0
            ? SUBJECT_KEYS.map((key) => ({
                subject: SUBJECT_LABELS[key],
                value: s.grades[s.grades.length - 1][key],
              }))
            : [];

          return (
            <Card
              key={s.id}
              className={`transition-all ${isOpen ? "border-green-700 border-2" : ""}`}
            >
              {/* Header row — just name */}
              <div
                className="flex items-center gap-3.5 cursor-pointer"
                onClick={() => toggle(s.id)}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-700 to-emerald-500 text-white flex items-center justify-center font-bold text-base shrink-0">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-[15px] font-bold text-gray-800">{s.name}</div>
                  <div className="text-[11px] text-gray-500">
                    NIS: {s.nis} &bull; {s.grade} {s.major} {s.class_number}
                  </div>
                </div>
                <StatusBadge status={status} />
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform duration-200 ml-1 ${isOpen ? "rotate-180" : ""}`}
                />
              </div>

              {/* Expanded detail */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-emerald-200">
                      {/* Per-semester detail */}
                      <h4 className="text-sm font-bold text-gray-800 mb-3">Grades Per Semester</h4>
                      {s.grades.length === 0 ? (
                        <p className="text-gray-500 text-sm py-4 text-center">No grade data yet.</p>
                      ) : (
                        <div className="flex flex-col gap-2.5 mb-4">
                          {s.grades.map((g, idx) => (
                            <div
                              key={g.semester}
                              className="p-3 bg-green-50/50 rounded-lg border border-emerald-100"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-md bg-green-100 flex items-center justify-center text-[10px] font-bold text-green-700">
                                    {idx + 1}
                                  </span>
                                  <span className="bg-green-100 text-green-900 px-2.5 py-0.5 rounded-full text-xs font-bold">
                                    {g.semester}
                                  </span>
                                </div>
                                <span className="text-sm font-bold text-green-700">
                                  Average: {g.avg.toFixed(1)}
                                </span>
                              </div>
                              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5">
                                {SUBJECT_KEYS.map((key) => (
                                  <div key={key} className="text-center p-1.5 bg-white rounded border border-emerald-50">
                                    <div className="text-sm font-bold text-gray-800">{g[key]}</div>
                                    <div className="text-[8px] text-gray-500 leading-tight">{SUBJECT_LABELS[key]}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Chart toggle */}
                      {s.grades.length > 0 && (
                        <Button
                          variant={chartOpen ? "primary" : "outline"}
                          onClick={() => toggleChart(s.id)}
                          className="mb-4"
                        >
                          <BarChart2 size={14} />
                          {chartOpen ? "Hide Charts" : "Show Charts"}
                        </Button>
                      )}

                      <AnimatePresence>
                        {chartOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            {/* Grade trend chart */}
                            <div className="mb-5">
                              <h4 className="text-sm font-bold text-gray-800 mb-3">Average Grade Per Semester</h4>
                              <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={s.grades}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#cde5d2" />
                                  <XAxis dataKey="semester" tick={{ fontSize: 9 }} />
                                  <YAxis domain={[40, 100]} tick={{ fontSize: 10 }} />
                                  <Tooltip />
                                  <Line type="monotone" dataKey="avg" stroke="#2d7a35" strokeWidth={3} dot={{ r: 5, fill: "#2d7a35" }} name="Average" />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>

                            {/* Subject chart */}
                            <div className="mb-2">
                              <h4 className="text-sm font-bold text-gray-800 mb-3">Subject Chart (All Semesters)</h4>
                              <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={s.grades}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#cde5d2" />
                                  <XAxis dataKey="semester" tick={{ fontSize: 8 }} />
                                  <YAxis domain={[40, 100]} tick={{ fontSize: 10 }} />
                                  <Tooltip />
                                  <Legend wrapperStyle={{ fontSize: 10 }} />
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
                            </div>

                            {/* Subject bar chart — last semester */}
                            <div>
                              <h4 className="text-sm font-bold text-gray-800 mb-3">Latest Semester Grades</h4>
                              <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={subjectBarData} layout="vertical">
                                  <CartesianGrid strokeDasharray="3 3" stroke="#cde5d2" />
                                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                                  <YAxis type="category" dataKey="subject" tick={{ fontSize: 9 }} width={80} />
                                  <Tooltip />
                                  <Bar dataKey="value" fill="#2d7a35" radius={[0, 4, 4, 0]} name="Grade" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
        {students.length === 0 && (
          <Card className="text-center py-12">
            <p className="text-gray-500">No students found for your class.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

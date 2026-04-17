"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { Users, TrendingUp, Activity, AlertCircle, ChevronRight, ChevronDown, Eye } from "lucide-react";
import { Card, StatCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatus } from "@/lib/utils";
import { SUBJECT_KEYS, SUBJECT_LABELS } from "@/lib/types";
import { semesterOptions, majorOptions, gradeOptions, classNumberOptions } from "@/lib/constants";
import type { StudentWithData } from "@/lib/types";

const STUDENT_COLORS = ["#2d7a35", "#2196f3", "#e91e63", "#ff9800", "#9c27b0", "#00bcd4", "#795548"];
const SUBJECT_COLORS: Record<string, string> = {
  matematika_umum: "#2d7a2f", matematika_peminatan: "#1b5e20",
  bahasa_indonesia: "#43a047", bahasa_inggris: "#66bb6a",
  fisika: "#2196f3", kimia: "#9c27b0", biologi: "#e91e63",
  sejarah: "#ff9800", informatika: "#00bcd4", pai: "#795548", pjok: "#607d8b",
};

type StatusFilter = "all" | "improving" | "stable" | "declining";

interface Props {
  teacherName: string;
  students: StudentWithData[];
  defaultMajor: string;
  defaultGrade: string;
  defaultClass: string;
}

export function TeacherDashboardClient({ teacherName, students: allStudents, defaultMajor, defaultGrade, defaultClass }: Props) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showWho, setShowWho] = useState<StatusFilter | null>(null);
  const [showSemesterDetail, setShowSemesterDetail] = useState(false);

  const [filterMajor, setFilterMajor] = useState(defaultMajor);
  const [filterGrade, setFilterGrade] = useState(defaultGrade);
  const [filterClass, setFilterClass] = useState(defaultClass);

  const students = allStudents.filter((s) => {
    if (filterMajor && s.major !== filterMajor) return false;
    if (filterGrade && s.grade !== filterGrade) return false;
    if (filterClass && s.class_number !== filterClass) return false;
    return true;
  });

  const classLabel = [filterGrade, filterMajor, filterClass].filter(Boolean).join(" ") || "All Classes";

  const improving = students.filter((s) => getStatus(s.grades) === "improving");
  const stable = students.filter((s) => getStatus(s.grades) === "stable");
  const declining = students.filter((s) => getStatus(s.grades) === "declining");

  const filtered = statusFilter === "all"
    ? students
    : students.filter((s) => getStatus(s.grades) === statusFilter);

  const handleStatClick = (status: StatusFilter) => {
    if (status === "all") {
      setStatusFilter("all");
      setShowWho(null);
    } else {
      setStatusFilter(status);
      setShowWho((prev) => (prev === status ? null : status));
    }
  };

  // Class average per semester
  const classTrendData = semesterOptions.map((sem) => {
    const avgs = students
      .map((s) => s.grades.find((g) => g.semester === sem)?.avg)
      .filter((v): v is number => v !== undefined);
    return {
      semester: sem,
      avg: avgs.length > 0 ? Number((avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(1)) : null,
    };
  }).filter((d) => d.avg !== null);

  const currentClassAvg = classTrendData.length > 0 ? classTrendData[classTrendData.length - 1]?.avg : null;

  // Per-student trend
  const studentTrendData = semesterOptions.map((sem) => {
    const row: Record<string, string | number> = { semester: sem };
    for (const s of students) {
      const grade = s.grades.find((g) => g.semester === sem);
      if (grade) row[s.name] = Number(grade.avg.toFixed(1));
    }
    return row;
  }).filter((row) => Object.keys(row).length > 1);

  // Class average per subject per semester (for subject line chart)
  const subjectTrendData = semesterOptions.map((sem) => {
    const row: Record<string, string | number> = { semester: sem };
    for (const key of SUBJECT_KEYS) {
      const vals = students
        .map((s) => s.grades.find((g) => g.semester === sem)?.[key])
        .filter((v): v is number => v !== undefined && v > 0);
      if (vals.length > 0) {
        row[key] = Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1));
      }
    }
    return row;
  }).filter((row) => Object.keys(row).length > 1);

  // Per-semester detail data
  const semesterDetailData = semesterOptions.map((sem) => {
    const gradeEntries = students
      .map((s) => s.grades.find((g) => g.semester === sem))
      .filter(Boolean);
    if (gradeEntries.length === 0) return null;

    const subjectAvgs: Record<string, number> = {};
    for (const key of SUBJECT_KEYS) {
      const vals = gradeEntries.map((g) => g![key as keyof typeof g] as number).filter((v) => v > 0);
      subjectAvgs[key] = vals.length > 0 ? Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : 0;
    }
    const totalAvg = gradeEntries.length > 0
      ? Number((gradeEntries.reduce((sum, g) => sum + g!.avg, 0) / gradeEntries.length).toFixed(1))
      : 0;

    return { semester: sem, avg: totalAvg, subjects: subjectAvgs };
  }).filter(Boolean);

  const whoList = showWho === "improving" ? improving : showWho === "stable" ? stable : showWho === "declining" ? declining : [];
  const whoLabel = showWho === "improving" ? "Improving" : showWho === "stable" ? "Stable" : showWho === "declining" ? "Needs Attention" : "";

  return (
    <div>
      <h1 className="text-[26px] font-extrabold text-green-900 mb-1.5">Teacher Dashboard</h1>
      <p className="text-gray-500 mb-4">
        Welcome, {teacherName.split(",")[0]}! {classLabel} overview.
      </p>

      {/* Class filter dropdowns */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={filterMajor}
          onChange={(e) => setFilterMajor(e.target.value)}
          className="px-3 py-2 rounded-lg border-[1.5px] border-emerald-200 text-sm bg-white text-gray-800 outline-none focus:border-green-600"
        >
          <option value="">All Majors</option>
          {majorOptions.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <select
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
          className="px-3 py-2 rounded-lg border-[1.5px] border-emerald-200 text-sm bg-white text-gray-800 outline-none focus:border-green-600"
        >
          <option value="">All Grades</option>
          {gradeOptions.map((o) => <option key={o} value={o}>Grade {o}</option>)}
        </select>
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="px-3 py-2 rounded-lg border-[1.5px] border-emerald-200 text-sm bg-white text-gray-800 outline-none focus:border-green-600"
        >
          <option value="">All Classes</option>
          {classNumberOptions.map((o) => <option key={o} value={o}>Class {o}</option>)}
        </select>
        {(filterMajor || filterGrade || filterClass) && (
          <button
            onClick={() => { setFilterMajor(""); setFilterGrade(""); setFilterClass(""); }}
            className="text-xs text-gray-500 bg-transparent border-none cursor-pointer hover:underline self-center"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
        <div onClick={() => handleStatClick("all")} className="cursor-pointer">
          <StatCard icon={<Users size={22} />} label="Total Students" value={students.length} />
        </div>
        <div onClick={() => handleStatClick("improving")} className="cursor-pointer">
          <div className="bg-white rounded-[14px] border border-emerald-200 px-5 py-4 flex items-center gap-3.5">
            <div className="w-[46px] h-[46px] rounded-xl bg-green-50 flex items-center justify-center text-green-700">
              <TrendingUp size={22} />
            </div>
            <div>
              <div className="text-[22px] font-bold text-green-700">{improving.length}</div>
              <div className="text-xs text-gray-500">Improving</div>
              <div className="text-[10px] text-green-600 mt-0.5 italic">tap to see who</div>
            </div>
          </div>
        </div>
        <div onClick={() => handleStatClick("stable")} className="cursor-pointer">
          <div className="bg-white rounded-[14px] border border-emerald-200 px-5 py-4 flex items-center gap-3.5">
            <div className="w-[46px] h-[46px] rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Activity size={22} />
            </div>
            <div>
              <div className="text-[22px] font-bold text-blue-600">{stable.length}</div>
              <div className="text-xs text-blue-600 font-medium">Stable</div>
              <div className="text-[10px] text-blue-400 mt-0.5 italic">tap to see who</div>
            </div>
          </div>
        </div>
        <div onClick={() => handleStatClick("declining")} className="cursor-pointer">
          <div className="bg-white rounded-[14px] border border-emerald-200 px-5 py-4 flex items-center gap-3.5">
            <div className="w-[46px] h-[46px] rounded-xl bg-red-50 flex items-center justify-center text-red-500">
              <AlertCircle size={22} />
            </div>
            <div>
              <div className="text-[22px] font-bold text-red-500">{declining.length}</div>
              <div className="text-xs text-red-500 font-medium">Needs Attention</div>
              <div className="text-[10px] text-red-400 mt-0.5 italic">tap to see who</div>
            </div>
          </div>
        </div>
      </div>

      {/* "Who" panel */}
      <AnimatePresence>
        {showWho && whoList.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-5"
          >
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-gray-800">
                  Students — {whoLabel} ({whoList.length})
                </h4>
                <button
                  onClick={() => { setShowWho(null); setStatusFilter("all"); }}
                  className="text-xs text-gray-500 bg-transparent border-none cursor-pointer hover:underline"
                >
                  Close
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {whoList.map((s) => {
                  const last = s.grades[s.grades.length - 1];
                  return (
                    <div key={s.id} className="flex items-center gap-3 px-3 py-2 bg-green-50/50 rounded-lg border border-emerald-100">
                      <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {s.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-800">{s.name}</div>
                        <div className="text-[11px] text-gray-500">{s.grade} {s.major} {s.class_number}</div>
                      </div>
                      <div className="text-base font-bold text-green-700">{last?.avg?.toFixed(1) || "—"}</div>
                      <StatusBadge status={getStatus(s.grades)} />
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Semester trend with Show Detail */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">Grade Trend Per Student</h3>
            <button
              onClick={() => setShowSemesterDetail(!showSemesterDetail)}
              className="inline-flex items-center gap-1 text-xs text-green-700 font-semibold bg-transparent border-none cursor-pointer hover:underline"
            >
              <Eye size={12} /> {showSemesterDetail ? "Hide Detail" : "Show Detail"}
            </button>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={studentTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cde5d2" />
              <XAxis dataKey="semester" tick={{ fontSize: 9 }} />
              <YAxis domain={[40, 100]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {students.map((s, i) => (
                <Line key={s.id} type="monotone" dataKey={s.name} stroke={STUDENT_COLORS[i % STUDENT_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>

          <AnimatePresence>
            {showSemesterDetail && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-emerald-200 flex flex-col gap-2.5">
                  {semesterDetailData.map((d) => d && (
                    <div key={d.semester} className="p-3 bg-green-50/40 rounded-lg border border-emerald-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-green-100 text-green-900 px-2 py-0.5 rounded-full text-[10px] font-bold">{d.semester}</span>
                        <span className="text-xs font-bold text-green-700">Avg: {d.avg}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {SUBJECT_KEYS.map((key) => (
                          <div key={key} className="text-center p-1 bg-white rounded">
                            <div className="text-xs font-bold text-gray-800">{d.subjects[key] || "—"}</div>
                            <div className="text-[7px] text-gray-500">{SUBJECT_LABELS[key]}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Subject trend chart (like student progress) */}
        <Card>
          <h3 className="text-sm font-bold text-gray-800 mb-4">Subject Chart (Class Average)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={subjectTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cde5d2" />
              <XAxis dataKey="semester" tick={{ fontSize: 9 }} />
              <YAxis domain={[40, 100]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 9 }} />
              {SUBJECT_KEYS.map((key) => (
                <Line key={key} type="monotone" dataKey={key} stroke={SUBJECT_COLORS[key]} strokeWidth={1.5} dot={{ r: 2 }} name={SUBJECT_LABELS[key]} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Class Performance */}
      <Card className="mb-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-gray-800">Class Performance</h3>
          {currentClassAvg !== null && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Class Average:</span>
              <span className="text-2xl font-black text-green-700">{currentClassAvg}</span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-4">
          {improving.length} improving, {stable.length} stable, {declining.length} need attention
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={classTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cde5d2" />
            <XAxis dataKey="semester" tick={{ fontSize: 9 }} />
            <YAxis domain={[40, 100]} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line type="monotone" dataKey="avg" stroke="#2d7a35" strokeWidth={3} dot={{ r: 5, fill: "#2d7a35" }} name="Class Average" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Student Roster */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800">Student Roster</h3>
          <Link href="/teacher/students" className="text-xs text-green-700 font-semibold no-underline hover:underline flex items-center gap-1">
            View all details <ChevronRight size={12} />
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          {filtered.map((s) => {
            const last = s.grades[s.grades.length - 1];
            const status = getStatus(s.grades);
            return (
              <Link
                key={s.id}
                href="/teacher/students"
                className="flex items-center gap-3.5 px-4 py-3 rounded-[10px] bg-green-50/50 border border-emerald-200 no-underline hover:shadow-sm transition-all"
              >
                <div className="w-[38px] h-[38px] rounded-full bg-green-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-800">{s.name}</div>
                  <div className="text-xs text-gray-500">{s.grade} {s.major} {s.class_number}</div>
                </div>
                <div className="text-lg font-extrabold text-green-700 mr-1">
                  {last?.avg?.toFixed(1) || "—"}
                </div>
                <StatusBadge status={status} />
              </Link>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-gray-500 text-center py-6 text-sm">
              {statusFilter !== "all" ? "No students match this filter." : "No students found."}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { classOptions, schoolYearOptions, semesterOptions } from "@/lib/constants";
import { SUBJECT_KEYS, SUBJECT_LABELS, SUBJECT_LABELS_FULL } from "@/lib/types";
import type { SubjectKey } from "@/lib/types";
import { uploadGrade, uploadBulkGrades, saveUploadHistory, type BulkGradeRow, type BulkUploadResult } from "@/actions/grades";
import { Clock, File } from "lucide-react";

interface Student {
  id: string;
  name: string;
  class: string;
}

interface ParsedRow {
  nis: string;
  name: string;
  semester: string;
  grades: Record<SubjectKey, number>;
  avg: number;
  valid: boolean;
  error?: string;
}

const HEADER_ALIASES: Record<string, SubjectKey> = {
  matematikaumum: "matematika_umum",
  matumum: "matematika_umum",
  mtk: "matematika_umum",
  mtkumum: "matematika_umum",
  math: "matematika_umum",
  matematika: "matematika_umum",
  matematikpeminatan: "matematika_peminatan",
  mtkpeminatan: "matematika_peminatan",
  matpeminatan: "matematika_peminatan",
  mtkp: "matematika_peminatan",
  bahasaindonesia: "bahasa_indonesia",
  bindo: "bahasa_indonesia",
  bindonesia: "bahasa_indonesia",
  indonesian: "bahasa_indonesia",
  indo: "bahasa_indonesia",
  bahasainggris: "bahasa_inggris",
  bing: "bahasa_inggris",
  binggris: "bahasa_inggris",
  english: "bahasa_inggris",
  inggris: "bahasa_inggris",
  fisika: "fisika",
  fis: "fisika",
  physics: "fisika",
  science: "fisika",
  kimia: "kimia",
  kim: "kimia",
  chemistry: "kimia",
  biologi: "biologi",
  bio: "biologi",
  biology: "biologi",
  sejarah: "sejarah",
  sej: "sejarah",
  history: "sejarah",
  informatika: "informatika",
  info: "informatika",
  tik: "informatika",
  komputer: "informatika",
  pai: "pai",
  agama: "pai",
  pendidikanagamaislam: "pai",
  pjok: "pjok",
  penjas: "pjok",
  olahraga: "pjok",
  penjaskes: "pjok",
};

function normalizeHeader(h: string): string {
  return h.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseExcelFile(data: ArrayBuffer): { rows: ParsedRow[]; errors: string[] } {
  const workbook = XLSX.read(data, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  const errors: string[] = [];
  const rows: ParsedRow[] = [];

  if (json.length === 0) {
    errors.push("The spreadsheet is empty.");
    return { rows, errors };
  }

  const rawHeaders = Object.keys(json[0]);
  const headerMap: Record<string, string> = {};

  for (const h of rawHeaders) {
    const norm = normalizeHeader(h);
    if (norm.includes("nisn") || norm.includes("nis")) { headerMap[h] = "nis"; continue; }
    if (norm.includes("nama") || norm === "name") { headerMap[h] = "name"; continue; }
    if (norm.includes("semester") || norm.includes("sem")) { headerMap[h] = "semester"; continue; }
    if (norm.includes("rata") || norm === "avg" || norm === "average") { headerMap[h] = "avg_skip"; continue; }
    const alias = HEADER_ALIASES[norm];
    if (alias) { headerMap[h] = alias; continue; }
    for (const [pattern, subject] of Object.entries(HEADER_ALIASES)) {
      if (norm.includes(pattern) && pattern.length >= 3) {
        headerMap[h] = subject;
        break;
      }
    }
  }

  const requiredSubjects = [...SUBJECT_KEYS];
  const foundSubjects = requiredSubjects.filter((s) => Object.values(headerMap).includes(s));
  const missingSub = requiredSubjects.filter((s) => !Object.values(headerMap).includes(s));

  if (!Object.values(headerMap).includes("nis")) {
    errors.push("Missing NIS column.");
    return { rows, errors };
  }
  if (!Object.values(headerMap).includes("semester")) {
    errors.push("Missing Semester column.");
    return { rows, errors };
  }
  if (foundSubjects.length === 0) {
    errors.push(`No subject columns recognized. Found headers: ${rawHeaders.join(", ")}`);
    return { rows, errors };
  }
  if (missingSub.length > 0) {
    errors.push(`Missing subject columns (will default to 0): ${missingSub.map((s) => SUBJECT_LABELS[s]).join(", ")}`);
  }

  for (let i = 0; i < json.length; i++) {
    const raw = json[i];
    const get = (key: string): string => {
      const col = Object.entries(headerMap).find(([, v]) => v === key)?.[0];
      return col ? String(raw[col] ?? "").trim() : "";
    };

    const nis = get("nis");
    const name = get("name");
    const semester = get("semester");

    const grades: Record<SubjectKey, number> = {} as Record<SubjectKey, number>;
    let valid = true;
    let error: string | undefined;

    for (const key of SUBJECT_KEYS) {
      const val = get(key);
      grades[key] = val ? Number(val) : 0;
      if (val && isNaN(Number(val))) {
        valid = false;
        error = `Invalid value for ${SUBJECT_LABELS[key]}`;
      }
    }

    if (!nis) { valid = false; error = "Missing NIS"; }
    else if (!semester) { valid = false; error = "Missing semester"; }
    else if (Object.values(grades).some((v) => v < 0 || v > 100)) {
      valid = false; error = "Grades must be 0-100";
    }

    const avg = SUBJECT_KEYS.reduce((sum, k) => sum + grades[k], 0) / SUBJECT_KEYS.length;

    rows.push({ nis, name, semester, grades, avg, valid, error });
  }

  return { rows, errors };
}

function generateTemplate() {
  const headers = ["NIS", "Student Name", "Semester",
    ...SUBJECT_KEYS.map((k) => SUBJECT_LABELS_FULL[k])
  ];
  const example = ["12345", "Adi Nugroho", "Sem 1 (Grade 10)",
    78, 75, 85, 80, 82, 76, 74, 70, 80, 78, 75,
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, example]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Grades");
  XLSX.writeFile(wb, "learntrack-grade-template.xlsx");
}

interface UploadHistoryItem {
  id: string;
  file_name: string;
  row_count: number;
  success_count: number;
  failed_count: number;
  status: "success" | "partial" | "failed";
  created_at: string;
}

export function UploadClient({ students, uploadHistory = [] }: { students: Student[]; uploadHistory?: UploadHistoryItem[] }) {
  const [form, setForm] = useState<Record<string, string>>({
    studentId: "", class: "", schoolYear: "", semester: "",
    ...Object.fromEntries(SUBJECT_KEYS.map((k) => [k, ""])),
  });
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const [dragOver, setDragOver] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkUploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const handleSave = async () => {
    if (!form.studentId || !form.semester) return;
    setSaving(true);
    const formData = new FormData();
    formData.set("student_id", form.studentId);
    formData.set("semester", form.semester);
    for (const key of SUBJECT_KEYS) {
      formData.set(key, form[key] || "0");
    }

    const result = await uploadGrade(formData);
    setSaving(false);

    if (result?.success) {
      const student = students.find((s) => s.id === form.studentId);
      setSuccess(`Grades uploaded for ${student?.name} — ${form.semester}!`);
      setTimeout(() => setSuccess(""), 3000);
      router.refresh();
    }
  };

  const filledSubjects = SUBJECT_KEYS.filter((k) => form[k] && Number(form[k]) > 0);
  const avg = filledSubjects.length === SUBJECT_KEYS.length
    ? (SUBJECT_KEYS.reduce((sum, k) => sum + Number(form[k]), 0) / SUBJECT_KEYS.length).toFixed(2)
    : null;

  const handleFile = (file: File) => {
    if (!file) return;
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setParseErrors(["Please upload an Excel file (.xlsx, .xls) or CSV file."]);
      return;
    }
    setFileName(file.name);
    setBulkResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as ArrayBuffer;
      const { rows, errors } = parseExcelFile(data);
      setParsedRows(rows);
      setParseErrors(errors);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleBulkUpload = async () => {
    const validRows = parsedRows.filter((r) => r.valid);
    if (validRows.length === 0) return;
    setBulkUploading(true);
    const payload: BulkGradeRow[] = validRows.map((r) => ({
      nis: r.nis,
      semester: r.semester,
      ...r.grades,
    }));
    const result = await uploadBulkGrades(payload);
    setBulkResult(result);
    setBulkUploading(false);
    await saveUploadHistory({
      fileName: fileName,
      rowCount: result.total,
      successCount: result.success,
      failedCount: result.failed,
    });
    router.refresh();
  };

  const clearBulk = () => {
    setParsedRows([]);
    setParseErrors([]);
    setFileName("");
    setBulkResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validCount = parsedRows.filter((r) => r.valid).length;
  const invalidCount = parsedRows.filter((r) => !r.valid).length;

  return (
    <div>
      <h1 className="text-[26px] font-extrabold text-green-900 mb-1.5">Upload Grades</h1>
      <p className="text-gray-500 mb-6">Enter or update student grade data by class and semester.</p>

      {success && (
        <div className="bg-green-50 text-green-900 px-4 py-3 rounded-[10px] mb-5 font-semibold text-sm">{success}</div>
      )}

      {/* Manual Entry */}
      <Card className="mb-5">
        <h3 className="text-base font-bold text-gray-800 mb-4">Manual Grade Entry</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <div className="md:col-span-2 mb-3.5">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
              Student <span className="text-red-400">*</span>
            </label>
            <select
              value={form.studentId}
              onChange={f("studentId")}
              className="w-full px-3 py-2 rounded-lg border-[1.5px] border-emerald-200 text-sm bg-white text-gray-800 font-[inherit] box-border focus:border-green-600 outline-none"
            >
              <option value="">-- Select Student --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} (Class {s.class})</option>
              ))}
            </select>
          </div>
          <Input label="Class" value={form.class} onChange={f("class")} as="select" options={classOptions} />
          <Input label="School Year" value={form.schoolYear} onChange={f("schoolYear")} as="select" options={schoolYearOptions} />
          <div className="md:col-span-2">
            <Input label="Semester" value={form.semester} onChange={f("semester")} as="select" options={semesterOptions} />
          </div>
          {SUBJECT_KEYS.map((key) => (
            <Input key={key} label={SUBJECT_LABELS_FULL[key]} value={form[key]} onChange={f(key)} type="number" placeholder="0–100" />
          ))}
        </div>
        {avg && (
          <div className="p-3 bg-green-50 rounded-lg mb-3.5 text-sm font-semibold text-green-900">
            Average: {avg}
          </div>
        )}
        <Button onClick={handleSave} disabled={saving}>
          <Upload size={15} /> {saving ? "Uploading..." : "Upload Grades"}
        </Button>
      </Card>

      {/* Bulk Upload */}
      <Card>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base font-bold text-gray-800">Bulk Upload via Excel</h3>
          <button onClick={generateTemplate} className="inline-flex items-center gap-1.5 text-green-700 text-xs font-semibold cursor-pointer bg-transparent border-none hover:underline">
            <Download size={14} /> Download Template
          </button>
        </div>
        <p className="text-gray-500 text-sm leading-relaxed mb-4">
          Upload an Excel file with columns: <code className="bg-green-50 px-1 py-0.5 rounded text-xs">NIS</code>, <code className="bg-green-50 px-1 py-0.5 rounded text-xs">Student Name</code>, <code className="bg-green-50 px-1 py-0.5 rounded text-xs">Semester</code>, and all 11 subject columns.
        </p>

        {parsedRows.length === 0 && parseErrors.length === 0 && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl py-10 px-5 text-center cursor-pointer transition-all ${
              dragOver ? "border-green-700 bg-green-50" : "border-emerald-200 hover:border-emerald-300"
            }`}
          >
            <Upload size={36} className="text-emerald-300 mx-auto mb-2.5" />
            <p className="text-gray-500 text-sm">Drag & drop your Excel file here, or click to browse</p>
            <p className="text-gray-400 text-xs mt-1">Supports .xlsx, .xls, and .csv</p>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />

        {parseErrors.length > 0 && parseErrors.some((e) => !e.startsWith("Missing subject")) && (
          <div className="mt-4">
            {parseErrors.filter((e) => !e.startsWith("Missing subject")).map((err, i) => (
              <div key={i} className="bg-red-50 text-red-500 px-3.5 py-2.5 rounded-[9px] text-[13px] mb-2 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" /> {err}
              </div>
            ))}
            {parsedRows.length === 0 && <Button variant="outline" onClick={clearBulk} className="mt-2">Try Again</Button>}
          </div>
        )}

        {parseErrors.some((e) => e.startsWith("Missing subject")) && (
          <div className="mt-4">
            {parseErrors.filter((e) => e.startsWith("Missing subject")).map((err, i) => (
              <div key={i} className="bg-amber-50 text-amber-600 px-3.5 py-2.5 rounded-[9px] text-[13px] mb-2 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" /> {err}
              </div>
            ))}
          </div>
        )}

        {parsedRows.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-3 p-3 bg-green-50/50 rounded-lg border border-emerald-200 mb-4">
              <FileSpreadsheet size={20} className="text-green-700 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800 truncate">{fileName}</div>
                <div className="text-xs text-gray-500">
                  {parsedRows.length} rows &bull; <span className="text-green-700">{validCount} valid</span>
                  {invalidCount > 0 && <span className="text-red-400"> &bull; {invalidCount} invalid</span>}
                </div>
              </div>
              <button onClick={clearBulk} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-1">
                <X size={16} />
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-emerald-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-green-50 text-left">
                    <th className="px-2 py-2 text-[10px] font-bold text-gray-500 uppercase">#</th>
                    <th className="px-2 py-2 text-[10px] font-bold text-gray-500 uppercase">NIS</th>
                    <th className="px-2 py-2 text-[10px] font-bold text-gray-500 uppercase">Name</th>
                    <th className="px-2 py-2 text-[10px] font-bold text-gray-500 uppercase">Semester</th>
                    {SUBJECT_KEYS.map((k) => (
                      <th key={k} className="px-1.5 py-2 text-[9px] font-bold text-gray-500 uppercase text-center whitespace-nowrap">
                        {SUBJECT_LABELS[k]}
                      </th>
                    ))}
                    <th className="px-2 py-2 text-[10px] font-bold text-gray-500 uppercase text-center">Avg</th>
                    <th className="px-2 py-2 text-[10px] font-bold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row, i) => (
                    <tr key={i} className={`border-t border-emerald-100 ${!row.valid ? "bg-red-50/50" : ""}`}>
                      <td className="px-2 py-1.5 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-2 py-1.5 font-mono text-[11px] text-gray-800">{row.nis}</td>
                      <td className="px-2 py-1.5 text-xs text-gray-800">{row.name || "—"}</td>
                      <td className="px-2 py-1.5 text-gray-600 text-[10px]">{row.semester}</td>
                      {SUBJECT_KEYS.map((k) => (
                        <td key={k} className="px-1.5 py-1.5 text-center text-xs font-semibold">
                          {row.valid ? row.grades[k] || "—" : "—"}
                        </td>
                      ))}
                      <td className="px-2 py-1.5 text-center text-xs font-bold text-green-700">
                        {row.valid ? row.avg.toFixed(1) : "—"}
                      </td>
                      <td className="px-2 py-1.5">
                        {row.valid ? (
                          <span className="inline-flex items-center gap-1 text-green-700 text-[10px] font-semibold">
                            <CheckCircle size={11} /> OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400 text-[10px] font-semibold" title={row.error}>
                            <AlertCircle size={11} /> {row.error}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {bulkResult && (
              <div className={`mt-4 p-4 rounded-lg border ${bulkResult.failed === 0 ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
                <div className="flex items-center gap-2 mb-2">
                  {bulkResult.failed === 0 ? <CheckCircle size={18} className="text-green-700" /> : <AlertCircle size={18} className="text-amber-600" />}
                  <span className="font-bold text-gray-800">Upload Complete &mdash; {bulkResult.success}/{bulkResult.total} successful</span>
                </div>
                {bulkResult.errors.length > 0 && (
                  <div className="mt-2 text-xs text-red-500 space-y-1">
                    {bulkResult.errors.map((err, i) => <div key={i}>&bull; {err}</div>)}
                  </div>
                )}
              </div>
            )}

            {!bulkResult && (
              <div className="flex gap-3 mt-4">
                <Button onClick={handleBulkUpload} disabled={bulkUploading || validCount === 0}>
                  <Upload size={15} /> {bulkUploading ? "Uploading..." : `Upload ${validCount} Grade${validCount !== 1 ? "s" : ""}`}
                </Button>
                <Button variant="outline" onClick={clearBulk}>Cancel</Button>
              </div>
            )}
            {bulkResult && (
              <div className="mt-3">
                <Button variant="outline" onClick={clearBulk}>Upload Another File</Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Upload History */}
      {uploadHistory.length > 0 && (
        <Card className="mt-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-green-700" />
            <h3 className="text-base font-bold text-gray-800">Upload History</h3>
          </div>
          <div className="overflow-x-auto rounded-lg border border-emerald-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-green-50 text-left">
                  <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">File</th>
                  <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">Date</th>
                  <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase text-center">Rows</th>
                  <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase text-center">Success</th>
                  <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase text-center">Failed</th>
                  <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {uploadHistory.map((h) => (
                  <tr key={h.id} className="border-t border-emerald-100">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <File size={14} className="text-gray-400 shrink-0" />
                        <span className="text-gray-800 text-sm truncate max-w-[200px]">{h.file_name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(h.created_at).toLocaleDateString("en-US", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="px-3 py-2.5 text-center font-semibold text-gray-800">{h.row_count}</td>
                    <td className="px-3 py-2.5 text-center font-semibold text-green-700">{h.success_count}</td>
                    <td className="px-3 py-2.5 text-center font-semibold text-red-500">{h.failed_count}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        h.status === "success"
                          ? "bg-green-100 text-green-800"
                          : h.status === "partial"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-600"
                      }`}>
                        {h.status === "success" && <CheckCircle size={10} />}
                        {h.status === "partial" && <AlertCircle size={10} />}
                        {h.status === "failed" && <AlertCircle size={10} />}
                        {h.status === "success" ? "Success" : h.status === "partial" ? "Partial" : "Failed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

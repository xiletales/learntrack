"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import {
  UserPlus, Upload, FileSpreadsheet, CheckCircle, AlertCircle,
  X, Download, Copy, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { majorOptions, gradeOptions, classNumberOptions, schoolYearOptions } from "@/lib/constants";
import { addStudent, addBulkStudents, type BulkStudentRow, type BulkStudentResult } from "@/actions/students";

interface ParsedRow {
  nis: string;
  name: string;
  gender: string;
  major: string;
  grade: string;
  classNumber: string;
  valid: boolean;
  error?: string;
}

function normalizeHeader(h: string): string {
  return h.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseExcelFile(data: ArrayBuffer): { rows: ParsedRow[]; errors: string[] } {
  const workbook = XLSX.read(data, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  const errors: string[] = [];
  const rows: ParsedRow[] = [];

  if (json.length === 0) { errors.push("Spreadsheet is empty."); return { rows, errors }; }

  const rawHeaders = Object.keys(json[0]);
  const headerMap: Record<string, string> = {};

  for (const h of rawHeaders) {
    const norm = normalizeHeader(h);
    if (norm.includes("nis")) headerMap[h] = "nis";
    else if (norm.includes("nama") || norm === "name") headerMap[h] = "name";
    else if (norm.includes("gender") || norm.includes("kelamin") || norm.includes("jk")) headerMap[h] = "gender";
    else if (norm.includes("major") || norm.includes("jurusan") || norm.includes("peminatan")) headerMap[h] = "major";
    else if (norm.includes("grade") || norm.includes("kelas") || norm.includes("tingkat")) headerMap[h] = "grade";
    else if (norm.includes("class") || norm.includes("rombel") || norm.includes("nomorkelas")) headerMap[h] = "classNumber";
  }

  if (!Object.values(headerMap).includes("nis")) { errors.push("Missing NIS column."); return { rows, errors }; }
  if (!Object.values(headerMap).includes("name")) { errors.push("Missing Name/Nama column."); return { rows, errors }; }

  for (const raw of json) {
    const get = (key: string): string => {
      const col = Object.entries(headerMap).find(([, v]) => v === key)?.[0];
      return col ? String(raw[col] ?? "").trim() : "";
    };

    const nis = get("nis");
    const name = get("name");
    const gender = get("gender");
    const major = get("major").toUpperCase();
    const grade = get("grade");
    const classNumber = get("classNumber");

    let valid = true;
    let error: string | undefined;

    if (!nis) { valid = false; error = "Missing NIS"; }
    else if (!name) { valid = false; error = "Missing name"; }
    else if (nis.length !== 5) { valid = false; error = "NIS must be 5 digits"; }
    else if (major && !["MIPA", "IPS"].includes(major)) { valid = false; error = "Major must be MIPA or IPS"; }
    else if (grade && !["10", "11", "12"].includes(grade)) { valid = false; error = "Grade must be 10, 11, or 12"; }
    else if (classNumber && !["1", "2", "3"].includes(classNumber)) { valid = false; error = "Class must be 1, 2, or 3"; }

    rows.push({ nis, name, gender, major, grade, classNumber, valid, error });
  }

  return { rows, errors };
}

function generateTemplate() {
  const headers = ["NIS", "Nama", "Gender", "Major", "Grade", "Class"];
  const examples = [
    ["12345", "Adi Nugroho", "Male", "MIPA", "10", "1"],
    ["67890", "Siti Rahayu", "Female", "MIPA", "10", "1"],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...examples]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Students");
  XLSX.writeFile(wb, "learntrack-student-template.xlsx");
}

export function AddStudentsClient() {
  const router = useRouter();

  // Single add
  const [form, setForm] = useState({
    nis: "", name: "", gender: "", major: "", grade: "", class_number: "",
    school: "", school_year: "", birth_date: "", address: "",
  });
  const [saving, setSaving] = useState(false);
  const [singleResult, setSingleResult] = useState<{ success?: boolean; error?: string; password?: string } | null>(null);

  // Bulk
  const [dragOver, setDragOver] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkStudentResult | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const handleSingleAdd = async () => {
    if (!form.nis || !form.name || !form.major || !form.grade || !form.class_number) {
      setSingleResult({ error: "NIS, Name, Major, Grade, and Class are required." });
      return;
    }
    setSaving(true);
    setSingleResult(null);
    const result = await addStudent({
      nis: form.nis, name: form.name, gender: form.gender,
      major: form.major, grade: form.grade, classNumber: form.class_number,
      school: form.school, schoolYear: form.school_year,
      birthDate: form.birth_date, address: form.address,
    });
    setSaving(false);
    if (result.success) {
      setSingleResult({ success: true, password: result.defaultPassword });
      setForm({ nis: "", name: "", gender: "", major: "", grade: "", class_number: "", school: "", school_year: "", birth_date: "", address: "" });
      router.refresh();
    } else {
      setSingleResult({ error: result.error });
    }
  };

  const handleFile = (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setParseErrors(["Please upload .xlsx, .xls, or .csv file."]);
      return;
    }
    setFileName(file.name);
    setBulkResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const { rows, errors } = parseExcelFile(e.target?.result as ArrayBuffer);
      setParsedRows(rows);
      setParseErrors(errors);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBulkUpload = async () => {
    const validRows = parsedRows.filter((r) => r.valid);
    if (validRows.length === 0) return;
    setBulkUploading(true);
    const payload: BulkStudentRow[] = validRows.map((r) => ({
      nis: r.nis, name: r.name, gender: r.gender,
      major: r.major, grade: r.grade, classNumber: r.classNumber,
    }));
    const result = await addBulkStudents(payload);
    setBulkResult(result);
    setBulkUploading(false);
    router.refresh();
  };

  const clearBulk = () => {
    setParsedRows([]);
    setParseErrors([]);
    setFileName("");
    setBulkResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const copyCredentials = () => {
    if (!bulkResult?.credentials.length) return;
    const text = bulkResult.credentials
      .map((c) => `${c.name} — NIS: ${c.nis}, Password: ${c.password}`)
      .join("\n");
    navigator.clipboard.writeText(text);
  };

  const validCount = parsedRows.filter((r) => r.valid).length;
  const invalidCount = parsedRows.filter((r) => !r.valid).length;

  return (
    <div>
      <h1 className="text-[26px] font-extrabold text-green-900 mb-1.5">Add Students</h1>
      <p className="text-gray-500 mb-6">
        Add students to the system. Default password is NIS + &quot;123&quot; (e.g., NIS 12345 → password 12345123).
      </p>

      {/* Single Add */}
      <Card className="mb-5">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus size={18} className="text-green-700" />
          <h3 className="text-base font-bold text-gray-800">Add Single Student</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Input label="NIS (5 digits)" value={form.nis} onChange={f("nis")} placeholder="12345" required />
          <Input label="Full Name" value={form.name} onChange={f("name")} placeholder="Student full name" required />
          <Input label="Gender" value={form.gender} onChange={f("gender")} as="select" options={["Male", "Female"]} />
          <Input label="Date of Birth" value={form.birth_date} onChange={f("birth_date")} type="date" />
          <Input label="Major" value={form.major} onChange={f("major")} as="select" options={majorOptions} required />
          <Input label="Grade" value={form.grade} onChange={f("grade")} as="select" options={gradeOptions} required />
          <Input label="Class" value={form.class_number} onChange={f("class_number")} as="select" options={classNumberOptions} required />
          <Input label="School Year" value={form.school_year} onChange={f("school_year")} as="select" options={schoolYearOptions} />
          <Input label="School" value={form.school} onChange={f("school")} placeholder="e.g. SMA Negeri 1 Sragen" />
          <Input label="Address" value={form.address} onChange={f("address")} placeholder="Student address" />
        </div>

        {singleResult?.success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3.5 text-sm">
            <div className="flex items-center gap-2 text-green-700 font-semibold mb-1">
              <CheckCircle size={15} /> Student added successfully!
            </div>
            <div className="text-gray-600 text-xs">
              Default password: <code className="bg-white px-1.5 py-0.5 rounded font-bold">{singleResult.password}</code>
            </div>
          </div>
        )}
        {singleResult?.error && (
          <div className="p-3 bg-red-50 text-red-500 rounded-lg mb-3.5 text-sm flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" /> {singleResult.error}
          </div>
        )}

        <Button onClick={handleSingleAdd} disabled={saving}>
          <UserPlus size={15} /> {saving ? "Adding..." : "Add Student"}
        </Button>
      </Card>

      {/* Bulk Import */}
      <Card>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Upload size={18} className="text-green-700" />
            <h3 className="text-base font-bold text-gray-800">Bulk Import via Excel</h3>
          </div>
          <button onClick={generateTemplate} className="inline-flex items-center gap-1.5 text-green-700 text-xs font-semibold cursor-pointer bg-transparent border-none hover:underline">
            <Download size={14} /> Download Template
          </button>
        </div>
        <p className="text-gray-500 text-sm leading-relaxed mb-4">
          Columns: <code className="bg-green-50 px-1 py-0.5 rounded text-xs">NIS</code>, <code className="bg-green-50 px-1 py-0.5 rounded text-xs">Nama</code>, <code className="bg-green-50 px-1 py-0.5 rounded text-xs">Gender</code>, <code className="bg-green-50 px-1 py-0.5 rounded text-xs">Major</code>, <code className="bg-green-50 px-1 py-0.5 rounded text-xs">Grade</code>, <code className="bg-green-50 px-1 py-0.5 rounded text-xs">Class</code>
        </p>

        {parsedRows.length === 0 && parseErrors.length === 0 && !bulkResult && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl py-10 px-5 text-center cursor-pointer transition-all ${
              dragOver ? "border-green-700 bg-green-50" : "border-emerald-200 hover:border-emerald-300"
            }`}
          >
            <Upload size={36} className="text-emerald-300 mx-auto mb-2.5" />
            <p className="text-gray-500 text-sm">Drag & drop your Excel file here, or click to browse</p>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />

        {parseErrors.length > 0 && (
          <div className="mt-4">
            {parseErrors.map((err, i) => (
              <div key={i} className="bg-red-50 text-red-500 px-3.5 py-2.5 rounded-[9px] text-[13px] mb-2 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" /> {err}
              </div>
            ))}
            {parsedRows.length === 0 && <Button variant="outline" onClick={clearBulk} className="mt-2">Try Again</Button>}
          </div>
        )}

        {/* Preview */}
        {parsedRows.length > 0 && !bulkResult && (
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
              <button onClick={clearBulk} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-1"><X size={16} /></button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-emerald-200 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-green-50 text-left">
                    <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">#</th>
                    <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">NIS</th>
                    <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">Name</th>
                    <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">Gender</th>
                    <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">Major</th>
                    <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">Grade</th>
                    <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">Class</th>
                    <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row, i) => (
                    <tr key={i} className={`border-t border-emerald-100 ${!row.valid ? "bg-red-50/50" : ""}`}>
                      <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                      <td className="px-3 py-2 font-mono text-xs text-gray-800">{row.nis}</td>
                      <td className="px-3 py-2 text-gray-800">{row.name}</td>
                      <td className="px-3 py-2 text-gray-600 text-xs">{row.gender || "—"}</td>
                      <td className="px-3 py-2 text-gray-600 text-xs">{row.major || "—"}</td>
                      <td className="px-3 py-2 text-gray-600 text-xs">{row.grade || "—"}</td>
                      <td className="px-3 py-2 text-gray-600 text-xs">{row.classNumber || "—"}</td>
                      <td className="px-3 py-2">
                        {row.valid ? (
                          <span className="inline-flex items-center gap-1 text-green-700 text-xs font-semibold"><CheckCircle size={12} /> OK</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400 text-xs font-semibold"><AlertCircle size={12} /> {row.error}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleBulkUpload} disabled={bulkUploading || validCount === 0}>
                <UserPlus size={15} /> {bulkUploading ? "Adding students..." : `Add ${validCount} Student${validCount !== 1 ? "s" : ""}`}
              </Button>
              <Button variant="outline" onClick={clearBulk}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Result with credentials */}
        {bulkResult && (
          <div className="mt-4">
            <div className={`p-4 rounded-lg border mb-4 ${bulkResult.failed === 0 ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
              <div className="flex items-center gap-2 mb-2">
                {bulkResult.failed === 0 ? <CheckCircle size={18} className="text-green-700" /> : <AlertCircle size={18} className="text-amber-600" />}
                <span className="font-bold text-gray-800">
                  {bulkResult.success}/{bulkResult.total} students added
                </span>
              </div>
              {bulkResult.errors.length > 0 && (
                <div className="text-xs text-red-500 space-y-1 mb-3">
                  {bulkResult.errors.map((err, i) => <div key={i}>&bull; {err}</div>)}
                </div>
              )}
            </div>

            {bulkResult.credentials.length > 0 && (
              <div className="p-4 bg-white border border-emerald-200 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-800">Student Login Credentials</h4>
                  <div className="flex gap-2">
                    <button onClick={() => setShowPasswords((p) => !p)} className="inline-flex items-center gap-1 text-xs text-gray-500 bg-transparent border-none cursor-pointer hover:underline">
                      {showPasswords ? <EyeOff size={12} /> : <Eye size={12} />}
                      {showPasswords ? "Hide" : "Show"}
                    </button>
                    <button onClick={copyCredentials} className="inline-flex items-center gap-1 text-xs text-green-700 bg-transparent border-none cursor-pointer hover:underline">
                      <Copy size={12} /> Copy All
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-emerald-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-green-50">
                        <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase text-left">Name</th>
                        <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase text-left">NIS</th>
                        <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase text-left">Password</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkResult.credentials.map((c) => (
                        <tr key={c.nis} className="border-t border-emerald-50">
                          <td className="px-3 py-2 text-gray-800">{c.name}</td>
                          <td className="px-3 py-2 font-mono text-xs text-gray-800">{c.nis}</td>
                          <td className="px-3 py-2 font-mono text-xs">
                            {showPasswords ? c.password : "••••••••"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <Button variant="outline" onClick={clearBulk}>Add More Students</Button>
          </div>
        )}
      </Card>
    </div>
  );
}

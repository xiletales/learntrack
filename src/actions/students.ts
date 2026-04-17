"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface AddStudentData {
  nis: string;
  name: string;
  gender?: string;
  major: string;
  grade: string;
  classNumber: string;
  school?: string;
  schoolYear?: string;
  birthDate?: string;
  address?: string;
}

export async function addStudent(data: AddStudentData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const email = `nis_${data.nis}@learntrack.local`;
  const password = `${data.nis}123`;

  // Check if NIS already exists
  const { data: existing } = await supabase
    .from("students")
    .select("id")
    .eq("nis", data.nis)
    .single();

  if (existing) return { error: `NIS ${data.nis} already exists.` };

  // Get teacher's school info as defaults
  const { data: teacherProfile } = await supabase
    .from("profiles")
    .select("school, school_year")
    .eq("id", user.id)
    .single();

  // Create auth user with service role via edge function workaround:
  // Since we can't use admin.createUser from client, we use signUp
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role: "student" } },
  });

  if (authError) {
    if (authError.message.includes("already been registered")) {
      return { error: "This NIS is already registered." };
    }
    return { error: authError.message };
  }

  if (!authData.user) return { error: "Failed to create student account." };

  const studentId = authData.user.id;

  const { error: profileError } = await supabase.from("profiles").insert({
    id: studentId,
    role: "student",
    name: data.name,
    gender: data.gender || null,
    school: data.school || teacherProfile?.school || null,
    school_year: data.schoolYear || teacherProfile?.school_year || null,
  });

  if (profileError) return { error: profileError.message };

  const { error: studentError } = await supabase.from("students").insert({
    id: studentId,
    nis: data.nis,
    major: data.major,
    grade: data.grade,
    class_number: data.classNumber,
    birth_date: data.birthDate || null,
    address: data.address || null,
  });

  if (studentError) return { error: studentError.message };

  revalidatePath("/teacher/add-students");
  revalidatePath("/teacher/students");
  revalidatePath("/teacher/dashboard");
  return { success: true, defaultPassword: password };
}

export interface BulkStudentRow {
  nis: string;
  name: string;
  gender?: string;
  major: string;
  grade: string;
  classNumber: string;
}

export interface BulkStudentResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
  credentials: { nis: string; name: string; password: string }[];
}

export async function addBulkStudents(rows: BulkStudentRow[]): Promise<BulkStudentResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { total: 0, success: 0, failed: 0, errors: ["Not authenticated"], credentials: [] };

  const { data: teacherProfile } = await supabase
    .from("profiles")
    .select("school, school_year")
    .eq("id", user.id)
    .single();

  const result: BulkStudentResult = { total: rows.length, success: 0, failed: 0, errors: [], credentials: [] };

  for (const row of rows) {
    const email = `nis_${row.nis}@learntrack.local`;
    const password = `${row.nis}123`;

    const { data: existing } = await supabase
      .from("students")
      .select("id")
      .eq("nis", row.nis)
      .single();

    if (existing) {
      result.failed++;
      result.errors.push(`NIS ${row.nis} (${row.name}): already exists`);
      continue;
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: "student" } },
    });

    if (authError || !authData.user) {
      result.failed++;
      result.errors.push(`NIS ${row.nis} (${row.name}): ${authError?.message || "auth failed"}`);
      continue;
    }

    const studentId = authData.user.id;

    const { error: pErr } = await supabase.from("profiles").insert({
      id: studentId, role: "student", name: row.name,
      gender: row.gender || null,
      school: teacherProfile?.school || null,
      school_year: teacherProfile?.school_year || null,
    });

    if (pErr) {
      result.failed++;
      result.errors.push(`NIS ${row.nis} (${row.name}): ${pErr.message}`);
      continue;
    }

    const { error: sErr } = await supabase.from("students").insert({
      id: studentId, nis: row.nis, major: row.major,
      grade: row.grade, class_number: row.classNumber,
    });

    if (sErr) {
      result.failed++;
      result.errors.push(`NIS ${row.nis} (${row.name}): ${sErr.message}`);
      continue;
    }

    result.success++;
    result.credentials.push({ nis: row.nis, name: row.name, password });
  }

  revalidatePath("/teacher/add-students");
  revalidatePath("/teacher/students");
  revalidatePath("/teacher/dashboard");
  return result;
}

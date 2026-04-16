"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { SUBJECT_KEYS } from "@/lib/types";

export async function uploadGrade(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const studentId = formData.get("student_id") as string;
  const semester = formData.get("semester") as string;

  if (!studentId || !semester) return { error: "Missing required fields" };

  const gradeData: Record<string, number> = {};
  for (const key of SUBJECT_KEYS) {
    gradeData[key] = Number(formData.get(key)) || 0;
  }

  const { data: existing } = await supabase
    .from("grades")
    .select("id")
    .eq("student_id", studentId)
    .eq("semester", semester)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("grades")
      .update({ ...gradeData, uploaded_by: user.id })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("grades").insert({
      student_id: studentId,
      semester,
      ...gradeData,
      uploaded_by: user.id,
    });
    if (error) return { error: error.message };
  }

  revalidatePaths();
  return { success: true };
}

export interface BulkGradeRow {
  nisn: string;
  semester: string;
  matematika_umum: number;
  matematika_peminatan: number;
  bahasa_indonesia: number;
  bahasa_inggris: number;
  fisika: number;
  kimia: number;
  biologi: number;
  sejarah: number;
  informatika: number;
  pai: number;
  pjok: number;
}

export interface BulkUploadResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

export async function uploadBulkGrades(rows: BulkGradeRow[]): Promise<BulkUploadResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { total: 0, success: 0, failed: 0, errors: ["Not authenticated"] };

  const result: BulkUploadResult = { total: rows.length, success: 0, failed: 0, errors: [] };

  for (const row of rows) {
    const { data: student } = await supabase
      .from("students")
      .select("id")
      .eq("nisn", row.nisn)
      .single();

    if (!student) {
      result.failed++;
      result.errors.push(`NISN ${row.nisn}: student not found`);
      continue;
    }

    const gradeData = {
      matematika_umum: row.matematika_umum,
      matematika_peminatan: row.matematika_peminatan,
      bahasa_indonesia: row.bahasa_indonesia,
      bahasa_inggris: row.bahasa_inggris,
      fisika: row.fisika,
      kimia: row.kimia,
      biologi: row.biologi,
      sejarah: row.sejarah,
      informatika: row.informatika,
      pai: row.pai,
      pjok: row.pjok,
    };

    const { data: existing } = await supabase
      .from("grades")
      .select("id")
      .eq("student_id", student.id)
      .eq("semester", row.semester)
      .single();

    if (existing) {
      const { error } = await supabase
        .from("grades")
        .update({ ...gradeData, uploaded_by: user.id })
        .eq("id", existing.id);
      if (error) {
        result.failed++;
        result.errors.push(`NISN ${row.nisn}, ${row.semester}: ${error.message}`);
      } else {
        result.success++;
      }
    } else {
      const { error } = await supabase.from("grades").insert({
        student_id: student.id,
        semester: row.semester,
        ...gradeData,
        uploaded_by: user.id,
      });
      if (error) {
        result.failed++;
        result.errors.push(`NISN ${row.nisn}, ${row.semester}: ${error.message}`);
      } else {
        result.success++;
      }
    }
  }

  revalidatePaths();
  return result;
}

function revalidatePaths() {
  revalidatePath("/teacher/upload");
  revalidatePath("/teacher/students");
  revalidatePath("/teacher/dashboard");
  revalidatePath("/teacher/progress");
  revalidatePath("/student/dashboard");
  revalidatePath("/student/grades");
  revalidatePath("/student/status");
}

export async function getStudentGrades(studentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grades")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return data;
}

export async function getClassStudentsWithGrades(classHandled: string) {
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("students")
    .select("*, profiles(*)")
    .eq("class", classHandled);

  if (!students) return [];

  const result = await Promise.all(
    students.map(async (s) => {
      const { data: grades } = await supabase
        .from("grades")
        .select("*")
        .eq("student_id", s.id)
        .order("created_at", { ascending: true });

      const { data: reflections } = await supabase
        .from("reflections")
        .select("*")
        .eq("student_id", s.id)
        .order("created_at", { ascending: true });

      return {
        id: s.id,
        nisn: s.nisn,
        birth_date: s.birth_date,
        class: s.class,
        address: s.address,
        name: s.profiles.name,
        gender: s.profiles.gender,
        school: s.profiles.school,
        school_year: s.profiles.school_year,
        photo_url: s.profiles.photo_url,
        grades: grades || [],
        reflections: reflections || [],
      };
    })
  );

  return result;
}

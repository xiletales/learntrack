"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveReflection(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const semester = formData.get("semester") as string;
  const text = formData.get("text") as string;
  const target = formData.get("target") as string;

  if (!semester || !text) return { error: "Missing required fields" };

  const { data: existing } = await supabase
    .from("reflections")
    .select("id")
    .eq("student_id", user.id)
    .eq("semester", semester)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("reflections")
      .update({ text, target })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("reflections").insert({
      student_id: user.id,
      semester,
      text,
      target,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/student/reflections");
  return { success: true };
}

export async function addTeacherNote(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const studentId = formData.get("student_id") as string;
  const semester = formData.get("semester") as string;
  const note = formData.get("note") as string;

  if (!studentId || !semester || !note)
    return { error: "Missing required fields" };

  const { data: existing } = await supabase
    .from("reflections")
    .select("id")
    .eq("student_id", studentId)
    .eq("semester", semester)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("reflections")
      .update({ teacher_note: note, noted_by: user.id })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("reflections").insert({
      student_id: studentId,
      semester,
      teacher_note: note,
      noted_by: user.id,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/teacher/reflections");
  revalidatePath("/student/reflections");
  return { success: true };
}

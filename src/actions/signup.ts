"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const role = formData.get("role") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;
  const school = formData.get("school") as string;
  const schoolYear = formData.get("school_year") as string;
  const gender = formData.get("gender") as string;

  if (!role || !name || !password) {
    return { error: "Name, password, and role are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  let email: string;

  if (role === "student") {
    const nisn = formData.get("nisn") as string;
    if (!nisn) return { error: "NISN is required for students." };
    email = `${nisn}@learntrack.local`;
  } else {
    const teacherEmail = formData.get("email") as string;
    if (!teacherEmail) return { error: "Email is required for teachers." };
    email = teacherEmail;
  }

  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    if (authError.message.includes("already been registered")) {
      return { error: "This account already exists. Please log in instead." };
    }
    return { error: authError.message };
  }

  if (!data.user) {
    return { error: "Failed to create account." };
  }

  const userId = data.user.id;

  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    role,
    name,
    gender: gender || null,
    school: school || null,
    school_year: schoolYear || null,
  });

  if (profileError) {
    return { error: profileError.message };
  }

  if (role === "student") {
    const nisn = formData.get("nisn") as string;
    const birthDate = formData.get("birth_date") as string;
    const studentClass = formData.get("class") as string;
    const address = formData.get("address") as string;

    const { error } = await supabase.from("students").insert({
      id: userId,
      nisn,
      birth_date: birthDate || null,
      class: studentClass || null,
      address: address || null,
    });
    if (error) return { error: error.message };
  } else {
    const nip = formData.get("nip") as string;
    const jurusan = formData.get("jurusan") as string;
    const subject = formData.get("subject") as string;
    const classHandled = formData.get("class_handled") as string;
    const phone = formData.get("phone") as string;
    const teacherEmail = formData.get("email") as string;

    if (!nip) return { error: "NIP is required for teachers." };
    if (!jurusan) return { error: "Jurusan (MIPA/IPS) is required for teachers." };

    const { error } = await supabase.from("teachers").insert({
      id: userId,
      nip,
      jurusan,
      class_handled: classHandled || null,
      subject: subject || null,
      phone: phone || null,
      email: teacherEmail || null,
    });
    if (error) return { error: error.message };
  }

  redirect(role === "teacher" ? "/teacher/dashboard" : "/student/dashboard");
}

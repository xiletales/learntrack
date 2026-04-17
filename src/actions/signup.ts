"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const password = formData.get("password") as string;
  const gender = formData.get("gender") as string;
  const school = formData.get("school") as string;
  const schoolYear = formData.get("school_year") as string;

  if (!name || !password) return { error: "Name and password are required." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const email = formData.get("email") as string;
  if (!email) return { error: "Email is required." };

  const { data, error: authError } = await supabase.auth.signUp({ email, password });

  if (authError) {
    if (authError.message.includes("already been registered")) {
      return { error: "This account already exists. Please log in instead." };
    }
    return { error: authError.message };
  }

  if (!data.user) return { error: "Failed to create account." };

  const userId = data.user.id;

  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    role: "teacher",
    name,
    gender: gender || null,
    school: school || null,
    school_year: schoolYear || null,
  });

  if (profileError) return { error: profileError.message };

  const nip = formData.get("nip") as string;
  const jurusan = formData.get("jurusan") as string;
  const subject = formData.get("subject") as string;
  const classHandled = formData.get("class_handled") as string;
  const phone = formData.get("phone") as string;

  if (!nip) return { error: "NIP is required." };
  if (!jurusan) return { error: "Jurusan (MIPA/IPS) is required." };

  const { error } = await supabase.from("teachers").insert({
    id: userId,
    nip,
    jurusan,
    class_handled: classHandled || null,
    subject: subject || null,
    phone: phone || null,
    email: email || null,
  });

  if (error) return { error: error.message };

  redirect("/teacher/dashboard");
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const role = formData.get("role") as string;
  const identifier = formData.get("identifier") as string;
  const password = formData.get("password") as string;

  const email =
    role === "student"
      ? `${identifier}@learntrack.local`
      : identifier.includes("@")
        ? identifier
        : `${identifier}@sman1sragen.sch.id`;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .single();

  redirect(
    profile?.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard"
  );
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

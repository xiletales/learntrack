import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReflectionsClient } from "./reflections-client";

export default async function StudentReflectionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: grades } = await supabase
    .from("grades")
    .select("semester")
    .eq("student_id", user.id)
    .order("created_at");

  const { data: reflections } = await supabase
    .from("reflections")
    .select("*")
    .eq("student_id", user.id)
    .order("created_at");

  const semesters = (grades || []).map((g) => g.semester);

  return (
    <ReflectionsClient
      reflections={reflections || []}
      semesters={semesters}
    />
  );
}

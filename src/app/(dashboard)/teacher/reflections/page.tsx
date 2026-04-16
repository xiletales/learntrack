import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getClassStudentsWithGrades } from "@/actions/grades";
import { TeacherReflectionsClient } from "./reflections-client";

export default async function TeacherReflectionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: teacher } = await supabase.from("teachers").select("class_handled").eq("id", user.id).single();
  const students = teacher?.class_handled
    ? await getClassStudentsWithGrades(teacher.class_handled)
    : [];

  return (
    <TeacherReflectionsClient students={students} />
  );
}

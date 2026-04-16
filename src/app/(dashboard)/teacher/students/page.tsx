import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getClassStudentsWithGrades } from "@/actions/grades";
import { StudentDataClient } from "./student-data-client";

export default async function TeacherStudentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: teacher } = await supabase.from("teachers").select("class_handled").eq("id", user.id).single();
  const students = teacher?.class_handled
    ? await getClassStudentsWithGrades(teacher.class_handled)
    : [];

  return <StudentDataClient students={students} />;
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TeacherDashboardClient } from "./dashboard-client";

export default async function TeacherDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("name").eq("id", user.id).single();
  const { data: teacher } = await supabase.from("teachers").select("class_handled").eq("id", user.id).single();

  // Fetch ALL students (teacher can filter by major/grade/class on the client)
  const { data: allStudents } = await supabase.from("students").select("*, profiles(*)");

  const studentIds = (allStudents || []).map((s) => s.id);
  const { data: allGrades } = await supabase.from("grades").select("*").in("student_id", studentIds.length > 0 ? studentIds : ["none"]).order("created_at");
  const { data: allReflections } = await supabase.from("reflections").select("*").in("student_id", studentIds.length > 0 ? studentIds : ["none"]).order("created_at");

  const students = (allStudents || []).map((s) => ({
    id: s.id,
    nis: s.nis,
    birth_date: s.birth_date,
    major: s.major,
    grade: s.grade,
    class_number: s.class_number,
    address: s.address,
    name: s.profiles.name,
    gender: s.profiles.gender,
    school: s.profiles.school,
    school_year: s.profiles.school_year,
    photo_url: s.profiles.photo_url,
    grades: (allGrades || []).filter((g) => g.student_id === s.id),
    reflections: (allReflections || []).filter((r) => r.student_id === s.id),
  }));

  // Parse default filter from class_handled
  const parts = (teacher?.class_handled || "").split(" ");
  const defaultGrade = parts[0] || "";
  const defaultMajor = parts[1] || "";
  const defaultClass = parts[2] || "";

  return (
    <TeacherDashboardClient
      teacherName={profile?.name || ""}
      students={students}
      defaultMajor={defaultMajor}
      defaultGrade={defaultGrade}
      defaultClass={defaultClass}
    />
  );
}

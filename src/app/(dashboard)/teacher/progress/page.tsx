import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getClassStudentsWithGrades } from "@/actions/grades";
import { TeacherProgressChart } from "@/components/charts/teacher-progress-chart";

export default async function TeacherProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: teacher } = await supabase.from("teachers").select("class_handled").eq("id", user.id).single();
  const students = teacher?.class_handled
    ? await getClassStudentsWithGrades(teacher.class_handled)
    : [];

  return (
    <div>
      <h1 className="text-[26px] font-extrabold text-green-900 mb-1.5">
        Student Progress
      </h1>
      <p className="text-gray-500 mb-6">
        View individual student grade progress charts.
      </p>
      <TeacherProgressChart students={students} />
    </div>
  );
}

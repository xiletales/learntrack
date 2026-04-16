import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { GradeLineChart, AllSubjectsChart } from "@/components/charts/grade-line-chart";

export default async function StudentGradesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: grades } = await supabase
    .from("grades")
    .select("*")
    .eq("student_id", user.id)
    .order("created_at");

  const g = grades || [];

  return (
    <div>
      <h1 className="text-[26px] font-extrabold text-green-900 mb-1.5">
        Grade Progress Chart
      </h1>
      <p className="text-gray-500 mb-6">
        Your academic performance across all semesters.
      </p>

      <Card className="mb-5">
        <GradeLineChart grades={g} />
      </Card>

      <Card>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          All Subjects Overview
        </h3>
        <AllSubjectsChart grades={g} />
      </Card>
    </div>
  );
}

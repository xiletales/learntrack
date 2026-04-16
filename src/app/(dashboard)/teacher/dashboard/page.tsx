import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Users, TrendingUp, Activity, AlertCircle } from "lucide-react";
import { Card, StatCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatus } from "@/lib/utils";
import { getClassStudentsWithGrades } from "@/actions/grades";

export default async function TeacherDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("name").eq("id", user.id).single();
  const { data: teacher } = await supabase.from("teachers").select("class_handled").eq("id", user.id).single();

  const students = teacher?.class_handled
    ? await getClassStudentsWithGrades(teacher.class_handled)
    : [];

  return (
    <div>
      <h1 className="text-[26px] font-extrabold text-green-900 mb-1.5">
        Teacher Dashboard
      </h1>
      <p className="text-gray-500 mb-7">
        Welcome, {profile?.name?.split(",")[0]}! Here&apos;s your class overview.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard icon={<Users size={22} />} label="Total Students" value={students.length} />
        <StatCard icon={<TrendingUp size={22} />} label="Improving" value={students.filter((s) => getStatus(s.grades) === "improving").length} />
        <StatCard icon={<Activity size={22} />} label="Stable" value={students.filter((s) => getStatus(s.grades) === "stable").length} />
        <StatCard icon={<AlertCircle size={22} />} label="Needs Attention" value={students.filter((s) => getStatus(s.grades) === "declining").length} />
      </div>

      <Card>
        <h3 className="text-base font-bold text-gray-800 mb-4">Class Overview</h3>
        <div className="flex flex-col gap-2.5">
          {students.map((s) => {
            const last = s.grades[s.grades.length - 1];
            const status = getStatus(s.grades);
            return (
              <div
                key={s.id}
                className="flex items-center gap-3.5 px-4 py-3 rounded-[10px] bg-green-50/50 border border-emerald-200"
              >
                <div className="w-[38px] h-[38px] rounded-full bg-green-700 text-white flex items-center justify-center font-bold text-sm">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-800">{s.name}</div>
                  <div className="text-xs text-gray-500">
                    Class {s.class} &bull; {s.school_year}
                  </div>
                </div>
                <div className="text-xl font-extrabold text-green-700">
                  {last?.avg?.toFixed(1)}
                </div>
                <StatusBadge status={status} />
              </div>
            );
          })}
          {students.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              No students found for your class.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

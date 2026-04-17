import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TrendingUp, Activity, Target, Award } from "lucide-react";
import { Card, StatCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { GradeAreaChart } from "@/components/charts/grade-area-chart";
import { getStatus } from "@/lib/utils";
import { SUBJECT_KEYS, SUBJECT_LABELS } from "@/lib/types";
import type { Grade } from "@/lib/types";

export default async function StudentDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("name").eq("id", user.id).single();
  const { data: grades } = await supabase.from("grades").select("*").eq("student_id", user.id).order("created_at");
  const { data: reflections } = await supabase.from("reflections").select("id").eq("student_id", user.id);

  const g = (grades || []) as Grade[];
  const status = getStatus(g);
  const lastGrade = g[g.length - 1];

  return (
    <div>
      <h1 className="text-[26px] font-extrabold text-green-900 mb-1.5">Dashboard</h1>
      <p className="text-gray-500 mb-7">
        Welcome back, {profile?.name?.split(" ")[0]}! Here&apos;s your learning summary.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard icon={<TrendingUp size={22} />} label="Latest Average" value={lastGrade?.avg?.toFixed(1) || "—"} />
        <StatCard icon={<Activity size={22} />} label="Semesters Recorded" value={g.length} />
        <StatCard icon={<Target size={22} />} label="Reflections" value={reflections?.length || 0} />
        <StatCard icon={<Award size={22} />} label="Status" value={<StatusBadge status={status} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
        <Card>
          <h3 className="text-base font-bold text-gray-800 mb-4">Grade Trend (All Semesters)</h3>
          <GradeAreaChart grades={g} />
        </Card>
        <Card>
          <h3 className="text-base font-bold text-gray-800 mb-4">Latest Semester</h3>
          {lastGrade &&
            SUBJECT_KEYS.map((key) => {
              const v = lastGrade[key];
              return (
                <div key={key} className="mb-2.5">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">{SUBJECT_LABELS[key]}</span>
                    <span className="font-bold text-gray-800">{v}</span>
                  </div>
                  <div className="h-1.5 rounded-sm bg-green-50">
                    <div
                      className="h-full rounded-sm"
                      style={{
                        width: `${v}%`,
                        background: v >= 85 ? "#2d7a35" : v >= 75 ? "#5aad6a" : "#c98a3e",
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </Card>
      </div>
    </div>
  );
}

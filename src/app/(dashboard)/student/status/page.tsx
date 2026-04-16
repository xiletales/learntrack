import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatus } from "@/lib/utils";

export default async function StudentStatusPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: grades } = await supabase
    .from("grades")
    .select("*")
    .eq("student_id", user.id)
    .order("created_at");

  const g = grades || [];
  const status = getStatus(g);
  const last = g[g.length - 1];
  const first = g[0];
  const overallChange = last && first ? (last.avg - first.avg).toFixed(1) : "0";

  return (
    <div>
      <h1 className="text-[26px] font-extrabold text-green-900 mb-1.5">
        Learning Status
      </h1>
      <p className="text-gray-500 mb-6">
        Auto-calculated based on your recent grade trend.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <Card className="text-center py-9 px-6">
          <div className="text-sm text-gray-500 mb-3.5 font-semibold uppercase tracking-wider">
            Current Status
          </div>
          <div className="text-4xl">
            <StatusBadge status={status} />
          </div>
          <p className="text-gray-500 text-[13px] mt-4 leading-relaxed">
            {status === "improving" && "Your grades show a consistent upward trend. Keep up the great work!"}
            {status === "stable" && "Your grades are consistent. Try to push for more improvement!"}
            {status === "declining" && "Your grades show a downward trend. Let's work on a study plan!"}
          </p>
        </Card>
        <Card className="text-center py-9 px-6">
          <div className="text-sm text-gray-500 mb-3.5 font-semibold uppercase tracking-wider">
            Overall Change
          </div>
          <div
            className="text-5xl font-black"
            style={{ color: Number(overallChange) >= 0 ? "#2d7a35" : "#c0616a" }}
          >
            {Number(overallChange) >= 0 ? "+" : ""}
            {overallChange}
          </div>
          <p className="text-gray-500 text-[13px] mt-2">
            Points from Semester 1 to latest
          </p>
        </Card>
      </div>

      <Card>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          Semester-by-Semester Analysis
        </h3>
        <div className="flex flex-col gap-2.5">
          {g.map((grade, i) => {
            const prev = g[i - 1];
            const diff = prev ? (grade.avg - prev.avg).toFixed(1) : null;
            const st =
              !prev
                ? null
                : Number(diff) >= 2
                  ? "improving" as const
                  : Number(diff) <= -2
                    ? "declining" as const
                    : "stable" as const;

            return (
              <div
                key={grade.semester}
                className="flex items-center gap-4 px-4 py-3 rounded-[10px] bg-green-50/50 border border-emerald-200"
              >
                <div className="w-9 h-9 rounded-[10px] bg-green-50 flex items-center justify-center text-xs font-bold text-green-700">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-800">
                    {grade.semester}
                  </div>
                  <div className="text-xs text-gray-500">
                    Average: {grade.avg.toFixed(1)}
                  </div>
                </div>
                {diff !== null && (
                  <div
                    className="text-[13px] font-bold"
                    style={{ color: Number(diff) >= 0 ? "#2d7a35" : "#c0616a" }}
                  >
                    {Number(diff) >= 0 ? "+" : ""}
                    {diff}
                  </div>
                )}
                {st ? (
                  <StatusBadge status={st} />
                ) : (
                  <span className="text-xs text-gray-500">Baseline</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

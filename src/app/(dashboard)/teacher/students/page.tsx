import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatus } from "@/lib/utils";
import { SUBJECT_KEYS, SUBJECT_LABELS } from "@/lib/types";
import { getClassStudentsWithGrades } from "@/actions/grades";

export default async function TeacherStudentsPage() {
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
        Student Data
      </h1>
      <p className="text-gray-500 mb-6">
        View all student information and academic records.
      </p>

      <div className="flex flex-col gap-4">
        {students.map((s) => {
          const last = s.grades[s.grades.length - 1];
          return (
            <Card key={s.id}>
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-700 to-emerald-500 text-white flex items-center justify-center font-bold text-lg">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-base font-bold text-gray-800">{s.name}</div>
                  <div className="text-xs text-gray-500">
                    NISN: {s.nisn} &bull; Class {s.class} &bull; {s.school_year}
                  </div>
                </div>
                <StatusBadge status={getStatus(s.grades)} />
              </div>
              {last && (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {SUBJECT_KEYS.map((key) => (
                    <div key={key} className="text-center p-2 bg-green-50/50 rounded-lg">
                      <div className="text-lg font-extrabold text-green-700">{last[key]}</div>
                      <div className="text-[10px] text-gray-500 leading-tight">{SUBJECT_LABELS[key]}</div>
                    </div>
                  ))}
                  <div className="text-center p-2 bg-green-100 rounded-lg">
                    <div className="text-lg font-extrabold text-green-900">{last.avg.toFixed(1)}</div>
                    <div className="text-[10px] text-gray-600 font-bold leading-tight">Rata-rata</div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
        {students.length === 0 && (
          <Card className="text-center py-12">
            <p className="text-gray-500">No students found for your class.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

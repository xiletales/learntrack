import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getClassStudentsWithGrades, getUploadHistory } from "@/actions/grades";
import { UploadClient } from "./upload-client";

export default async function TeacherUploadPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: teacher } = await supabase.from("teachers").select("class_handled").eq("id", user.id).single();
  const students = teacher?.class_handled
    ? await getClassStudentsWithGrades(teacher.class_handled)
    : [];

  const history = await getUploadHistory();

  return (
    <UploadClient
      students={students.map((s) => ({
        id: s.id,
        name: s.name,
        class: `${s.grade || ""} ${s.major || ""} ${s.class_number || ""}`.trim(),
      }))}
      uploadHistory={history}
    />
  );
}

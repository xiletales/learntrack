import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileClient } from "@/components/profile/profile-client";

export default async function StudentProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: student } = await supabase.from("students").select("*").eq("id", user.id).single();
  const { data: grades } = await supabase.from("grades").select("*").eq("student_id", user.id).order("created_at");

  if (!profile || !student) redirect("/login");

  return (
    <ProfileClient
      role="student"
      profile={profile}
      extended={student}
      grades={grades || []}
    />
  );
}

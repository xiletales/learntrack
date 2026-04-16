import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileClient } from "@/components/profile/profile-client";

export default async function TeacherProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: teacher } = await supabase.from("teachers").select("*").eq("id", user.id).single();

  if (!profile || !teacher) redirect("/login");

  return (
    <ProfileClient
      role="teacher"
      profile={profile}
      extended={teacher}
    />
  );
}

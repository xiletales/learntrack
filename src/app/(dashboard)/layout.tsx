import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  let subtitle = "";
  if (profile.role === "student") {
    const { data: student } = await supabase
      .from("students")
      .select("nis")
      .eq("id", user.id)
      .single();
    subtitle = `NIS: ${student?.nis || ""}`;
  } else {
    const { data: teacher } = await supabase
      .from("teachers")
      .select("subject")
      .eq("id", user.id)
      .single();
    subtitle = teacher?.subject || "";
  }

  return (
    <div className="flex min-h-screen bg-green-50/30">
      <Sidebar
        role={profile.role}
        userName={profile.name}
        userSubtitle={subtitle}
        photoUrl={profile.photo_url}
      />
      <main className="flex-1 p-8 min-h-screen">{children}</main>
    </div>
  );
}

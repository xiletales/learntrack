"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const role = formData.get("role") as string;
  const name = formData.get("name") as string;
  const gender = formData.get("gender") as string;
  const school = formData.get("school") as string;
  const schoolYear = formData.get("school_year") as string;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ name, gender, school, school_year: schoolYear })
    .eq("id", user.id);

  if (profileError) return { error: profileError.message };

  if (role === "student") {
    const birthDate = formData.get("birth_date") as string;
    const major = formData.get("major") as string;
    const grade = formData.get("grade") as string;
    const classNumber = formData.get("class_number") as string;
    const address = formData.get("address") as string;

    const { error } = await supabase
      .from("students")
      .update({ birth_date: birthDate || null, major: major || null, grade: grade || null, class_number: classNumber || null, address })
      .eq("id", user.id);
    if (error) return { error: error.message };
  } else {
    const jurusan = formData.get("jurusan") as string;
    const subject = formData.get("subject") as string;
    const classHandled = formData.get("class_handled") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;

    const { error } = await supabase
      .from("teachers")
      .update({ jurusan: jurusan || null, subject, class_handled: classHandled, phone, email })
      .eq("id", user.id);
    if (error) return { error: error.message };
  }

  revalidatePath("/student/profile");
  revalidatePath("/teacher/profile");
  return { success: true };
}

export async function uploadPhoto(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const file = formData.get("photo") as File;
  if (!file) return { error: "No file provided" };

  const ext = file.name.split(".").pop();
  const filePath = `${user.id}/profile.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ photo_url: publicUrl })
    .eq("id", user.id);

  if (updateError) return { error: updateError.message };

  revalidatePath("/student/profile");
  revalidatePath("/teacher/profile");
  return { success: true, url: publicUrl };
}

export async function removePhoto() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: files } = await supabase.storage
    .from("avatars")
    .list(user.id);

  if (files && files.length > 0) {
    await supabase.storage
      .from("avatars")
      .remove(files.map((f) => `${user.id}/${f.name}`));
  }

  await supabase
    .from("profiles")
    .update({ photo_url: null })
    .eq("id", user.id);

  revalidatePath("/student/profile");
  revalidatePath("/teacher/profile");
  return { success: true };
}

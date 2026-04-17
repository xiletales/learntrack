"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatus } from "@/lib/utils";
import { classOptions, schoolYearOptions, majorOptions, gradeOptions, classNumberOptions } from "@/lib/constants";
import { updateProfile, uploadPhoto, removePhoto } from "@/actions/profile";
import type { Profile, Grade } from "@/lib/types";

interface Props {
  role: "student" | "teacher";
  profile: Profile;
  extended: Record<string, unknown>;
  grades?: Grade[];
}

export function ProfileClient({ role, profile, extended, grades = [] }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({ ...profile, ...extended });
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile.photo_url);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const handlePhotoFile = async (file: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.set("photo", file);
    await uploadPhoto(formData);
    router.refresh();
  };

  const handleRemovePhoto = async () => {
    setPhotoPreview(null);
    await removePhoto();
    router.refresh();
  };

  const handleSave = async () => {
    setSaving(true);
    const formData = new FormData();
    formData.set("role", role);
    formData.set("name", form.name as string);
    formData.set("gender", (form.gender as string) || "");
    formData.set("school", (form.school as string) || "");
    formData.set("school_year", (form.school_year as string) || "");
    if (role === "student") {
      formData.set("birth_date", (form.birth_date as string) || "");
      formData.set("major", (form.major as string) || "");
      formData.set("grade", (form.grade as string) || "");
      formData.set("class_number", (form.class_number as string) || "");
      formData.set("address", (form.address as string) || "");
    } else {
      formData.set("jurusan", (form.jurusan as string) || "");
      formData.set("subject", (form.subject as string) || "");
      formData.set("class_handled", (form.class_handled as string) || "");
      formData.set("phone", (form.phone as string) || "");
      formData.set("email", (form.email as string) || "");
    }
    await updateProfile(formData);
    setSaving(false);
    setEditing(false);
    router.refresh();
  };

  const isStudent = role === "student";

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-[26px] font-extrabold text-green-900 mb-1.5">
            {isStudent ? "Student" : "Teacher"} Profile
          </h1>
          <p className="text-gray-500">View and edit your profile information.</p>
        </div>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>
            <Edit3 size={15} /> Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2.5">
            <Button onClick={handleSave} disabled={saving}>
              <Save size={15} /> {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setForm({ ...profile, ...extended });
                setPhotoPreview(profile.photo_url);
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-5">
        <Card className="text-center py-7 px-5">
          <div className="relative inline-block mb-4">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Profile"
                className="w-[100px] h-[100px] rounded-full object-cover border-[3px] border-emerald-200 block"
              />
            ) : (
              <div className="w-[100px] h-[100px] rounded-full bg-gradient-to-br from-green-700 to-emerald-500 flex items-center justify-center text-4xl font-bold text-white mx-auto">
                {(form.name as string)?.charAt(0)}
              </div>
            )}
            {editing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0.5 right-0.5 w-[30px] h-[30px] rounded-full bg-green-700 border-2 border-white flex items-center justify-center cursor-pointer text-white"
              >
                <Edit3 size={13} />
              </button>
            )}
          </div>
          <div className="text-[17px] font-bold text-gray-800">{form.name as string}</div>
          {isStudent ? (
            <>
              <div className="text-gray-500 text-[13px] mt-1">NIS: {form.nis as string}</div>
              <div className="mt-2.5">
                <StatusBadge status={getStatus(grades)} />
              </div>
            </>
          ) : (
            <>
              <div className="text-gray-500 text-[13px] mt-1">NIP: {form.nip as string}</div>
              {form.jurusan && (
                <div className="mt-1.5 inline-block bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  {form.jurusan as string}
                </div>
              )}
            </>
          )}

          {editing && (
            <div className="mt-5">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handlePhotoFile(e.dataTransfer.files[0]); }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all ${
                  dragOver ? "border-green-700 bg-green-50" : "border-emerald-200 bg-green-50/50"
                }`}
              >
                <Upload size={20} className="text-gray-500 mx-auto mb-1.5" />
                <div className="text-xs text-gray-500 leading-relaxed">
                  Click or drag photo here
                  <br />
                  <span className="opacity-70 text-[11px]">JPG, PNG — max 5MB</span>
                </div>
              </div>
              {photoPreview && (
                <button
                  onClick={handleRemovePhoto}
                  className="mt-2.5 w-full bg-transparent border border-red-400 text-red-400 rounded-lg py-1.5 text-xs font-semibold cursor-pointer"
                >
                  Remove photo
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handlePhotoFile(e.target.files[0])}
                className="hidden"
              />
            </div>
          )}
        </Card>

        <Card>
          <h3 className="text-base font-bold text-gray-800 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Input label="Full Name" value={(form.name as string) || ""} onChange={f("name")} readOnly={!editing} />
            <Input label="Gender" value={(form.gender as string) || ""} onChange={f("gender")} as={editing ? "select" : "input"} options={["Male", "Female"]} readOnly={!editing} />
            {isStudent ? (
              <>
                <Input label="Date of Birth" value={(form.birth_date as string) || ""} onChange={f("birth_date")} type="date" readOnly={!editing} />
                <Input label="NIS" value={(form.nis as string) || ""} readOnly />
                <Input label="Major" value={(form.major as string) || ""} onChange={f("major")} as={editing ? "select" : "input"} options={majorOptions} readOnly={!editing} />
                <Input label="Grade" value={(form.grade as string) || ""} onChange={f("grade")} as={editing ? "select" : "input"} options={gradeOptions} readOnly={!editing} />
                <Input label="Class" value={(form.class_number as string) || ""} onChange={f("class_number")} as={editing ? "select" : "input"} options={classNumberOptions} readOnly={!editing} />
                <Input label="School Year" value={(form.school_year as string) || ""} onChange={f("school_year")} as={editing ? "select" : "input"} options={schoolYearOptions} readOnly={!editing} />
              </>
            ) : (
              <>
                <Input label="NIP" value={(form.nip as string) || ""} readOnly />
                <Input label="Major" value={(form.jurusan as string) || ""} onChange={f("jurusan")} as={editing ? "select" : "input"} options={["MIPA", "IPS"]} readOnly={!editing} />
                <Input label="Class Handled" value={(form.class_handled as string) || ""} onChange={f("class_handled")} as={editing ? "select" : "input"} options={classOptions} readOnly={!editing} />
              </>
            )}
            <Input label="School" value={(form.school as string) || ""} onChange={f("school")} readOnly={!editing} />
            {!isStudent && <Input label="Email" value={(form.email as string) || ""} onChange={f("email")} readOnly={!editing} />}
            {!isStudent && <Input label="Phone" value={(form.phone as string) || ""} onChange={f("phone")} readOnly={!editing} />}
            <div className="md:col-span-2">
              <Input label="Address" value={(form.address as string) || ""} onChange={f("address")} readOnly={!editing} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

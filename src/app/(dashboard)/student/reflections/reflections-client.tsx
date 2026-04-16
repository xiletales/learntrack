"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Edit3, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { saveReflection } from "@/actions/reflections";
import type { Reflection } from "@/lib/types";

interface Props {
  reflections: Reflection[];
  semesters: string[];
}

export function ReflectionsClient({ reflections, semesters }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ semester: "", text: "", target: "" });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    if (!form.semester || !form.text) return;
    setSaving(true);
    const formData = new FormData();
    formData.set("semester", form.semester);
    formData.set("text", form.text);
    formData.set("target", form.target);
    await saveReflection(formData);
    setSaving(false);
    setShowForm(false);
    setForm({ semester: "", text: "", target: "" });
    router.refresh();
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-[26px] font-extrabold text-green-900 mb-1.5">
            Learning Reflections
          </h1>
          <p className="text-gray-500">
            Write your learning reflection and set targets for each semester.
          </p>
        </div>
        <Button
          onClick={() => {
            setForm({ semester: "", text: "", target: "" });
            setShowForm(true);
          }}
        >
          + Add Reflection
        </Button>
      </div>

      {showForm && (
        <Card className="mb-5 border-2 border-green-700">
          <h3 className="text-base font-bold text-gray-800 mb-4">
            New Reflection
          </h3>
          <Input
            label="Semester"
            value={form.semester}
            onChange={(e) => setForm({ ...form, semester: e.target.value })}
            as="select"
            options={semesters}
          />
          <Input
            label="Reflection"
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
            as="textarea"
            placeholder="Write your reflection on this semester's learning..."
          />
          <Input
            label="Target for Next Semester"
            value={form.target}
            onChange={(e) => setForm({ ...form, target: e.target.value })}
            placeholder="What do you want to achieve next semester?"
          />
          <div className="flex gap-2.5">
            <Button onClick={handleSave} disabled={saving}>
              <Save size={15} /> {saving ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {reflections.length === 0 && !showForm && (
        <Card className="text-center py-12">
          <BookOpen size={48} className="text-emerald-200 mx-auto mb-3.5" />
          <p className="text-gray-500">
            No reflections yet. Start by adding your first reflection!
          </p>
        </Card>
      )}

      <div className="flex flex-col gap-4">
        {reflections.map((r) => (
          <Card key={r.id}>
            <div className="flex justify-between items-center mb-3.5">
              <span className="bg-green-50 text-green-900 px-3 py-1 rounded-full text-xs font-bold">
                {r.semester}
              </span>
              <Button
                variant="ghost"
                onClick={() => {
                  setForm({
                    semester: r.semester,
                    text: r.text || "",
                    target: r.target || "",
                  });
                  setShowForm(true);
                }}
              >
                <Edit3 size={14} /> Edit
              </Button>
            </div>
            {r.text && (
              <div className="mb-3.5">
                <div className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                  My Reflection
                </div>
                <p className="text-gray-800 text-sm leading-relaxed">
                  {r.text}
                </p>
              </div>
            )}
            {r.target && (
              <div className="mb-3.5 p-3 bg-green-50/50 rounded-lg border-l-[3px] border-green-700">
                <div className="text-xs font-bold text-green-700 mb-1">
                  Target
                </div>
                <p className="text-gray-800 text-[13px]">{r.target}</p>
              </div>
            )}
            {r.teacher_note && (
              <div className="p-3 bg-blue-50 rounded-lg border-l-[3px] border-blue-500">
                <div className="text-xs font-bold text-blue-500 mb-1">
                  Teacher&apos;s Note
                </div>
                <p className="text-blue-900 text-[13px]">{r.teacher_note}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

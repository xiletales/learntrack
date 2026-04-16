"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { addTeacherNote } from "@/actions/reflections";
import type { StudentWithData } from "@/lib/types";

export function TeacherReflectionsClient({ students }: { students: StudentWithData[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showNote, setShowNote] = useState(false);
  const [noteForm, setNoteForm] = useState({ semester: "", note: "" });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const student = selected ? students.find((s) => s.id === selected) : null;
  const semOptions = student ? student.grades.map((g) => g.semester) : [];

  const saveNote = async () => {
    if (!noteForm.semester || !noteForm.note || !student) return;
    setSaving(true);
    const formData = new FormData();
    formData.set("student_id", student.id);
    formData.set("semester", noteForm.semester);
    formData.set("note", noteForm.note);
    await addTeacherNote(formData);
    setSaving(false);
    setShowNote(false);
    setNoteForm({ semester: "", note: "" });
    router.refresh();
  };

  return (
    <div>
      <h1 className="text-[26px] font-extrabold text-green-900 mb-1.5">
        Student Reflections
      </h1>
      <p className="text-gray-500 mb-6">
        View student reflections and add teacher notes.
      </p>

      <div className="flex gap-2.5 flex-wrap mb-6">
        {students.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setSelected(selected === s.id ? null : s.id);
              setShowNote(false);
            }}
            className={`px-4 py-2 rounded-[10px] border-[1.5px] text-[13px] font-semibold cursor-pointer transition-all ${
              selected === s.id
                ? "border-green-700 bg-green-700 text-white"
                : "border-emerald-200 bg-white text-gray-800"
            }`}
          >
            {s.name}{" "}
            {s.reflections.length > 0 && (
              <span className="bg-white/30 rounded-full px-1.5 text-[11px]">
                {s.reflections.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {student && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-gray-800">
              Reflections &mdash; {student.name}
            </h3>
            <Button onClick={() => setShowNote(true)}>
              <MessageSquare size={15} /> Add Note
            </Button>
          </div>

          {showNote && (
            <Card className="mb-4 border-2 border-green-700">
              <h4 className="text-sm font-bold text-gray-800 mb-3.5">
                Add Teacher Note
              </h4>
              <Input
                label="Semester"
                value={noteForm.semester}
                onChange={(e) => setNoteForm({ ...noteForm, semester: e.target.value })}
                as="select"
                options={semOptions}
              />
              <Input
                label="Message to Student"
                value={noteForm.note}
                onChange={(e) => setNoteForm({ ...noteForm, note: e.target.value })}
                as="textarea"
                placeholder="Write your encouragement, feedback, or guidance..."
              />
              <div className="flex gap-2.5">
                <Button onClick={saveNote} disabled={saving}>
                  <Save size={14} /> {saving ? "Saving..." : "Save Note"}
                </Button>
                <Button variant="outline" onClick={() => setShowNote(false)}>
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          {student.reflections.length === 0 ? (
            <Card className="text-center py-10">
              <p className="text-gray-500">This student has no reflections yet.</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3.5">
              {student.reflections.map((r) => (
                <Card key={r.id}>
                  <span className="bg-green-50 text-green-900 px-2.5 py-1 rounded-full text-xs font-bold">
                    {r.semester}
                  </span>
                  {r.text && (
                    <div className="mt-3.5">
                      <div className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                        Student&apos;s Reflection
                      </div>
                      <p className="text-gray-800 text-sm leading-relaxed">
                        {r.text}
                      </p>
                    </div>
                  )}
                  {r.target && (
                    <div className="mt-3 p-2.5 bg-green-50/50 rounded-lg border-l-[3px] border-green-700">
                      <span className="text-xs font-bold text-green-700">Target: </span>
                      <span className="text-[13px] text-gray-800">{r.target}</span>
                    </div>
                  )}
                  {r.teacher_note && (
                    <div className="mt-3 p-2.5 bg-blue-50 rounded-lg border-l-[3px] border-blue-500">
                      <span className="text-xs font-bold text-blue-500">Teacher: </span>
                      <span className="text-[13px] text-blue-900">{r.teacher_note}</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {!student && (
        <Card className="text-center py-12">
          <MessageSquare size={48} className="text-emerald-200 mx-auto mb-3.5" />
          <p className="text-gray-500">
            Select a student above to view their reflections.
          </p>
        </Card>
      )}
    </div>
  );
}

export type Role = "student" | "teacher";

export interface Profile {
  id: string;
  role: Role;
  name: string;
  gender: string | null;
  school: string | null;
  school_year: string | null;
  photo_url: string | null;
}

export interface Student {
  id: string;
  nis: string;
  birth_date: string | null;
  major: string | null;
  grade: string | null;
  class_number: string | null;
  address: string | null;
  profiles: Profile;
}

export interface Teacher {
  id: string;
  nip: string;
  jurusan: string | null;
  class_handled: string | null;
  subject: string | null;
  phone: string | null;
  email: string | null;
  profiles: Profile;
}

export interface Grade {
  id: string;
  student_id: string;
  semester: string;
  matematika_umum: number;
  matematika_peminatan: number;
  bahasa_indonesia: number;
  bahasa_inggris: number;
  fisika: number;
  kimia: number;
  biologi: number;
  sejarah: number;
  informatika: number;
  pai: number;
  pjok: number;
  avg: number;
  uploaded_by: string | null;
  created_at: string;
}

export interface Reflection {
  id: string;
  student_id: string;
  semester: string;
  text: string | null;
  target: string | null;
  teacher_note: string | null;
  noted_by: string | null;
  created_at: string;
}

export interface StudentWithData {
  id: string;
  nis: string;
  birth_date: string | null;
  major: string | null;
  grade: string | null;
  class_number: string | null;
  address: string | null;
  name: string;
  gender: string | null;
  school: string | null;
  school_year: string | null;
  photo_url: string | null;
  grades: Grade[];
  reflections: Reflection[];
}

export interface TeacherProfile {
  id: string;
  nip: string;
  jurusan: string | null;
  class_handled: string | null;
  subject: string | null;
  phone: string | null;
  email: string | null;
  name: string;
  gender: string | null;
  school: string | null;
  school_year: string | null;
  photo_url: string | null;
}

export const SUBJECT_KEYS = [
  "matematika_umum",
  "matematika_peminatan",
  "bahasa_indonesia",
  "bahasa_inggris",
  "fisika",
  "kimia",
  "biologi",
  "sejarah",
  "informatika",
  "pai",
  "pjok",
] as const;

export type SubjectKey = (typeof SUBJECT_KEYS)[number];

export const SUBJECT_LABELS: Record<SubjectKey, string> = {
  matematika_umum: "Gen. Math",
  matematika_peminatan: "Spec. Math",
  bahasa_indonesia: "Indonesian",
  bahasa_inggris: "English",
  fisika: "Physics",
  kimia: "Chemistry",
  biologi: "Biology",
  sejarah: "History",
  informatika: "IT",
  pai: "Religion",
  pjok: "PE",
};

export const SUBJECT_LABELS_FULL: Record<SubjectKey, string> = {
  matematika_umum: "General Mathematics",
  matematika_peminatan: "Specialized Mathematics",
  bahasa_indonesia: "Indonesian Language",
  bahasa_inggris: "English Language",
  fisika: "Physics",
  kimia: "Chemistry",
  biologi: "Biology",
  sejarah: "History",
  informatika: "Informatics",
  pai: "Religious Education",
  pjok: "Physical Education",
};

/**
 * LearnTrack — Seed Script
 *
 * Run: SUPABASE_SERVICE_ROLE_KEY=your_key npx tsx supabase/seed-users.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nmigyjygjqufrbgxbygo.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) { console.error("Missing SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface GradeRow {
  semester: string;
  matematika_umum: number; matematika_peminatan: number;
  bahasa_indonesia: number; bahasa_inggris: number;
  fisika: number; kimia: number; biologi: number;
  sejarah: number; informatika: number; pai: number; pjok: number;
}

const studentSeeds = [
  {
    email: "nis_12345@learntrack.local", password: "siswa123",
    name: "Adi Nugroho", gender: "Male", school: "SMA Negeri 1 Sragen", schoolYear: "2024/2025",
    nis: "12345", birthDate: "2008-03-15", major: "MIPA", grade: "10", classNumber: "1",
    address: "Jl. Merdeka No. 12, Sragen",
    grades: [
      { semester: "Sem 1 (Grade 10)", matematika_umum: 78, matematika_peminatan: 75, bahasa_indonesia: 85, bahasa_inggris: 80, fisika: 82, kimia: 76, biologi: 79, sejarah: 72, informatika: 84, pai: 80, pjok: 78 },
      { semester: "Sem 2 (Grade 10)", matematika_umum: 81, matematika_peminatan: 78, bahasa_indonesia: 87, bahasa_inggris: 83, fisika: 84, kimia: 79, biologi: 81, sejarah: 75, informatika: 86, pai: 82, pjok: 80 },
      { semester: "Sem 1 (Grade 11)", matematika_umum: 79, matematika_peminatan: 77, bahasa_indonesia: 88, bahasa_inggris: 85, fisika: 86, kimia: 82, biologi: 83, sejarah: 78, informatika: 88, pai: 84, pjok: 82 },
      { semester: "Sem 2 (Grade 11)", matematika_umum: 85, matematika_peminatan: 82, bahasa_indonesia: 90, bahasa_inggris: 87, fisika: 88, kimia: 85, biologi: 86, sejarah: 80, informatika: 90, pai: 86, pjok: 84 },
      { semester: "Sem 1 (Grade 12)", matematika_umum: 87, matematika_peminatan: 84, bahasa_indonesia: 91, bahasa_inggris: 88, fisika: 89, kimia: 87, biologi: 88, sejarah: 83, informatika: 91, pai: 88, pjok: 86 },
      { semester: "Sem 2 (Grade 12)", matematika_umum: 90, matematika_peminatan: 87, bahasa_indonesia: 93, bahasa_inggris: 90, fisika: 91, kimia: 89, biologi: 90, sejarah: 86, informatika: 93, pai: 90, pjok: 88 },
    ] as GradeRow[],
    reflections: [
      { semester: "Sem 1 (Grade 10)", text: "Saya perlu meningkatkan matematika.", target: "Mencapai 85 di matematika.", teacherNote: "Terus semangat Adi!" },
      { semester: "Sem 2 (Grade 10)", text: "Matematika meningkat tapi fisika perlu perhatian.", target: "Meningkatkan fisika ke 87.", teacherNote: "" },
    ],
  },
  {
    email: "nis_67890@learntrack.local", password: "siswa123",
    name: "Siti Rahayu", gender: "Female", school: "SMA Negeri 1 Sragen", schoolYear: "2024/2025",
    nis: "67890", birthDate: "2008-07-22", major: "MIPA", grade: "10", classNumber: "1",
    address: "Jl. Sudirman No. 45, Sragen",
    grades: [
      { semester: "Sem 1 (Grade 10)", matematika_umum: 90, matematika_peminatan: 88, bahasa_indonesia: 92, bahasa_inggris: 91, fisika: 88, kimia: 90, biologi: 89, sejarah: 85, informatika: 91, pai: 88, pjok: 82 },
      { semester: "Sem 2 (Grade 10)", matematika_umum: 88, matematika_peminatan: 86, bahasa_indonesia: 91, bahasa_inggris: 90, fisika: 87, kimia: 88, biologi: 87, sejarah: 84, informatika: 90, pai: 87, pjok: 84 },
      { semester: "Sem 1 (Grade 11)", matematika_umum: 86, matematika_peminatan: 84, bahasa_indonesia: 89, bahasa_inggris: 88, fisika: 85, kimia: 86, biologi: 86, sejarah: 82, informatika: 88, pai: 86, pjok: 83 },
      { semester: "Sem 2 (Grade 11)", matematika_umum: 87, matematika_peminatan: 85, bahasa_indonesia: 90, bahasa_inggris: 89, fisika: 86, kimia: 87, biologi: 87, sejarah: 83, informatika: 89, pai: 87, pjok: 84 },
      { semester: "Sem 1 (Grade 12)", matematika_umum: 89, matematika_peminatan: 87, bahasa_indonesia: 91, bahasa_inggris: 90, fisika: 88, kimia: 89, biologi: 89, sejarah: 85, informatika: 91, pai: 89, pjok: 85 },
      { semester: "Sem 2 (Grade 12)", matematika_umum: 91, matematika_peminatan: 89, bahasa_indonesia: 93, bahasa_inggris: 92, fisika: 90, kimia: 91, biologi: 91, sejarah: 87, informatika: 93, pai: 91, pjok: 86 },
    ] as GradeRow[],
    reflections: [
      { semester: "Sem 1 (Grade 10)", text: "Semester berjalan baik.", target: "Tetap di atas 88.", teacherNote: "Performa luar biasa!" },
    ],
  },
  {
    email: "nis_11223@learntrack.local", password: "siswa123",
    name: "Bima Saputra", gender: "Male", school: "SMA Negeri 1 Sragen", schoolYear: "2024/2025",
    nis: "11223", birthDate: "2008-11-05", major: "MIPA", grade: "10", classNumber: "1",
    address: "Jl. Gatot Subroto No. 8, Sragen",
    grades: [
      { semester: "Sem 1 (Grade 10)", matematika_umum: 70, matematika_peminatan: 68, bahasa_indonesia: 75, bahasa_inggris: 71, fisika: 72, kimia: 69, biologi: 73, sejarah: 76, informatika: 74, pai: 78, pjok: 80 },
      { semester: "Sem 2 (Grade 10)", matematika_umum: 68, matematika_peminatan: 66, bahasa_indonesia: 73, bahasa_inggris: 69, fisika: 70, kimia: 67, biologi: 71, sejarah: 74, informatika: 72, pai: 76, pjok: 82 },
      { semester: "Sem 1 (Grade 11)", matematika_umum: 65, matematika_peminatan: 63, bahasa_indonesia: 70, bahasa_inggris: 66, fisika: 67, kimia: 64, biologi: 68, sejarah: 72, informatika: 70, pai: 74, pjok: 81 },
      { semester: "Sem 2 (Grade 11)", matematika_umum: 72, matematika_peminatan: 70, bahasa_indonesia: 76, bahasa_inggris: 73, fisika: 74, kimia: 71, biologi: 75, sejarah: 77, informatika: 76, pai: 79, pjok: 83 },
      { semester: "Sem 1 (Grade 12)", matematika_umum: 75, matematika_peminatan: 73, bahasa_indonesia: 78, bahasa_inggris: 76, fisika: 76, kimia: 74, biologi: 77, sejarah: 79, informatika: 78, pai: 80, pjok: 84 },
      { semester: "Sem 2 (Grade 12)", matematika_umum: 78, matematika_peminatan: 76, bahasa_indonesia: 80, bahasa_inggris: 78, fisika: 79, kimia: 77, biologi: 80, sejarah: 81, informatika: 80, pai: 82, pjok: 85 },
    ] as GradeRow[],
    reflections: [],
  },
];

const teacherSeeds = [
  {
    email: "budi.santoso@sman1sragen.sch.id", password: "guru123",
    name: "Budi Santoso, S.Pd.", gender: "Male", school: "SMA Negeri 1 Sragen", schoolYear: "2024/2025",
    nip: "198503152010011001", jurusan: "MIPA", classHandled: "10 MIPA 1",
    subject: "Mathematics", phone: "081234567890", teacherEmail: "budi.santoso@sman1sragen.sch.id",
  },
  {
    email: "ani.widyastuti@sman1sragen.sch.id", password: "guru123",
    name: "Ani Widyastuti, M.Pd.", gender: "Female", school: "SMA Negeri 1 Sragen", schoolYear: "2024/2025",
    nip: "198907122015042001", jurusan: "IPS", classHandled: "10 IPS 1",
    subject: "Indonesian Language", phone: "082345678901", teacherEmail: "ani.widyastuti@sman1sragen.sch.id",
  },
];

async function seed() {
  console.log("Seeding LearnTrack database...\n");
  const teacherIds: Record<string, string> = {};

  for (const t of teacherSeeds) {
    console.log(`Creating teacher: ${t.name}`);
    const { data, error } = await supabase.auth.admin.createUser({ email: t.email, password: t.password, email_confirm: true });
    if (error) { console.error(`  -> Error: ${error.message}`); continue; }
    const userId = data.user.id;
    teacherIds[t.classHandled] = userId;
    console.log(`  -> Created: ${userId}`);
    await supabase.from("profiles").insert({ id: userId, role: "teacher", name: t.name, gender: t.gender, school: t.school, school_year: t.schoolYear });
    await supabase.from("teachers").insert({ id: userId, nip: t.nip, jurusan: t.jurusan, class_handled: t.classHandled, subject: t.subject, phone: t.phone, email: t.teacherEmail });
  }

  for (const s of studentSeeds) {
    console.log(`Creating student: ${s.name}`);
    const { data, error } = await supabase.auth.admin.createUser({ email: s.email, password: s.password, email_confirm: true });
    if (error) { console.error(`  -> Error: ${error.message}`); continue; }
    const userId = data.user.id;
    console.log(`  -> Created: ${userId}`);
    await supabase.from("profiles").insert({ id: userId, role: "student", name: s.name, gender: s.gender, school: s.school, school_year: s.schoolYear });
    await supabase.from("students").insert({ id: userId, nis: s.nis, birth_date: s.birthDate, major: s.major, grade: s.grade, class_number: s.classNumber, address: s.address });

    const classKey = `${s.grade} ${s.major} ${s.classNumber}`;
    const teacherId = teacherIds[classKey] || null;
    for (const g of s.grades) { await supabase.from("grades").insert({ student_id: userId, uploaded_by: teacherId, ...g }); }
    for (const r of s.reflections) {
      await supabase.from("reflections").insert({ student_id: userId, semester: r.semester, text: r.text, target: r.target, teacher_note: r.teacherNote || null, noted_by: r.teacherNote ? teacherId : null });
    }
  }

  console.log("\nSeed complete!");
  console.log("  Student: 12345 / siswa123");
  console.log("  Teacher: budi.santoso / guru123");
}

seed().catch(console.error);

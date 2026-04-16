import type { Grade } from "./types";

export function getStatus(grades: Grade[]): "improving" | "stable" | "declining" {
  if (!grades || grades.length < 2) return "stable";
  const recent = grades.slice(-3).map((g) => g.avg);
  const diff = recent[recent.length - 1] - recent[0];
  if (diff >= 2) return "improving";
  if (diff <= -2) return "declining";
  return "stable";
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

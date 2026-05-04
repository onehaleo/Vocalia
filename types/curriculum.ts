import type { Database } from "@/types/database";

export type LanguageRow = Database["public"]["Tables"]["languages"]["Row"];
export type CourseRow = Database["public"]["Tables"]["courses"]["Row"];
export type LevelRow = Database["public"]["Tables"]["levels"]["Row"];
export type ModuleRow = Database["public"]["Tables"]["modules"]["Row"];
export type LessonRow = Database["public"]["Tables"]["lessons"]["Row"];
export type PhraseRow = Database["public"]["Tables"]["phrases"]["Row"];
export type ActivityRow = Database["public"]["Tables"]["activities"]["Row"];
export type SoundLessonRow = Database["public"]["Tables"]["sound_lessons"]["Row"];

export type Grade = 3 | 4 | 5;

export interface CurriculumPeriod {
  period: number; // 1 to 140
  week: number;   // 1 to 35
  unit: string;   // e.g. "STARTER", "UNIT 1", "REVIEW 1"
  lessonTitle: string; // e.g. "Unit 3: Lesson 1 – Activity 1 - 3"
  page: string;   // e.g. "Trang 22"
  ndth?: string;  // Nội dung tích hợp / thực hiện
  note?: string;  // Ghi chú
}

export interface ClassInfo {
  id: string;
  name: string;        // e.g. "3G2", "4G1", "5G3"
  grade: Grade;
  curriculumGrade: Grade;
  color?: string;
  room?: string;
}

export type DayOfWeek = 2 | 3 | 4 | 5 | 6; // Thứ Hai = 2, Thứ Ba = 3, Thứ Tư = 4, Thứ Năm = 5, Thứ Sáu = 6
export type Session = 'morning' | 'afternoon';

export interface TimetableSlot {
  id: string;
  day: DayOfWeek;
  session: Session;
  period: number; // 1..4 for morning, 1..3 for afternoon
  classId: string | null;
}

export interface WeeklyScheduleRow {
  id: string;
  day: DayOfWeek;
  dayLabel: string; // "Thứ Hai", "Thứ Ba"...
  dateStr: string;  // "05/10"
  fullDateStr: string; // "05/10/2026"
  session: Session;
  sessionLabel: string; // "Sáng" | "Chiều"
  period: number; // 1..4 (Sáng) / 1..3 (Chiều)
  classId: string | null;
  className: string;
  grade?: Grade;
  lessonTitle: string;
  ppctPeriod: number | null;
  page?: string;
  ndth: string;
  notes: string;
  isCustomized?: boolean;
}

export interface WeekOverride {
  [rowId: string]: {
    className?: string;
    classId?: string | null;
    lessonTitle?: string;
    ppctPeriod?: number | null;
    ndth?: string;
    notes?: string;
  };
}

export interface GeneralSettings {
  schoolName: string;
  teacherName: string;
  subject: string;
  schoolYear: string;
  startDate: string; // YYYY-MM-DD e.g. "2026-09-07"
  totalWeeks: number;
}

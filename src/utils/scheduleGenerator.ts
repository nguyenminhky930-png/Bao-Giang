import {
  ClassInfo,
  CurriculumPeriod,
  Grade,
  TimetableSlot,
  WeeklyScheduleRow,
  WeekOverride,
} from '../types';
import { dayNamesMap, getWeekDateInfo } from './dateUtils';

interface GenerateWeeklyScheduleParams {
  weekNumber: number;
  startDateStr: string;
  timetableSlots: TimetableSlot[];
  classes: ClassInfo[];
  curricula: Record<Grade, CurriculumPeriod[]>;
  overrides?: WeekOverride;
}

export function generateWeeklyScheduleRows({
  weekNumber,
  startDateStr,
  timetableSlots,
  classes,
  curricula,
  overrides = {},
}: GenerateWeeklyScheduleParams): WeeklyScheduleRow[] {
  const weekInfo = getWeekDateInfo(weekNumber, startDateStr);
  const classMap = new Map<string, ClassInfo>(classes.map((c) => [c.id, c]));

  // Track the index of period for each class within this specific week (0, 1, 2, 3)
  const classWeeklyCounter = new Map<string, number>();

  const rows: WeeklyScheduleRow[] = [];

  // Sort slots chronologically: day (2..6) -> session ('morning' before 'afternoon') -> period (1..4)
  const sortedSlots = [...timetableSlots].sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    if (a.session !== b.session) return a.session === 'morning' ? -1 : 1;
    return a.period - b.period;
  });

  for (const slot of sortedSlots) {
    const rowId = `w${weekNumber}-${slot.day}-${slot.session}-${slot.period}`;
    const dayLabel = dayNamesMap[slot.day];
    const dateObj = weekInfo.dayDates[slot.day];
    const sessionLabel = slot.session === 'morning' ? 'Sáng' : 'Chiều';

    let classId = slot.classId;
    let cls = classId ? classMap.get(classId) : undefined;
    let className = cls ? cls.name : '';
    let grade = cls?.curriculumGrade || cls?.grade;

    // Check if there is an override for this cell
    const override = overrides[rowId];
    if (override) {
      if (override.className !== undefined) className = override.className;
      if (override.classId !== undefined) {
        classId = override.classId;
        cls = classId ? classMap.get(classId) : undefined;
        grade = cls?.curriculumGrade || cls?.grade;
      }
    }

    let lessonTitle = '';
    let ppctPeriod: number | null = null;
    let page = '';
    let ndth = '';
    let notes = '';

    if (cls && grade) {
      const currentCount = classWeeklyCounter.get(cls.id) || 0;
      // standard 4 periods per week progression: (week - 1) * 4 + currentCount + 1
      const calculatedPpct = (weekNumber - 1) * 4 + currentCount + 1;
      classWeeklyCounter.set(cls.id, currentCount + 1);

      // Lookup in that grade's curriculum
      const gradeCurriculum = curricula[grade] || [];
      const currItem = gradeCurriculum.find((item) => item.period === calculatedPpct);

      if (currItem) {
        ppctPeriod = currItem.period;
        lessonTitle = currItem.lessonTitle;
        page = currItem.page || '';
        ndth = currItem.ndth || '';
        notes = currItem.note || '';
      } else {
        ppctPeriod = calculatedPpct;
        lessonTitle = `Tiết ${calculatedPpct}`;
      }
    }

    // Apply manual overrides if present
    if (override) {
      if (override.lessonTitle !== undefined) lessonTitle = override.lessonTitle;
      if (override.ppctPeriod !== undefined) ppctPeriod = override.ppctPeriod;
      if (override.ndth !== undefined) ndth = override.ndth;
      if (override.notes !== undefined) notes = override.notes;
    }

    rows.push({
      id: rowId,
      day: slot.day,
      dayLabel,
      dateStr: dateObj.shortDate,
      fullDateStr: dateObj.fullDate,
      session: slot.session,
      sessionLabel,
      period: slot.period,
      classId,
      className,
      grade,
      lessonTitle,
      ppctPeriod,
      page,
      ndth,
      notes,
      isCustomized: !!override,
    });
  }

  return rows;
}

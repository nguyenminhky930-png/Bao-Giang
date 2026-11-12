import { ClassInfo, TimetableSlot } from '../types';

export const defaultClasses: ClassInfo[] = [
  { id: 'c-3g1', name: '3G1', grade: 3, curriculumGrade: 3, color: '#0284c7' },
  { id: 'c-3g2', name: '3G2', grade: 3, curriculumGrade: 3, color: '#0369a1' },
  { id: 'c-4g1', name: '4G1', grade: 4, curriculumGrade: 4, color: '#16a34a' },
  { id: 'c-4g2', name: '4G2', grade: 4, curriculumGrade: 4, color: '#15803d' },
  { id: 'c-5g1', name: '5G1', grade: 5, curriculumGrade: 5, color: '#9333ea' },
  { id: 'c-5g2', name: '5G2', grade: 5, curriculumGrade: 5, color: '#7e22ce' },
  { id: 'c-5g3', name: '5G3', grade: 5, curriculumGrade: 5, color: '#6b21a8' },
];

// Exact timetable slots as observed in file "Tuần 5"
export function generateDefaultTimetableSlots(): TimetableSlot[] {
  const slots: TimetableSlot[] = [];

  const addSlot = (
    day: 2 | 3 | 4 | 5 | 6,
    session: 'morning' | 'afternoon',
    period: number,
    classId: string | null
  ) => {
    slots.push({
      id: `slot-${day}-${session}-${period}`,
      day,
      session,
      period,
      classId,
    });
  };

  // Thứ Hai (2)
  addSlot(2, 'morning', 1, null);
  addSlot(2, 'morning', 2, 'c-3g2');
  addSlot(2, 'morning', 3, 'c-4g2');
  addSlot(2, 'morning', 4, 'c-5g3');
  addSlot(2, 'afternoon', 1, 'c-4g1');
  addSlot(2, 'afternoon', 2, 'c-3g2');
  addSlot(2, 'afternoon', 3, 'c-5g1');

  // Thứ Ba (3)
  addSlot(3, 'morning', 1, null);
  addSlot(3, 'morning', 2, null);
  addSlot(3, 'morning', 3, 'c-5g2');
  addSlot(3, 'morning', 4, 'c-5g3');
  addSlot(3, 'afternoon', 1, null);
  addSlot(3, 'afternoon', 2, 'c-4g2');
  addSlot(3, 'afternoon', 3, null);

  // Thứ Tư (4)
  addSlot(4, 'morning', 1, 'c-4g2');
  addSlot(4, 'morning', 2, 'c-4g1');
  addSlot(4, 'morning', 3, 'c-3g2');
  addSlot(4, 'morning', 4, null);
  addSlot(4, 'afternoon', 1, 'c-5g1');
  addSlot(4, 'afternoon', 2, 'c-5g2');
  addSlot(4, 'afternoon', 3, 'c-5g3');

  // Thứ Năm (5)
  addSlot(5, 'morning', 1, 'c-5g2');
  addSlot(5, 'morning', 2, 'c-4g1');
  addSlot(5, 'morning', 3, 'c-3g2');
  addSlot(5, 'morning', 4, null);
  addSlot(5, 'afternoon', 1, 'c-5g1');
  addSlot(5, 'afternoon', 2, 'c-4g2');
  addSlot(5, 'afternoon', 3, 'c-5g3');

  // Thứ Sáu (6)
  addSlot(6, 'morning', 1, 'c-5g2');
  addSlot(6, 'morning', 2, 'c-4g1');
  addSlot(6, 'morning', 3, 'c-5g1');
  addSlot(6, 'morning', 4, null);
  addSlot(6, 'afternoon', 1, null);
  addSlot(6, 'afternoon', 2, null);
  addSlot(6, 'afternoon', 3, null);

  return slots;
}

import { DayOfWeek } from '../types';

export interface WeekDateInfo {
  weekNumber: number;
  semester: 1 | 2;
  semesterWeekNumber: number; // Tuần thứ mấy của học kì (HK1: 1..18, HK2: 1..17)
  startDate: Date;
  endDate: Date;
  startDateStr: string; // "DD/MM/YYYY"
  endDateStr: string;   // "DD/MM/YYYY"
  dayDates: Record<DayOfWeek, { shortDate: string; fullDate: string }>;
  eventNote?: string;
}

export function padZero(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function formatDateDDMMYYYY(d: Date): string {
  const day = padZero(d.getDate());
  const month = padZero(d.getMonth() + 1);
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateDDMM(d: Date): string {
  const day = padZero(d.getDate());
  const month = padZero(d.getMonth() + 1);
  return `${day}/${month}`;
}

// Các sự kiện và ngày nghỉ lễ theo Quyết định 4103/QĐ-UBND năm học 2026-2027
export const OFFICIAL_SCHOOL_YEAR_EVENTS: Record<number, string> = {
  1: 'Chương trình Học kỳ 1',
  12: 'Nghỉ ngày VHVN 24/11',
  17: 'Tết Dương lịch 01/01/2027 (Nghỉ Thứ sáu)',
  18: 'Kiểm tra cuối học kỳ 1 - Sơ kết HK1',
  19: 'Chương trình Học kỳ 2',
  30: 'Nghỉ Giỗ tổ Hùng Vương (Thứ sáu 16/04/2027)',
  32: 'Nghỉ Giải phóng miền Nam 30/04/2027 (Thứ sáu)',
  33: 'Nghỉ bù Quốc tế Lao động (Thứ hai 03/05/2027)',
  35: 'Kiểm tra cuối năm học',
};

// Thông tin kỳ nghỉ Tết Nguyên Đán năm học 2026-2027
export const TET_HOLIDAY_INFO = {
  startDateStr: '01/02/2027',
  endDateStr: '12/02/2027',
  description: 'Nghỉ Tết Nguyên Đán từ ngày 01/02/2027 đến 12/02/2027 (2 tuần giữa Tuần 21 và Tuần 22)',
};

/**
 * Tính toán ngày bắt đầu và kết thúc của tuần học theo Khung kế hoạch thời gian năm học 2026-2027 (QĐ 4103/QĐ-UBND)
 * Tuần 1 bắt đầu từ Thứ Hai 07/09/2026
 * Học kỳ 1: Tuần 1 đến 18 (07/09/2026 - 08/01/2027)
 * Học kỳ 2: Tuần 19 đến 35 (11/01/2027 - 21/05/2027)
 * Giữa tuần 21 (kết thúc 29/01/2027) và tuần 22 (bắt đầu 15/02/2027) có 2 tuần nghỉ Tết Nguyên Đán (01/02/2027 - 12/02/2027)
 */
export function getWeekDateInfo(weekNumber: number, baseStartDateStr = '2026-09-07'): WeekDateInfo {
  const [yearStr, monthStr, dayStr] = baseStartDateStr.split('-').map(Number);
  const week1Monday = new Date(yearStr, monthStr - 1, dayStr);

  // Tính số tuần chênh lệch (offset)
  // Nếu tuần <= 21: học liên tục (offset = weekNumber - 1)
  // Nếu tuần >= 22: cộng thêm 2 tuần nghỉ Tết Nguyên Đán (offset = weekNumber - 1 + 2)
  const isDefaultSchoolYear = baseStartDateStr === '2026-09-07';
  let weekOffset = weekNumber - 1;

  if (isDefaultSchoolYear && weekNumber >= 22) {
    weekOffset += 2; // 2 tuần nghỉ Tết Nguyên Đán (01/02/2027 - 12/02/2027)
  }

  const monday = new Date(week1Monday);
  monday.setDate(monday.getDate() + weekOffset * 7);

  const friday = new Date(monday);
  friday.setDate(friday.getDate() + 4);

  const dayDates: Record<DayOfWeek, { shortDate: string; fullDate: string }> = {
    2: {
      shortDate: formatDateDDMM(monday),
      fullDate: formatDateDDMMYYYY(monday),
    },
    3: {
      shortDate: formatDateDDMM(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 1)),
      fullDate: formatDateDDMMYYYY(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 1)),
    },
    4: {
      shortDate: formatDateDDMM(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 2)),
      fullDate: formatDateDDMMYYYY(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 2)),
    },
    5: {
      shortDate: formatDateDDMM(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 3)),
      fullDate: formatDateDDMMYYYY(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 3)),
    },
    6: {
      shortDate: formatDateDDMM(friday),
      fullDate: formatDateDDMMYYYY(friday),
    },
  };

  const semester = weekNumber <= 18 ? 1 : 2;
  const semesterWeekNumber = weekNumber <= 18 ? weekNumber : weekNumber - 18;
  const eventNote = OFFICIAL_SCHOOL_YEAR_EVENTS[weekNumber];

  return {
    weekNumber,
    semester,
    semesterWeekNumber,
    startDate: monday,
    endDate: friday,
    startDateStr: formatDateDDMMYYYY(monday),
    endDateStr: formatDateDDMMYYYY(friday),
    dayDates,
    eventNote,
  };
}

export function getAllWeeks(totalWeeks = 35, baseStartDateStr = '2026-09-07'): WeekDateInfo[] {
  const weeks: WeekDateInfo[] = [];
  for (let i = 1; i <= totalWeeks; i++) {
    weeks.push(getWeekDateInfo(i, baseStartDateStr));
  }
  return weeks;
}

export const dayNamesMap: Record<DayOfWeek, string> = {
  2: 'Thứ Hai',
  3: 'Thứ Ba',
  4: 'Thứ Tư',
  5: 'Thứ Năm',
  6: 'Thứ Sáu',
};

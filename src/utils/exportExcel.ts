import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { WeeklyScheduleRow, GeneralSettings } from '../types';
import { getWeekDateInfo } from './dateUtils';

interface ExportExcelParams {
  weekNumber: number;
  rows: WeeklyScheduleRow[];
  settings: GeneralSettings;
  fileName?: string;
  onlyActiveSlots?: boolean;
}

export function exportWeekToExcel({
  weekNumber,
  rows,
  settings,
  fileName,
  onlyActiveSlots = false,
}: ExportExcelParams) {
  const weekInfo = getWeekDateInfo(weekNumber, settings.startDate);
  const displayRows = onlyActiveSlots ? rows.filter((r) => r.className || r.lessonTitle) : rows;

  const data: (string | number)[][] = [];

  // Header rows
  data.push([settings.schoolName.toUpperCase() || 'TRƯỜNG TIỂU HỌC']);
  data.push([`SỔ BÁO GIẢNG NĂM HỌC ${settings.schoolYear}`]);
  data.push([`Môn: ${settings.subject} | Giáo viên: ${settings.teacherName || '...'}`]);
  data.push([]);
  data.push([`Tuần ${weekNumber}`, `Từ: ${weekInfo.startDateStr} Đến ${weekInfo.endDateStr}`]);
  data.push([
    'Ngày',
    'Buổi',
    'Tiết',
    'Lớp',
    'Tựa bài dạy',
    'Tiết theo PPCT',
    'NDTH',
    'Ghi chú',
  ]);

  // Track merges
  const merges: XLSX.Range[] = [];
  const startRowIdx = 6; // index of first data row (0-based)

  // Map rows
  let prevDay: number | null = null;
  let dayStartIdx = startRowIdx;
  let prevSession: string | null = null;
  let sessionStartIdx = startRowIdx;

  displayRows.forEach((r, idx) => {
    const currentIdx = startRowIdx + idx;
    const dayLabel = `${r.dayLabel}\n${r.dateStr}`;
    const sessionLabel = r.sessionLabel;

    data.push([
      dayLabel,
      sessionLabel,
      r.period,
      r.className || '',
      r.lessonTitle || '',
      r.ppctPeriod ? r.ppctPeriod : '',
      r.ndth || '',
      r.notes || '',
    ]);

    // Handle day merge
    if (idx === 0) {
      prevDay = r.day;
      dayStartIdx = currentIdx;
    } else if (r.day !== prevDay) {
      if (currentIdx - 1 > dayStartIdx) {
        merges.push({
          s: { r: dayStartIdx, c: 0 },
          e: { r: currentIdx - 1, c: 0 },
        });
      }
      prevDay = r.day;
      dayStartIdx = currentIdx;
    }

    // Handle session merge (within same day)
    if (idx === 0) {
      prevSession = `${r.day}-${r.session}`;
      sessionStartIdx = currentIdx;
    } else if (`${r.day}-${r.session}` !== prevSession) {
      if (currentIdx - 1 > sessionStartIdx) {
        merges.push({
          s: { r: sessionStartIdx, c: 1 },
          e: { r: currentIdx - 1, c: 1 },
        });
      }
      prevSession = `${r.day}-${r.session}`;
      sessionStartIdx = currentIdx;
    }
  });

  // Final merges for last groups
  const lastIdx = startRowIdx + displayRows.length - 1;
  if (lastIdx > dayStartIdx) {
    merges.push({
      s: { r: dayStartIdx, c: 0 },
      e: { r: lastIdx, c: 0 },
    });
  }
  if (lastIdx > sessionStartIdx) {
    merges.push({
      s: { r: sessionStartIdx, c: 1 },
      e: { r: lastIdx, c: 1 },
    });
  }

  // Title merges
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } });
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: 7 } });
  merges.push({ s: { r: 2, c: 0 }, e: { r: 2, c: 7 } });
  merges.push({ s: { r: 4, c: 0 }, e: { r: 4, c: 1 } });
  merges.push({ s: { r: 4, c: 2 }, e: { r: 4, c: 7 } });

  // Add signature section at bottom with BGH, Tổ trưởng & Giáo viên
  data.push([]);
  const signRowIdx = data.length;
  data.push(['DUYỆT CỦA BAN GIÁM HIỆU', '', '', 'TỔ TRƯỞNG CHUYÊN MÔN', '', 'GIÁO VIÊN GIẢNG DẠY', '', '']);
  data.push(['(Ký và đóng dấu)', '', '', '(Ký và ghi rõ họ tên)', '', '(Ký và ghi rõ họ tên)', '', '']);
  data.push([]);
  data.push([]);
  data.push([
    '',
    '',
    '',
    '',
    '',
    settings.teacherName ? settings.teacherName : '',
    '',
    '',
  ]);

  merges.push({ s: { r: signRowIdx, c: 0 }, e: { r: signRowIdx, c: 2 } });
  merges.push({ s: { r: signRowIdx, c: 3 }, e: { r: signRowIdx, c: 4 } });
  merges.push({ s: { r: signRowIdx, c: 5 }, e: { r: signRowIdx, c: 7 } });
  merges.push({ s: { r: signRowIdx + 1, c: 0 }, e: { r: signRowIdx + 1, c: 2 } });
  merges.push({ s: { r: signRowIdx + 1, c: 3 }, e: { r: signRowIdx + 1, c: 4 } });
  merges.push({ s: { r: signRowIdx + 1, c: 5 }, e: { r: signRowIdx + 1, c: 7 } });
  merges.push({ s: { r: signRowIdx + 4, c: 5 }, e: { r: signRowIdx + 4, c: 7 } });

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!merges'] = merges;

  // Column widths
  ws['!cols'] = [
    { wch: 14 }, // Ngày
    { wch: 10 }, // Buổi
    { wch: 8 },  // Tiết
    { wch: 10 }, // Lớp
    { wch: 42 }, // Tựa bài dạy
    { wch: 15 }, // Tiết theo PPCT
    { wch: 18 }, // NDTH
    { wch: 16 }, // Ghi chú
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Tuần ${weekNumber}`);

  const outputName = fileName || `Bao_Giang_Tuan_${weekNumber}_2026_2027.xlsx`;
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  saveAs(blob, outputName);
}

// Export all 35 weeks to a single Excel workbook with separate sheets or consolidated
export function exportAllWeeksToExcel({
  allWeeksData,
  settings,
}: {
  allWeeksData: { weekNumber: number; rows: WeeklyScheduleRow[] }[];
  settings: GeneralSettings;
}) {
  const wb = XLSX.utils.book_new();

  for (const { weekNumber, rows } of allWeeksData) {
    const weekInfo = getWeekDateInfo(weekNumber, settings.startDate);
    const data: (string | number)[][] = [];

    data.push([settings.schoolName.toUpperCase() || 'TRƯỜNG TIỂU HỌC']);
    data.push([`SỔ BÁO GIẢNG NĂM HỌC ${settings.schoolYear}`]);
    data.push([`Môn: ${settings.subject} | Giáo viên: ${settings.teacherName || '...'}`]);
    data.push([]);
    data.push([`Tuần ${weekNumber}`, `Từ: ${weekInfo.startDateStr} Đến ${weekInfo.endDateStr}`]);
    data.push([
      'Ngày',
      'Buổi',
      'Tiết',
      'Lớp',
      'Tựa bài dạy',
      'Tiết theo PPCT',
      'NDTH',
      'Ghi chú',
    ]);

    const merges: XLSX.Range[] = [];
    const startRowIdx = 6;

    let prevDay: number | null = null;
    let dayStartIdx = startRowIdx;
    let prevSession: string | null = null;
    let sessionStartIdx = startRowIdx;

    rows.forEach((r, idx) => {
      const currentIdx = startRowIdx + idx;
      const dayLabel = `${r.dayLabel}\n${r.dateStr}`;
      const sessionLabel = r.sessionLabel;

      data.push([
        dayLabel,
        sessionLabel,
        r.period,
        r.className || '',
        r.lessonTitle || '',
        r.ppctPeriod ? r.ppctPeriod : '',
        r.ndth || '',
        r.notes || '',
      ]);

      if (idx === 0) {
        prevDay = r.day;
        dayStartIdx = currentIdx;
      } else if (r.day !== prevDay) {
        if (currentIdx - 1 > dayStartIdx) {
          merges.push({ s: { r: dayStartIdx, c: 0 }, e: { r: currentIdx - 1, c: 0 } });
        }
        prevDay = r.day;
        dayStartIdx = currentIdx;
      }

      if (idx === 0) {
        prevSession = `${r.day}-${r.session}`;
        sessionStartIdx = currentIdx;
      } else if (`${r.day}-${r.session}` !== prevSession) {
        if (currentIdx - 1 > sessionStartIdx) {
          merges.push({ s: { r: sessionStartIdx, c: 1 }, e: { r: currentIdx - 1, c: 1 } });
        }
        prevSession = `${r.day}-${r.session}`;
        sessionStartIdx = currentIdx;
      }
    });

    const lastIdx = startRowIdx + rows.length - 1;
    if (lastIdx > dayStartIdx) {
      merges.push({ s: { r: dayStartIdx, c: 0 }, e: { r: lastIdx, c: 0 } });
    }
    if (lastIdx > sessionStartIdx) {
      merges.push({ s: { r: sessionStartIdx, c: 1 }, e: { r: lastIdx, c: 1 } });
    }

    merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } });
    merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: 7 } });
    merges.push({ s: { r: 2, c: 0 }, e: { r: 2, c: 7 } });
    merges.push({ s: { r: 4, c: 0 }, e: { r: 4, c: 1 } });
    merges.push({ s: { r: 4, c: 2 }, e: { r: 4, c: 7 } });

    // Add signature section at bottom with BGH, Tổ trưởng & Giáo viên
    data.push([]);
    const signRowIdx = data.length;
    data.push(['DUYỆT CỦA BAN GIÁM HIỆU', '', '', 'TỔ TRƯỞNG CHUYÊN MÔN', '', 'GIÁO VIÊN GIẢNG DẠY', '', '']);
    data.push(['(Ký và đóng dấu)', '', '', '(Ký và ghi rõ họ tên)', '', '(Ký và ghi rõ họ tên)', '', '']);
    data.push([]);
    data.push([]);
    data.push([
      '',
      '',
      '',
      '',
      '',
      settings.teacherName ? settings.teacherName : '',
      '',
      '',
    ]);

    merges.push({ s: { r: signRowIdx, c: 0 }, e: { r: signRowIdx, c: 2 } });
    merges.push({ s: { r: signRowIdx, c: 3 }, e: { r: signRowIdx, c: 4 } });
    merges.push({ s: { r: signRowIdx, c: 5 }, e: { r: signRowIdx, c: 7 } });
    merges.push({ s: { r: signRowIdx + 1, c: 0 }, e: { r: signRowIdx + 1, c: 2 } });
    merges.push({ s: { r: signRowIdx + 1, c: 3 }, e: { r: signRowIdx + 1, c: 4 } });
    merges.push({ s: { r: signRowIdx + 1, c: 5 }, e: { r: signRowIdx + 1, c: 7 } });
    merges.push({ s: { r: signRowIdx + 4, c: 5 }, e: { r: signRowIdx + 4, c: 7 } });

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!merges'] = merges;
    ws['!cols'] = [
      { wch: 14 },
      { wch: 10 },
      { wch: 8 },
      { wch: 10 },
      { wch: 42 },
      { wch: 15 },
      { wch: 18 },
      { wch: 16 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, `Tuan_${weekNumber}`);
  }

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  saveAs(blob, `So_Bao_Giang_35_Tuan_2026_2027.xlsx`);
}

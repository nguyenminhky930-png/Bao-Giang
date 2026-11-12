import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { WeeklyScheduleRow, GeneralSettings } from '../types';
import { getWeekDateInfo } from './dateUtils';

// Helper to remove accents for fallback standard fonts if needed,
// but modern print preview gives pixel-perfect Vietnamese Unicode
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export function exportWeekToJsPdf({
  weekNumber,
  rows,
  settings,
  onlyActiveSlots = false,
}: {
  weekNumber: number;
  rows: WeeklyScheduleRow[];
  settings: GeneralSettings;
  onlyActiveSlots?: boolean;
}) {
  const weekInfo = getWeekDateInfo(weekNumber, settings.startDate);
  const displayRows = onlyActiveSlots ? rows.filter((r) => r.className || r.lessonTitle) : rows;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Title
  doc.setFontSize(14);
  doc.text(
    `${settings.schoolName || 'TRƯỜNG TIỂU HỌC'} - LỊCH BÁO GIẢNG`,
    105,
    14,
    { align: 'center' }
  );

  doc.setFontSize(10);
  doc.text(
    `Năm học: ${settings.schoolYear} | Môn: ${settings.subject} | GV: ${settings.teacherName || '...' }`,
    105,
    20,
    { align: 'center' }
  );

  // Week header
  doc.setFontSize(11);
  doc.text(
    `Tuần ${weekNumber} (Từ: ${weekInfo.startDateStr} Đến: ${weekInfo.endDateStr})`,
    105,
    26,
    { align: 'center' }
  );

  const tableData = displayRows.map((r) => [
    `${r.dayLabel}\n${r.dateStr}`,
    r.sessionLabel,
    String(r.period),
    r.className || '',
    r.lessonTitle || '',
    r.ppctPeriod ? String(r.ppctPeriod) : '',
    r.ndth || '',
    r.notes || '',
  ]);

  autoTable(doc, {
    startY: 30,
    head: [
      [
        'Ngày',
        'Buổi',
        'Tiết',
        'Lớp',
        'Tựa bài dạy',
        'Tiết theo PPCT',
        'NDTH',
        'Ghi chú',
      ],
    ],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 2,
      halign: 'left',
      valign: 'middle',
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 22, halign: 'center' }, // Ngày
      1: { cellWidth: 16, halign: 'center' }, // Buổi
      2: { cellWidth: 12, halign: 'center' }, // Tiết
      3: { cellWidth: 15, halign: 'center', fontStyle: 'bold' }, // Lớp
      4: { cellWidth: 68 },                   // Tựa bài dạy
      5: { cellWidth: 16, halign: 'center' }, // PPCT
      6: { cellWidth: 20 },                   // NDTH
      7: { cellWidth: 20 },                   // Ghi chú
    },
  });

  // Get final Y position after table
  const finalY = (doc as any).lastAutoTable?.finalY || 240;
  const signY = finalY + 12 < 265 ? finalY + 12 : 260;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('DUYET CUA BAN GIAM HIEU', 35, signY, { align: 'center' });
  doc.text('TO TRUONG CHUYEN MON', 105, signY, { align: 'center' });
  doc.text('GIAO VIEN GIANG DAY', 175, signY, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('(Ky va dong dau)', 35, signY + 5, { align: 'center' });
  doc.text('(Ky va ghi ro ho ten)', 105, signY + 5, { align: 'center' });
  doc.text('(Ky va ghi ro ho ten)', 175, signY + 5, { align: 'center' });

  if (settings.teacherName) {
    doc.setFont('helvetica', 'bold');
    doc.text(removeVietnameseTones(settings.teacherName), 175, signY + 20, { align: 'center' });
  }

  doc.save(`Bao_Giang_Tuan_${weekNumber}_2026_2027.pdf`);
}

import React from 'react';
import { Printer, Download, X, FileSpreadsheet, FileText } from 'lucide-react';
import { useSchedule } from '../context/ScheduleContext';
import { getWeekDateInfo } from '../utils/dateUtils';
import { exportWeekToExcel } from '../utils/exportExcel';
import { exportWeekToWord } from '../utils/exportWord';
import { exportWeekToJsPdf } from '../utils/exportPdf';
import { WeeklyScheduleRow } from '../types';

interface PrintPreviewModalProps {
  weekNumber: number;
  onClose: () => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  weekNumber,
  onClose,
}) => {
  const { settings, getWeekRows, classes } = useSchedule();
  const weekInfo = getWeekDateInfo(weekNumber, settings.startDate);
  const rows = getWeekRows(weekNumber);

  // Group rows for rowSpan
  interface DisplayGroup {
    row: WeeklyScheduleRow;
    isFirstOfDay: boolean;
    dayRowSpan: number;
    isFirstOfSession: boolean;
    sessionRowSpan: number;
  }

  const groupedRows: DisplayGroup[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const isFirstOfDay = i === 0 || rows[i - 1].day !== r.day;
    let dayRowSpan = 1;
    if (isFirstOfDay) {
      for (let j = i + 1; j < rows.length && rows[j].day === r.day; j++) {
        dayRowSpan++;
      }
    }

    const isFirstOfSession =
      i === 0 ||
      rows[i - 1].day !== r.day ||
      rows[i - 1].session !== r.session;
    let sessionRowSpan = 1;
    if (isFirstOfSession) {
      for (
        let j = i + 1;
        j < rows.length &&
        rows[j].day === r.day &&
        rows[j].session === r.session;
        j++
      ) {
        sessionRowSpan++;
      }
    }

    groupedRows.push({
      row: r,
      isFirstOfDay,
      dayRowSpan,
      isFirstOfSession,
      sessionRowSpan,
    });
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[96vh] flex flex-col overflow-hidden">
        {/* Top Control Header (Hidden when printing) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <span className="font-bold text-base">Xem Trước Bản In & Xuất PDF - Tuần {weekNumber}</span>
            <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">
              Khổ chuẩn A4
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>In Ngay / Lưu PDF Trực Tiếp</span>
            </button>

            <button
              onClick={() => exportWeekToJsPdf({ weekNumber, rows, settings })}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm"
              title="Tải file PDF"
            >
              <Download className="w-4 h-4" />
              <span>Tải file PDF</span>
            </button>

            <button
              onClick={() => exportWeekToWord({ weekNumber, rows, settings })}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
              title="Tải file Word"
            >
              <FileText className="w-4 h-4" />
              <span>Tải file Word</span>
            </button>

            <button
              onClick={() => exportWeekToExcel({ weekNumber, rows, settings })}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm"
              title="Tải file Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Tải file Excel</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors ml-2"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Container - styled for A4 page view & print */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center print:bg-white print:p-0 print:overflow-visible">
          <div
            id="printable-schedule"
            className="bg-white w-full max-w-[850px] shadow-lg rounded-sm p-8 sm:p-10 border border-slate-300 print:shadow-none print:border-none print:p-0 print:w-full print:max-w-none text-black"
          >
            {/* Top School Meta */}
            <div className="flex justify-between items-start border-b border-black/20 pb-4 mb-4">
              <div>
                <p className="font-bold text-sm tracking-wide uppercase">
                  {settings.schoolName || 'TRƯỜNG TIỂU HỌC'}
                </p>
                <p className="text-xs italic text-slate-700">
                  Môn: {settings.subject} • Năm học: {settings.schoolYear}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">
                  LỊCH BÁO GIẢNG
                </p>
                <p className="text-xs text-slate-700">
                  Giáo viên: <span className="font-bold">{settings.teacherName || '....................'}</span>
                </p>
              </div>
            </div>

            {/* Official Table Matching File "Tuần 5" Exactly */}
            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                {/* Header row 1: Tuần X | Từ: ... Đến: ... */}
                <tr className="border-b border-black font-bold">
                  <th
                    colSpan={2}
                    className="border-r border-black p-2 text-left text-sm font-bold w-28 bg-slate-50 print:bg-transparent"
                  >
                    Tuần {weekNumber}
                  </th>
                  <th
                    colSpan={6}
                    className="p-2 text-left text-sm font-bold bg-slate-50 print:bg-transparent"
                  >
                    Từ: {weekInfo.startDateStr} Đến {weekInfo.endDateStr}
                  </th>
                </tr>
                {/* Header row 2: Columns */}
                <tr className="border-b border-black text-center font-bold bg-slate-100 print:bg-transparent">
                  <th className="border-r border-black p-2 w-20">Ngày</th>
                  <th className="border-r border-black p-2 w-16">Buổi</th>
                  <th className="border-r border-black p-2 w-12">Tiết</th>
                  <th className="border-r border-black p-2 w-16">Lớp</th>
                  <th className="border-r border-black p-2 text-left">Tựa bài dạy</th>
                  <th className="border-r border-black p-2 w-16">Tiết theo PPCT</th>
                  <th className="border-r border-black p-2 w-20">NDTH</th>
                  <th className="p-2 w-20">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {groupedRows.map((item) => {
                  const r = item.row;
                  const isBlank = !r.className && !r.lessonTitle;

                  return (
                    <tr
                      key={r.id}
                      className="border-b border-black last:border-b-0"
                    >
                      {/* Ngày */}
                      {item.isFirstOfDay && (
                        <td
                          rowSpan={item.dayRowSpan}
                          className="border-r border-black p-2 text-center align-middle font-bold"
                        >
                          <div>
                            <div>{r.dayLabel}</div>
                            <div className="font-semibold text-[11px] mt-0.5">{r.dateStr}</div>
                          </div>
                        </td>
                      )}

                      {/* Buổi */}
                      {item.isFirstOfSession && (
                        <td
                          rowSpan={item.sessionRowSpan}
                          className="border-r border-black p-2 text-center align-middle font-semibold"
                        >
                          {r.sessionLabel}
                        </td>
                      )}

                      {/* Tiết */}
                      <td className="border-r border-black p-1.5 text-center font-bold">
                        {r.period}
                      </td>

                      {/* Lớp */}
                      <td className="border-r border-black p-1.5 text-center font-bold">
                        {r.className || ''}
                      </td>

                      {/* Tựa bài dạy */}
                      <td className="border-r border-black p-1.5 font-normal">
                        {r.lessonTitle || ''}
                      </td>

                      {/* Tiết theo PPCT */}
                      <td className="border-r border-black p-1.5 text-center font-semibold">
                        {r.ppctPeriod ? r.ppctPeriod : ''}
                      </td>

                      {/* NDTH */}
                      <td className="border-r border-black p-1.5 text-[11px]">
                        {r.ndth || ''}
                      </td>

                      {/* Ghi chú */}
                      <td className="p-1.5 text-[11px]">
                        {r.notes || ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Signature Section Matching Vietnamese Primary School Standard with BGH, Tổ trưởng & Giáo viên */}
            <div className="grid grid-cols-3 gap-4 mt-8 text-center text-xs">
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-900">
                  DUYỆT CỦA BAN GIÁM HIỆU
                </p>
                <p className="italic text-slate-600 mt-1">(Ký, ghi rõ họ tên và đóng dấu)</p>
                <div className="h-20" />
                <p className="font-semibold text-slate-400">........................................</p>
              </div>

              <div>
                <p className="font-bold uppercase tracking-wider text-slate-900">
                  TỔ TRƯỞNG CHUYÊN MÔN
                </p>
                <p className="italic text-slate-600 mt-1">(Ký và ghi rõ họ tên)</p>
                <div className="h-20" />
                <p className="font-semibold text-slate-400">........................................</p>
              </div>

              <div>
                <p className="italic text-slate-600 mb-1">
                  Ngày ..... tháng ..... năm {weekInfo.endDate.getFullYear()}
                </p>
                <p className="font-bold uppercase tracking-wider text-slate-900">
                  GIÁO VIÊN GIẢNG DẠY
                </p>
                <p className="italic text-slate-600 mt-1">(Ký và ghi rõ họ tên)</p>
                <div className="h-16" />
                <p className="font-bold text-sm text-slate-900">
                  {settings.teacherName || '........................................'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

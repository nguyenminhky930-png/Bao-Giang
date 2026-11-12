import React, { useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Edit2,
  RotateCcw,
  Layers,
  Filter,
  Check,
  Info,
  Sparkles,
} from 'lucide-react';
import { useSchedule } from '../context/ScheduleContext';
import { getWeekDateInfo } from '../utils/dateUtils';
import { exportWeekToExcel } from '../utils/exportExcel';
import { exportWeekToWord } from '../utils/exportWord';
import { exportWeekToJsPdf } from '../utils/exportPdf';
import { WeeklyScheduleRow } from '../types';

interface WeeklyScheduleViewProps {
  onOpenPrintPreview: (weekNum: number) => void;
  onOpenBatchExport: () => void;
}

export const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({
  onOpenPrintPreview,
  onOpenBatchExport,
}) => {
  const {
    currentWeek,
    setCurrentWeek,
    settings,
    classes,
    curricula,
    getCurrentWeekRows,
    updateWeekOverride,
    clearWeekOverrides,
    overrides,
  } = useSchedule();

  const [onlyActiveSlots, setOnlyActiveSlots] = useState(false);
  const [editingRow, setEditingRow] = useState<WeeklyScheduleRow | null>(null);
  const [editForm, setEditForm] = useState({
    className: '',
    classId: '',
    lessonTitle: '',
    ppctPeriod: '',
    ndth: '',
    notes: '',
  });

  const weekInfo = getWeekDateInfo(currentWeek, settings.startDate);
  const rows = getCurrentWeekRows(onlyActiveSlots);
  const hasCustomOverrides = !!overrides[currentWeek] && Object.keys(overrides[currentWeek]).length > 0;

  // Open edit modal
  const handleStartEdit = (row: WeeklyScheduleRow) => {
    setEditingRow(row);
    setEditForm({
      className: row.className,
      classId: row.classId || '',
      lessonTitle: row.lessonTitle,
      ppctPeriod: row.ppctPeriod ? String(row.ppctPeriod) : '',
      ndth: row.ndth || '',
      notes: row.notes || '',
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;

    const selectedCls = classes.find((c) => c.id === editForm.classId);

    updateWeekOverride(currentWeek, editingRow.id, {
      className: selectedCls ? selectedCls.name : editForm.className,
      classId: editForm.classId || null,
      lessonTitle: editForm.lessonTitle,
      ppctPeriod: editForm.ppctPeriod ? Number(editForm.ppctPeriod) : null,
      ndth: editForm.ndth,
      notes: editForm.notes,
    });

    setEditingRow(null);
  };

  // Group rows for rowSpan rendering
  // We need to calculate rowSpan for Ngày and Buổi
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

  // Pre-fill curriculum lesson suggestion when class changes in edit modal
  const handleEditClassChange = (newClassId: string) => {
    setEditForm((prev) => {
      const cls = classes.find((c) => c.id === newClassId);
      if (!cls) return { ...prev, classId: '', className: '' };
      const gradeCurr = curricula[cls.curriculumGrade || cls.grade] || [];
      const currentPeriodNum = prev.ppctPeriod ? Number(prev.ppctPeriod) : (currentWeek - 1) * 4 + 1;
      const currItem = gradeCurr.find((item) => item.period === currentPeriodNum);

      return {
        ...prev,
        classId: newClassId,
        className: cls.name,
        lessonTitle: currItem ? currItem.lessonTitle : prev.lessonTitle,
        ppctPeriod: currItem ? String(currItem.period) : prev.ppctPeriod,
        ndth: currItem?.ndth || prev.ndth,
        notes: currItem?.note || prev.notes,
      };
    });
  };

  const totalTeachingPeriodsInWeek = rows.filter((r) => r.className && r.lessonTitle).length;

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Week Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <button
                onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
                disabled={currentWeek <= 1}
                className="p-2 rounded-md hover:bg-white text-slate-700 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                title="Tuần trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="px-3 py-1 flex items-center gap-2">
                <span className="font-bold text-blue-700 text-lg">Tuần {currentWeek}</span>
                <span className="text-xs text-slate-500 font-medium bg-slate-200 px-2 py-0.5 rounded-full">
                  / {settings.totalWeeks} tuần
                </span>
              </div>

              <button
                onClick={() => setCurrentWeek(Math.min(settings.totalWeeks, currentWeek + 1))}
                disabled={currentWeek >= settings.totalWeeks}
                className="p-2 rounded-md hover:bg-white text-slate-700 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                title="Tuần sau"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Week Select Dropdown */}
            <select
              value={currentWeek}
              onChange={(e) => setCurrentWeek(Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-sm font-semibold rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer max-w-[340px]"
            >
              {Array.from({ length: settings.totalWeeks }, (_, i) => i + 1).map((w) => {
                const info = getWeekDateInfo(w, settings.startDate);
                const eventText = info.eventNote ? ` - ${info.eventNote}` : '';
                return (
                  <option key={w} value={w}>
                    Tuần {w}: {info.startDateStr} → {info.endDateStr}{eventText}
                  </option>
                );
              })}
            </select>

            {/* Quick buttons */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setCurrentWeek(5)}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                  currentWeek === 5
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ★ Mẫu Tuần 5
              </button>
              <button
                onClick={() => setCurrentWeek(1)}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                  currentWeek <= 18
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Học kì I (Tuần 1-18)
              </button>
              <button
                onClick={() => setCurrentWeek(19)}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                  currentWeek >= 19
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Học kì II (Tuần 19-35)
              </button>
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportWeekToExcel({ weekNumber: currentWeek, rows, settings, onlyActiveSlots })}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              title="Xuất file Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => exportWeekToWord({ weekNumber: currentWeek, rows, settings, onlyActiveSlots })}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              title="Xuất file Word"
            >
              <FileText className="w-4 h-4" />
              <span>Xuất Word (.docx)</span>
            </button>

            <button
              onClick={() => exportWeekToJsPdf({ weekNumber: currentWeek, rows, settings, onlyActiveSlots })}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              title="Xuất file PDF trực tiếp"
            >
              <Download className="w-4 h-4" />
              <span>Tải PDF (.pdf)</span>
            </button>

            <button
              onClick={() => onOpenPrintPreview(currentWeek)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              title="Xem và in định dạng chuẩn A4"
            >
              <Printer className="w-4 h-4" />
              <span>In ấn (A4)</span>
            </button>

            <button
              onClick={onOpenBatchExport}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              title="Xuất hàng loạt cả năm hoặc nhiều tuần"
            >
              <Layers className="w-4 h-4" />
              <span>Xuất trọn bộ 35 tuần</span>
            </button>
          </div>
        </div>

        {/* Info & Display filter bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="font-medium text-slate-800">
              📅 Khoảng thời gian: <span className="font-bold text-blue-700">Từ {weekInfo.startDateStr} Đến {weekInfo.endDateStr}</span>
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
              Học kỳ {weekInfo.semester === 1 ? 'I' : 'II'} (Tuần {weekInfo.semesterWeekNumber}/{weekInfo.semester === 1 ? '18' : '17'})
            </span>
            {weekInfo.eventNote && (
              <span className="inline-flex items-center gap-1 text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-md font-bold border border-purple-200">
                📌 {weekInfo.eventNote}
              </span>
            )}
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span>
              Tổng số tiết dạy trong tuần: <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{totalTeachingPeriodsInWeek} tiết</span>
            </span>
            {hasCustomOverrides && (
              <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-medium border border-amber-200">
                <Edit2 className="w-3 h-3" /> Tuần này đã có chỉnh sửa riêng
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={onlyActiveSlots}
                onChange={(e) => setOnlyActiveSlots(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span>Chỉ hiển thị các tiết có lịch dạy</span>
            </label>

            {hasCustomOverrides && (
              <button
                onClick={() => {
                  if (window.confirm('Khôi phục lại tuần này theo phân phối chương trình mặc định?')) {
                    clearWeekOverrides(currentWeek);
                  }
                }}
                className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 underline font-medium"
              >
                <RotateCcw className="w-3 h-3" /> Khôi phục mặc định tuần này
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Thông báo kỳ nghỉ Tết Nguyên Đán giữa Tuần 21 và Tuần 22 */}
      {currentWeek === 21 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl text-xs flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-base">🧧</span>
            <span>
              <strong>Sau Tuần 21:</strong> Toàn trường nghỉ Tết Nguyên Đán từ ngày <strong>01/02/2027</strong> đến <strong>12/02/2027</strong> (2 tuần). <strong>Tuần 22</strong> sẽ bắt đầu từ <strong>15/02/2027</strong> theo QĐ 4103/QĐ-UBND.
            </span>
          </div>
          <button
            onClick={() => setCurrentWeek(22)}
            className="text-amber-800 hover:text-amber-950 font-bold underline whitespace-nowrap"
          >
            Xem Tuần 22 →
          </button>
        </div>
      )}

      {currentWeek === 22 && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-base">🌸</span>
            <span>
              <strong>Tuần 22:</strong> Tuần thực học đầu tiên sau kỳ nghỉ Tết Nguyên Đán (kỳ nghỉ kết thúc ngày 12/02/2027). Chúc thầy cô và học sinh năm mới dạy tốt - học tốt!
            </span>
          </div>
          <button
            onClick={() => setCurrentWeek(21)}
            className="text-emerald-800 hover:text-emerald-950 font-bold underline whitespace-nowrap"
          >
            ← Xem Tuần 21
          </button>
        </div>
      )}

      {/* Main Schedule Table - Exact format matching PDF "Tuần 5" */}
      <div className="bg-white rounded-xl shadow-md border border-slate-300 overflow-hidden">
        {/* Table Title Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              KẾ HOẠCH DẠY HỌC - SỔ BÁO GIẢNG
            </h2>
            <p className="text-xs text-slate-300">
              {settings.schoolName} • Môn: {settings.subject} • GV: {settings.teacherName || 'Chưa cập nhật'}
            </p>
          </div>
          <div className="text-sm font-semibold bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
            Tuần {currentWeek}: Từ <span className="text-amber-300">{weekInfo.startDateStr}</span> Đến <span className="text-amber-300">{weekInfo.endDateStr}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm text-slate-800">
            <thead>
              {/* Header Matching "Tuần 5 Từ: 05/10/2026 Đến 09/10/2026" */}
              <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-900">
                <th colSpan={2} className="py-2.5 px-3 border-r border-slate-300 text-center text-sm font-bold bg-slate-200">
                  Tuần {currentWeek}
                </th>
                <th colSpan={6} className="py-2.5 px-4 text-center text-sm font-bold bg-slate-200">
                  Từ: {weekInfo.startDateStr} Đến {weekInfo.endDateStr}
                </th>
              </tr>
              {/* Columns Header matching PDF */}
              <tr className="bg-slate-100 border-b border-slate-300 text-center font-bold text-xs uppercase tracking-wider text-slate-750">
                <th className="py-3 px-3 border-r border-slate-300 w-28">Ngày</th>
                <th className="py-3 px-2 border-r border-slate-300 w-20">Buổi</th>
                <th className="py-3 px-2 border-r border-slate-300 w-16">Tiết</th>
                <th className="py-3 px-3 border-r border-slate-300 w-24">Lớp</th>
                <th className="py-3 px-4 border-r border-slate-300 text-left min-w-[320px]">Tựa bài dạy</th>
                <th className="py-3 px-3 border-r border-slate-300 w-24 text-center">Tiết theo PPCT</th>
                <th className="py-3 px-3 border-r border-slate-300 w-28 text-left">NDTH</th>
                <th className="py-3 px-3 w-28 text-left">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {groupedRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 italic">
                    Không có tiết dạy nào được xếp trong tuần này.
                  </td>
                </tr>
              ) : (
                groupedRows.map((item) => {
                  const r = item.row;
                  const isBlank = !r.className && !r.lessonTitle;

                  return (
                    <tr
                      key={r.id}
                      className={`group transition-colors ${
                        isBlank
                          ? 'bg-slate-50/50 text-slate-400'
                          : r.isCustomized
                          ? 'bg-amber-50/50 hover:bg-amber-100/50'
                          : 'hover:bg-blue-50/40'
                      }`}
                    >
                      {/* Cột Ngày (rowSpan) */}
                      {item.isFirstOfDay && (
                        <td
                          rowSpan={item.dayRowSpan}
                          className="py-3 px-3 border-r border-slate-300 text-center align-middle font-bold text-slate-900 bg-white"
                        >
                          <div className="leading-tight">
                            <span className="block text-slate-800 font-bold">{r.dayLabel}</span>
                            <span className="block text-xs font-semibold text-blue-700 mt-0.5">{r.dateStr}</span>
                          </div>
                        </td>
                      )}

                      {/* Cột Buổi (rowSpan) */}
                      {item.isFirstOfSession && (
                        <td
                          rowSpan={item.sessionRowSpan}
                          className="py-2.5 px-2 border-r border-slate-300 text-center align-middle font-semibold text-slate-700 bg-white/70"
                        >
                          <span className={`inline-block px-1.5 py-0.5 rounded text-xs ${
                            r.session === 'morning' ? 'text-amber-800 bg-amber-50 font-bold' : 'text-indigo-800 bg-indigo-50 font-bold'
                          }`}>
                            {r.sessionLabel}
                          </span>
                        </td>
                      )}

                      {/* Cột Tiết */}
                      <td className="py-2.5 px-2 border-r border-slate-300 text-center font-bold text-slate-800">
                        {r.period}
                      </td>

                      {/* Cột Lớp */}
                      <td className="py-2.5 px-3 border-r border-slate-300 text-center font-bold">
                        {r.className ? (
                          <span
                            className="inline-block px-2 py-0.5 rounded text-xs font-extrabold text-white"
                            style={{
                              backgroundColor:
                                classes.find((c) => c.name === r.className)?.color || '#2563eb',
                            }}
                          >
                            {r.className}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Cột Tựa bài dạy */}
                      <td className="py-2.5 px-4 border-r border-slate-300 font-medium">
                        <div className="flex items-center justify-between gap-2">
                          <span className={isBlank ? 'text-slate-300 italic' : 'text-slate-900'}>
                            {r.lessonTitle || '-'}
                          </span>
                          <button
                            onClick={() => handleStartEdit(r)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 rounded transition-opacity"
                            title="Chỉnh sửa nội dung tiết này"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Cột Tiết theo PPCT */}
                      <td className="py-2.5 px-3 border-r border-slate-300 text-center font-semibold text-slate-800">
                        {r.ppctPeriod ? (
                          <span className="text-blue-700 font-bold">{r.ppctPeriod}</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Cột NDTH */}
                      <td className="py-2.5 px-3 border-r border-slate-300 text-xs text-slate-600">
                        {r.ndth || ''}
                      </td>

                      {/* Cột Ghi chú */}
                      <td className="py-2.5 px-3 text-xs text-slate-600">
                        {r.notes || ''}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Signatures Section with BGH, Tổ trưởng & Giáo viên */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-xs">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <p className="font-bold uppercase tracking-wider text-slate-900">
                DUYỆT CỦA BAN GIÁM HIỆU
              </p>
              <p className="italic text-slate-500 mt-1">(Ký, ghi rõ họ tên và đóng dấu)</p>
              <div className="h-16" />
              <p className="font-semibold text-slate-400">........................................</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <p className="font-bold uppercase tracking-wider text-slate-900">
                TỔ TRƯỞNG CHUYÊN MÔN
              </p>
              <p className="italic text-slate-500 mt-1">(Ký và ghi rõ họ tên)</p>
              <div className="h-16" />
              <p className="font-semibold text-slate-400">........................................</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <p className="italic text-slate-500 mb-1">
                Ngày ..... tháng ..... năm {weekInfo.endDate.getFullYear()}
              </p>
              <p className="font-bold uppercase tracking-wider text-slate-900">
                GIÁO VIÊN GIẢNG DẠY
              </p>
              <p className="italic text-slate-500 mt-1">(Ký và ghi rõ họ tên)</p>
              <div className="h-12" />
              <p className="font-bold text-sm text-slate-900">
                {settings.teacherName || '........................................'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-500" />
            <span>Mẹo: Di chuột vào bất kỳ dòng nào và nhấn biểu tượng cây bút để sửa trực tiếp bài dạy hoặc bổ sung ghi chú.</span>
          </div>
          <div>
            <span>Năm học 2026 - 2027 • Bộ sách Tiếng Anh Global Success</span>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingRow && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Chỉnh Sửa Tiết Báo Giảng</h3>
                <p className="text-xs text-blue-100">
                  {editingRow.dayLabel} ({editingRow.dateStr}) • {editingRow.sessionLabel} • Tiết {editingRow.period}
                </p>
              </div>
              <button
                onClick={() => setEditingRow(null)}
                className="text-white/80 hover:text-white p-1 rounded-md text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Lớp dạy
                  </label>
                  <select
                    value={editForm.classId}
                    onChange={(e) => handleEditClassChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">-- Trống (Không có lớp) --</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (Khối {c.grade})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tiết theo PPCT
                  </label>
                  <input
                    type="number"
                    value={editForm.ppctPeriod}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditForm((prev) => {
                        // If class is chosen, auto suggest curriculum lesson title
                        const num = Number(val);
                        const cls = classes.find((c) => c.id === prev.classId);
                        let autoTitle = prev.lessonTitle;
                        if (cls && num > 0) {
                          const curr = curricula[cls.curriculumGrade || cls.grade]?.find((item) => item.period === num);
                          if (curr) autoTitle = curr.lessonTitle;
                        }
                        return {
                          ...prev,
                          ppctPeriod: val,
                          lessonTitle: autoTitle,
                        };
                      });
                    }}
                    placeholder="VD: 17"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tựa bài dạy
                </label>
                <input
                  type="text"
                  value={editForm.lessonTitle}
                  onChange={(e) => setEditForm({ ...editForm, lessonTitle: e.target.value })}
                  placeholder="VD: Unit 3: Lesson 1 – Activity 1 - 3"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required={!!editForm.classId}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nội dung tích hợp (NDTH)
                </label>
                <input
                  type="text"
                  value={editForm.ndth}
                  onChange={(e) => setEditForm({ ...editForm, ndth: e.target.value })}
                  placeholder="Ghi nội dung tích hợp (nếu có)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Ghi chú
                </label>
                <input
                  type="text"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Ghi chú thêm (VD: Dạy bù, Kiểm tra...)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRow(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Layers,
  X,
  FileSpreadsheet,
  FileText,
  Printer,
  Check,
  Calendar,
  Loader2,
} from 'lucide-react';
import { useSchedule } from '../context/ScheduleContext';
import { exportAllWeeksToExcel } from '../utils/exportExcel';
import { exportMultipleWeeksToWord } from '../utils/exportWord';
import { getWeekDateInfo } from '../utils/dateUtils';

interface BatchExportModalProps {
  onClose: () => void;
}

export const BatchExportModal: React.FC<BatchExportModalProps> = ({ onClose }) => {
  const { settings, getWeekRows } = useSchedule();
  const [rangeMode, setRangeMode] = useState<'all' | 'sem1' | 'sem2' | 'custom'>('all');
  const [customStart, setCustomStart] = useState(1);
  const [customEnd, setCustomEnd] = useState(35);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  // Determine selected weeks
  let startW = 1;
  let endW = 35;
  if (rangeMode === 'sem1') {
    startW = 1;
    endW = 18;
  } else if (rangeMode === 'sem2') {
    startW = 19;
    endW = 35;
  } else if (rangeMode === 'custom') {
    startW = Math.max(1, Math.min(customStart, customEnd));
    endW = Math.min(settings.totalWeeks, Math.max(customStart, customEnd));
  }

  const selectedWeeksCount = endW - startW + 1;

  const handleExportExcel = async () => {
    setIsExporting(true);
    setExportMessage(`Đang đóng gói ${selectedWeeksCount} tuần sang file Excel...`);
    try {
      const allWeeksData = [];
      for (let w = startW; w <= endW; w++) {
        allWeeksData.push({
          weekNumber: w,
          rows: getWeekRows(w),
        });
      }
      exportAllWeeksToExcel({ allWeeksData, settings });
      setExportMessage('Xuất file Excel thành công!');
      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 800);
    } catch (err) {
      console.error(err);
      setExportMessage('Có lỗi khi tạo file Excel.');
      setIsExporting(false);
    }
  };

  const handleExportWord = async () => {
    setIsExporting(true);
    setExportMessage(`Đang đóng gói ${selectedWeeksCount} tuần sang tài liệu Word...`);
    try {
      const weeksData = [];
      for (let w = startW; w <= endW; w++) {
        weeksData.push({
          weekNumber: w,
          rows: getWeekRows(w),
        });
      }
      await exportMultipleWeeksToWord({ weeksData, settings });
      setExportMessage('Xuất file Word thành công!');
      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 800);
    } catch (err) {
      console.error(err);
      setExportMessage('Có lỗi khi tạo file Word.');
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-200" />
            <div>
              <h3 className="font-bold text-base">Xuất Báo Giảng Hàng Loạt</h3>
              <p className="text-xs text-purple-200">Xuất nhiều tuần hoặc cả năm học 2026-2027</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-md text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Range Options */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Chọn phạm vi tuần cần xuất:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setRangeMode('all')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  rangeMode === 'all'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold text-sm">Toàn bộ 35 tuần</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Từ 07/09/2026 đến hết năm</div>
              </button>

              <button
                type="button"
                onClick={() => setRangeMode('sem1')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  rangeMode === 'sem1'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold text-sm">Học kì I (Tuần 1 - 18)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">18 tuần đầu tiên</div>
              </button>

              <button
                type="button"
                onClick={() => setRangeMode('sem2')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  rangeMode === 'sem2'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold text-sm">Học kì II (Tuần 19 - 35)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">17 tuần học kì 2</div>
              </button>

              <button
                type="button"
                onClick={() => setRangeMode('custom')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  rangeMode === 'custom'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold text-sm">Tùy chọn khoảng tuần</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Chọn từ tuần A đến B</div>
              </button>
            </div>
          </div>

          {/* Custom Range Inputs */}
          {rangeMode === 'custom' && (
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Từ tuần:</label>
                <input
                  type="number"
                  min={1}
                  max={settings.totalWeeks}
                  value={customStart}
                  onChange={(e) => setCustomStart(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm font-bold text-center"
                />
              </div>
              <span className="text-slate-400 font-bold mt-4">→</span>
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Đến tuần:</label>
                <input
                  type="number"
                  min={1}
                  max={settings.totalWeeks}
                  value={customEnd}
                  onChange={(e) => setCustomEnd(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm font-bold text-center"
                />
              </div>
            </div>
          )}

          {/* Summary notice */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-xs text-purple-900">
            Đang chọn: <strong>Tuần {startW}</strong> đến <strong>Tuần {endW}</strong> (Tổng cộng: <strong>{selectedWeeksCount} tuần</strong>)
          </div>

          {/* Export Status */}
          {isExporting && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>{exportMessage}</span>
            </div>
          )}

          {/* Format Buttons */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={handleExportExcel}
              disabled={isExporting}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất Sổ Báo Giảng Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleExportWord}
              disabled={isExporting}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Xuất Sổ Báo Giảng Word (.docx)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

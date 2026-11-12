import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  RotateCcw,
  Edit2,
  Check,
  FileSpreadsheet,
  Layers,
  Filter,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useSchedule } from '../context/ScheduleContext';
import { Grade, CurriculumPeriod } from '../types';

export const CurriculumEditor: React.FC = () => {
  const { curricula, updateCurriculumPeriod, resetCurriculum } = useSchedule();
  const [selectedGrade, setSelectedGrade] = useState<Grade>(3);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<number | 'all'>('all');
  const [editingItem, setEditingItem] = useState<CurriculumPeriod | null>(null);
  const [editForm, setEditForm] = useState({
    unit: '',
    lessonTitle: '',
    page: '',
    ndth: '',
    note: '',
  });

  const gradeList = curricula[selectedGrade] || [];

  const filteredList = gradeList.filter((item) => {
    const matchesSearch =
      item.lessonTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(item.period).includes(searchTerm) ||
      (item.ndth && item.ndth.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesWeek =
      selectedWeekFilter === 'all' || item.week === selectedWeekFilter;

    return matchesSearch && matchesWeek;
  });

  const handleStartEdit = (item: CurriculumPeriod) => {
    setEditingItem(item);
    setEditForm({
      unit: item.unit,
      lessonTitle: item.lessonTitle,
      page: item.page,
      ndth: item.ndth || '',
      note: item.note || '',
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    updateCurriculumPeriod(selectedGrade, editingItem.period, {
      unit: editForm.unit,
      lessonTitle: editForm.lessonTitle,
      page: editForm.page,
      ndth: editForm.ndth,
      note: editForm.note,
    });

    setEditingItem(null);
  };

  const handleExportCurriculumExcel = () => {
    const data: (string | number)[][] = [
      [`KẾ HOẠCH DẠY HỌC TIẾNG ANH ${selectedGrade} – GLOBAL SUCCESS`],
      ['Thời lượng: 4 tiết/tuần (140 tiết cho một năm học gồm 35 tuần)'],
      [],
      ['Tuần', 'Tiết PPCT', 'Bài/Unit', 'Nội dung chi tiết (Tựa bài dạy)', 'Sách học sinh', 'NDTH', 'Ghi chú'],
    ];

    gradeList.forEach((item) => {
      data.push([
        `Tuần ${item.week}`,
        item.period,
        item.unit,
        item.lessonTitle,
        item.page,
        item.ndth || '',
        item.note || '',
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [
      { wch: 10 },
      { wch: 12 },
      { wch: 16 },
      { wch: 45 },
      { wch: 14 },
      { wch: 18 },
      { wch: 16 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `PPCT_TA_${selectedGrade}`);
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, `Ke_Hoach_Day_Hoc_TA_${selectedGrade}_Global_Success.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Controller */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-800">
                Phân Phối Chương Trình (PPCT) & Kế Hoạch Dạy Học
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Khung 35 tuần x 4 tiết/tuần = 140 tiết SGK Tiếng Anh Global Success (Có thể tinh chỉnh theo thực tế của từng lớp)
            </p>
          </div>

          {/* Grade Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {([3, 4, 5] as Grade[]).map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedGrade === g
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Khối {g} (Global Success {g})
              </button>
            ))}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative min-w-[240px] max-w-sm flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm bài học, Unit, số tiết..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <select
              value={selectedWeekFilter}
              onChange={(e) =>
                setSelectedWeekFilter(
                  e.target.value === 'all' ? 'all' : Number(e.target.value)
                )
              }
              className="bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">Tất cả 35 tuần</option>
              {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  Tuần {w} (Tiết {(w - 1) * 4 + 1} - {w * 4})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCurriculumExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Xuất Excel PPCT Khối {selectedGrade}</span>
            </button>

            <button
              onClick={() => {
                if (
                  window.confirm(
                    `Khôi phục lại phân phối chương trình gốc của Khối ${selectedGrade} theo SGK Global Success?`
                  )
                ) {
                  resetCurriculum(selectedGrade);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-300"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục gốc SGK</span>
            </button>
          </div>
        </div>
      </div>

      {/* Curriculum Table */}
      <div className="bg-white rounded-xl shadow-md border border-slate-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm text-slate-800">
            <thead>
              <tr className="bg-slate-800 text-white text-xs uppercase tracking-wider text-center">
                <th className="py-3 px-3 border-r border-slate-700 w-20">Tuần</th>
                <th className="py-3 px-3 border-r border-slate-700 w-20">Tiết PPCT</th>
                <th className="py-3 px-3 border-r border-slate-700 min-w-[200px] text-left">Bài / Unit</th>
                <th className="py-3 px-4 border-r border-slate-700 text-left min-w-[340px]">Nội dung chi tiết (Tựa bài dạy)</th>
                <th className="py-3 px-3 border-r border-slate-700 w-28">Sách học sinh</th>
                <th className="py-3 px-3 border-r border-slate-700 w-32 text-left">NDTH</th>
                <th className="py-3 px-3 border-r border-slate-700 w-32 text-left">Ghi chú</th>
                <th className="py-3 px-2 w-16 text-center">Sửa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredList.map((item) => (
                <tr key={`p-${item.period}`} className="hover:bg-indigo-50/40 transition-colors group">
                  <td className="py-2.5 px-3 border-r border-slate-200 text-center font-bold text-slate-600 bg-slate-50/50">
                    Tuần {item.week}
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-200 text-center font-extrabold text-blue-700">
                    {item.period}
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-200 text-left font-bold text-slate-800">
                    {item.unit}
                  </td>
                  <td className="py-2.5 px-4 border-r border-slate-200 font-medium text-slate-900 text-sm">
                    {item.lessonTitle}
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-200 text-center text-slate-600 font-medium">
                    {item.page || '-'}
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-200 text-slate-600">
                    {item.ndth || '-'}
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-200 text-slate-600">
                    {item.note || '-'}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                      title="Chỉnh sửa tiết này"
                    >
                      <Edit2 className="w-3.5 h-3.5 mx-auto" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Chỉnh Sửa PPCT Khối {selectedGrade}</h3>
                <p className="text-xs text-indigo-100">
                  Tuần {editingItem.week} • Tiết PPCT số {editingItem.period}
                </p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-white/80 hover:text-white p-1 rounded-md text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Bài / Unit
                  </label>
                  <input
                    type="text"
                    value={editForm.unit}
                    onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Trang sách (SGK)
                  </label>
                  <input
                    type="text"
                    value={editForm.page}
                    onChange={(e) => setEditForm({ ...editForm, page: e.target.value })}
                    placeholder="VD: Trang 22"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nội dung chi tiết (Tựa bài dạy)
                </label>
                <input
                  type="text"
                  value={editForm.lessonTitle}
                  onChange={(e) => setEditForm({ ...editForm, lessonTitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
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
                  placeholder="Ghi chú tích hợp STEM, kỹ năng sống, liên môn..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Ghi chú
                </label>
                <input
                  type="text"
                  value={editForm.note}
                  onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                  placeholder="Ghi chú thêm..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm"
                >
                  Lưu cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

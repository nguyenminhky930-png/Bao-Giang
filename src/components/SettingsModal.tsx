import React, { useState } from 'react';
import { Settings, Save, X, Calendar, School, User, BookOpen } from 'lucide-react';
import { useSchedule } from '../context/ScheduleContext';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { settings, updateSettings } = useSchedule();
  const [formData, setFormData] = useState({
    schoolName: settings.schoolName,
    teacherName: settings.teacherName,
    subject: settings.subject,
    schoolYear: settings.schoolYear,
    startDate: settings.startDate,
    totalWeeks: settings.totalWeeks,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      schoolName: formData.schoolName.trim(),
      teacherName: formData.teacherName.trim(),
      subject: formData.subject.trim(),
      schoolYear: formData.schoolYear.trim(),
      startDate: formData.startDate,
      totalWeeks: Number(formData.totalWeeks),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-base">Cấu Hình Thông Tin Năm Học</h3>
              <p className="text-xs text-slate-300">Thông tin xuất hiện trên đầu sổ báo giảng</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-md text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-slate-500" /> Tên Trường
            </label>
            <input
              type="text"
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              placeholder="VD: TRƯỜNG TIỂU HỌC NGUYỄN DU"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" /> Họ & Tên Giáo Viên Giảng Dạy
            </label>
            <input
              type="text"
              value={formData.teacherName}
              onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
              placeholder="VD: Nguyễn Minh Kỳ"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" /> Môn Học
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Năm Học
              </label>
              <input
                type="text"
                value={formData.schoolYear}
                onChange={(e) => setFormData({ ...formData, schoolYear: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Ngày Bắt Đầu Tuần 1
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
              <span className="text-[10px] text-slate-500 block mt-1">Mặc định: Thứ Hai 07/09/2026</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tổng Số Tuần Học
              </label>
              <input
                type="number"
                min={1}
                max={40}
                value={formData.totalWeeks}
                onChange={(e) => setFormData({ ...formData, totalWeeks: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
              <span className="text-[10px] text-slate-500 block mt-1">Chuẩn năm học: 35 tuần</span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Cài Đặt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

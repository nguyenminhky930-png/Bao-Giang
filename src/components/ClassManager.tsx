import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useSchedule } from '../context/ScheduleContext';
import { ClassInfo, Grade } from '../types';

export const ClassManager: React.FC = () => {
  const { classes, addClass, updateClass, deleteClass, timetableSlots } = useSchedule();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formGrade, setFormGrade] = useState<Grade>(3);
  const [formColor, setFormColor] = useState('#2563eb');

  const colorPresets = [
    '#0284c7', // Sky
    '#0369a1', // Ocean
    '#16a34a', // Emerald
    '#15803d', // Forest
    '#9333ea', // Purple
    '#7e22ce', // Violet
    '#6b21a8', // Deep violet
    '#d97706', // Amber
    '#dc2626', // Red
    '#0d9488', // Teal
  ];

  const handleStartAdd = () => {
    setIsAddingNew(true);
    setFormName('');
    setFormGrade(3);
    setFormColor(colorPresets[Math.floor(Math.random() * colorPresets.length)]);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    addClass({
      name: formName.trim(),
      grade: formGrade,
      curriculumGrade: formGrade,
      color: formColor,
    });

    setIsAddingNew(false);
  };

  const handleStartEdit = (c: ClassInfo) => {
    setEditingId(c.id);
    setFormName(c.name);
    setFormGrade(c.grade);
    setFormColor(c.color || '#2563eb');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !formName.trim()) return;

    updateClass(editingId, {
      name: formName.trim(),
      grade: formGrade,
      curriculumGrade: formGrade,
      color: formColor,
    });

    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">
              Quản Lý Danh Sách Lớp Học
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mỗi lớp học liên kết với Phân phối chương trình tương ứng theo Khối 3, 4 hoặc 5. Khi đổi tên hoặc khối lớp, bài học sẽ tự động đồng bộ.
          </p>
        </div>

        <button
          onClick={handleStartAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm lớp mới</span>
        </button>
      </div>

      {/* Add New Class Form */}
      {isAddingNew && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 animate-in fade-in duration-150">
          <h3 className="text-sm font-bold text-blue-900 mb-3">Thêm Lớp Mới</h3>
          <form onSubmit={handleSaveNew} className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên lớp (VD: 3G1, 4G3...)
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nhập tên lớp..."
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none w-40"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Khối lớp (Áp dụng PPCT)
              </label>
              <select
                value={formGrade}
                onChange={(e) => setFormGrade(Number(e.target.value) as Grade)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none w-36"
              >
                <option value={3}>Khối 3 (SGK TA 3)</option>
                <option value={4}>Khối 4 (SGK TA 4)</option>
                <option value={5}>Khối 5 (SGK TA 5)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Màu đại diện
              </label>
              <div className="flex items-center gap-1.5">
                {colorPresets.slice(0, 6).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      formColor === c ? 'scale-110 ring-2 ring-offset-1 ring-slate-800' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs"
              >
                Lưu lớp
              </button>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Class List Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => {
          const isEditing = editingId === cls.id;
          const assignedSlots = timetableSlots.filter((s) => s.classId === cls.id).length;

          if (isEditing) {
            return (
              <div
                key={cls.id}
                className="bg-amber-50/70 border border-amber-300 rounded-xl p-5 shadow-sm space-y-3"
              >
                <h4 className="text-xs font-bold text-amber-900 uppercase">Chỉnh Sửa Lớp</h4>
                <form onSubmit={handleSaveEdit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Tên lớp:</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Khối lớp:</label>
                    <select
                      value={formGrade}
                      onChange={(e) => setFormGrade(Number(e.target.value) as Grade)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value={3}>Khối 3 (SGK TA 3)</option>
                      <option value={4}>Khối 4 (SGK TA 4)</option>
                      <option value={5}>Khối 5 (SGK TA 5)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Màu sắc:</label>
                    <div className="flex items-center gap-1.5">
                      {colorPresets.slice(0, 7).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setFormColor(c)}
                          className={`w-5 h-5 rounded-full ${
                            formColor === c ? 'ring-2 ring-offset-1 ring-slate-800' : ''
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs"
                    >
                      Lưu
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            );
          }

          return (
            <div
              key={cls.id}
              className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div
                className="absolute top-0 left-0 bottom-0 w-2"
                style={{ backgroundColor: cls.color || '#2563eb' }}
              />

              <div className="pl-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="px-3 py-1 text-sm font-black text-white rounded-lg shadow-2xs"
                      style={{ backgroundColor: cls.color || '#2563eb' }}
                    >
                      {cls.name}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Khối {cls.grade}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        SGK Tiếng Anh {cls.curriculumGrade}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(cls)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                      title="Chỉnh sửa tên / khối"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Bạn có chắc chắn muốn xóa lớp ${cls.name}?`)) {
                          deleteClass(cls.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
                      title="Xóa lớp"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Thời khóa biểu:
                  </span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full ${
                      assignedSlots === 4
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : assignedSlots === 0
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {assignedSlots} / 4 tiết/tuần
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

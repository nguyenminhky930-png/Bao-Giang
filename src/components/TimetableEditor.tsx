import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useSchedule } from '../context/ScheduleContext';
import { DayOfWeek, Session } from '../types';

export const TimetableEditor: React.FC = () => {
  const {
    timetableSlots,
    updateTimetableSlot,
    resetTimetableToDefault,
    classes,
  } = useSchedule();

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Group slots by Day and Session
  const days: { day: DayOfWeek; label: string }[] = [
    { day: 2, label: 'Thứ Hai' },
    { day: 3, label: 'Thứ Ba' },
    { day: 4, label: 'Thứ Tư' },
    { day: 5, label: 'Thứ Năm' },
    { day: 6, label: 'Thứ Sáu' },
  ];

  const morningPeriods = [1, 2, 3, 4];
  const afternoonPeriods = [1, 2, 3];

  const getSlot = (day: DayOfWeek, session: Session, period: number) => {
    return timetableSlots.find(
      (s) => s.day === day && s.session === session && s.period === period
    );
  };

  const handleCellClick = (day: DayOfWeek, session: Session, period: number) => {
    const slot = getSlot(day, session, period);
    if (!slot) return;

    if (selectedClassId !== null) {
      // Toggle or assign selected class
      const newClassId = slot.classId === selectedClassId ? null : selectedClassId;
      updateTimetableSlot(slot.id, newClassId);
    } else {
      // Rotate through classes: null -> class1 -> class2 ... -> null
      const classIds = [null, ...classes.map((c) => c.id)];
      const currentIndex = classIds.indexOf(slot.classId);
      const nextIndex = (currentIndex + 1) % classIds.length;
      updateTimetableSlot(slot.id, classIds[nextIndex]);
    }
  };

  // Calculate periods per class
  const classStats = classes.map((cls) => {
    const count = timetableSlots.filter((s) => s.classId === cls.id).length;
    return {
      ...cls,
      count,
    };
  });

  const totalAssignedSlots = timetableSlots.filter((s) => s.classId !== null).length;

  return (
    <div className="space-y-6">
      {/* Header & Instructions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-800">
                Thiết Lập Thời Khóa Biểu Giảng Dạy (Hàng Tuần)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Thời khóa biểu này làm khung cơ sở cố định để tự động phân bổ bài dạy cho toàn bộ 35 tuần trong năm học.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Bạn có muốn đặt lại thời khóa biểu chuẩn theo đúng mẫu "Tuần 5"?')) {
                  resetTimetableToDefault();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-300"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục mẫu chuẩn Tuần 5</span>
            </button>
          </div>
        </div>

        {/* Quick Class Palette */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Chọn nhanh lớp để gán vào ô (hoặc click trực tiếp vào ô để đổi):
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Tổng số tiết dạy: <strong className="text-blue-700">{totalAssignedSlots} tiết/tuần</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedClassId(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                selectedClassId === null
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
              }`}
            >
              Chế độ xoay vòng lớp
            </button>

            {classStats.map((cls) => {
              const isSelected = selectedClassId === cls.id;
              const isTargetReached = cls.count === 4;

              return (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassId(isSelected ? null : cls.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? 'ring-2 ring-offset-1 ring-blue-500 text-white shadow-sm'
                      : 'hover:opacity-90 text-white'
                  }`}
                  style={{ backgroundColor: cls.color || '#3b82f6' }}
                >
                  <span>{cls.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isTargetReached ? 'bg-white/30 text-white' : 'bg-black/30 text-white'
                  }`}>
                    {cls.count}/4 tiết
                  </span>
                </button>
              );
            })}

            <button
              onClick={() => setSelectedClassId('__CLEAR__')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                selectedClassId === '__CLEAR__'
                  ? 'bg-rose-700 text-white border-rose-700 shadow-sm'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200'
              }`}
            >
              Chổi xóa tiết (Trống)
            </button>
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-xl shadow-md border border-slate-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-center">
            <thead>
              <tr className="bg-slate-800 text-white text-xs uppercase tracking-wider">
                <th className="py-3 px-3 border-r border-slate-700 w-24">Buổi</th>
                <th className="py-3 px-2 border-r border-slate-700 w-16">Tiết</th>
                {days.map((d) => (
                  <th key={d.day} className="py-3 px-3 border-r border-slate-700 last:border-r-0">
                    <span className="font-bold text-sm block">{d.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {/* Morning (Sáng - 4 tiết) */}
              {morningPeriods.map((period, pIdx) => (
                <tr key={`morning-${period}`} className="hover:bg-slate-50/50">
                  {pIdx === 0 && (
                    <td
                      rowSpan={4}
                      className="py-3 px-2 border-r border-slate-300 font-extrabold text-amber-900 bg-amber-50/70 align-middle text-xs uppercase"
                    >
                      SÁNG
                      <span className="block text-[10px] text-amber-700 font-medium mt-1">(4 tiết)</span>
                    </td>
                  )}

                  <td className="py-3 px-2 border-r border-slate-300 font-bold text-slate-700 bg-slate-50">
                    Tiết {period}
                  </td>

                  {days.map((d) => {
                    const slot = getSlot(d.day, 'morning', period);
                    const cls = slot?.classId ? classes.find((c) => c.id === slot.classId) : null;

                    return (
                      <td
                        key={`slot-${d.day}-morning-${period}`}
                        onClick={() => {
                          if (slot) {
                            if (selectedClassId === '__CLEAR__') {
                              updateTimetableSlot(slot.id, null);
                            } else {
                              handleCellClick(d.day, 'morning', period);
                            }
                          }
                        }}
                        className="py-2.5 px-3 border-r border-slate-200 last:border-r-0 cursor-pointer hover:bg-blue-50/50 transition-colors"
                      >
                        {cls ? (
                          <div
                            className="inline-flex items-center justify-center font-extrabold text-white text-xs px-3 py-1.5 rounded-lg shadow-xs w-full max-w-[100px]"
                            style={{ backgroundColor: cls.color || '#2563eb' }}
                          >
                            {cls.name}
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs italic">Trống</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Divider between sessions */}
              <tr className="bg-slate-200/60">
                <td colSpan={7} className="py-1 text-[11px] text-slate-500 font-semibold tracking-wider uppercase text-center">
                  --- Buổi Chiều ---
                </td>
              </tr>

              {/* Afternoon (Chiều - 3 tiết) */}
              {afternoonPeriods.map((period, pIdx) => (
                <tr key={`afternoon-${period}`} className="hover:bg-slate-50/50">
                  {pIdx === 0 && (
                    <td
                      rowSpan={3}
                      className="py-3 px-2 border-r border-slate-300 font-extrabold text-indigo-900 bg-indigo-50/70 align-middle text-xs uppercase"
                    >
                      CHIỀU
                      <span className="block text-[10px] text-indigo-700 font-medium mt-1">(3 tiết)</span>
                    </td>
                  )}

                  <td className="py-3 px-2 border-r border-slate-300 font-bold text-slate-700 bg-slate-50">
                    Tiết {period}
                  </td>

                  {days.map((d) => {
                    const slot = getSlot(d.day, 'afternoon', period);
                    const cls = slot?.classId ? classes.find((c) => c.id === slot.classId) : null;

                    return (
                      <td
                        key={`slot-${d.day}-afternoon-${period}`}
                        onClick={() => {
                          if (slot) {
                            if (selectedClassId === '__CLEAR__') {
                              updateTimetableSlot(slot.id, null);
                            } else {
                              handleCellClick(d.day, 'afternoon', period);
                            }
                          }
                        }}
                        className="py-2.5 px-3 border-r border-slate-200 last:border-r-0 cursor-pointer hover:bg-blue-50/50 transition-colors"
                      >
                        {cls ? (
                          <div
                            className="inline-flex items-center justify-center font-extrabold text-white text-xs px-3 py-1.5 rounded-lg shadow-xs w-full max-w-[100px]"
                            style={{ backgroundColor: cls.color || '#2563eb' }}
                          >
                            {cls.name}
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs italic">Trống</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-500" />
            <span>Mỗi khối lớp học 4 tiết/tuần (35 tuần = 140 tiết). Hãy đảm bảo mỗi lớp có đủ 4 tiết trong tuần để bài dạy khớp với sách giáo khoa.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-700">Mẫu mặc định:</span>
            <span>3G2 (4 tiết), 4G1 (4 tiết), 4G2 (4 tiết), 5G1 (4 tiết), 5G2 (4 tiết), 5G3 (4 tiết) = 24 tiết/tuần</span>
          </div>
        </div>
      </div>
    </div>
  );
};

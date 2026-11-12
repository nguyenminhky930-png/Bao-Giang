import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  BookOpen,
  Users,
  Settings as SettingsIcon,
  Printer,
  Layers,
  Sparkles,
  School,
  FileSpreadsheet,
  FileText,
  Download,
} from 'lucide-react';
import { ScheduleProvider, useSchedule } from './context/ScheduleContext';
import { WeeklyScheduleView } from './components/WeeklyScheduleView';
import { TimetableEditor } from './components/TimetableEditor';
import { CurriculumEditor } from './components/CurriculumEditor';
import { ClassManager } from './components/ClassManager';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import { BatchExportModal } from './components/BatchExportModal';
import { SettingsModal } from './components/SettingsModal';

type ActiveTab = 'schedule' | 'timetable' | 'curriculum' | 'classes';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('schedule');
  const [printPreviewWeek, setPrintPreviewWeek] = useState<number | null>(null);
  const [isBatchExportOpen, setIsBatchExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { settings, currentWeek } = useSchedule();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Main Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm font-black text-lg">
                BG
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight">
                    Sổ Báo Giảng Tiểu Học
                  </h1>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    2026 - 2027
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  Tiếng Anh 3, 4, 5 • Global Success • 35 tuần
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setActiveTab('schedule')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'schedule'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Sổ Báo Giảng</span>
              </button>

              <button
                onClick={() => setActiveTab('timetable')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'timetable'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span className="hidden md:inline">Thời Khóa Biểu</span>
                <span className="md:hidden">TKB</span>
              </button>

              <button
                onClick={() => setActiveTab('curriculum')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'curriculum'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden md:inline">PPCT (Kế Hoạch)</span>
                <span className="md:hidden">PPCT</span>
              </button>

              <button
                onClick={() => setActiveTab('classes')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'classes'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="hidden md:inline">Lớp Học</span>
                <span className="md:hidden">Lớp</span>
              </button>
            </nav>

            {/* Quick Settings & Help */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                title="Cài đặt thông tin trường / giáo viên"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'schedule' && (
          <WeeklyScheduleView
            onOpenPrintPreview={(weekNum) => setPrintPreviewWeek(weekNum)}
            onOpenBatchExport={() => setIsBatchExportOpen(true)}
          />
        )}

        {activeTab === 'timetable' && <TimetableEditor />}

        {activeTab === 'curriculum' && <CurriculumEditor />}

        {activeTab === 'classes' && <ClassManager />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span>Năm học 2026 - 2027 • Bộ GD&ĐT • Khung 35 tuần (bắt đầu 07/09/2026)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-600 font-semibold">{settings.schoolName}</span>
            <span>•</span>
            <span>{settings.teacherName}</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {printPreviewWeek !== null && (
        <PrintPreviewModal
          weekNumber={printPreviewWeek}
          onClose={() => setPrintPreviewWeek(null)}
        />
      )}

      {isBatchExportOpen && (
        <BatchExportModal onClose={() => setIsBatchExportOpen(false)} />
      )}

      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ScheduleProvider>
      <MainApp />
    </ScheduleProvider>
  );
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ClassInfo,
  CurriculumPeriod,
  GeneralSettings,
  Grade,
  TimetableSlot,
  WeekOverride,
  WeeklyScheduleRow,
} from '../types';
import {
  initialCurriculumGrade3,
  initialCurriculumGrade4,
  initialCurriculumGrade5,
} from '../data/defaultCurricula';
import {
  defaultClasses,
  generateDefaultTimetableSlots,
} from '../data/defaultTimetable';
import { generateWeeklyScheduleRows } from '../utils/scheduleGenerator';

interface ScheduleContextType {
  currentWeek: number;
  setCurrentWeek: (w: number) => void;
  settings: GeneralSettings;
  updateSettings: (newSettings: Partial<GeneralSettings>) => void;
  classes: ClassInfo[];
  addClass: (cls: Omit<ClassInfo, 'id'>) => void;
  updateClass: (id: string, updated: Partial<ClassInfo>) => void;
  deleteClass: (id: string) => void;
  timetableSlots: TimetableSlot[];
  updateTimetableSlot: (slotId: string, classId: string | null) => void;
  resetTimetableToDefault: () => void;
  curricula: Record<Grade, CurriculumPeriod[]>;
  updateCurriculumPeriod: (grade: Grade, periodNum: number, updated: Partial<CurriculumPeriod>) => void;
  resetCurriculum: (grade: Grade) => void;
  overrides: Record<number, WeekOverride>; // weekNum -> WeekOverride
  updateWeekOverride: (weekNum: number, rowId: string, data: Partial<WeeklyScheduleRow>) => void;
  clearWeekOverrides: (weekNum: number) => void;
  getCurrentWeekRows: (onlyActive?: boolean) => WeeklyScheduleRow[];
  getWeekRows: (weekNum: number, onlyActive?: boolean) => WeeklyScheduleRow[];
}

const defaultSettings: GeneralSettings = {
  schoolName: 'TRƯỜNG TIỂU HỌC',
  teacherName: 'Giáo viên Tiếng Anh',
  subject: 'TIẾNG ANH (GLOBAL SUCCESS)',
  schoolYear: '2026 - 2027',
  startDate: '2026-09-07',
  totalWeeks: 35,
};

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentWeek, setCurrentWeek] = useState<number>(() => {
    return 5; // Default to Week 5 as requested by user based on sample file
  });

  const [settings, setSettings] = useState<GeneralSettings>(() => {
    const saved = localStorage.getItem('bao_giang_settings_2026');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return defaultSettings;
  });

  const [classes, setClasses] = useState<ClassInfo[]>(() => {
    const saved = localStorage.getItem('bao_giang_classes_2026');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return defaultClasses;
  });

  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>(() => {
    const saved = localStorage.getItem('bao_giang_timetable_2026');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return generateDefaultTimetableSlots();
  });

  const [curricula, setCurricula] = useState<Record<Grade, CurriculumPeriod[]>>(() => {
    const saved = localStorage.getItem('bao_giang_curricula_2026_v2') || localStorage.getItem('bao_giang_curricula_2026');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Check if parsed curriculum has unit title included (e.g. "Unit 1: Hello")
        if (parsed[3] && parsed[3][4]?.unit?.includes(':') && parsed[4] && parsed[4][4]?.unit?.includes(':')) {
          return parsed;
        }
      } catch (e) { /* ignore */ }
    }
    return {
      3: initialCurriculumGrade3,
      4: initialCurriculumGrade4,
      5: initialCurriculumGrade5,
    };
  });

  const [overrides, setOverrides] = useState<Record<number, WeekOverride>>(() => {
    const saved = localStorage.getItem('bao_giang_overrides_2026');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {};
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('bao_giang_settings_2026', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('bao_giang_classes_2026', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('bao_giang_timetable_2026', JSON.stringify(timetableSlots));
  }, [timetableSlots]);

  useEffect(() => {
    localStorage.setItem('bao_giang_curricula_2026_v2', JSON.stringify(curricula));
  }, [curricula]);

  useEffect(() => {
    localStorage.setItem('bao_giang_overrides_2026', JSON.stringify(overrides));
  }, [overrides]);

  const updateSettings = (newSettings: Partial<GeneralSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const addClass = (cls: Omit<ClassInfo, 'id'>) => {
    const newClass: ClassInfo = {
      ...cls,
      id: `c-${Date.now()}`,
    };
    setClasses((prev) => [...prev, newClass]);
  };

  const updateClass = (id: string, updated: Partial<ClassInfo>) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
  };

  const deleteClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    // Remove class from timetable slots
    setTimetableSlots((prev) =>
      prev.map((s) => (s.classId === id ? { ...s, classId: null } : s))
    );
  };

  const updateTimetableSlot = (slotId: string, classId: string | null) => {
    setTimetableSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, classId } : s))
    );
  };

  const resetTimetableToDefault = () => {
    setTimetableSlots(generateDefaultTimetableSlots());
  };

  const updateCurriculumPeriod = (
    grade: Grade,
    periodNum: number,
    updated: Partial<CurriculumPeriod>
  ) => {
    setCurricula((prev) => {
      const gradeList = prev[grade] || [];
      const updatedList = gradeList.map((item) =>
        item.period === periodNum ? { ...item, ...updated } : item
      );
      return {
        ...prev,
        [grade]: updatedList,
      };
    });
  };

  const resetCurriculum = (grade: Grade) => {
    setCurricula((prev) => {
      let original: CurriculumPeriod[] = [];
      if (grade === 3) original = initialCurriculumGrade3;
      else if (grade === 4) original = initialCurriculumGrade4;
      else original = initialCurriculumGrade5;
      return {
        ...prev,
        [grade]: original,
      };
    });
  };

  const updateWeekOverride = (
    weekNum: number,
    rowId: string,
    data: Partial<WeeklyScheduleRow>
  ) => {
    setOverrides((prev) => {
      const weekOv = prev[weekNum] || {};
      return {
        ...prev,
        [weekNum]: {
          ...weekOv,
          [rowId]: {
            ...weekOv[rowId],
            lessonTitle: data.lessonTitle,
            ppctPeriod: data.ppctPeriod,
            ndth: data.ndth,
            notes: data.notes,
            className: data.className,
            classId: data.classId,
          },
        },
      };
    });
  };

  const clearWeekOverrides = (weekNum: number) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[weekNum];
      return next;
    });
  };

  const getWeekRows = (weekNum: number, onlyActive = false): WeeklyScheduleRow[] => {
    const allRows = generateWeeklyScheduleRows({
      weekNumber: weekNum,
      startDateStr: settings.startDate,
      timetableSlots,
      classes,
      curricula,
      overrides: overrides[weekNum] || {},
    });

    if (onlyActive) {
      return allRows.filter((r) => r.className && r.lessonTitle);
    }
    return allRows;
  };

  const getCurrentWeekRows = (onlyActive = false) => {
    return getWeekRows(currentWeek, onlyActive);
  };

  return (
    <ScheduleContext.Provider
      value={{
        currentWeek,
        setCurrentWeek,
        settings,
        updateSettings,
        classes,
        addClass,
        updateClass,
        deleteClass,
        timetableSlots,
        updateTimetableSlot,
        resetTimetableToDefault,
        curricula,
        updateCurriculumPeriod,
        resetCurriculum,
        overrides,
        updateWeekOverride,
        clearWeekOverrides,
        getCurrentWeekRows,
        getWeekRows,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};

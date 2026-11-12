import { CurriculumPeriod, Grade } from '../types';

export const GRADE_3_UNITS: Record<number, string> = {
  1: 'Hello',
  2: 'Our names',
  3: 'Our friends',
  4: 'Our bodies',
  5: 'My hobbies',
  6: 'Our school',
  7: 'Classroom instructions',
  8: 'My school things',
  9: 'Colours',
  10: 'Break time activities',
  11: 'My family',
  12: 'Jobs',
  13: 'My house',
  14: 'My bedroom',
  15: 'At the dining table',
  16: 'My pets',
  17: 'Our toys',
  18: 'Playing and doing',
  19: 'Outdoor activities',
  20: 'At the zoo',
};

export const GRADE_4_UNITS: Record<number, string> = {
  1: 'My friends',
  2: 'Time and daily routines',
  3: 'My week',
  4: 'My birthday party',
  5: 'Things we can do',
  6: 'Our school facilities',
  7: 'Our timetable',
  8: 'My favourite subjects',
  9: 'Our sports day',
  10: 'Our summer holidays',
  11: 'My home',
  12: 'Jobs',
  13: 'Appearance',
  14: 'Daily activities',
  15: "My family's weekends",
  16: 'Weather',
  17: 'In the city',
  18: 'At the shopping centre',
  19: 'The animal world',
  20: 'At summer camp',
};

export const GRADE_5_UNITS: Record<number, string> = {
  1: 'All about me',
  2: 'Our homes',
  3: 'My foreign friends',
  4: 'Our free-time activities',
  5: 'My future job',
  6: 'Our school rooms',
  7: 'Our favourite school activities',
  8: 'In our classroom',
  9: 'Our outdoor activities',
  10: 'Our school trip',
  11: 'Family time',
  12: 'Our Tet holiday',
  13: 'Our special days',
  14: 'Staying healthy',
  15: 'Our health',
  16: 'Seasons and the weather',
  17: 'Stories for children',
  18: 'Means of transport',
  19: 'Places of interest',
  20: 'Our summer holiday',
};

// Generate standard 140 periods for Grade 3, 4, 5 Global Success
export function generateCurriculumForGrade(grade: Grade): CurriculumPeriod[] {
  const list: CurriculumPeriod[] = [];

  const unitTitles =
    grade === 3
      ? GRADE_3_UNITS
      : grade === 4
      ? GRADE_4_UNITS
      : GRADE_5_UNITS;

  // Helper to add a period
  const addPeriod = (
    pNum: number,
    unit: string,
    lessonTitle: string,
    page: string,
    ndth = '',
    note = ''
  ) => {
    const week = Math.ceil(pNum / 4);
    list.push({
      period: pNum,
      week,
      unit,
      lessonTitle,
      page,
      ndth,
      note,
    });
  };

  // Week 1: Starter
  if (grade === 3) {
    addPeriod(1, 'LÀM QUEN', 'Làm quen với Chương trình và sách giáo khoa Tiếng Anh 3 và các tài liệu bổ trợ liên quan trên mạng', '');
    addPeriod(2, 'STARTER', 'Starter: A. Numbers', 'Trang 7');
    addPeriod(3, 'STARTER', 'Starter: B. The Alphabet', 'Trang 8');
    addPeriod(4, 'STARTER', 'Starter: C. Fun Time', 'Trang 9');
  } else if (grade === 4) {
    addPeriod(1, 'LÀM QUEN', 'Làm quen với Chương trình và sách giáo khoa Tiếng Anh 4 và các tài liệu bổ trợ liên quan trên mạng', '');
    addPeriod(2, 'STARTER', 'Starter: A. Hello again!', 'Trang 7');
    addPeriod(3, 'STARTER', 'Starter: B. Classroom activities', 'Trang 8');
    addPeriod(4, 'STARTER', 'Starter: C. Outdoor activities', 'Trang 9');
  } else {
    addPeriod(1, 'LÀM QUEN', 'Làm quen với Chương trình và sách giáo khoa Tiếng Anh 5 và các tài liệu bổ trợ liên quan trên mạng', '');
    addPeriod(2, 'STARTER', 'Starter: A. Back to school', 'Trang 7');
    addPeriod(3, 'STARTER', 'Starter: B. Classroom instructions', 'Trang 8');
    addPeriod(4, 'STARTER', 'Starter: C. Activities we can do', 'Trang 9');
  }

  // Helper to generate a 6-period unit with explicit unit title
  const addUnit = (unitNum: number, startPeriod: number, startPage: number) => {
    const unitTitle = unitTitles[unitNum] || '';
    const unitFullLabel = `Unit ${unitNum}: ${unitTitle}`;

    const activities = [
      { name: 'Lesson 1 – Activity 1 - 3', offset: 0 },
      { name: 'Lesson 1 – Activity 4 - 6', offset: 1 },
      { name: 'Lesson 2 – Activity 1 - 3', offset: 2 },
      { name: 'Lesson 2 – Activity 4 - 6', offset: 3 },
      { name: 'Lesson 3 – Activity 1 - 3', offset: 4 },
      { name: 'Lesson 3 – Activity 4 - 6', offset: 5 },
    ];
    activities.forEach((act, idx) => {
      const p = startPeriod + idx;
      const pageStr = `Trang ${startPage + act.offset}`;
      addPeriod(p, unitFullLabel, `${unitFullLabel} - ${act.name}`, pageStr);
    });
  };

  // Units 1 to 5:
  // Unit 1: periods 5..10 (start page 10)
  addUnit(1, 5, 10);
  // Unit 2: periods 11..16 (start page 16)
  addUnit(2, 11, 16);
  // Unit 3: periods 17..22 (start page 22)
  addUnit(3, 17, 22);
  // Unit 4: periods 23..28 (start page 28)
  addUnit(4, 23, 28);
  // Unit 5: periods 29..34 (start page 34)
  addUnit(5, 29, 34);

  // Review 1: periods 35, 36, 37
  addPeriod(35, 'REVIEW 1', 'Review 1: Activity 1 - 2', 'Trang 40');
  addPeriod(36, 'REVIEW 1', 'Review 1: Activity 3 - 5', 'Trang 41');
  if (grade === 3) {
    addPeriod(37, 'FUN TIME', 'Fun Time: Activity 1 - 3', 'Trang 42 – 43');
  } else if (grade === 4) {
    addPeriod(37, 'EXTENSION ACTIVITIES', 'Extension Activities: Activity 1 - 3', 'Trang 42 – 43');
  } else {
    addPeriod(37, 'REVIEW 1', 'Review 1: Extension activities', 'Trang 42 – 43');
  }

  // Units 6 to 10:
  // Unit 6: periods 38..43 (start page 44)
  addUnit(6, 38, 44);
  // Unit 7: periods 44..49 (start page 50)
  addUnit(7, 44, 50);
  // Unit 8: periods 50..55 (start page 56)
  addUnit(8, 50, 56);
  // Unit 9: periods 56..61 (start page 62)
  addUnit(9, 56, 62);
  // Unit 10: periods 62..67 (start page 68)
  addUnit(10, 62, 68);

  // Review 2 & Semester 1 Exam: periods 68..72
  addPeriod(68, 'REVIEW 2', 'Review 2: Activity 1 - 2', 'Trang 74');
  addPeriod(69, 'REVIEW 2', 'Review 2: Activity 3 – 5', 'Trang 75');
  if (grade === 3) {
    addPeriod(70, 'FUN TIME', 'Fun Time: Activity 1 - 3', 'Trang 76 – 77');
  } else if (grade === 4) {
    addPeriod(70, 'EXTENSION ACTIVITIES', 'Extension Activities: Activity 1 - 3', 'Trang 76 – 77');
  } else {
    addPeriod(70, 'REVIEW 2', 'Review 2: Extension activities', 'Trang 76 – 77');
  }
  addPeriod(71, 'KIỂM TRA', 'Kiểm tra Học kì 1', '', 'Đánh giá định kỳ', 'Kiểm tra cuối HKI');
  addPeriod(72, 'CHỮA BÀI', 'Chữa bài kiểm tra Học kì 1', '', 'Đánh giá định kỳ', 'Rút kinh nghiệm HKI');

  // Semester 2: Units 11 to 15 (Book 2 starts at page 6)
  // Unit 11: periods 73..78 (start page 6)
  addUnit(11, 73, 6);
  // Unit 12: periods 79..84 (start page 12)
  addUnit(12, 79, 12);
  // Unit 13: periods 85..90 (start page 18)
  addUnit(13, 85, 18);
  // Unit 14: periods 91..96 (start page 24)
  addUnit(14, 91, 24);
  // Unit 15: periods 97..102 (start page 30)
  addUnit(15, 97, 30);

  // Review 3 (or Review 2 in Book 2): periods 103, 104, 105
  const review3Label = grade === 5 ? 'REVIEW 3' : (grade === 3 ? 'REVIEW 3' : 'REVIEW 3');
  addPeriod(103, review3Label, `${review3Label}: Activity 1 - 2`, 'Trang 36');
  addPeriod(104, review3Label, `${review3Label}: Activity 3 - 5`, 'Trang 37');
  if (grade === 3) {
    addPeriod(105, 'FUN TIME', 'Fun Time: Activity 1 - 3', 'Trang 38 – 39');
  } else if (grade === 4) {
    addPeriod(105, 'EXTENSION ACTIVITIES', 'Extension Activities: Activity 1 - 3', 'Trang 38 – 39');
  } else {
    addPeriod(105, review3Label, `${review3Label}: Extension activities`, 'Trang 38 – 39');
  }

  // Units 16 to 20:
  // Unit 16: periods 106..111 (start page 40)
  addUnit(16, 106, 40);
  // Unit 17: periods 112..117 (start page 46)
  addUnit(17, 112, 46);
  // Unit 18: periods 118..123 (start page 52)
  addUnit(18, 118, 52);
  // Unit 19: periods 124..129 (start page 58)
  addUnit(19, 124, 58);
  // Unit 20: periods 130..135 (start page 64)
  addUnit(20, 130, 64);

  // Review 4 & Semester 2 Exam: periods 136..140
  addPeriod(136, 'REVIEW 4', 'Review 4: Activity 1 – 2', 'Trang 70');
  addPeriod(137, 'REVIEW 4', 'Review 4: Activity 3 – 5', 'Trang 71');
  if (grade === 3) {
    addPeriod(138, 'FUN TIME', 'Fun Time: Activity 1 – 3', 'Trang 72 – 73');
  } else if (grade === 4) {
    addPeriod(138, 'EXTENSION ACTIVITIES', 'Extension Activities: Activity 1 – 3', 'Trang 72 – 73');
  } else {
    addPeriod(138, 'REVIEW 4', 'Review 4: Extension activities', 'Trang 72 – 73');
  }
  addPeriod(139, 'KIỂM TRA', 'Kiểm tra Học kì 2', '', 'Đánh giá định kỳ', 'Kiểm tra cuối HKII');
  addPeriod(140, 'CHỮA BÀI', 'Chữa bài kiểm tra Học kì 2', '', 'Đánh giá định kỳ', 'Tổng kết năm học');

  return list;
}

export const initialCurriculumGrade3 = generateCurriculumForGrade(3);
export const initialCurriculumGrade4 = generateCurriculumForGrade(4);
export const initialCurriculumGrade5 = generateCurriculumForGrade(5);

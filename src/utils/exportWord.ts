import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  AlignmentType,
  BorderStyle,
  PageOrientation,
  HeadingLevel,
  VerticalMergeType,
  VerticalAlign,
} from 'docx';
import { saveAs } from 'file-saver';
import { WeeklyScheduleRow, GeneralSettings } from '../types';
import { getWeekDateInfo } from './dateUtils';

interface ExportWordParams {
  weekNumber: number;
  rows: WeeklyScheduleRow[];
  settings: GeneralSettings;
  fileName?: string;
  onlyActiveSlots?: boolean;
}

export async function exportWeekToWord({
  weekNumber,
  rows,
  settings,
  fileName,
  onlyActiveSlots = false,
}: ExportWordParams) {
  const weekInfo = getWeekDateInfo(weekNumber, settings.startDate);
  const displayRows = onlyActiveSlots ? rows.filter((r) => r.className || r.lessonTitle) : rows;

  const borderNone = {
    top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  };

  const borderStandard = {
    top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  };

  // Header Table for metadata (School name & Schedule title)
  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: borderNone,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: borderNone,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: (settings.schoolName || 'TRƯỜNG TIỂU HỌC').toUpperCase(),
                    bold: true,
                    size: 22,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Môn: ${settings.subject} - Năm học: ${settings.schoolYear}`,
                    italics: true,
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: borderNone,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `Giáo viên: ${settings.teacherName || '....................'}`,
                    bold: true,
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Table header rows matching Tuần 5
  const tableRows: TableRow[] = [];

  // Top header row: Tuần X | Từ: ... Đến: ...
  tableRows.push(
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          columnSpan: 2,
          borders: borderStandard,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `Tuần ${weekNumber}`,
                  bold: true,
                  size: 22,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          columnSpan: 6,
          borders: borderStandard,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `Từ: ${weekInfo.startDateStr} Đến ${weekInfo.endDateStr}`,
                  bold: true,
                  size: 22,
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  // Column titles row
  const columnHeaders = [
    { title: 'Ngày', width: 12 },
    { title: 'Buổi', width: 10 },
    { title: 'Tiết', width: 8 },
    { title: 'Lớp', width: 10 },
    { title: 'Tựa bài dạy', width: 34 },
    { title: 'Tiết theo PPCT', width: 10 },
    { title: 'NDTH', width: 8 },
    { title: 'Ghi chú', width: 8 },
  ];

  tableRows.push(
    new TableRow({
      tableHeader: true,
      children: columnHeaders.map(
        (col) =>
          new TableCell({
            width: { size: col.width, type: WidthType.PERCENTAGE },
            borders: borderStandard,
            shading: { fill: 'F3F4F6' },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: col.title,
                    bold: true,
                    size: 19,
                  }),
                ],
              }),
            ],
          })
      ),
    })
  );

  // Add data rows with merged Day and Session cells
  displayRows.forEach((r, idx) => {
    const isFirstOfDay = idx === 0 || displayRows[idx - 1].day !== r.day;
    const isFirstOfSession =
      idx === 0 ||
      displayRows[idx - 1].day !== r.day ||
      displayRows[idx - 1].session !== r.session;

    tableRows.push(
      new TableRow({
        children: [
          // Cột Ngày (Gộp theo Thứ/Ngày)
          new TableCell({
            width: { size: 12, type: WidthType.PERCENTAGE },
            borders: borderStandard,
            verticalMerge: isFirstOfDay ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE,
            verticalAlign: VerticalAlign.CENTER,
            children: isFirstOfDay
              ? [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({ text: r.dayLabel, bold: true, size: 18 }),
                    ],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({ text: r.dateStr, italics: true, size: 17 }),
                    ],
                  }),
                ]
              : [],
          }),

          // Cột Buổi (Gộp theo Sáng/Chiều trong ngày)
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            borders: borderStandard,
            verticalMerge: isFirstOfSession ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE,
            verticalAlign: VerticalAlign.CENTER,
            children: isFirstOfSession
              ? [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: r.sessionLabel, bold: true, size: 18 })],
                  }),
                ]
              : [],
          }),

          // Cột Tiết
          new TableCell({
            width: { size: 8, type: WidthType.PERCENTAGE },
            borders: borderStandard,
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: String(r.period), bold: true, size: 18 })],
              }),
            ],
          }),

          // Cột Lớp
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            borders: borderStandard,
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: r.className || '', bold: true, size: 18 })],
              }),
            ],
          }),

          // Cột Tựa bài dạy
          new TableCell({
            width: { size: 34, type: WidthType.PERCENTAGE },
            borders: borderStandard,
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                children: [new TextRun({ text: r.lessonTitle || '', size: 18 })],
              }),
            ],
          }),

          // Cột Tiết theo PPCT
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            borders: borderStandard,
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: r.ppctPeriod ? String(r.ppctPeriod) : '', size: 18 })],
              }),
            ],
          }),

          // Cột NDTH
          new TableCell({
            width: { size: 8, type: WidthType.PERCENTAGE },
            borders: borderStandard,
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                children: [new TextRun({ text: r.ndth || '', size: 16 })],
              }),
            ],
          }),

          // Cột Ghi chú
          new TableCell({
            width: { size: 8, type: WidthType.PERCENTAGE },
            borders: borderStandard,
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                children: [new TextRun({ text: r.notes || '', size: 16 })],
              }),
            ],
          }),
        ],
      })
    );
  });

  const mainTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: borderStandard,
    rows: tableRows,
  });

  // Signatures Table with BGH, Tổ trưởng & Giáo viên
  const signTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: borderNone,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 33, type: WidthType.PERCENTAGE },
            borders: borderNone,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'DUYỆT CỦA BAN GIÁM HIỆU',
                    bold: true,
                    size: 20,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: '(Ký, ghi rõ họ tên và đóng dấu)',
                    italics: true,
                    size: 17,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 33, type: WidthType.PERCENTAGE },
            borders: borderNone,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'TỔ TRƯỞNG CHUYÊN MÔN',
                    bold: true,
                    size: 20,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: '(Ký và ghi rõ họ tên)',
                    italics: true,
                    size: 17,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 34, type: WidthType.PERCENTAGE },
            borders: borderNone,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `Ngày ..... tháng ..... năm ${weekInfo.endDate.getFullYear()}`,
                    italics: true,
                    size: 17,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'GIÁO VIÊN GIẢNG DẠY',
                    bold: true,
                    size: 20,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: '(Ký và ghi rõ họ tên)',
                    italics: true,
                    size: 17,
                  }),
                ],
              }),
              new Paragraph({ children: [new TextRun({ text: '' })] }),
              new Paragraph({ children: [new TextRun({ text: '' })] }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: settings.teacherName || '',
                    bold: true,
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 }, // 0.5 inch margins
          },
        },
        children: [
          metaTable,
          new Paragraph({ spacing: { after: 120 } }),
          mainTable,
          new Paragraph({ spacing: { after: 240 } }),
          signTable,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const outName = fileName || `Bao_Giang_Tuan_${weekNumber}_2026_2027.docx`;
  saveAs(blob, outName);
}

// Export multiple weeks to a single Word document
export async function exportMultipleWeeksToWord({
  weeksData,
  settings,
}: {
  weeksData: { weekNumber: number; rows: WeeklyScheduleRow[] }[];
  settings: GeneralSettings;
}) {
  const sections = weeksData.map(({ weekNumber, rows }) => {
    const weekInfo = getWeekDateInfo(weekNumber, settings.startDate);
    const borderStandard = {
      top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    };
    const borderNone = {
      top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    };

    const tableRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            columnSpan: 2,
            borders: borderStandard,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: `Tuần ${weekNumber}`, bold: true, size: 22 })],
              }),
            ],
          }),
          new TableCell({
            columnSpan: 6,
            borders: borderStandard,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `Từ: ${weekInfo.startDateStr} Đến ${weekInfo.endDateStr}`,
                    bold: true,
                    size: 22,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        tableHeader: true,
        children: [
          { title: 'Ngày', width: 12 },
          { title: 'Buổi', width: 10 },
          { title: 'Tiết', width: 8 },
          { title: 'Lớp', width: 10 },
          { title: 'Tựa bài dạy', width: 34 },
          { title: 'Tiết theo PPCT', width: 10 },
          { title: 'NDTH', width: 8 },
          { title: 'Ghi chú', width: 8 },
        ].map(
          (col) =>
            new TableCell({
              width: { size: col.width, type: WidthType.PERCENTAGE },
              borders: borderStandard,
              shading: { fill: 'F3F4F6' },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: col.title, bold: true, size: 19 })],
                }),
              ],
            })
        ),
      }),
    ];

    rows.forEach((r, idx) => {
      const isFirstOfDay = idx === 0 || rows[idx - 1].day !== r.day;
      const isFirstOfSession =
        idx === 0 ||
        rows[idx - 1].day !== r.day ||
        rows[idx - 1].session !== r.session;

      tableRows.push(
        new TableRow({
          children: [
            // Cột Ngày (Gộp theo Thứ/Ngày)
            new TableCell({
              width: { size: 12, type: WidthType.PERCENTAGE },
              borders: borderStandard,
              verticalMerge: isFirstOfDay ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE,
              verticalAlign: VerticalAlign.CENTER,
              children: isFirstOfDay
                ? [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: r.dayLabel, bold: true, size: 18 })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: r.dateStr, italics: true, size: 17 })] }),
                  ]
                : [],
            }),

            // Cột Buổi (Gộp theo Sáng/Chiều trong ngày)
            new TableCell({
              width: { size: 10, type: WidthType.PERCENTAGE },
              borders: borderStandard,
              verticalMerge: isFirstOfSession ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE,
              verticalAlign: VerticalAlign.CENTER,
              children: isFirstOfSession
                ? [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: r.sessionLabel, bold: true, size: 18 })] })]
                : [],
            }),

            // Cột Tiết
            new TableCell({
              width: { size: 8, type: WidthType.PERCENTAGE },
              borders: borderStandard,
              verticalAlign: VerticalAlign.CENTER,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(r.period), bold: true, size: 18 })] })],
            }),

            // Cột Lớp
            new TableCell({
              width: { size: 10, type: WidthType.PERCENTAGE },
              borders: borderStandard,
              verticalAlign: VerticalAlign.CENTER,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: r.className || '', bold: true, size: 18 })] })],
            }),

            // Cột Tựa bài dạy
            new TableCell({
              width: { size: 34, type: WidthType.PERCENTAGE },
              borders: borderStandard,
              verticalAlign: VerticalAlign.CENTER,
              children: [new Paragraph({ children: [new TextRun({ text: r.lessonTitle || '', size: 18 })] })],
            }),

            // Cột Tiết theo PPCT
            new TableCell({
              width: { size: 10, type: WidthType.PERCENTAGE },
              borders: borderStandard,
              verticalAlign: VerticalAlign.CENTER,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: r.ppctPeriod ? String(r.ppctPeriod) : '', size: 18 })] })],
            }),

            // Cột NDTH
            new TableCell({
              width: { size: 8, type: WidthType.PERCENTAGE },
              borders: borderStandard,
              verticalAlign: VerticalAlign.CENTER,
              children: [new Paragraph({ children: [new TextRun({ text: r.ndth || '', size: 16 })] })],
            }),

            // Cột Ghi chú
            new TableCell({
              width: { size: 8, type: WidthType.PERCENTAGE },
              borders: borderStandard,
              verticalAlign: VerticalAlign.CENTER,
              children: [new Paragraph({ children: [new TextRun({ text: r.notes || '', size: 16 })] })],
            }),
          ],
        })
      );
    });

    const mainTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: borderStandard,
      rows: tableRows,
    });

    const signTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: borderNone,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 33, type: WidthType.PERCENTAGE },
              borders: borderNone,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'DUYỆT CỦA BAN GIÁM HIỆU', bold: true, size: 20 })],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: '(Ký, ghi rõ họ tên và đóng dấu)', italics: true, size: 17 })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 33, type: WidthType.PERCENTAGE },
              borders: borderNone,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'TỔ TRƯỞNG CHUYÊN MÔN', bold: true, size: 20 })],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: '(Ký và ghi rõ họ tên)', italics: true, size: 17 })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 34, type: WidthType.PERCENTAGE },
              borders: borderNone,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: `Ngày ..... tháng ..... năm ${weekInfo.endDate.getFullYear()}`, italics: true, size: 17 })],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'GIÁO VIÊN GIẢNG DẠY', bold: true, size: 20 })],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: '(Ký và ghi rõ họ tên)', italics: true, size: 17 })],
                }),
                new Paragraph({ children: [new TextRun({ text: '' })] }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: settings.teacherName || '', bold: true, size: 20 })],
                }),
              ],
            }),
          ],
        }),
      ],
    });

    return {
      properties: {
        page: {
          margin: { top: 720, bottom: 720, left: 720, right: 720 },
        },
      },
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: `${settings.schoolName || 'TRƯỜNG TIỂU HỌC'} - SỔ BÁO GIẢNG NĂM HỌC ${settings.schoolYear}`,
              bold: true,
              size: 22,
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: `Môn: ${settings.subject} | Giáo viên: ${settings.teacherName || '....................'}`,
              italics: true,
              size: 19,
            }),
          ],
        }),
        mainTable,
        new Paragraph({ spacing: { after: 200 } }),
        signTable,
      ],
    };
  });

  const doc = new Document({ sections });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `So_Bao_Giang_Tap_Hop_2026_2027.docx`);
}

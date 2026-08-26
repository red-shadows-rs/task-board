import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ARABIC_CHARS: Record<number, number[]> = {
  0x0621: [0xfe80, 0xfe80, 0xfe80, 0xfe80],
  0x0622: [0xfe81, 0xfe81, 0xfe82, 0xfe82],
  0x0623: [0xfe83, 0xfe83, 0xfe84, 0xfe84],
  0x0624: [0xfe85, 0xfe85, 0xfe86, 0xfe86],
  0x0625: [0xfe87, 0xfe87, 0xfe88, 0xfe88],
  0x0626: [0xfe89, 0xfe8b, 0xfe8c, 0xfe8a],
  0x0627: [0xfe8d, 0xfe8d, 0xfe8e, 0xfe8e],
  0x0628: [0xfe8f, 0xfe91, 0xfe92, 0xfe90],
  0x0629: [0xfe93, 0xfe93, 0xfe94, 0xfe94],
  0x062a: [0xfe95, 0xfe97, 0xfe98, 0xfe96],
  0x062b: [0xfe99, 0xfe9b, 0xfe9c, 0xfe9a],
  0x062c: [0xfe9d, 0xfe9f, 0xfea0, 0xfe9e],
  0x062d: [0xfea1, 0xfea3, 0xfea4, 0xfea2],
  0x062e: [0xfea5, 0xfea7, 0xfea8, 0xfea6],
  0x062f: [0xfea9, 0xfea9, 0xfeaa, 0xfeaa],
  0x0630: [0xfeab, 0xfeab, 0xfeac, 0xfeac],
  0x0631: [0xfead, 0xfead, 0xfeae, 0xfeae],
  0x0632: [0xfeaf, 0xfeaf, 0xfeb0, 0xfeb0],
  0x0633: [0xfeb1, 0xfeb3, 0xfeb4, 0xfeb2],
  0x0634: [0xfeb5, 0xfeb7, 0xfeb8, 0xfeb6],
  0x0635: [0xfeb9, 0xfebb, 0xfebc, 0xfeba],
  0x0636: [0xfebd, 0xfebf, 0xfec0, 0xfebe],
  0x0637: [0xfec1, 0xfec3, 0xfec4, 0xfec2],
  0x0638: [0xfec5, 0xfec7, 0xfec8, 0xfec6],
  0x0639: [0xfec9, 0xfecb, 0xfecc, 0xfeca],
  0x063a: [0xfecd, 0xfecf, 0xfed0, 0xfece],
  0x0641: [0xfed1, 0xfed3, 0xfed4, 0xfed2],
  0x0642: [0xfed5, 0xfed7, 0xfed8, 0xfed6],
  0x0643: [0xfed9, 0xfedb, 0xfedc, 0xfeda],
  0x0644: [0xfedd, 0xfedf, 0xfee0, 0xfede],
  0x0645: [0xfee1, 0xfee3, 0xfee4, 0xfee2],
  0x0646: [0xfee5, 0xfee7, 0xfee8, 0xfee6],
  0x0647: [0xfee9, 0xfeeb, 0xfeec, 0xfeea],
  0x0648: [0xfeed, 0xfeed, 0xfeee, 0xfeee],
  0x0649: [0xfeef, 0xfeef, 0xfef0, 0xfef0],
  0x064a: [0xfef1, 0xfef3, 0xfef4, 0xfef2],
};

const LIGATURES: Record<number, number[]> = {
  0xfefb: [0xfefb, 0xfefb, 0xfefc, 0xfefc],
  0xfef5: [0xfef5, 0xfef5, 0xfef6, 0xfef6],
  0xfef7: [0xfef7, 0xfef7, 0xfef8, 0xfef8],
  0xfef9: [0xfef9, 0xfef9, 0xfefa, 0xfefa],
};

const isJoiningLeft = (char: number): boolean => {
  const nonJoining = [
    0x0621, 0x0622, 0x0623, 0x0624, 0x0625, 0x0627, 0x062f, 0x0630, 0x0631,
    0x0632, 0x0648, 0x0629, 0x0649,
  ];
  return ARABIC_CHARS[char] !== undefined && !nonJoining.includes(char);
};

const isJoiningRight = (char: number): boolean => {
  return ARABIC_CHARS[char] !== undefined && char !== 0x0621;
};

const reshapeArabic = (text: string): string => {
  if (!text) return "";
  const chars = text.split("").map((c) => c.charCodeAt(0));
  const shapedChars: number[] = [];
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    if (char === 0x0644 && i + 1 < chars.length) {
      const next = chars[i + 1];
      let ligature = 0;
      if (next === 0x0627) ligature = 0xfefb;
      else if (next === 0x0622) ligature = 0xfef5;
      else if (next === 0x0623) ligature = 0xfef7;
      else if (next === 0x0625) ligature = 0xfef9;
      if (ligature) {
        const prev = chars[i - 1];
        const left = isJoiningLeft(prev);
        shapedChars.push(
          left ? LIGATURES[ligature][2] : LIGATURES[ligature][0],
        );
        i++;
        continue;
      }
    }
    if (!ARABIC_CHARS[char]) {
      shapedChars.push(char);
      continue;
    }
    const prev = chars[i - 1];
    const next = chars[i + 1];
    const left = isJoiningLeft(prev);
    const right = isJoiningRight(next) && isJoiningLeft(char);
    if (left && right) shapedChars.push(ARABIC_CHARS[char][2]);
    else if (left) shapedChars.push(ARABIC_CHARS[char][3]);
    else if (right) shapedChars.push(ARABIC_CHARS[char][1]);
    else {
      const isolated = ARABIC_CHARS[char][0];
      shapedChars.push(isolated);
    }
  }
  const resultString = String.fromCharCode(...shapedChars);
  if (
    resultString.length > 0 &&
    !/[\u0600-\u06FF\uFE70-\uFEFF]/.test(resultString) &&
    /[a-zA-Z0-9]/.test(resultString)
  ) {
    return "\u200E" + resultString + "\u200E";
  }
  return resultString;
};

const loadAsset = async (url: string): Promise<string> => {
  try {
    let targetUrl = url;
    if (
      !url.startsWith("http") &&
      !url.startsWith("data:") &&
      !url.startsWith("/")
    ) {
      targetUrl = "/" + url;
    }
    const response = await fetch(targetUrl);
    if (!response.ok) return "";
    const buffer = await response.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  } catch {
    return "";
  }
};

type RGB = [number, number, number];

const C = {
  PRIMARY: [59, 130, 246] as RGB,
  PRIMARY_FG: [248, 250, 252] as RGB,
  FOREGROUND: [15, 23, 42] as RGB,
  SECONDARY_FG: [30, 41, 59] as RGB,
  MUTED: [241, 245, 249] as RGB,
  MUTED_FG: [100, 116, 139] as RGB,
  BORDER: [226, 232, 240] as RGB,
  CARD: [255, 255, 255] as RGB,
  SUCCESS: [16, 185, 129] as RGB,
  WARNING: [245, 158, 11] as RGB,
  PURPLE: [139, 92, 246] as RGB,
  DESTRUCTIVE: [239, 68, 68] as RGB,
};

const MARGIN = 14;

interface ProjectData {
  id: string;
  title: { en: string; ar: string };
  startDate: string;
  endDate?: string;
  status: string;
  teamMembers: string[];
  color?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface SectionData {
  id: string;
  projectId: string;
  title: { en: string; ar: string };
  order?: number;
}

interface TaskData {
  id: string;
  sectionId: string;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  status: string;
  assignedTo: string[];
  dueDate: string;
  priority: string;
  tags: string[];
  order?: number;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  assigneePrices?: { userId: string; price: number }[];
}

interface UserData {
  id: string;
  name: string;
  email?: string;
  role: string;
}

type TranslationsFn = (key: string) => string;

interface ExportProjectOptions {
  project: ProjectData;
  sections: SectionData[];
  tasks: TaskData[];
  users: UserData[];
  language: "en" | "ar";
  translations: TranslationsFn;
}

interface ExportSectionOptions {
  section: SectionData;
  tasks: TaskData[];
  users: UserData[];
  project?: ProjectData | null;
  language: "en" | "ar";
  translations: TranslationsFn;
}

interface ExportTaskOptions {
  task: TaskData;
  section?: SectionData | null;
  project?: ProjectData | null;
  users: UserData[];
  language: "en" | "ar";
  translations: TranslationsFn;
}

interface ExportAnalyticsOptions {
  tasks: TaskData[];
  projects: ProjectData[];
  users: UserData[];
  sections: SectionData[];
  dateRange: string;
  language: "en" | "ar";
  translations: TranslationsFn;
}

interface AutoTableInfo {
  finalY: number;
}

const txt = (text: string, isRTL: boolean): string => {
  if (!isRTL || !/[\u0600-\u06FF]/.test(text)) return text;
  return reshapeArabic(text);
};

const setFont = (doc: jsPDF, style: "normal" | "bold" = "normal"): void => {
  try {
    doc.setFont("IBMPlexSans", style);
  } catch {
    doc.setFont("helvetica", style);
  }
};

const getUserName = (userId: string, users: UserData[]): string => {
  const user = users.find((u) => u.id === userId);
  return user?.name || "-";
};

const drawRichText = (
  doc: jsPDF,
  html: string,
  y: number,
  pw: number,
  ph: number,
  isRTL: boolean,
): number => {
  const margin = MARGIN;
  const contentW = pw - 2 * margin;
  const lineH = 5.5;
  let curY = y;

  interface TextSeg {
    text: string;
    bold: boolean;
  }

  interface RichLine {
    segments: TextSeg[];
    level: number;
    isListItem: boolean;
  }

  const richLines: RichLine[] = [];
  let ulDepth = 0;
  let isBold = false;
  let currentSegs: TextSeg[] = [];
  let currentIsLI = false;
  let currentLevel = 0;

  const commitLine = () => {
    if (currentSegs.length === 0) return;
    const hasContent = currentSegs.some((s) => s.text.trim().length > 0);
    if (!hasContent) {
      currentSegs = [];
      return;
    }
    richLines.push({
      segments: [...currentSegs],
      level: currentLevel,
      isListItem: currentIsLI,
    });
    currentSegs = [];
  };

  const rawTokens = html.match(/<[^>]+>|[^<]+/gi) || [html];

  rawTokens.forEach((token) => {
    const lower = token.toLowerCase().trim();

    if (lower.startsWith("<ul")) {
      ulDepth++;
    } else if (lower === "</ul>") {
      ulDepth = Math.max(0, ulDepth - 1);
    } else if (lower.startsWith("<li")) {
      commitLine();
      currentIsLI = true;
      currentLevel = ulDepth;
    } else if (lower === "</li>") {
      commitLine();
      currentIsLI = false;
    } else if (lower.startsWith("<p") || lower.startsWith("<br")) {
      commitLine();
    } else if (lower === "</p>") {
      commitLine();
    } else if (lower.startsWith("<strong") || lower === "<b>") {
      isBold = true;
    } else if (lower === "</strong>" || lower === "</b>") {
      isBold = false;
    } else if (!token.startsWith("<")) {
      const decoded = token
        .replace(/&nbsp;/g, " ")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&");
      if (decoded.trim()) {
        currentSegs.push({ text: decoded, bold: isBold });
      }
    }
  });
  commitLine();

  for (const richLine of richLines) {
    const indentW = richLine.isListItem
      ? 8 + Math.max(0, richLine.level - 1) * 6
      : 0;
    const maxW = contentW - indentW;

    const words: TextSeg[] = [];
    richLine.segments.forEach((seg) => {
      seg.text.split(/(\s+)/).forEach((w) => {
        if (w) words.push({ text: w, bold: seg.bold });
      });
    });

    if (isRTL) {
      const mirrorMap: Record<string, string> = {
        "(": ")",
        ")": "(",
        "[": "]",
        "]": "[",
        "{": "}",
        "}": "{",
      };
      const punctRe =
        /^([^\w\u0600-\u06FF]*)(.*?[\w\u0600-\u06FF].*?)([^\w\u0600-\u06FF]*)$/;

      const processed: TextSeg[] = [];
      words.forEach((word) => {
        if (/^\s+$/.test(word.text)) {
          processed.push(word);
          return;
        }
        const m = word.text.match(punctRe);
        if (m && (m[1] || m[3])) {
          if (m[1]) {
            m[1].split("").forEach((ch) => {
              processed.push({ text: mirrorMap[ch] || ch, bold: word.bold });
            });
          }
          if (m[2]) processed.push({ text: m[2], bold: word.bold });
          if (m[3]) {
            m[3].split("").forEach((ch) => {
              processed.push({ text: mirrorMap[ch] || ch, bold: word.bold });
            });
          }
        } else {
          processed.push(word);
        }
      });
      words.length = 0;
      words.push(...processed);
    }

    let line: TextSeg[] = [];
    let lineW = 0;
    let isFirstLine = true;

    const renderLine = () => {
      if (line.length === 0) return;
      curY = ensureSpace(doc, curY, lineH, ph);

      if (richLine.isListItem && isFirstLine) {
        setFont(doc, "normal");
        const bullet = "\u2022";
        const bulletIndent = Math.max(0, richLine.level - 1) * 6;
        const bulletX = isRTL
          ? pw - margin - bulletIndent - 1
          : margin + bulletIndent + 1;
        doc.text(bullet, bulletX, curY, { align: isRTL ? "right" : "left" });
      }
      isFirstLine = false;

      let curX = isRTL ? pw - margin - indentW : margin + indentW;
      line.forEach((w) => {
        setFont(doc, w.bold ? "bold" : "normal");
        const processed = txt(w.text, isRTL);
        const wW = doc.getTextWidth(processed);
        const x = isRTL ? curX - wW : curX;
        doc.text(processed, x, curY);
        curX = isRTL ? curX - wW : curX + wW;
      });

      curY += lineH;
      line = [];
      lineW = 0;
    };

    words.forEach((word) => {
      setFont(doc, word.bold ? "bold" : "normal");
      const wordW = doc.getTextWidth(word.text);

      if (lineW + wordW > maxW && line.length > 0) {
        renderLine();
      }
      line.push(word);
      lineW += wordW;
    });

    if (line.length > 0) {
      renderLine();
    }
    curY += 2;
  }

  return curY;
};

const formatDate = (dateString: string, _isRTL: boolean): string => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  } catch {
    return dateString;
  }
};

const initFonts = async (doc: jsPDF): Promise<void> => {
  try {
    const regularFont64 = await loadAsset(
      "/fonts/IBMPlexSansArabic-Regular.ttf",
    );
    const boldFont64 = await loadAsset("/fonts/IBMPlexSansArabic-Bold.ttf");
    if (regularFont64 && boldFont64) {
      doc.addFileToVFS("IBMPlexSansArabic-Regular.ttf", regularFont64);
      doc.addFont("IBMPlexSansArabic-Regular.ttf", "IBMPlexSans", "normal");
      doc.addFileToVFS("IBMPlexSansArabic-Bold.ttf", boldFont64);
      doc.addFont("IBMPlexSansArabic-Bold.ttf", "IBMPlexSans", "bold");
    }
  } catch {}
};

const estimateRichTextHeight = (
  doc: jsPDF,
  html: string,
  pw: number,
): number => {
  const contentW = pw - 2 * MARGIN;
  const lineH = 5.5;

  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return lineH;

  setFont(doc, "normal");
  doc.setFontSize(9);
  const avgCharW = doc.getTextWidth("m");
  const charsPerLine = Math.max(Math.floor(contentW / avgCharW), 1);

  const textLines = Math.ceil(text.length / charsPerLine);
  const paragraphs = (html.match(/<\/p>|<\/li>|<br/gi) || []).length;

  return textLines * lineH + paragraphs * 2 + 16;
};

const ensureSpace = (
  doc: jsPDF,
  y: number,
  needed: number,
  pageHeight: number,
): number => {
  if (y + needed > pageHeight - 20) {
    doc.addPage();
    return 20;
  }
  return y;
};
const drawTaskBoardLogo = (doc: jsPDF, x: number, y: number, size: number) => {
  const s = size / 24;
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(2 * s);

  const drawRect = (
    rx: number,
    ry: number,
    rw: number,
    rh: number,
    fillOpacity: number,
  ) => {
    const r = Math.round(59 + (255 - 59) * fillOpacity);
    const g = Math.round(130 + (255 - 130) * fillOpacity);
    const b = Math.round(246 + (255 - 246) * fillOpacity);
    doc.setFillColor(r, g, b);
    doc.roundedRect(x + rx * s, y + ry * s, rw * s, rh * s, 1 * s, 1 * s, "FD");
  };

  drawRect(3, 3, 7, 9, 0.2);
  drawRect(14, 3, 7, 5, 0.3);
  drawRect(14, 12, 7, 9, 0.25);
  drawRect(3, 16, 7, 5, 0.35);
};

const drawHeader = (
  doc: jsPDF,
  pw: number,
  isRTL: boolean,
  title: string,
  subtitle: string = "",
): number => {
  const h = 38;

  for (let i = 0; i < h; i++) {
    const t = i / h;
    const r = Math.round(C.PRIMARY[0] * (1 - t * 0.15));
    const g = Math.round(C.PRIMARY[1] * (1 - t * 0.08));
    const b = Math.round(C.PRIMARY[2] * (1 + t * 0.02));
    doc.setFillColor(r, g, Math.min(255, b));
    doc.rect(0, i, pw, 1, "F");
  }

  const logoSize = 25;
  const logoX = isRTL ? pw - MARGIN - logoSize + 4 : MARGIN - 4;
  const logoY = 6;
  drawTaskBoardLogo(doc, logoX, logoY, logoSize);

  doc.setTextColor(...C.PRIMARY_FG);
  setFont(doc, "bold");
  doc.setFontSize(16);
  doc.text(txt(title, isRTL), pw / 2, subtitle ? 16 : 20, { align: "center" });

  if (subtitle) {
    setFont(doc, "normal");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(txt(subtitle, isRTL), pw / 2, 28, { align: "center" });
  }

  return h + 8;
};

const drawFooter = (
  doc: jsPDF,
  pw: number,
  ph: number,
  isRTL: boolean,
  pageNum: number,
): void => {
  const y = ph - 10;

  doc.setDrawColor(...C.BORDER);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y - 4, pw - MARGIN, y - 4);

  setFont(doc, "normal");
  doc.setFontSize(7);
  doc.setTextColor(...C.MUTED_FG);

  const dateStr = new Date().toLocaleDateString("en-GB");
  doc.text(dateStr, isRTL ? MARGIN : pw - MARGIN, y, {
    align: isRTL ? "left" : "right",
  });

  doc.text(String(pageNum), pw / 2, y, { align: "center" });

  const brand = "TaskBoard";
  doc.text(brand, isRTL ? pw - MARGIN : MARGIN, y, {
    align: isRTL ? "right" : "left",
  });
};

const drawStatCard = (
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  value: string | number,
  accent: RGB,
  isRTL: boolean,
): void => {
  doc.setFillColor(...C.CARD);
  doc.roundedRect(x, y, w, h, 3, 3, "F");

  doc.setDrawColor(...C.BORDER);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 3, 3, "S");

  doc.setFillColor(...accent);
  const accentX = isRTL ? x + w - 6 : x + 4;
  doc.roundedRect(accentX, y + 4, 2, h - 8, 1, 1, "F");

  const cx = x + w / 2;

  setFont(doc, "bold");
  doc.setFontSize(18);
  doc.setTextColor(...C.FOREGROUND);
  doc.text(String(value), cx, y + h / 2 - 2, { align: "center" });

  setFont(doc, "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.MUTED_FG);
  doc.text(txt(label, isRTL), cx, y + h / 2 + 7, { align: "center" });
};

const drawSectionTitle = (
  doc: jsPDF,
  title: string,
  y: number,
  pw: number,
  isRTL: boolean,
): number => {
  const h = 10;

  doc.setFillColor(...C.MUTED);
  doc.roundedRect(MARGIN, y, pw - 2 * MARGIN, h, 2, 2, "F");

  doc.setDrawColor(...C.BORDER);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, y, pw - 2 * MARGIN, h, 2, 2, "S");

  const barX = isRTL ? pw - MARGIN - 0.5 : MARGIN + 0.5;
  doc.setFillColor(...C.PRIMARY);
  doc.roundedRect(barX - 0.5, y + 2, 1.5, h - 4, 0.75, 0.75, "F");

  setFont(doc, "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...C.SECONDARY_FG);
  const textX = isRTL ? pw - MARGIN - 7 : MARGIN + 7;
  doc.text(txt(title, isRTL), textX, y + h / 2 + 1, {
    align: isRTL ? "right" : "left",
  });

  return y + h + 6;
};

const drawTable = (
  doc: jsPDF,
  headers: string[],
  rows: string[][],
  startY: number,
  isRTL: boolean,
  pw: number,
  ph: number,
): number => {
  const shapeCell = (text: string): string => {
    if (/[\u0600-\u06FF]/.test(text)) return reshapeArabic(text);
    return text;
  };

  const tableHeaders = isRTL
    ? [...headers].reverse().map((h) => shapeCell(h))
    : headers;

  const tableRows = isRTL
    ? rows.map((row) =>
        [...row].reverse().map((cell) => shapeCell(String(cell))),
      )
    : rows;

  let finalY = startY;

  autoTable(doc, {
    head: [tableHeaders],
    body: tableRows as string[][],
    startY: startY,
    margin: { left: MARGIN, right: MARGIN, top: 20, bottom: 18 },
    styles: {
      font: "IBMPlexSans",
      halign: isRTL ? "right" : "left",
      fontSize: 8.5,
      textColor: C.FOREGROUND,
      cellPadding: { top: 4, right: 5, bottom: 4, left: 5 },
      lineColor: C.BORDER,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: C.PRIMARY,
      textColor: C.PRIMARY_FG,
      fontStyle: "bold",
      font: "IBMPlexSans",
      fontSize: 8.5,
      cellPadding: { top: 5, right: 5, bottom: 5, left: 5 },
      halign: isRTL ? "right" : "left",
    },
    alternateRowStyles: {
      fillColor: C.MUTED,
    },
    tableLineColor: C.BORDER,
    tableLineWidth: 0.2,
    didDrawPage: () => {
      const pageNum = (
        doc as unknown as { internal: { getNumberOfPages: () => number } }
      ).internal.getNumberOfPages();
      drawFooter(doc, pw, ph, isRTL, pageNum);
    },
  });

  const info = (doc as unknown as { lastAutoTable?: AutoTableInfo })
    .lastAutoTable;
  if (info) finalY = info.finalY;

  return finalY + 10;
};

const drawInfoCard = (
  doc: jsPDF,
  y: number,
  pw: number,
  isRTL: boolean,
  fields: { label: string; value: string }[],
): number => {
  const cardX = MARGIN;
  const cardW = pw - 2 * MARGIN;
  const lineH = 7;
  const padding = 6;

  const fieldData = fields.map((f) => {
    const maxW = cardW - padding * 2 - 40;
    const lines = doc.splitTextToSize(txt(f.value || "-", isRTL), maxW);
    return { f, lines };
  });

  const totalLinesH = fieldData.reduce(
    (acc, item) => acc + Math.max(lineH, item.lines.length * 4.5 + 2),
    0,
  );
  const finalH = totalLinesH + padding * 2;

  doc.setFillColor(...C.CARD);
  doc.roundedRect(cardX, y, cardW, finalH, 3, 3, "F");

  doc.setDrawColor(...C.BORDER);
  doc.setLineWidth(0.3);
  doc.roundedRect(cardX, y, cardW, finalH, 3, 3, "S");

  const barW = 1.2;
  const barX = isRTL ? cardX + cardW - 2.5 : cardX + 1.3;
  doc.setFillColor(...C.PRIMARY);
  doc.roundedRect(barX, y + 3, barW, finalH - 6, 0.6, 0.6, "F");

  let currentY = y + padding + 4;
  for (const { f, lines } of fieldData) {
    const labelX = isRTL ? cardX + cardW - padding - 4 : cardX + padding + 4;
    const valueX = isRTL ? labelX - 26 : labelX + 32;

    setFont(doc, "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.MUTED_FG);
    doc.text(
      txt(isRTL ? `:${f.label}` : `${f.label}:`, isRTL),
      labelX,
      currentY,
      { align: isRTL ? "right" : "left" },
    );

    setFont(doc, "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.FOREGROUND);
    lines.forEach((line: string, index: number) => {
      doc.text(line, valueX, currentY + index * 4.5, {
        align: isRTL ? "right" : "left",
      });
    });

    currentY += Math.max(lineH, lines.length * 4.5 + 2);
  }

  return y + finalH + 8;
};

export const exportProjectPDF = async (
  options: ExportProjectOptions,
): Promise<void> => {
  const { project, sections, tasks, users, language, translations } = options;
  const isRTL = language === "ar";

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  await initFonts(doc);

  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  const projectTitle = isRTL ? project.title.ar : project.title.en;
  let y = drawHeader(
    doc,
    pw,
    isRTL,
    translations("dashboard.projects.pdf.title"),
    projectTitle,
  );

  const projectTasks = tasks.filter((t) => {
    const sectionIds = sections.map((s) => s.id);
    return sectionIds.includes(t.sectionId);
  });

  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter((t) => t.status === "done").length;
  const inProgressTasks = projectTasks.filter(
    (t) => t.status === "in_progress",
  ).length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const gap = 4;
  const cardW = (pw - 2 * MARGIN - 3 * gap) / 4;
  const cardH = 32;

  const stats = [
    {
      label: translations("common.stats.totalTasks"),
      value: totalTasks,
      color: C.PRIMARY,
    },
    {
      label: translations("common.stats.completedTasks"),
      value: completedTasks,
      color: C.SUCCESS,
    },
    {
      label: translations("common.stats.inProgressTasks"),
      value: inProgressTasks,
      color: C.WARNING,
    },
    {
      label: translations("common.stats.completionRate"),
      value: `${completionRate}%`,
      color: C.PURPLE,
    },
  ];

  const displayStats = isRTL ? [...stats].reverse() : stats;
  displayStats.forEach((stat, i) => {
    drawStatCard(
      doc,
      MARGIN + i * (cardW + gap),
      y,
      cardW,
      cardH,
      stat.label,
      stat.value,
      stat.color,
      isRTL,
    );
  });
  y += cardH + 10;

  y = drawInfoCard(doc, y, pw, isRTL, [
    {
      label: translations("dashboard.projects.status.label"),
      value:
        translations(`dashboard.projects.status.${project.status}`) ||
        project.status,
    },
    {
      label: translations("dashboard.projects.startDate"),
      value: formatDate(project.startDate, isRTL),
    },
    {
      label: translations("dashboard.projects.form.fields.endDate"),
      value: project.endDate ? formatDate(project.endDate, isRTL) : "-",
    },
    {
      label: translations("dashboard.projects.teamMembers"),
      value:
        project.teamMembers
          .filter((id) => {
            const member = users.find((u) => u.id === id);
            return member && member.role !== "client";
          })
          .map((id) => getUserName(id, users))
          .filter((n) => n !== "-")
          .join(", ") || "-",
    },
  ]);

  if (sections.length > 0) {
    y = ensureSpace(doc, y, 40, ph);
    y = drawSectionTitle(
      doc,
      translations("dashboard.tasks.sections.title"),
      y,
      pw,
      isRTL,
    );

    const sectionRows = sections.map((section) => {
      const sTitle = isRTL ? section.title.ar : section.title.en;
      const sTasks = tasks.filter((t) => t.sectionId === section.id);
      const done = sTasks.filter((t) => t.status === "done").length;
      const total = sTasks.length;
      return [sTitle, `${done}/${total}`];
    });

    y = drawTable(
      doc,
      [
        translations("dashboard.tasks.table.title"),
        translations("dashboard.tasks.header.title"),
      ],
      sectionRows,
      y,
      isRTL,
      pw,
      ph,
    );
  }

  if (projectTasks.length > 0) {
    y = ensureSpace(doc, y, 40, ph);
    y = drawSectionTitle(
      doc,
      translations("dashboard.tasks.header.title"),
      y,
      pw,
      isRTL,
    );

    const taskRows = projectTasks.map((task) => {
      const taskTitle = isRTL ? task.title.ar : task.title.en;
      const assignedNames = task.assignedTo
        .map((id) => getUserName(id, users))
        .filter((n) => n !== "-")
        .join(", ");
      return [
        taskTitle,
        translations(`common.status.${task.status}`) || task.status,
        translations(`dashboard.tasks.priority.${task.priority}`) ||
          task.priority,
        formatDate(task.dueDate, isRTL),
        assignedNames || "-",
      ];
    });

    drawTable(
      doc,
      [
        translations("dashboard.tasks.card.title"),
        translations("common.status.label"),
        translations("dashboard.tasks.priority.label"),
        translations("dashboard.tasks.card.dueDate"),
        translations("dashboard.tasks.card.assignee"),
      ],
      taskRows,
      y,
      isRTL,
      pw,
      ph,
    );
  }

  doc.save(
    `TaskBoard_Project_${project.title.en.replace(/\s+/g, "_")}_${language.toUpperCase()}.pdf`,
  );
};

export const exportSectionPDF = async (
  options: ExportSectionOptions,
): Promise<void> => {
  const { section, tasks, users, project, language, translations } = options;
  const isRTL = language === "ar";

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  await initFonts(doc);

  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  const sectionTitle = isRTL ? section.title.ar : section.title.en;
  const projectTitle = project
    ? isRTL
      ? project.title.ar
      : project.title.en
    : "";

  let y = drawHeader(
    doc,
    pw,
    isRTL,
    translations("dashboard.projects.pdf.sectionTitle"),
    projectTitle ? `${sectionTitle} - ${projectTitle}` : sectionTitle,
  );

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "in_progress",
  ).length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const gap = 4;
  const cardW = (pw - 2 * MARGIN - 3 * gap) / 4;
  const cardH = 32;

  const stats = [
    {
      label: translations("common.stats.totalTasks"),
      value: totalTasks,
      color: C.PRIMARY,
    },
    {
      label: translations("common.stats.completedTasks"),
      value: completedTasks,
      color: C.SUCCESS,
    },
    {
      label: translations("common.stats.inProgressTasks"),
      value: inProgressTasks,
      color: C.WARNING,
    },
    {
      label: translations("common.stats.completionRate"),
      value: `${completionRate}%`,
      color: C.PURPLE,
    },
  ];

  const displayStats = isRTL ? [...stats].reverse() : stats;
  displayStats.forEach((stat, i) => {
    drawStatCard(
      doc,
      MARGIN + i * (cardW + gap),
      y,
      cardW,
      cardH,
      stat.label,
      stat.value,
      stat.color,
      isRTL,
    );
  });
  y += cardH + 10;

  if (tasks.length > 0) {
    y = drawSectionTitle(
      doc,
      translations("dashboard.tasks.header.title"),
      y,
      pw,
      isRTL,
    );

    const taskRows = tasks.map((task) => {
      const taskTitle = isRTL ? task.title.ar : task.title.en;
      const assignedNames = task.assignedTo
        .map((id) => getUserName(id, users))
        .filter((n) => n !== "-")
        .join(", ");
      return [
        taskTitle,
        translations(`common.status.${task.status}`) || task.status,
        translations(`dashboard.tasks.priority.${task.priority}`) ||
          task.priority,
        formatDate(task.dueDate, isRTL),
        assignedNames || "-",
      ];
    });

    drawTable(
      doc,
      [
        translations("dashboard.tasks.card.title"),
        translations("common.status.label"),
        translations("dashboard.tasks.priority.label"),
        translations("dashboard.tasks.card.dueDate"),
        translations("dashboard.tasks.card.assignee"),
      ],
      taskRows,
      y,
      isRTL,
      pw,
      ph,
    );
  }

  doc.save(
    `TaskBoard_Section_${section.title.en.replace(/\s+/g, "_")}_${language.toUpperCase()}.pdf`,
  );
};

export const exportTaskPDF = async (
  options: ExportTaskOptions,
): Promise<void> => {
  const { task, section, project, users, language, translations } = options;
  const isRTL = language === "ar";

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  await initFonts(doc);

  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  const taskTitle = isRTL ? task.title.ar : task.title.en;
  const projectTitle = project
    ? isRTL
      ? project.title.ar
      : project.title.en
    : "";
  const sectionTitle = section
    ? isRTL
      ? section.title.ar
      : section.title.en
    : "";

  let y = drawHeader(
    doc,
    pw,
    isRTL,
    translations("dashboard.tasks.pdf.title"),
    taskTitle,
  );

  if (projectTitle || sectionTitle) {
    const contextFields: { label: string; value: string }[] = [];
    if (projectTitle) {
      contextFields.push({
        label: translations("dashboard.projects.card.title"),
        value: projectTitle,
      });
    }
    if (sectionTitle) {
      contextFields.push({
        label: translations("dashboard.tasks.list.section"),
        value: sectionTitle,
      });
    }
    y = drawInfoCard(doc, y, pw, isRTL, contextFields);
  }

  y = drawSectionTitle(
    doc,
    translations("dashboard.tasks.form.fields.title"),
    y,
    pw,
    isRTL,
  );

  const detailsFields = [
    {
      label: translations("common.status.label"),
      value: translations(`common.status.${task.status}`) || task.status,
    },
    {
      label: translations("dashboard.tasks.priority.label"),
      value:
        translations(`dashboard.tasks.priority.${task.priority}`) ||
        task.priority,
    },
    {
      label: translations("dashboard.tasks.list.assigned"),
      value:
        task.assignedTo
          .map((id) => getUserName(id, users))
          .filter((n) => n !== "-")
          .join(", ") || "-",
    },
    {
      label: translations("dashboard.tasks.card.price"),
      value:
        (task.assigneePrices ?? [])
          .map((ap) => {
            const name = getUserName(ap.userId, users);
            return `${name}: $${ap.price.toFixed(2)}`;
          })
          .join("\n") || "$0.00",
    },
    {
      label: translations("dashboard.tasks.card.dueDate"),
      value: formatDate(task.dueDate, isRTL),
    },
    {
      label: translations("dashboard.tasks.card.tags"),
      value: task.tags?.join(", ") || "-",
    },
    {
      label: translations("dashboard.tasks.card.createdAt"),
      value: formatDate(task.createdAt, isRTL),
    },
  ];

  const detailsTableData = detailsFields.map((f) => [f.label, f.value]);

  y = drawTable(
    doc,
    [
      translations("dashboard.tasks.form.field"),
      translations("dashboard.tasks.form.value"),
    ],
    detailsTableData,
    y,
    isRTL,
    pw,
    ph,
  );

  const rawDesc = isRTL ? task.description.ar : task.description.en;
  const descEstimatedH = estimateRichTextHeight(doc, rawDesc || "-", pw);
  const descAvailableH = ph - y - 20;

  if (descEstimatedH > descAvailableH) {
    doc.addPage();
    drawFooter(
      doc,
      pw,
      ph,
      isRTL,
      (
        doc as unknown as { internal: { getNumberOfPages: () => number } }
      ).internal.getNumberOfPages(),
    );
    y = 20;
  } else {
    y = ensureSpace(doc, y, 30, ph);
  }

  y = drawSectionTitle(
    doc,
    translations("dashboard.tasks.card.description"),
    y,
    pw,
    isRTL,
  );

  doc.setTextColor(...C.FOREGROUND);
  doc.setFontSize(9);

  y = drawRichText(doc, rawDesc || "-", y, pw, ph, isRTL);

  y += 6;

  if (task.attachments && task.attachments.length > 0) {
    doc.addPage();
    drawFooter(
      doc,
      pw,
      ph,
      isRTL,
      (
        doc as unknown as { internal: { getNumberOfPages: () => number } }
      ).internal.getNumberOfPages(),
    );

    y = 20;
    y = drawSectionTitle(
      doc,
      translations("dashboard.tasks.card.attachments"),
      y,
      pw,
      isRTL,
    );

    const maxW = pw - 2 * MARGIN;
    const minUsableH = 40;

    for (const url of task.attachments) {
      if (!url) continue;
      const imgData = await loadAsset(url);
      if (imgData) {
        try {
          const props = doc.getImageProperties(imgData);
          const ratio = props.height / props.width;

          let availableH = ph - y - 20;

          if (availableH < minUsableH) {
            doc.addPage();
            drawFooter(
              doc,
              pw,
              ph,
              isRTL,
              (
                doc as unknown as {
                  internal: { getNumberOfPages: () => number };
                }
              ).internal.getNumberOfPages(),
            );
            y = 20;
            availableH = ph - y - 20;
          }

          const imgH = Math.min(maxW * ratio, availableH);
          const imgW = imgH / ratio;

          doc.addImage(
            imgData,
            "PNG",
            isRTL ? pw - MARGIN - imgW : MARGIN,
            y,
            imgW,
            imgH,
            undefined,
            "FAST",
          );
          y += imgH + 10;
        } catch (_e) {}
      }
    }
  }

  doc.save(
    `TaskBoard_Task_${task.title.en.replace(/\s+/g, "_")}_${language.toUpperCase()}.pdf`,
  );
};

export const exportAnalyticsPDF = async (
  options: ExportAnalyticsOptions,
): Promise<void> => {
  const {
    tasks,
    projects,
    users,
    sections,
    dateRange,
    language,
    translations,
  } = options;
  const isRTL = language === "ar";

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  await initFonts(doc);

  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  const dateRangeText =
    {
      all: translations("dashboard.analytics.dateRange.all"),
      "1d": translations("dashboard.analytics.dateRange.1d"),
      "7d": translations("dashboard.analytics.dateRange.7d"),
      "30d": translations("dashboard.analytics.dateRange.30d"),
      "90d": translations("dashboard.analytics.dateRange.90d"),
    }[dateRange] || dateRange;

  let y = drawHeader(
    doc,
    pw,
    isRTL,
    translations("dashboard.analytics.header.title"),
    dateRangeText,
  );

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "in_progress",
  ).length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const gap = 4;
  const cardW = (pw - 2 * MARGIN - 3 * gap) / 4;
  const cardH = 32;

  const stats = [
    {
      label: translations("common.stats.totalTasks"),
      value: totalTasks,
      color: C.PRIMARY,
    },
    {
      label: translations("common.stats.completedTasks"),
      value: completedTasks,
      color: C.SUCCESS,
    },
    {
      label: translations("common.stats.inProgressTasks"),
      value: inProgressTasks,
      color: C.WARNING,
    },
    {
      label: translations("common.stats.completionRate"),
      value: `${completionRate}%`,
      color: C.PURPLE,
    },
  ];

  const displayStats = isRTL ? [...stats].reverse() : stats;
  displayStats.forEach((stat, i) => {
    drawStatCard(
      doc,
      MARGIN + i * (cardW + gap),
      y,
      cardW,
      cardH,
      stat.label,
      stat.value,
      stat.color,
      isRTL,
    );
  });
  y += cardH + 10;

  y = drawSectionTitle(
    doc,
    translations("dashboard.analytics.trends.byStatus"),
    y,
    pw,
    isRTL,
  );

  const statusData = [
    {
      status: translations("common.status.todo"),
      count: tasks.filter((t) => t.status === "todo").length,
    },
    {
      status: translations("common.status.in_progress"),
      count: tasks.filter((t) => t.status === "in_progress").length,
    },
    {
      status: translations("common.status.in_review"),
      count: tasks.filter((t) => t.status === "in_review").length,
    },
    {
      status: translations("common.status.done"),
      count: tasks.filter((t) => t.status === "done").length,
    },
  ];

  y = drawTable(
    doc,
    [
      translations("common.status.label"),
      translations("dashboard.analytics.labels.tasks"),
      translations("dashboard.analytics.labels.percentage"),
    ],
    statusData.map((item) => [
      item.status,
      String(item.count),
      totalTasks > 0 ? `${Math.round((item.count / totalTasks) * 100)}%` : "0%",
    ]),
    y,
    isRTL,
    pw,
    ph,
  );

  y = ensureSpace(doc, y, 40, ph);
  y = drawSectionTitle(
    doc,
    translations("dashboard.analytics.trends.byPriority"),
    y,
    pw,
    isRTL,
  );

  const priorityData = [
    {
      priority: translations("dashboard.tasks.priority.low"),
      count: tasks.filter((t) => t.priority === "low").length,
    },
    {
      priority: translations("dashboard.tasks.priority.medium"),
      count: tasks.filter((t) => t.priority === "medium").length,
    },
    {
      priority: translations("dashboard.tasks.priority.high"),
      count: tasks.filter((t) => t.priority === "high").length,
    },
    {
      priority: translations("dashboard.tasks.priority.urgent"),
      count: tasks.filter((t) => t.priority === "urgent").length,
    },
  ];

  y = drawTable(
    doc,
    [
      translations("dashboard.tasks.priority.label"),
      translations("dashboard.analytics.labels.tasks"),
      translations("dashboard.analytics.labels.percentage"),
    ],
    priorityData.map((item) => [
      item.priority,
      String(item.count),
      totalTasks > 0 ? `${Math.round((item.count / totalTasks) * 100)}%` : "0%",
    ]),
    y,
    isRTL,
    pw,
    ph,
  );

  y = ensureSpace(doc, y, 40, ph);
  y = drawSectionTitle(
    doc,
    translations("dashboard.analytics.projects.title"),
    y,
    pw,
    isRTL,
  );

  const projectData = projects.map((project) => {
    const projectSections = sections.filter((s) => s.projectId === project.id);
    const sectionIds = projectSections.map((s) => s.id);
    const projectTasks = tasks.filter((t) => sectionIds.includes(t.sectionId));
    return {
      name: isRTL ? project.title.ar : project.title.en,
      total: projectTasks.length,
      completed: projectTasks.filter((t) => t.status === "done").length,
      inProgress: projectTasks.filter((t) => t.status === "in_progress").length,
    };
  });

  y = drawTable(
    doc,
    [
      translations("dashboard.projects.card.title"),
      translations("common.stats.totalTasks"),
      translations("common.stats.completedTasks"),
      translations("common.stats.inProgressTasks"),
      translations("common.stats.completionRate"),
    ],
    projectData.map((item) => [
      item.name,
      String(item.total),
      String(item.completed),
      String(item.inProgress),
      item.total > 0
        ? `${Math.round((item.completed / item.total) * 100)}%`
        : "0%",
    ]),
    y,
    isRTL,
    pw,
    ph,
  );

  y = ensureSpace(doc, y, 40, ph);
  y = drawSectionTitle(
    doc,
    translations("dashboard.analytics.team.performance"),
    y,
    pw,
    isRTL,
  );

  const teamData = users.map((user) => {
    const userTasks = tasks.filter((t) => t.assignedTo.includes(user.id));
    const completed = userTasks.filter((t) => t.status === "done").length;
    const total = userTasks.length;
    return {
      name: user.name,
      total,
      completed,
      inProgress: userTasks.filter((t) => t.status === "in_progress").length,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });

  drawTable(
    doc,
    [
      translations("dashboard.analytics.team.memberName"),
      translations("common.stats.tasks"),
      translations("common.stats.completed"),
      translations("common.stats.inProgress"),
      translations("common.stats.completionRate"),
    ],
    teamData.map((item) => [
      item.name,
      String(item.total),
      String(item.completed),
      String(item.inProgress),
      `${item.completionRate}%`,
    ]),
    y,
    isRTL,
    pw,
    ph,
  );

  const rangeLabel =
    {
      all: "AllTime",
      "1d": "24Hours",
      "7d": "7Days",
      "30d": "30Days",
      "90d": "90Days",
    }[dateRange] || dateRange;

  doc.save(
    `TaskBoard_Analytics_Report_${rangeLabel}_${language.toUpperCase()}.pdf`,
  );
};

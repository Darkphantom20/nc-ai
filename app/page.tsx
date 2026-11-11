'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { STATUS, type EventData, type Step } from 'react-joyride';
import { HelpCircle, ImagePlus, ZoomIn, ZoomOut, Maximize2, X, Eye, FileText, Sparkles } from 'lucide-react';
import {
  getMonthlyJournalGroups,
  getNextMonthlyJournalKey,
  MONTH_NAMES,
  type MonthlyJournalSummary,
} from '../lib/monthly-journal';
import guideScene from '../05c9cb1a-009e-4c61-ab2f-30d279b5a02c.jpg';
import memeScene from '../memes.gif';
import completionScene from '../c0b37494-6751-46ac-9eae-3abd056aa8bf.jpg';

const Joyride = dynamic(() => import('react-joyride').then((module) => module.Joyride), {
  ssr: false,
});

const sectionOrder = [
  'Cover Page',
  'Acknowledgement',
  'Table of Contents',
  'Introduction',
  'Organization Analysis',
  'Tasks & Duties',
  'Case Analysis',
  'Reflections',
  'Appendices'
];

const aiNarrativeFieldLabels = {
  background: 'Background of the Organization',
  vision: 'Vision',
  mission: 'Mission',
  objectives: 'Objectives',
  coreValues: 'Core Values',
  services: 'Products and Services Offered',
  strengths: 'Strengths',
  weaknesses: 'Weaknesses',
  opportunities: 'Opportunities',
  threats: 'Threats',
  recommendations: 'Recommendations for Improvement',
  tasks: 'Assigned Tasks and Responsibilities',
  procedures: 'Duties and Procedures Conformed',
  issue1: 'Issue / Problem 1',
  issue1Action: 'Strategy / Action for Problem 1',
  issue2: 'Issue / Problem 2',
  issue2Action: 'Strategy / Action for Problem 2',
  lessons: 'Lessons Learned',
  selfEvaluation: 'Self-Evaluation',
  relevancy: 'Relevancy of the Organization',
} as const;

const schoolPlacementTOCEntries = [
  '6. Introduction',
  '6.1 Background of the Organization',
  '6.2 Vision',
  '6.3 Mission',
  '6.4 Objectives',
  '6.5 Core Values',
  '6.6 Products and Services Offered',
  '7. Organization / Company Analysis',
  '7.1 Strengths',
  '7.2 Weaknesses',
  '7.3 Opportunities',
  '7.4 Threats',
  '7.5 Recommendations for Improvement',
  '8. Tasks and Duties',
  '8.1 Assigned Tasks and Responsibilities',
  '8.2 Duties and Procedures Conformed',
  '9. Case Analysis',
  '9.1 Issue / Problem 1',
  '9.2 Strategy/Action Undertaken for Problem 1',
  '9.3 Issue / Problem 2',
  '9.4 Strategy/Action Undertaken for Problem 2',
  '9.5 Lessons Learned from the Situations',
  '10. Reflections',
  '10.1 Self-Evaluation',
  '10.2 Relevancy of the Organization'
];

function syncSchoolPlacementTOC(contents: string, enabled: boolean): string {
  const lines = contents.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const withoutSchoolEntries = lines
    .filter((line) => (
      !/school ojt/i.test(line)
      && !/^6\.\d+\.\d+\s+/.test(line)
      && !schoolPlacementTOCEntries.includes(line)
    ))
    .map((line) => {
      if (enabled && /^6\.\s*appendices$/i.test(line)) return '11. Appendices';
      if (!enabled && /^11\.\s*appendices$/i.test(line)) return '6. Appendices';
      return line;
    });

  if (!enabled) return withoutSchoolEntries.join('\n');

  const appendicesIndex = withoutSchoolEntries.findIndex((line) => /^11\.\s*appendices$/i.test(line));
  withoutSchoolEntries.splice(
    appendicesIndex >= 0 ? appendicesIndex : withoutSchoolEntries.length,
    0,
    ...schoolPlacementTOCEntries
  );
  return withoutSchoolEntries.join('\n');
}

const defaultForm = {
  trainingOrganization: 'Zamboanga del Norte Provincial Capitol',
  trainingLocation: 'Dipolog City',
  collegeFaculty: 'College of Computing Studies',
  degreeProgram: 'Bachelor of Science in Information System',
  studentName: 'Ian P. Padilla',
  submittedToName: 'Mr. Erson A. Rodriguez',
  submittedToTitle: 'Associate Dean of the College of Computing Studies',
  trainingDuration: '',
  studentYear: '',
  acknowledgement: 'With deepest gratitude and appreciation, I humbly extend my sincere thanks to all who contributed to my OJT experience and helped me grow in both technical and professional knowledge.',
  tableOfContents: '1. Introduction\n1.1 Background of the Organization\n1.2 Vision\n1.3 Mission\n1.4 Objectives\n1.5 Core Values\n1.6 Products and Services Offered\n2. Organization / Company Analysis\n2.1 Strengths\n2.2 Weaknesses\n2.3 Opportunities\n2.4 Threats\n2.5 Recommendations for Improvement\n3. Tasks and Duties\n3.1 Assigned Tasks and Responsibilities\n3.2 Duties and Procedures Conformed\n4. Case Analysis\n4.1 Issue / Problem 1\n4.2 Strategy/Action Undertaken for Problem 1\n4.3 Issue / Problem 2\n4.4 Strategy/Action Undertaken for Problem 2\n4.5 Lessons Learned from the Situations\n5. Reflections\n5.1 Self-Evaluation\n5.2 Relevancy of the Organization\n6. Appendices',
  sectionLayout: 'compact',
  reportTemplate: 'current',
  acknowledgementLineSpacing: 'single',
  background: 'The Management Information Systems Office (MISO) serves as the core technological backbone, responsible for managing, maintaining, and securing the digital infrastructure, information systems, and network communications of the institution.',
  vision: 'To be a premier provider of innovative, reliable, and secure technological solutions and digital services.',
  mission: 'To empower the organization through efficient IT infrastructure, responsive technical support, and robust systems development.',
  objectives: 'To streamline administrative processes and ensure system reliability.',
  coreValues: 'Integrity, Excellence, and Commitment to Public Service.',
  services: 'Provide reliable technical support and ICT services to the institution and its stakeholders.',
  organizationStructureImage: '',
  strengths: 'The organization possesses highly skilled and dedicated technical personnel capable of handling complex network and software demands.',
  weaknesses: 'Internal operations occasionally face limitations due to aging hardware upgrades and constrained resource allocations.',
  opportunities: 'There are significant external prospects for adopting advanced cloud solutions and process automation technologies.',
  threats: 'External risks such as evolving cybersecurity vulnerabilities and potential data breaches remain constant challenges.',
  recommendations: 'It is highly recommended to upgrade legacy infrastructure and conduct continuous staff training programs.',
  tasks: 'Assigned tasks included troubleshooting office hardware issues, maintaining network cables, and updating internal database records.',
  procedures: 'Followed strict IT ticketing protocols, observed safety compliance guidelines during hardware repairs, and conformed to daily attendance logs.',
  issue1: 'Encountered unexpected network downtime during a critical system update, disrupting office communications.',
  issue1Action: 'Conducted a line check, isolated the faulty switch port, and switched the main office routing temporarily to a secondary backup line.',
  issue2: 'Faced compatibility errors when deploying a legacy database script onto the updated server environment.',
  issue2Action: 'Debugged SQL syntax constraints, updated driver packages, and successfully refactored connection strings.',
  lessons: 'These situations taught the vital importance of systematic troubleshooting, maintaining proper system backups, and remaining calm under pressure.',
  selfEvaluation: 'The OJT journey served as a transformative learning process, pushing me to transition from theoretical classroom knowledge to practical, fast-paced technical execution.',
  relevancy: 'The host organization directly aligns with my degree program, allowing me to fulfill my expected professional goals of mastering enterprise systems administration and IT support workflows.',
  schoolPlacement: {
    enabled: false,
    trainingOrganization: 'Jose Rizal Memorial State University',
    trainingLocation: 'School-based OJT',
    background: '',
    vision: '',
    mission: '',
    objectives: '',
    coreValues: '',
    services: '',
    strengths: '',
    weaknesses: '',
    opportunities: '',
    threats: '',
    recommendations: '',
    tasks: '',
    procedures: '',
    issue1: '',
    issue1Action: '',
    issue2: '',
    issue2Action: '',
    lessons: '',
    selfEvaluation: '',
    relevancy: '',
    organizationStructureImage: ''
  },
  appendices: {
    dailyJournalLayout: 'current',
    dailyJournalMonthlySummaries: {} as Record<string, MonthlyJournalSummary>,
    reportFooter: {
      preparedByLabel: 'Prepared By:',
      preparedByName: '',
      checkedByLabel: 'Checked By:',
      checkedByName: '',
      checkedByRole: 'Supervising\nStatistical Specialist',
      officeInCharge: '',
      dateLabel: 'Date:',
      dateValue: ''
    },
    dailyJournal: [
      {
        weekNumber: 1,
        totalHours: 40,
        narrative: '',
        activities: [
          { day: 'Day 1', date: 'Oct 2', accomplishment: 'Orientation and facility tour', hours: 8 },
          { day: 'Day 2', date: 'Oct 3', accomplishment: 'Network cable termination and testing', hours: 8 },
          { day: 'Day 3', date: 'Oct 4', accomplishment: 'PC hardware cleaning and maintenance', hours: 8 },
          { day: 'Day 4', date: 'Oct 5', accomplishment: 'Operating system updates deployment', hours: 8 },
          { day: 'Day 5', date: 'Oct 6', accomplishment: 'Helpdesk ticketing queue review', hours: 8 }
        ],
        images: [] as { base64: string; detail: string }[]
      }
    ],
    certParticipation: '',
    primeNarrative: 'The PRIME seminar provided profound insights into professional workplace ethics and modern enterprise standards.',
    primeReportImages: [] as { base64: string; detail: string }[],
    resume: '',
    grades: '',
    medicalWaiver: '',
    letterAcceptance: '',
    dtr: '',
    ratingSheet: '',
    certCompletion: ''
  }
};

type NarrativeDailyActivity = {
  day: string;
  date: string;
  accomplishment: string;
  hours: number | string;
};

type JournalPhoto = { base64: string; detail: string };

type MonthlyPhotoCandidate = {
  id: string;
  photo: JournalPhoto;
  description: string;
};

type MonthlyPhotoSelectionGroup = {
  key: string;
  label: string;
  activityCount: number;
  datedActivityCount: number;
  periodCovered: string;
  candidates: MonthlyPhotoCandidate[];
  selectedIds: string[];
  generationFocus: string;
  generationUnit: AIGenerationLength['unit'];
  generationCount: number;
  drafts: Partial<Record<'activitiesPerformed' | 'learningExperience', string>>;
  generationError: string;
};

type MonthlyPhotoSelection = {
  preference: string;
  groups: MonthlyPhotoSelectionGroup[];
  error: string;
};

type NarrativeJournalWeek = {
  weekNumber: number;
  totalHours: number | string;
  narrative: string;
  activities: NarrativeDailyActivity[];
  images?: (JournalPhoto | null)[];
  currentLayoutImages?: (JournalPhoto | null)[];
  reportLayoutImages?: (JournalPhoto | null)[];
};

function getDailyJournalPhoto(
  week: NarrativeJournalWeek | undefined,
  dayIndex: number,
  layout: string,
): JournalPhoto | null {
  if (!week) return null;
  const preferredImages = layout === 'report' ? week.reportLayoutImages : week.currentLayoutImages;
  const alternateImages = layout === 'report' ? week.currentLayoutImages : week.reportLayoutImages;
  return preferredImages?.[dayIndex] ?? alternateImages?.[dayIndex] ?? week.images?.[dayIndex] ?? null;
}

function normalizeDailyJournalDays(journal: NarrativeJournalWeek[]): NarrativeJournalWeek[] {
  let dayNumber = 1;
  return journal.map((week, index) => ({
    ...week,
    weekNumber: index + 1,
    activities: week.activities.map((activity) => ({
      ...activity,
      day: `Day ${dayNumber++}`
    }))
  }));
}

function moveJournalDateToMonth(
  date: string,
  oldMonthIndex: number,
  targetMonthIndex: number,
  targetYear: number | null,
): string | null {
  const oldMonth = MONTH_NAMES[oldMonthIndex];
  const targetMonth = MONTH_NAMES[targetMonthIndex];
  const monthPattern = new RegExp(`\\b(?:${oldMonth}|${oldMonth.slice(0, 3)})\\b\\.?`, 'gi');
  if (monthPattern.test(date)) {
    const updatedDate = date.replace(monthPattern, targetMonth);
    if (targetYear === null) return updatedDate;
    if (/\b(?:19|20)\d{2}\b/.test(updatedDate)) {
      return updatedDate.replace(/\b(?:19|20)\d{2}\b/, String(targetYear));
    }
    return `${updatedDate}, ${targetYear}`;
  }

  const isoDate = date.match(/^(\s*)(\d{4})([-/])(\d{1,2})([-/])(\d{1,2})(.*)$/);
  if (isoDate && Number(isoDate[4]) === oldMonthIndex + 1) {
    const month = String(targetMonthIndex + 1).padStart(isoDate[4].length, '0');
    return `${isoDate[1]}${targetYear ?? isoDate[2]}${isoDate[3]}${month}${isoDate[5]}${isoDate[6]}${isoDate[7]}`;
  }

  const numericDate = date.match(/^(\s*)(\d{1,2})([-/])(\d{1,2})(?:([-/])(\d{2,4}))?(.*)$/);
  if (numericDate && Number(numericDate[2]) === oldMonthIndex + 1) {
    const month = String(targetMonthIndex + 1).padStart(numericDate[2].length, '0');
    const year = numericDate[6]
      ? `${numericDate[5]}${targetYear ?? numericDate[6]}`
      : targetYear === null
        ? ''
        : `${numericDate[3]}${targetYear}`;
    return `${numericDate[1]}${month}${numericDate[3]}${numericDate[4]}${year}${numericDate[7]}`;
  }

  return null;
}

function moveMonthText(value: string, oldMonthIndex: number, targetMonthIndex: number, targetYear: number | null): string {
  const oldMonth = MONTH_NAMES[oldMonthIndex];
  const targetMonth = MONTH_NAMES[targetMonthIndex];
  const monthPattern = new RegExp(`\\b(?:${oldMonth}|${oldMonth.slice(0, 3)})\\b\\.?`, 'gi');
  const namedMonthText = value.replace(monthPattern, targetMonth);
  const oldMonthNumber = oldMonthIndex + 1;
  const targetMonthNumber = targetMonthIndex + 1;
  const numericMonthPattern = new RegExp(`(^|[^\\d])0?${oldMonthNumber}([-/])(?=\\d)`, 'g');
  const updatedText = namedMonthText
    .replace(numericMonthPattern, `$1${targetMonthNumber}$2`)
  return targetYear === null
    ? updatedText
    : updatedText.replace(/\b(?:19|20)\d{2}\b/, String(targetYear));
}

type NarrativeForm = Omit<typeof defaultForm, 'appendices'> & {
  appendices: Omit<typeof defaultForm.appendices, 'dailyJournal'> & {
    dailyJournal: NarrativeJournalWeek[];
  };
};

type AiNarrativeFieldKey = keyof typeof aiNarrativeFieldLabels;
type AiGenerationFieldKey = AiNarrativeFieldKey | 'acknowledgement';
type AiDraftField = {
  scope: 'report' | 'schoolPlacement';
  key: AiNarrativeFieldKey;
  label: string;
  value: string;
  selected: boolean;
};

type AIGenerationLength = {
  unit: 'sentences' | 'paragraphs';
  count: number;
};

type AIGenerationOptions = AIGenerationLength & {
  focus: string;
};

function aiText(value: string, maxLength = 1000): string {
  return value.trim().slice(0, maxLength);
}

function userProvidedText(value: string, example: string, maxLength = 1000): string {
  const text = aiText(value, maxLength);
  return text && text !== example.trim() ? text : '';
}

function getUserJournalActivities(form: NarrativeForm, selectedWeekIndex?: number) {
  return form.appendices.dailyJournal.flatMap((week, weekIndex) => {
    if (selectedWeekIndex !== undefined && weekIndex !== selectedWeekIndex) return [];
    return week.activities.flatMap((activity, activityIndex) => {
      const example = defaultForm.appendices.dailyJournal[weekIndex]?.activities[activityIndex];
      if (example && activity.day === example.day
        && activity.date === example.date
        && activity.accomplishment === example.accomplishment
        && activity.hours === example.hours) return [];
      const accomplishment = aiText(activity.accomplishment, 300);
      if (!accomplishment) return [];
      return [{
        weekNumber: week.weekNumber,
        day: aiText(activity.day, 40),
        date: aiText(activity.date, 40),
        accomplishment,
        hours: activity.hours,
      }];
    });
  }).slice(0, 100);
}

function getMonthlyJournalAIContext(form: NarrativeForm): Record<string, unknown>[] {
  const userActivities = new Set(
    getUserJournalActivities(form)
      .map((activity) => JSON.stringify([
        activity.weekNumber,
        activity.day,
        activity.date,
        aiText(activity.accomplishment, 200),
        String(activity.hours),
      ])),
  );

  return getMonthlyJournalGroups(
    form.appendices.dailyJournal,
    form.appendices.dailyJournalMonthlySummaries,
  )
    .flatMap((month) => {
      const activities = month.activities.flatMap(({ weekNumber, activity }) => {
        const accomplishment = aiText(activity.accomplishment, 200);
        const key = JSON.stringify([
          weekNumber,
          aiText(activity.day, 40),
          aiText(activity.date, 40),
          accomplishment,
          String(activity.hours),
        ]);
        if (!accomplishment || !userActivities.has(key)) return [];
        return [{
          weekNumber,
          day: aiText(activity.day, 40),
          date: aiText(activity.date, 40),
          accomplishment,
          hours: activity.hours,
        }];
      }).slice(0, 3);
      const summary = form.appendices.dailyJournalMonthlySummaries[month.key] || {};
      const activitiesPerformed = aiText(summary.activitiesPerformed || '', 250);
      const learningExperience = aiText(summary.learningExperience || '', 250);
      const hasUserSummary = Boolean(
        activitiesPerformed
        || learningExperience
        || summary.periodCovered
        || summary.actualDutyDays
        || summary.totalHoursRendered,
      );
      if (!activities.length && !hasUserSummary) return [];

      return [{
        month: month.label,
        periodCovered: aiText(summary.periodCovered || (activities.length ? month.periodCovered : ''), 100),
        actualDutyDays: aiText(summary.actualDutyDays || (activities.length ? month.actualDutyDays : ''), 30),
        totalHoursRendered: aiText(summary.totalHoursRendered || (activities.length ? month.totalHoursRendered : ''), 30),
        ...(activitiesPerformed ? { activitiesPerformed } : {}),
        ...(learningExperience ? { learningExperience } : {}),
        activities,
      }];
    })
    .slice(0, 24)
    .map((month, index) => ({ ...month, journalMonthNumber: index + 1 }));
}
function buildAISectionContext(form: NarrativeForm, targetKey: AiGenerationFieldKey): Record<string, unknown> {
  const organizationFields: AiNarrativeFieldKey[] = [
    'background',
    'vision',
    'mission',
    'objectives',
    'coreValues',
    'services',
  ];
  const organizationAnalysisFields: AiNarrativeFieldKey[] = [
    'strengths',
    'weaknesses',
    'opportunities',
    'threats',
    'recommendations',
  ];
  const taskFields: AiNarrativeFieldKey[] = ['tasks', 'procedures'];
  const caseFields: AiNarrativeFieldKey[] = ['issue1', 'issue1Action', 'issue2', 'issue2Action'];
  let contextFields: AiNarrativeFieldKey[];
  let includeJournal = false;
  let includeMonthlyJournal = false;
  if (targetKey === 'acknowledgement' || targetKey === 'lessons'
    || targetKey === 'selfEvaluation' || targetKey === 'relevancy') {
    contextFields = [...taskFields, ...caseFields, 'lessons', 'selfEvaluation', 'relevancy'];
    includeJournal = true;
  } else if (targetKey === 'tasks' || targetKey === 'procedures') {
    contextFields = taskFields;
    includeJournal = true;
  } else if (targetKey === 'issue1' || targetKey === 'issue2') {
    contextFields = [...taskFields, ...(targetKey === 'issue2' ? ['issue1' as const] : [])];
    includeJournal = true;
    includeMonthlyJournal = true;
  } else if (targetKey === 'issue1Action' || targetKey === 'issue2Action') {
    contextFields = [...taskFields, targetKey === 'issue1Action' ? 'issue1' : 'issue2'];
    includeJournal = true;
    includeMonthlyJournal = true;
  } else if (organizationAnalysisFields.includes(targetKey)) {
    contextFields = [...organizationFields, ...organizationAnalysisFields];
  } else {
    contextFields = organizationFields;
  }

  const relatedSections = Object.fromEntries(
    contextFields
      .filter((key) => key !== targetKey)
      .flatMap((key) => {
        const text = userProvidedText(form[key], defaultForm[key], 700);
        return text ? [[aiNarrativeFieldLabels[key], text]] : [];
      }),
  );
  const weeklyJournal = includeJournal
    ? (() => {
        const weeks = new Map<number, { weekNumber: number; activities: ReturnType<typeof getUserJournalActivities> }>();
        for (const activity of getUserJournalActivities(form).slice(-60)) {
          const week = weeks.get(activity.weekNumber) || {
            weekNumber: activity.weekNumber,
            activities: [],
          };
          week.activities.push(activity);
          weeks.set(activity.weekNumber, week);
        }
        for (let weekIndex = 0; weekIndex < form.appendices.dailyJournal.length; weekIndex += 1) {
          const week = form.appendices.dailyJournal[weekIndex];
          if (weeks.size >= 15 && !weeks.has(week.weekNumber)) continue;
          const exampleNarrative = defaultForm.appendices.dailyJournal[weekIndex]?.narrative || '';
          const narrative = userProvidedText(week.narrative, exampleNarrative, 350);
          if (!narrative && !weeks.has(week.weekNumber)) continue;
          const existingWeek = weeks.get(week.weekNumber) || {
            weekNumber: week.weekNumber,
            activities: [],
          };
          Object.assign(existingWeek, narrative ? { narrative } : {});
          weeks.set(week.weekNumber, existingWeek);
        }
        return Array.from(weeks.values()).slice(-15);
      })()
    : [];

  const organization = userProvidedText(form.trainingOrganization, defaultForm.trainingOrganization, 200);
  const location = userProvidedText(form.trainingLocation, defaultForm.trainingLocation, 200);
  const degreeProgram = targetKey === 'relevancy'
    ? userProvidedText(form.degreeProgram, defaultForm.degreeProgram, 200)
    : '';

  return {
    weeklyJournal,
    ...(includeMonthlyJournal ? { monthlyJournal: getMonthlyJournalAIContext(form) } : {}),
    ...(organization ? { trainingOrganization: organization } : {}),
    ...(location ? { trainingLocation: location } : {}),
    ...(degreeProgram ? { degreeProgram } : {}),
    relatedSections,
  };
}

function buildSchoolPlacementAIContext(
  placement: typeof defaultForm.schoolPlacement,
  targetKey: AiNarrativeFieldKey,
): Record<string, unknown> {
  const relatedSections = Object.fromEntries(
    (Object.keys(aiNarrativeFieldLabels) as AiNarrativeFieldKey[])
      .filter((key) => key !== targetKey)
      .flatMap((key) => {
        const value = userProvidedText(
          placement[key],
          defaultForm.schoolPlacement[key],
          1000,
        );
        return value ? [[aiNarrativeFieldLabels[key], value]] : [];
      }),
  );
  const organization = userProvidedText(
    placement.trainingOrganization,
    defaultForm.schoolPlacement.trainingOrganization,
    200,
  );
  const location = userProvidedText(
    placement.trainingLocation,
    defaultForm.schoolPlacement.trainingLocation,
    200,
  );

  return {
    placementScope: 'schoolPlacement',
    ...(organization ? { trainingOrganization: organization } : {}),
    ...(location ? { trainingLocation: location } : {}),
    relatedSections,
  };
}

type ParsedJournalImport = {
  fileName: string;
  weeks: NarrativeJournalWeek[];
  activityCount: number;
  imageCount: number;
  daysWithoutImages: number;
  rowsWithMultipleImages: number;
  hoursImported: boolean;
};

type NarrativeDraft = {
  id: string;
  title: string;
  updatedAt: string;
  form: NarrativeForm;
  importedDocument?: ImportedNarrativeDocument;
};

type ImportedNarrativeDocument = {
  fileName: string;
  blob: Blob;
  extractedText: string;
  wordCount: number;
};

type ParsedNarrativeDocx = {
  document: ImportedNarrativeDocument;
  form: NarrativeForm;
  mappedFields: string[];
};

type NarrativeImportTextField =
  | 'acknowledgement'
  | 'tableOfContents'
  | 'background'
  | 'vision'
  | 'mission'
  | 'objectives'
  | 'coreValues'
  | 'services'
  | 'strengths'
  | 'weaknesses'
  | 'opportunities'
  | 'threats'
  | 'recommendations'
  | 'tasks'
  | 'procedures'
  | 'issue1'
  | 'issue1Action'
  | 'issue2'
  | 'issue2Action'
  | 'lessons'
  | 'selfEvaluation'
  | 'relevancy'
  | 'primeNarrative';

type NarrativeImportField = NarrativeImportTextField
  | 'trainingOrganization'
  | 'trainingLocation'
  | 'collegeFaculty'
  | 'degreeProgram'
  | 'studentName'
  | 'submittedToName'
  | 'submittedToTitle'
  | 'trainingDuration'
  | 'studentYear';

type StoredNarrativeDraft = {
  id: string;
  title: string;
  updatedAt?: string;
  form: Record<string, unknown>;
  importedDocument?: ImportedNarrativeDocument;
};

const draftsStorageKey = 'narrativeReportDrafts';
const draftDatabaseName = 'jrmsu-narrative-reports';
const draftObjectStoreName = 'draft-data';
const draftCollectionKey = 'all-drafts';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function createNarrativeId(): string {
  return typeof window.crypto.randomUUID === 'function'
    ? window.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isStoredNarrativeDraft(value: unknown): value is StoredNarrativeDraft {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.title === 'string'
    && isRecord(value.form);
}

function isImportedNarrativeDocument(value: unknown): value is ImportedNarrativeDocument {
  return isRecord(value)
    && typeof value.fileName === 'string'
    && value.blob instanceof Blob
    && typeof value.extractedText === 'string'
    && typeof value.wordCount === 'number';
}

function isStoredNarrativeCollection(
  value: unknown
): value is { drafts: StoredNarrativeDraft[]; activeDraftId?: string } {
  return isRecord(value)
    && Array.isArray(value.drafts)
    && value.drafts.every(isStoredNarrativeDraft)
    && (value.activeDraftId === undefined || typeof value.activeDraftId === 'string');
}

function openDraftDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not available in this browser.'));
      return;
    }

    const request = window.indexedDB.open(draftDatabaseName, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(draftObjectStoreName)) {
        request.result.createObjectStore(draftObjectStoreName);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open browser draft storage.'));
  });
}

async function loadDraftCollection(): Promise<unknown> {
  const database = await openDraftDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(draftObjectStoreName, 'readonly');
    const request = transaction.objectStore(draftObjectStoreName).get(draftCollectionKey);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error || new Error('Could not read saved narratives.'));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => reject(transaction.error || new Error('Could not read saved narratives.'));
    transaction.onabort = () => reject(transaction.error || new Error('Reading saved narratives was cancelled.'));
  });
}

async function saveDraftCollection(collection: {
  drafts: NarrativeDraft[];
  activeDraftId: string;
}): Promise<void> {
  const database = await openDraftDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(draftObjectStoreName, 'readwrite');
    transaction.objectStore(draftObjectStoreName).put(collection, draftCollectionKey);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error('Could not save narratives to browser storage.'));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error || new Error('Saving narratives to browser storage was cancelled.'));
    };
  });
}

function mergeNarrativeForm(parsedForm: Record<string, unknown>): NarrativeForm {
  const schoolPlacement = isRecord(parsedForm.schoolPlacement) ? parsedForm.schoolPlacement : {};
  const appendices = isRecord(parsedForm.appendices) ? parsedForm.appendices : {};
  const mergedForm = {
    ...defaultForm,
    ...parsedForm,
    schoolPlacement: { ...defaultForm.schoolPlacement, ...schoolPlacement },
    appendices: { ...defaultForm.appendices, ...appendices }
  } as NarrativeForm;

  return {
    ...mergedForm,
    tableOfContents: syncSchoolPlacementTOC(mergedForm.tableOfContents, mergedForm.schoolPlacement.enabled)
  };
}

function createDefaultNarrativeForm(): NarrativeForm {
  return structuredClone(defaultForm);
}

const wordProcessingNamespace = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const officeRelationshipsNamespace = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const packageRelationshipsNamespace = 'http://schemas.openxmlformats.org/package/2006/relationships';
const drawingNamespace = 'http://schemas.openxmlformats.org/drawingml/2006/main';
const vmlNamespace = 'urn:schemas-microsoft-com:vml';

function getWordChildren(element: Element, localName: string): Element[] {
  return Array.from(element.children).filter((child) => (
    child.localName === localName && child.namespaceURI === wordProcessingNamespace
  ));
}

function getWordCellText(cell: Element): string {
  return Array.from(cell.getElementsByTagNameNS(wordProcessingNamespace, 'p'))
    .map((paragraph) => Array.from(paragraph.getElementsByTagNameNS(wordProcessingNamespace, 't'))
      .map((text) => text.textContent || '')
      .join(''))
    .filter((text) => text.trim())
    .join('\n')
    .trim();
}

function normalizeJournalHeader(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function resolveDocxPath(target: string): string {
  const path = target.replace(/\\/g, '/');
  const segments = path.startsWith('/') ? [] : ['word'];
  for (const segment of path.split('/')) {
    if (!segment || segment === '.') continue;
    if (segment === '..') {
      segments.pop();
    } else {
      segments.push(segment);
    }
  }
  return segments.join('/');
}

function imageMimeType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    bmp: 'image/bmp',
    gif: 'image/gif',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    tif: 'image/tiff',
    tiff: 'image/tiff',
    webp: 'image/webp'
  };
  return extension ? mimeTypes[extension] || 'application/octet-stream' : 'application/octet-stream';
}

function getCellImageRelationshipIds(cell: Element): string[] {
  const ids = new Set<string>();
  const imageElements = [
    ...Array.from(cell.getElementsByTagNameNS(drawingNamespace, 'blip')),
    ...Array.from(cell.getElementsByTagNameNS(vmlNamespace, 'imagedata'))
  ];
  for (const imageElement of imageElements) {
    const id = imageElement.getAttributeNS(officeRelationshipsNamespace, 'embed')
      || imageElement.getAttributeNS(officeRelationshipsNamespace, 'id');
    if (id) ids.add(id);
  }
  return Array.from(ids);
}

async function parseDailyJournalDocx(file: File): Promise<ParsedJournalImport> {
  const { default: JSZip } = await import('jszip');
  const archive = await JSZip.loadAsync(await file.arrayBuffer());
  const documentEntry = archive.file('word/document.xml');
  const relationshipEntry = archive.file('word/_rels/document.xml.rels');
  if (!documentEntry || !relationshipEntry) {
    throw new Error('This DOCX does not contain a readable Word document.');
  }

  const parser = new DOMParser();
  const documentXml = parser.parseFromString(await documentEntry.async('string'), 'application/xml');
  const relationshipsXml = parser.parseFromString(await relationshipEntry.async('string'), 'application/xml');
  if (
    documentXml.getElementsByTagName('parsererror').length > 0
    || relationshipsXml.getElementsByTagName('parsererror').length > 0
  ) {
    throw new Error('The DOCX contains invalid document data.');
  }

  const relationships = new Map<string, string>();
  for (const relationship of Array.from(relationshipsXml.getElementsByTagNameNS(packageRelationshipsNamespace, 'Relationship'))) {
    const id = relationship.getAttribute('Id');
    const target = relationship.getAttribute('Target');
    const relationshipType = relationship.getAttribute('Type') || '';
    if (id && target && relationshipType.endsWith('/image') && relationship.getAttribute('TargetMode') !== 'External') {
      relationships.set(id, resolveDocxPath(target));
    }
  }

  const tables = Array.from(documentXml.getElementsByTagNameNS(wordProcessingNamespace, 'tbl'));
  const weeks: NarrativeJournalWeek[] = [];
  const imageCache = new Map<string, Promise<{ base64: string; detail: string }>>();
  let activityCount = 0;
  let imageCount = 0;
  let daysWithoutImages = 0;
  let rowsWithMultipleImages = 0;
  let hoursImported = false;
  let dayNumber = 1;

  const loadImage = (relationshipId: string): Promise<{ base64: string; detail: string }> => {
    const cachedImage = imageCache.get(relationshipId);
    if (cachedImage) return cachedImage;

    const imagePath = relationships.get(relationshipId);
    const imageEntry = imagePath ? archive.file(imagePath) : null;
    if (!imagePath || !imageEntry) {
      return Promise.reject(new Error('A photo referenced in the journal table could not be found in the DOCX.'));
    }

    const imagePromise = imageEntry.async('blob').then(async (blob) => {
      const fileImage = new File([blob], imagePath.split('/').pop() || 'journal-image', {
        type: imageMimeType(imagePath)
      });
      return {
        base64: await compressImageDataUrl(fileImage, 1200, 0.7),
        detail: ''
      };
    });
    imageCache.set(relationshipId, imagePromise);
    return imagePromise;
  };

  for (const table of tables) {
    const rows = getWordChildren(table, 'tr');
    if (rows.length < 2) continue;

    const headerCells = getWordChildren(rows[0], 'tc');
    const headers = headerCells.map((cell) => normalizeJournalHeader(getWordCellText(cell)));
    const dateColumn = headers.findIndex((header) => header.split(' ').includes('date'));
    const accomplishmentColumn = headers.findIndex((header) => (
      /accomplishment|activities|activity|tasks|duties|work done/.test(header)
    ));
    const documentationColumn = headers.findIndex((header) => /documentation|photos?|pictures?|images?|evidence/.test(header));
    const hoursColumn = headers.findIndex((header) => /\bhours?\b/.test(header));

    if (dateColumn < 0 || accomplishmentColumn < 0) continue;
    if (hoursColumn >= 0) hoursImported = true;

    const activities: NarrativeDailyActivity[] = [];
    const currentLayoutImages: (JournalPhoto | null)[] = [];
    const reportLayoutImages: (JournalPhoto | null)[] = [];

    for (const row of rows.slice(1)) {
      const cells = getWordChildren(row, 'tc');
      const date = cells[dateColumn] ? getWordCellText(cells[dateColumn]) : '';
      const accomplishment = cells[accomplishmentColumn] ? getWordCellText(cells[accomplishmentColumn]) : '';
      const hoursText = hoursColumn >= 0 && cells[hoursColumn] ? getWordCellText(cells[hoursColumn]) : '';
      const rowText = date + accomplishment + hoursText;
      if (!rowText.trim()) continue;
      const day = `Day ${dayNumber++}`;

      const relationshipIds = documentationColumn >= 0 && cells[documentationColumn]
        ? getCellImageRelationshipIds(cells[documentationColumn])
        : [];
      if (relationshipIds.length > 1) rowsWithMultipleImages += 1;
      const loadedPhoto = relationshipIds.length > 0 ? await loadImage(relationshipIds[0]) : null;
      const photo = loadedPhoto ? { ...loadedPhoto, detail: day } : null;
      if (photo) imageCount += 1;
      const hoursValue = hoursText.match(/\d+(?:\.\d+)?/)?.[0] || '';

      activities.push({
        day,
        date,
        accomplishment,
        hours: hoursValue ? Number(hoursValue) : ''
      });
      currentLayoutImages.push(photo);
      reportLayoutImages.push(photo);
    }

    if (activities.length === 0) continue;
    const weekHours = hoursColumn >= 0
      ? activities.reduce((total, activity) => total + (Number(activity.hours) || 0), 0)
      : '';
    weeks.push({
      weekNumber: weeks.length + 1,
      totalHours: weekHours,
      narrative: '',
      activities,
      images: currentLayoutImages,
      currentLayoutImages,
      reportLayoutImages
    });
    activityCount += activities.length;
  }

  if (weeks.length === 0) {
    throw new Error('No Daily Journal tables found. The DOCX needs DATE, ACCOMPLISHMENT, and DOCUMENTATION columns.');
  }

  return {
    fileName: file.name,
    weeks,
    activityCount,
    imageCount,
    daysWithoutImages,
    rowsWithMultipleImages,
    hoursImported
  };
}

const narrativeImportFieldLabels: Record<string, NarrativeImportField> = {
  'background of the organization': 'background',
  'background of organization': 'background',
  'vision': 'vision',
  'mission': 'mission',
  'objectives': 'objectives',
  'core values': 'coreValues',
  'products and services offered': 'services',
  'products and services': 'services',
  'strengths': 'strengths',
  'weaknesses': 'weaknesses',
  'opportunities': 'opportunities',
  'threats': 'threats',
  'recommendations for improvement': 'recommendations',
  'recommendations for improvement of the organization': 'recommendations',
  'assigned tasks and responsibilities': 'tasks',
  'describe the tasks and responsibilities assigned': 'tasks',
  'describe tasks and responsibilities assigned': 'tasks',
  'tasks assigned': 'tasks',
  'tasks and responsibilities assigned': 'tasks',
  'tasks and responsibilities': 'tasks',
  'duties and procedures conformed': 'procedures',
  'duties and procedures followed': 'procedures',
  'procedures conformed': 'procedures',
  'one page narrative report of prime': 'primeNarrative',
  'prime report narrative': 'primeNarrative',
  'prime narrative report': 'primeNarrative',
  'prime narrative': 'primeNarrative',
  'issue problem 1': 'issue1',
  'description of issue problem 1': 'issue1',
  'description of problem 1': 'issue1',
  'description of issue 1': 'issue1',
  'issue 1': 'issue1',
  'problem 1': 'issue1',
  'strategy action for problem 1': 'issue1Action',
  'strategy action undertaken for problem 1': 'issue1Action',
  'strategies or actions undertaken to solve problem 1': 'issue1Action',
  'issue problem 2': 'issue2',
  'description of issue problem 2': 'issue2',
  'description of problem 2': 'issue2',
  'description of issue 2': 'issue2',
  'issue 2': 'issue2',
  'problem 2': 'issue2',
  'strategy action for problem 2': 'issue2Action',
  'strategy action undertaken for problem 2': 'issue2Action',
  'strategies or actions undertaken to solve problem 2': 'issue2Action',
  'lessons learned from the situations': 'lessons',
  'lessons learned from situations': 'lessons',
  'lessons learned from the situation': 'lessons',
  'lessons learned': 'lessons',
  'self evaluation': 'selfEvaluation',
  'self evaluation from the learning process experienced': 'selfEvaluation',
  'relevancy of the organization': 'relevancy',
  'relevancy of the organization with your programme of study and expected goals': 'relevancy',
  'relevancy of the organization with your program of study and expected goals': 'relevancy'
};

const narrativeImportDisplayLabels: Record<NarrativeImportField, string> = {
  acknowledgement: 'Acknowledgement',
  tableOfContents: 'Table of Contents',
  background: 'Organization Background',
  vision: 'Vision',
  mission: 'Mission',
  objectives: 'Objectives',
  coreValues: 'Core Values',
  services: 'Products and Services',
  strengths: 'Strengths',
  weaknesses: 'Weaknesses',
  opportunities: 'Opportunities',
  threats: 'Threats',
  recommendations: 'Recommendations',
  tasks: 'Tasks and Responsibilities',
  procedures: 'Duties and Procedures',
  issue1: 'Issue / Problem 1',
  issue1Action: 'Strategy / Action for Problem 1',
  issue2: 'Issue / Problem 2',
  issue2Action: 'Strategy / Action for Problem 2',
  lessons: 'Lessons Learned',
  selfEvaluation: 'Self-Evaluation',
  relevancy: 'Relevancy of the Organization',
  primeNarrative: 'PRIME Report Narrative',
  trainingOrganization: 'Organization',
  trainingLocation: 'Location',
  collegeFaculty: 'College / Faculty',
  degreeProgram: 'Degree Program',
  studentName: 'Student Name',
  submittedToName: 'Adviser Name',
  submittedToTitle: 'Adviser Title',
  trainingDuration: 'Training Duration',
  studentYear: 'Student Year Level'
};

function normalizeNarrativeImportLabel(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/^\s*(?:(?:chapter|section)\s+)?\d+(?:\.\d+)*[\s.)-]*/, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function createBlankNarrativeImportForm(): NarrativeForm {
  const form = createDefaultNarrativeForm();
  const narrativeFields: NarrativeImportField[] = [
    'trainingOrganization', 'trainingLocation', 'collegeFaculty', 'degreeProgram',
    'studentName', 'submittedToName', 'submittedToTitle', 'trainingDuration',
    'studentYear', 'acknowledgement', 'tableOfContents', 'background', 'vision',
    'mission', 'objectives', 'coreValues', 'services', 'strengths', 'weaknesses',
    'opportunities', 'threats', 'recommendations', 'tasks', 'procedures', 'issue1',
    'issue1Action', 'issue2', 'issue2Action', 'lessons', 'selfEvaluation', 'relevancy'
  ];
  Object.assign(form, Object.fromEntries(narrativeFields.map((field) => [field, ''])));
  form.schoolPlacement = { ...form.schoolPlacement, enabled: false };
  for (const field of [
    'trainingOrganization', 'trainingLocation', 'background', 'vision', 'mission',
    'objectives', 'coreValues', 'services', 'strengths', 'weaknesses', 'opportunities',
    'threats', 'recommendations', 'tasks', 'procedures', 'issue1', 'issue1Action',
    'issue2', 'issue2Action', 'lessons', 'selfEvaluation', 'relevancy'
  ] as const) {
    form.schoolPlacement[field] = '';
  }
  form.appendices = {
    ...form.appendices,
    dailyJournal: [],
    primeNarrative: '',
    reportFooter: {
      preparedByLabel: 'Prepared By:',
      preparedByName: '',
      checkedByLabel: 'Checked By:',
      checkedByName: '',
      checkedByRole: '',
      officeInCharge: '',
      dateLabel: 'Date:',
      dateValue: ''
    }
  };
  return form;
}

function getNarrativeImportFieldValue(form: NarrativeForm, field: NarrativeImportTextField): string {
  return field === 'primeNarrative' ? form.appendices.primeNarrative : form[field];
}

function appendNarrativeImportFieldValue(
  form: NarrativeForm,
  field: NarrativeImportTextField,
  paragraph: string
): void {
  if (field === 'primeNarrative') {
    form.appendices.primeNarrative = `${form.appendices.primeNarrative}${form.appendices.primeNarrative ? '\n' : ''}${paragraph}`;
    return;
  }
  const existing = form[field];
  Object.assign(form, { [field]: `${existing}${existing ? '\n' : ''}${paragraph}` });
}

function findNarrativeImportField(label: string): NarrativeImportTextField | null {
  const normalized = normalizeNarrativeImportLabel(label);
  if (/^acknowledg(?:e)?ments?$/.test(normalized)) return 'acknowledgement';
  const exactField = narrativeImportFieldLabels[normalized];
  if (exactField) return exactField as NarrativeImportTextField;
  const match = Object.entries(narrativeImportFieldLabels)
    .sort(([left], [right]) => right.length - left.length)
    .find(([alias]) => normalized.startsWith(`${alias} `));
  return (match?.[1] as NarrativeImportTextField | undefined) || null;
}

function findNarrativeImportHeading(
  value: string
): { field: NarrativeImportTextField; remainder: string } | null {
  const field = findNarrativeImportField(value);
  if (!field) return null;

  const normalized = normalizeNarrativeImportLabel(value);
  const alias = Object.keys(narrativeImportFieldLabels)
    .filter((candidate) => normalized === candidate || normalized.startsWith(`${candidate} `))
    .sort((left, right) => right.length - left.length)[0]
    || (/^acknowledg(?:e)?ments?\b/.test(normalized) ? 'acknowledgement' : '');
  if (!alias) return { field, remainder: '' };

  const words = value.trim().split(/\s+/);
  for (let wordCount = 1; wordCount <= words.length; wordCount += 1) {
    if (normalizeNarrativeImportLabel(words.slice(0, wordCount).join(' ')) !== alias) continue;
    return {
      field,
      remainder: words.slice(wordCount).join(' ').replace(/^[:：–—-]\s*/, '').trim()
    };
  }
  return { field, remainder: '' };
}

function getNarrativeParagraphText(paragraph: Element): string {
  const collectText = (node: Node): string => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      if (element.namespaceURI === wordProcessingNamespace) {
        if (element.localName === 't') return element.textContent || '';
        if (element.localName === 'br' || element.localName === 'cr') return '\n';
        if (element.localName === 'tab') return ' ';
      }
    }
    let result = '';
    let previousWasRun = false;
    for (const child of Array.from(node.childNodes)) {
      const childText = collectText(child);
      const childIsRun = child.nodeType === Node.ELEMENT_NODE
        && (child as Element).namespaceURI === wordProcessingNamespace
        && (child as Element).localName === 'r';
      if (
        previousWasRun
        && childIsRun
        && result
        && childText
        && /[A-Za-z0-9]$/.test(result)
        && /^[A-Za-z0-9]/.test(childText)
      ) {
        result += ' ';
      }
      result += childText;
      previousWasRun = childIsRun;
    }
    return result;
  };
  return collectText(paragraph);
}

function applyNarrativeImportLabel(form: NarrativeForm, label: string, value: string): NarrativeImportField | null {
  const normalized = normalizeNarrativeImportLabel(label);
  const scalarLabels: Record<string, NarrativeImportField> = {
    'student name': 'studentName',
    'name of student': 'studentName',
    'ojt student name': 'studentName',
    'trainee name': 'studentName',
    'organization': 'trainingOrganization',
    'organization name': 'trainingOrganization',
    'training organization': 'trainingOrganization',
    'name of organization': 'trainingOrganization',
    'name of company': 'trainingOrganization',
    'host organization': 'trainingOrganization',
    'company': 'trainingOrganization',
    'office': 'trainingOrganization',
    'location': 'trainingLocation',
    'training location': 'trainingLocation',
    'college faculty': 'collegeFaculty',
    'college faculty department': 'collegeFaculty',
    'college': 'collegeFaculty',
    'faculty': 'collegeFaculty',
    'degree program': 'degreeProgram',
    'program': 'degreeProgram',
    'course': 'degreeProgram',
    'submitted to': 'submittedToName',
    'adviser': 'submittedToName',
    'advisor': 'submittedToName',
    'name of adviser': 'submittedToName',
    'name of advisor': 'submittedToName',
    'ojt adviser': 'submittedToName',
    'submitted to title': 'submittedToTitle',
    'adviser title': 'submittedToTitle',
    'advisor title': 'submittedToTitle',
    'title position': 'submittedToTitle',
    'training duration': 'trainingDuration',
    'duration': 'trainingDuration',
    'year level': 'studentYear',
    'student year level': 'studentYear'
  };
  const key = scalarLabels[normalized] || findNarrativeImportField(label);
  if (!key || !value.trim()) return null;
  if (key === 'primeNarrative') {
    form.appendices.primeNarrative = value.trim();
  } else {
    Object.assign(form, { [key]: value.trim() });
  }
  return key;
}

async function readNarrativeDocx(file: File): Promise<ParsedNarrativeDocx> {
  if (!file.name.toLowerCase().endsWith('.docx')) {
    throw new Error('Choose a Word .docx file.');
  }
  if (file.size > 25 * 1024 * 1024) {
    throw new Error('The DOCX file is larger than 25 MB. Choose a smaller file.');
  }

  const { default: JSZip } = await import('jszip');
  const fileData = await file.arrayBuffer();
  const archive = await JSZip.loadAsync(fileData);
  const documentEntry = archive.file('word/document.xml');
  if (!documentEntry) {
    throw new Error('This DOCX does not contain a readable Word document.');
  }

  const parser = new DOMParser();
  const documentParts = Object.keys(archive.files).filter((path) => (
    /^word\/(?:document|header\d*|footer\d*|footnotes|endnotes)\.xml$/.test(path)
  ));
  const narrativeForm = createBlankNarrativeImportForm();
  const mappedFields = new Set<string>();
  const extractedParts = await Promise.all(documentParts.map(async (path) => {
    const entry = archive.file(path);
    if (!entry) return '';
    const xml = parser.parseFromString(await entry.async('string'), 'application/xml');
    if (xml.getElementsByTagName('parsererror').length > 0) {
      throw new Error('The DOCX contains invalid document data.');
    }

    const paragraphs = Array.from(xml.getElementsByTagNameNS(wordProcessingNamespace, 'p'))
      .map((paragraph) => ({
        text: getNarrativeParagraphText(paragraph).trim(),
        style: getWordChildren(paragraph, 'pPr')
          .flatMap((properties) => getWordChildren(properties, 'pStyle'))
          .map((style) => style.getAttributeNS(wordProcessingNamespace, 'val') || '')
          .join(' ')
      }))
      .filter(Boolean);

    let activeField: NarrativeImportTextField | null = null;
    for (const paragraph of paragraphs) {
      for (const line of paragraph.text.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)) {
        const normalizedLine = normalizeNarrativeImportLabel(line);
        if (/^(?:table of contents|contents)$/.test(normalizedLine)) {
          activeField = 'tableOfContents';
          continue;
        }

        if (activeField === 'tableOfContents' && /^\d+(?:\.\d+)*\s/.test(line)) {
          appendNarrativeImportFieldValue(narrativeForm, activeField, line);
          mappedFields.add(narrativeImportDisplayLabels[activeField]);
          continue;
        }

        if (/^(?:vision mission(?: and)? objectives|strengths and weaknesses(?: of the organization)?(?: internal factors)?|opportunities and threats(?: of the organization)?(?: external factors)?|description of (?:two )?(?:issues?|problems?) encountered|strategies or actions undertaken to solve (?:the )?(?:issues?|problems?))\b/.test(normalizedLine)) {
          activeField = null;
          continue;
        }

        const heading = findNarrativeImportHeading(line);
        if (heading) {
          activeField = heading.field;
          if (heading.remainder) {
            appendNarrativeImportFieldValue(narrativeForm, heading.field, heading.remainder);
            mappedFields.add(narrativeImportDisplayLabels[heading.field]);
          }
          continue;
        }

        const labeledValue = line.match(/^([^:：]{2,100})\s*[:：]\s*(.+)$/);
        const labeledField = labeledValue
          ? applyNarrativeImportLabel(narrativeForm, labeledValue[1], labeledValue[2])
          : null;
        if (labeledValue && labeledField) {
          mappedFields.add(narrativeImportDisplayLabels[labeledField]);
          activeField = null;
          continue;
        }

        if (/^(?:acknowledg(?:e)?ments?(?: table of contents.*)?|introduction|organization company analysis|organization analysis|tasks and duties|case analysis|reflections|appendices|appendix|list of (?:tables|figures|illustrations))\b/.test(normalizedLine)) {
          activeField = null;
          continue;
        }

        if (activeField === 'acknowledgement' && /^[A-Z][A-Z .,'’-]{2,}$/.test(line)) {
          Object.assign(narrativeForm, { studentName: line });
          mappedFields.add(narrativeImportDisplayLabels.studentName);
          activeField = null;
          continue;
        }
        if (/^(?:bachelor|associate|master|doctor)\b/i.test(line)) {
          Object.assign(narrativeForm, { degreeProgram: line });
          mappedFields.add(narrativeImportDisplayLabels.degreeProgram);
          activeField = null;
          continue;
        }
        const combinedSignature = line.match(/^([A-Z][A-Z .,'’-]{2,})\s+((?:bachelor|associate|master|doctor)\b.*)$/i);
        if (combinedSignature) {
          Object.assign(narrativeForm, {
            studentName: combinedSignature[1].trim(),
            degreeProgram: combinedSignature[2].split(/\s+(?:jose rizal|university of)\b/i)[0].trim()
          });
          mappedFields.add(narrativeImportDisplayLabels.studentName);
          mappedFields.add(narrativeImportDisplayLabels.degreeProgram);
          activeField = null;
          continue;
        }

        if (/heading[1-6]/i.test(paragraph.style)) {
          activeField = null;
          continue;
        }
        if (activeField) {
          appendNarrativeImportFieldValue(narrativeForm, activeField, line);
          mappedFields.add(narrativeImportDisplayLabels[activeField]);
        }
      }
    }

    if (path === 'word/document.xml') {
      for (const row of Array.from(xml.getElementsByTagNameNS(wordProcessingNamespace, 'tr'))) {
        const cells = Array.from(row.getElementsByTagNameNS(wordProcessingNamespace, 'tc'))
          .map((cell) => Array.from(cell.getElementsByTagNameNS(wordProcessingNamespace, 't'))
            .map((textNode) => textNode.textContent || '')
            .join(' ')
            .trim());
        for (let index = 0; index < cells.length - 1; index += 1) {
          const mappedField = applyNarrativeImportLabel(narrativeForm, cells[index], cells[index + 1]);
          if (mappedField) mappedFields.add(narrativeImportDisplayLabels[mappedField]);
        }
      }
    }

    return paragraphs.map((paragraph) => paragraph.text).join('\n');
  }));
  try {
    const journalImport = await parseDailyJournalDocx(file);
    narrativeForm.appendices.dailyJournal = normalizeDailyJournalDays(journalImport.weeks);
    mappedFields.add('Daily Journal');
  } catch (error) {
    if (!(error instanceof Error) || !error.message.startsWith('No Daily Journal tables found.')) {
      throw error;
    }
  }
  const extractedText = extractedParts.filter(Boolean).join('\n\n').trim();
  if (!extractedText) {
    throw new Error('No readable text was found in this DOCX.');
  }

  return {
    document: {
      fileName: file.name,
      blob: new Blob([fileData], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }),
      extractedText,
      wordCount: extractedText.match(/\S+/g)?.length || 0
    },
    form: mergeNarrativeForm(narrativeForm),
    mappedFields: Array.from(mappedFields)
  };
}

const fieldClass =
  'mt-2.5 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 sm:rounded-2xl sm:px-4 sm:py-3.5 sm:text-base';

const fileInputClass = 
  'mt-2.5 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20';

async function resizeImageDataUrl(dataUrl: string, maxWidth: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, maxWidth / Math.max(img.width, img.height));
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas is not available in this browser.'));
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Failed to process an attached image for the report.'));
    img.src = dataUrl;
  });
}

async function compressImageDataUrl(file: File, maxWidth = 1400, quality = 0.75): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read selected image.'));
    reader.readAsDataURL(file);
  });
  return resizeImageDataUrl(dataUrl, maxWidth, quality);
}

async function transformReportPayload(
  value: unknown,
  layout: 'current' | 'report' | 'no-photo' | 'monthly',
  imageSize?: { maxWidth: number; quality: number }
): Promise<unknown> {
  if (typeof value === 'string' && imageSize && value.startsWith('data:image/')) {
    return resizeImageDataUrl(value, imageSize.maxWidth, imageSize.quality);
  }
  if (Array.isArray(value)) {
    const transformedItems = [];
    for (const item of value) {
      transformedItems.push(await transformReportPayload(item, layout, imageSize));
    }
    return transformedItems;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value).filter(([key]) => (
      !(layout === 'no-photo' && (key === 'currentLayoutImages' || key === 'reportLayoutImages' || key === 'images'))
      &&
      !(layout === 'report' && key === 'currentLayoutImages')
      && !(layout === 'current' && key === 'reportLayoutImages')
      && !(layout === 'monthly' && key === 'reportLayoutImages')
    ));
    const transformedEntries = [];
    for (const [key, item] of entries) {
      transformedEntries.push([key, await transformReportPayload(item, layout, imageSize)] as const);
    }
    return Object.fromEntries(transformedEntries);
  }
  return value;
}

async function createReportRequestBody(form: NarrativeForm): Promise<string> {
  const layout = form.appendices.dailyJournalLayout === 'no-photo'
    ? 'no-photo'
    : form.appendices.dailyJournalLayout === 'report'
      ? 'report'
      : form.appendices.dailyJournalLayout === 'monthly' ? 'monthly' : 'current';
  const maxRequestBytes = 4 * 1024 * 1024;
  let body = JSON.stringify(await transformReportPayload(form, layout));
  if (new Blob([body]).size <= maxRequestBytes) return body;

  let maxWidth = 1400;
  let quality = 0.75;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    body = JSON.stringify(await transformReportPayload(form, layout, { maxWidth, quality }));
    if (new Blob([body]).size <= maxRequestBytes) return body;

    maxWidth = Math.max(320, Math.floor(maxWidth * 0.8));
    quality = Math.max(0.3, quality * 0.85);
  }

  throw new Error('The report is still too large to send. Remove some attached images and try again.');
}

async function readErrorMessage(response: Response): Promise<string> {
  const text = await response.text();
  if (!text) return 'Failed to generate the report';
  try {
    const parsed = JSON.parse(text);
    return parsed?.error || text || 'Failed to generate the report';
  } catch {
    return text || 'Failed to generate the report';
  }
}

function GuideTooltip({ step, tooltipProps, primaryProps }: any) {
  return (
    <div
      {...tooltipProps}
      className="w-full sm:w-max flex flex-col animate-fade-in max-w-[calc(100vw-2rem)] sm:max-w-none"
    >
      {/* Compact Layout: Image + Thought Bubble Side-by-Side on Desktop, Stacked on Mobile */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start">
        {/* Guide Character Image - Minimized */}
        <div className="relative overflow-hidden rounded-[16px] ring-1 ring-cyan-500/20 flex-shrink-0 mx-auto sm:mx-0">
          <Image
            src={guideScene}
            alt="Guide illustration"
            className="h-28 w-28 sm:h-32 sm:w-32 object-cover brightness-105 contrast-110"
            sizes="128px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        </div>

        {/* Thought Bubble Card - Compact & Adjacent */}
        <div className="relative rounded-[18px] border-2 border-cyan-500/50 bg-gradient-to-br from-slate-950/90 via-slate-900/85 to-slate-800/80 p-3 sm:p-4 shadow-[0_12px_36px_rgba(34,211,238,0.18),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/60 hover:shadow-[0_16px_48px_rgba(34,211,238,0.28)] w-full sm:w-[260px]">
          {/* Decorative cloud shapes */}
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-slate-900/40 rounded-full blur-md" />
          <div className="absolute -top-1 left-2 w-4 h-4 bg-slate-900/30 rounded-full blur-md" />
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-slate-900/40 rounded-full blur-md" />

          {/* Bubble pointer tail - pointing to image (hidden on mobile) */}
          <div className="hidden sm:block absolute -left-3 top-6 h-0 w-0 border-l-0 border-r-6 border-t-5 border-b-5 border-r-cyan-500/50 border-t-transparent border-b-transparent" />

          <div className="space-y-2 sm:space-y-2.5 relative z-10">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300/90">Guide</span>
              <span className="rounded-full border border-cyan-500/40 bg-cyan-500/15 px-2 py-0.5 text-[8px] sm:text-[9px] font-semibold text-cyan-200/90 backdrop-blur-sm">
                {step.title || 'Tip'}
              </span>
            </div>

            <p className="text-xs sm:text-xs leading-5 text-slate-200/95 font-medium">{step.content}</p>

            <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
              <button
                type="button"
                className="text-xs font-semibold text-slate-400 hover:text-slate-300 transition-colors duration-200 px-2 py-1.5 rounded hover:bg-slate-800/40"
                {...tooltipProps.closeProps}
              >
                Skip
              </button>

              <button
                type="button"
                {...primaryProps}
                className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:shadow-[0_8px_24px_rgba(34,211,238,0.4)] hover:brightness-110 active:scale-95 whitespace-nowrap"
              >
                {primaryProps.title}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Global animation style */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  const [form, setForm] = useState<NarrativeForm>(() => createDefaultNarrativeForm());
  const [drafts, setDrafts] = useState<NarrativeDraft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState('');
  const [showNewDraftDialog, setShowNewDraftDialog] = useState(false);
  const [newDraftTitle, setNewDraftTitle] = useState('');
  const [pendingNarrativeImport, setPendingNarrativeImport] = useState<ParsedNarrativeDocx | null>(null);
  const [previewingImportedDocument, setPreviewingImportedDocument] = useState<ImportedNarrativeDocument | null>(null);
  const [importedDocumentRendering, setImportedDocumentRendering] = useState(false);
  const [importedDocumentPreviewError, setImportedDocumentPreviewError] = useState('');
  const [narrativeImportError, setNarrativeImportError] = useState('');
  const [isImportingNarrative, setIsImportingNarrative] = useState(false);
  const [pendingJournalImport, setPendingJournalImport] = useState<ParsedJournalImport | null>(null);
  const [journalImportError, setJournalImportError] = useState('');
  const [isImportingJournal, setIsImportingJournal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const [aiDraftError, setAiDraftError] = useState('');
  const [aiDrafts, setAiDrafts] = useState<AiDraftField[]>([]);
  const [showAiDraftReview, setShowAiDraftReview] = useState(false);
  const [status, setStatus] = useState('Draft ready');
  const [aiGenerating, setAiGenerating] = useState('');
  
  // Tour State
  const [runTour, setRunTour] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [completionSlideIndex, setCompletionSlideIndex] = useState(0);
  const [dailyJournalGenerationError, setDailyJournalGenerationError] = useState<{
    weekIndex: number;
    dayIndex: number;
    message: string;
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [previewZoom, setPreviewZoom] = useState(0.3);
  const [monthlyPhotoSelection, setMonthlyPhotoSelection] = useState<MonthlyPhotoSelection | null>(null);
  const [mobileAccomplishmentEditor, setMobileAccomplishmentEditor] = useState<{
    weekIndex: number;
    dayIndex: number;
    draft: string;
    focus: string;
    unit: AIGenerationLength['unit'];
    count: number;
  } | null>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const previewRequestRef = useRef<AbortController | null>(null);
  const previewCacheRef = useRef<{ key: string; blob: Blob } | null>(null);
  const draftSaveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const narrativeImportFileRef = useRef<HTMLInputElement>(null);
  const importedDocumentPreviewRef = useRef<HTMLDivElement>(null);
  const journalImportFileRef = useRef<HTMLInputElement>(null);

  const isMobileAccomplishmentEditorOpen = mobileAccomplishmentEditor !== null;

  useEffect(() => {
    if (!isMobileAccomplishmentEditorOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileAccomplishmentEditorOpen]);

  useEffect(() => {
    if (!showCompletionPopup) return;

    const interval = window.setInterval(() => {
      setCompletionSlideIndex((prev) => (prev === 0 ? 1 : 0));
    }, 3000);

    return () => window.clearInterval(interval);
  }, [showCompletionPopup]);

  // Load saved narratives from IndexedDB, falling back to the earlier localStorage format.
  useEffect(() => {
    let cancelled = false;

    const restoreDrafts = async () => {
      try {
        let savedCollection: unknown = null;
        try {
          savedCollection = await loadDraftCollection();
        } catch (error) {
          console.error('Could not access IndexedDB draft storage:', error);
          if (!cancelled) setStatus('Could not access expanded browser storage');
        }

        if (isStoredNarrativeCollection(savedCollection) && savedCollection.drafts.length > 0) {
          const restoredDrafts = savedCollection.drafts.map((draft) => ({
            id: draft.id,
            title: draft.title,
            updatedAt: draft.updatedAt || new Date().toISOString(),
            form: mergeNarrativeForm(draft.form),
            ...(isImportedNarrativeDocument(draft.importedDocument)
              ? { importedDocument: draft.importedDocument }
              : {})
          }));
          const requestedActiveId = savedCollection.activeDraftId;
          const restoredActiveId = typeof requestedActiveId === 'string'
            && restoredDrafts.some((draft) => draft.id === requestedActiveId)
            ? requestedActiveId
            : restoredDrafts[0].id;

          if (cancelled) return;
          setDrafts(restoredDrafts);
          setActiveDraftId(restoredActiveId);
          setForm(restoredDrafts.find((draft) => draft.id === restoredActiveId)?.form || restoredDrafts[0].form);
          return;
        }

        const savedDrafts = localStorage.getItem(draftsStorageKey);
        const parsedDrafts: unknown = savedDrafts ? JSON.parse(savedDrafts) : null;
        if (isStoredNarrativeCollection(parsedDrafts) && parsedDrafts.drafts.length > 0) {
          const restoredDrafts = parsedDrafts.drafts.map((draft) => ({
            id: draft.id,
            title: draft.title,
            updatedAt: draft.updatedAt || new Date().toISOString(),
            form: mergeNarrativeForm(draft.form),
            ...(isImportedNarrativeDocument(draft.importedDocument)
              ? { importedDocument: draft.importedDocument }
              : {})
          }));
          const requestedActiveId = parsedDrafts.activeDraftId;
          const restoredActiveId = typeof requestedActiveId === 'string'
            && restoredDrafts.some((draft) => draft.id === requestedActiveId)
            ? requestedActiveId
            : restoredDrafts[0].id;

          if (cancelled) return;
          setDrafts(restoredDrafts);
          setActiveDraftId(restoredActiveId);
          setForm(restoredDrafts.find((draft) => draft.id === restoredActiveId)?.form || restoredDrafts[0].form);
          return;
        }

        const savedForm = localStorage.getItem('narrativeReportForm');
        const legacyForm: unknown = savedForm ? JSON.parse(savedForm) : null;
        const migratedForm = isRecord(legacyForm)
          ? mergeNarrativeForm(legacyForm)
          : createDefaultNarrativeForm();
        const migratedDraft: NarrativeDraft = {
          id: createNarrativeId(),
          title: 'My first narrative',
          updatedAt: new Date().toISOString(),
          form: migratedForm
        };
        if (cancelled) return;
        setDrafts([migratedDraft]);
        setActiveDraftId(migratedDraft.id);
        setForm(migratedForm);
      } catch (error) {
        console.error('Error loading saved narrative drafts:', error);
        if (cancelled) return;
        const starterDraft: NarrativeDraft = {
          id: createNarrativeId(),
          title: 'My narrative',
          updatedAt: new Date().toISOString(),
          form: createDefaultNarrativeForm()
        };
        setDrafts([starterDraft]);
        setActiveDraftId(starterDraft.id);
        setForm(starterDraft.form);
        setStatus('Could not load saved narratives');
      } finally {
        if (!cancelled) {
          setIsMounted(true);
          setRunTour(true);
        }
      }
    };

    void restoreDrafts();
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep the active narrative up to date and persist all drafts in this browser.
  useEffect(() => {
    if (!isMounted || !activeDraftId) return;
    setDrafts((currentDrafts) => currentDrafts.map((draft) => (
      draft.id === activeDraftId
        ? { ...draft, form, updatedAt: new Date().toISOString() }
        : draft
    )));
  }, [form, activeDraftId, isMounted]);

  useEffect(() => {
    if (!isMounted || drafts.length === 0 || !activeDraftId) return;
    let cancelled = false;
    const collection = { drafts, activeDraftId };
    const timeout = window.setTimeout(() => {
      setStatus('Saving locally...');
      draftSaveQueueRef.current = draftSaveQueueRef.current
        .catch(() => undefined)
        .then(() => saveDraftCollection(collection))
        .then(() => {
          try {
            localStorage.removeItem(draftsStorageKey);
            localStorage.removeItem('narrativeReportForm');
          } catch (error) {
            console.error('Could not remove the migrated localStorage copy:', error);
          }
          if (!cancelled) setStatus('Saved locally');
        })
        .catch((error: unknown) => {
          console.error('Error saving narrative drafts to IndexedDB:', error);
          if (!cancelled) {
            setStatus('Browser storage is full or unavailable - remove large images and try again');
          }
        });
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [drafts, activeDraftId, isMounted]);

  const activeDraft = drafts.find((draft) => draft.id === activeDraftId);
  const importedDocumentToPreview = pendingNarrativeImport?.document || previewingImportedDocument;

  const openNewDraftDialog = () => {
    setNewDraftTitle(`Narrative ${drafts.length + 1}`);
    setNarrativeImportError('');
    setShowNewDraftDialog(true);
  };

  const handleNarrativeDocxUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setNarrativeImportError('');
    setIsImportingNarrative(true);
    setStatus('Reading complete narrative DOCX...');
    try {
      const importedDocument = await readNarrativeDocx(file);
      setNewDraftTitle(importedDocument.document.fileName.replace(/\.docx$/i, '') || `Narrative ${drafts.length + 1}`);
      setPendingNarrativeImport(importedDocument);
      setPreviewingImportedDocument(null);
      setImportedDocumentPreviewError('');
      setStatus(`Mapped ${importedDocument.mappedFields.length} fields from DOCX`);
    } catch (error) {
      console.error('Error importing narrative DOCX:', error);
      const message = error instanceof Error ? error.message : 'Could not read the DOCX file.';
      setNarrativeImportError(message);
      setStatus('Narrative import failed');
    } finally {
      setIsImportingNarrative(false);
    }
  };

  const createNarrativeFromDocx = () => {
    if (!pendingNarrativeImport) return;
    const importedDocument = pendingNarrativeImport.document;
    const newDraft: NarrativeDraft = {
      id: createNarrativeId(),
      title: newDraftTitle.trim() || importedDocument.fileName.replace(/\.docx$/i, ''),
      updatedAt: new Date().toISOString(),
      form: pendingNarrativeImport.form,
      importedDocument
    };
    setDrafts((currentDrafts) => [
      ...currentDrafts.map((draft) => (
        draft.id === activeDraftId ? { ...draft, form, updatedAt: new Date().toISOString() } : draft
      )),
      newDraft
    ]);
    setActiveDraftId(newDraft.id);
    setForm(newDraft.form);
    setShowNewDraftDialog(false);
    setPendingNarrativeImport(null);
    setPreviewingImportedDocument(importedDocument);
    setStatus(`Imported ${pendingNarrativeImport.mappedFields.length} fields into the editor`);
  };

  const createNarrative = () => {
    const newDraft: NarrativeDraft = {
      id: createNarrativeId(),
      title: newDraftTitle.trim() || `Narrative ${drafts.length + 1}`,
      updatedAt: new Date().toISOString(),
      form: createDefaultNarrativeForm()
    };
    setDrafts((currentDrafts) => [
      ...currentDrafts.map((draft) => (
        draft.id === activeDraftId ? { ...draft, form, updatedAt: new Date().toISOString() } : draft
      )),
      newDraft
    ]);
    setActiveDraftId(newDraft.id);
    setForm(newDraft.form);
    setShowNewDraftDialog(false);
    setStatus('New narrative created');
  };

  const switchNarrative = (draftId: string) => {
    const selectedDraft = drafts.find((draft) => draft.id === draftId);
    if (!selectedDraft || draftId === activeDraftId) return;
    setDrafts((currentDrafts) => currentDrafts.map((draft) => (
      draft.id === activeDraftId ? { ...draft, form, updatedAt: new Date().toISOString() } : draft
    )));
    setForm(selectedDraft.form);
    setActiveDraftId(selectedDraft.id);
    setStatus(`Opened ${selectedDraft.title}`);
  };

  const tourSteps: Step[] = [
    {
      target: '.tour-start-btn',
      title: 'Start here',
      content: 'Use this button to review the steps. Replace all example information with your real OJT details as you go.',
      skipBeacon: true,
    },
    {
      target: '.tour-front-page',
      title: 'Front page',
      content: 'Replace the sample school, company, and cover details with your actual report information while keeping the page polished and presentable.',
    },
    {
      target: '.tour-acknowledgement',
      title: 'Acknowledgement',
      content: 'Replace the sample appreciation text with your real acknowledgement and keep the wording professional and sincere.',
    },
    {
      target: '.tour-table-of-contents',
      title: 'Table of Contents',
      content: 'Add or update the report outline here so the section list follows the acknowledgement and leads into the main narrative sections.',
    },
    {
      target: '.tour-page-layout',
      title: 'Page Layout Style',
      content: 'Choose Compact layout to flow sections together, or One section per page to start each report section on its own page in the generated Word document.',
    },
    {
      target: '.tour-introduction',
      title: 'Introduction',
      content: 'Edit the sample company background, mission, objectives, core values, and services so they reflect your actual host office and training experience.',
    },
    {
      target: '.tour-organization-structure',
      title: 'Organization structure',
      content: 'Attach the organization structure image that shows the people in your specific OJT area. It will be centered in the Introduction section of the generated report.',
    },
    {
      target: '.tour-organization-analysis',
      title: 'Organization analysis',
      content: 'Replace the example strengths, weaknesses, opportunities, and recommendations with your own analysis based on the actual office.',
    },
    {
      target: '.tour-tasks-duties',
      title: 'Tasks and duties',
      content: 'Update the sample tasks and procedures with the true work you performed during your internship.',
    },
    {
      target: '.tour-case-analysis',
      title: 'Case analysis',
      content: 'Replace the sample challenges and solutions with your real problems, actions taken, and lessons learned.',
    },
    {
      target: '.tour-reflections',
      title: 'Reflections',
      content: 'Change the sample reflection content to your actual learning experience and how it connects to your course and goals.',
    },
    {
      target: '.tour-school-placement',
      title: 'Second OJT placement',
      content: 'Enable this section only if you continued your OJT in the school or another location. Keep its Introduction, tasks, problems, and reflections separate from the first placement.',
    },
    {
      target: '.tour-appendices',
      title: 'Appendices',
      content: 'Replace the example weekly entries and attachments with your actual daily journal, proofs, and supporting documentation.',
    },
    {
      target: '.tour-generate-btn',
      title: 'Generate report',
      content: 'When all sample entries are replaced with your real details, generate the final Word document in its clean, presentable format.',
    }
  ];

  const handleJoyrideCallback = (data: EventData) => {
    const { status, type, step } = data;
    const finishedStatuses = new Set<string>([STATUS.FINISHED, STATUS.SKIPPED]);

    if (finishedStatuses.has(status)) {
      setRunTour(false);
    }
  };

  const updateField = (key: keyof typeof defaultForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const requestAIField = async (
    generationKey: string,
    title: string,
    apiTitle: string,
    currentText: string,
    instructions = '',
    options: AIGenerationOptions,
    sourceDetails: Record<string, unknown>,
    exampleText: string,
  ): Promise<string | null> => {
    if (aiGenerating) {
      throw new Error('Another AI generation is already in progress. Wait for it to finish, then try again.');
    }
    setAiGenerating(generationKey);
    setStatus(`Generating ${title} with AI...`);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: apiTitle,
          sourceDetails,
          currentText: userProvidedText(currentText, exampleText, 12000),
          focus: aiText(options.focus, 2000),
          instructions,
          outputUnit: options.unit,
          outputCount: options.count,
        }),
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message = response.status === 413
          ? 'The report details are too large to send for AI drafting. Shorten long text fields and try again.'
          : isRecord(result) && typeof result.error === 'string'
            ? result.error
            : 'Could not generate text. Please try again.';
        throw new Error(message);
      }
      if (!isRecord(result) || typeof result.text !== 'string' || !result.text.trim()) {
        throw new Error('The AI service returned no text. Please try again.');
      }
      setStatus(`${title} generated and aligned`);
      return result.text.trim();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not generate text.';
      setStatus(message);
      throw new Error(message);
    } finally {
      setAiGenerating('');
    }
  };

  const generateFieldWithAI = (
    key: AiGenerationFieldKey,
    title: string,
    currentText: string,
    instructions = '',
    options: AIGenerationOptions,
  ): Promise<string | null> => requestAIField(
    String(key),
    title,
    title,
    currentText,
    instructions,
    options,
    buildAISectionContext(form, key),
    defaultForm[key],
  );

  const generateSchoolPlacementFieldWithAI = (
    key: AiNarrativeFieldKey,
    title: string,
    currentText: string,
    instructions = '',
    options: AIGenerationOptions,
  ): Promise<string | null> => requestAIField(
    `schoolPlacement.${key}`,
    title,
    aiNarrativeFieldLabels[key],
    currentText,
    instructions,
    options,
    buildSchoolPlacementAIContext(form.schoolPlacement, key),
    defaultForm.schoolPlacement[key],
  );

  const generatePrimeNarrativeWithAI = (
    currentText: string,
    options: AIGenerationOptions,
  ): Promise<string | null> => requestAIField(
    'primeNarrative',
    'PRIME Report Narrative',
    'PRIME Report Narrative',
    currentText,
    'Use only the seminar details in the current text or generation focus. Do not invent dates, topics, speakers, activities, attendance, lessons, or personal outcomes. If the user has not supplied event details, ask them to add them.',
    options,
    {},
    defaultForm.appendices.primeNarrative,
  );

  const generateWeeklyNarrative = async (weekIndex: number, options: AIGenerationOptions): Promise<string | null> => {
    const week = form.appendices.dailyJournal[weekIndex];
    if (!week) return null;
    if (aiGenerating) {
      throw new Error('Another AI generation is already in progress. Wait for it to finish, then try again.');
    }
    setAiGenerating(`weekly-${weekIndex}`);
    setStatus(`Generating Week ${week.weekNumber} narrative with AI...`);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Week ${week.weekNumber} Daily Journal Narrative`,
          sourceDetails: {
            activities: week.activities
              .flatMap((activity, activityIndex) => {
                const example = defaultForm.appendices.dailyJournal[weekIndex]?.activities[activityIndex];
                if (example && activity.day === example.day
                  && activity.date === example.date
                  && activity.accomplishment === example.accomplishment
                  && activity.hours === example.hours) return [];
                const accomplishment = aiText(activity.accomplishment, 500);
                if (!accomplishment) return [];
                return [{
                  day: aiText(activity.day, 40),
                  date: aiText(activity.date, 40),
                  accomplishment,
                  hours: activity.hours,
                }];
              })
              .slice(0, 7),
          },
          currentText: userProvidedText(
            week.narrative,
            defaultForm.appendices.dailyJournal[weekIndex]?.narrative || '',
            12000,
          ),
          focus: aiText(options.focus, 2000),
          instructions: 'Summarize only the selected week activities into a coherent weekly OJT narrative. Do not invent activities, dates, hours, or skills.',
          outputUnit: options.unit,
          outputCount: options.count,
        }),
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message = response.status === 413
          ? 'The report details are too large to send for AI drafting. Shorten long text fields and try again.'
          : isRecord(result) && typeof result.error === 'string'
            ? result.error
            : 'Could not generate the weekly narrative. Please try again.';
        throw new Error(message);
      }
      if (!isRecord(result) || typeof result.text !== 'string' || !result.text.trim()) {
        throw new Error('The AI service returned no text. Please try again.');
      }
      setStatus(`Week ${week.weekNumber} narrative generated and aligned`);
      return result.text.trim();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not generate the weekly narrative.';
      setStatus(message);
      throw new Error(message);
    } finally {
      setAiGenerating('');
    }
  };

  const generateDailyJournalAccomplishment = async () => {
    if (aiGenerating) return;
    const editor = mobileAccomplishmentEditor;
    if (!editor) return;
    const { weekIndex, dayIndex } = editor;
    const week = form.appendices.dailyJournal[weekIndex];
    const activity = week?.activities[dayIndex];
    const photo = week && getDailyJournalPhoto(week, dayIndex, form.appendices.dailyJournalLayout);
    if (!week || !activity || !photo) {
      setStatus('Attach a photo to this journal day before generating its accomplishment.');
      return;
    }

    const generationKey = `journal-${weekIndex}-${dayIndex}`;
    setAiGenerating(generationKey);
    setDailyJournalGenerationError(null);
    setStatus(`Generating ${activity.day || `Day ${dayIndex + 1}`} accomplishment from its photo...`);
    try {
      const example = defaultForm.appendices.dailyJournal[weekIndex]?.activities[dayIndex]?.accomplishment || '';
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Daily Journal Accomplishment',
          sourceDetails: {
            weekNumber: week.weekNumber,
            day: activity.day,
            date: activity.date,
            hours: activity.hours,
          },
          imageData: photo.base64,
          currentText: userProvidedText(activity.accomplishment, example, 1000),
          focus: aiText(editor.focus, 2000),
          instructions: 'Draft this accomplishment using only clearly visible, unambiguous work evidence from the photo and details provided for this day. Do not invent a task, role, procedure, or result.',
          outputUnit: editor.unit,
          outputCount: editor.count,
        }),
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message = isRecord(result) && typeof result.error === 'string'
          ? result.error
          : 'Could not generate the accomplishment. Please try again.';
        throw new Error(message);
      }
      if (!isRecord(result) || typeof result.text !== 'string' || !result.text.trim()) {
        throw new Error('The AI service returned no text. Please try again.');
      }

      const generatedText = result.text.trim();
      setMobileAccomplishmentEditor((current) => current
        && current.weekIndex === weekIndex
        && current.dayIndex === dayIndex
        ? { ...current, draft: generatedText }
        : current);
      setDailyJournalGenerationError(null);
      setStatus(`${activity.day || `Day ${dayIndex + 1}`} accomplishment drafted. Review it and select Save.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not generate the accomplishment.';
      setDailyJournalGenerationError({ weekIndex, dayIndex, message });
      setStatus(message);
    } finally {
      setAiGenerating('');
    }
  };

  const updateSchoolPlacementField = (key: keyof typeof defaultForm.schoolPlacement, value: string) => {
    setForm((prev) => ({
      ...prev,
      schoolPlacement: { ...prev.schoolPlacement, [key]: value }
    }));
  };

  const setSchoolPlacementEnabled = (enabled: boolean) => {
    setForm((prev) => ({
      ...prev,
      tableOfContents: syncSchoolPlacementTOC(prev.tableOfContents, enabled),
      schoolPlacement: { ...prev.schoolPlacement, enabled }
    }));
  };

  const updateAppendixText = (key: keyof typeof defaultForm.appendices, value: string) => {
    setForm((prev) => ({
      ...prev,
      appendices: { ...prev.appendices, [key]: value }
    }));
  };

  const updateReportFooter = (field: keyof NonNullable<typeof defaultForm.appendices.reportFooter>, value: string) => {
    setForm((prev) => ({
      ...prev,
      appendices: {
        ...prev.appendices,
        reportFooter: {
          ...prev.appendices.reportFooter,
          [field]: value
        }
      }
    }));
  };

  const updateDailyJournalLayout = (layout: 'current' | 'report' | 'no-photo' | 'monthly') => {
    setForm((prev) => ({
      ...prev,
      appendices: { ...prev.appendices, dailyJournalLayout: layout }
    }));
  };

  const openMonthlyPhotoSelection = () => {
    const groups = getMonthlyJournalGroups(
      form.appendices.dailyJournal,
      form.appendices.dailyJournalMonthlySummaries,
    ).map((month): MonthlyPhotoSelectionGroup => {
      const candidates: MonthlyPhotoCandidate[] = [];
      const seenImages = new Set<string>();
      const summaryPhotos = form.appendices.dailyJournalMonthlySummaries[month.key]?.photos || [];

      summaryPhotos.forEach((photo, photoIndex) => {
        if (seenImages.has(photo.base64)) return;
        seenImages.add(photo.base64);
        candidates.push({
          id: `monthly:${month.key}:${photoIndex}`,
          photo,
          description: photo.detail || `${month.label} monthly photo`,
        });
      });

      month.activities.forEach(({ weekIndex, dayIndex, activity }) => {
        const week = form.appendices.dailyJournal[weekIndex];
        const photo = getDailyJournalPhoto(week, dayIndex, form.appendices.dailyJournalLayout);
        if (!photo || seenImages.has(photo.base64)) return;
        seenImages.add(photo.base64);
        const activityDescription = [
          activity.date.trim(),
          activity.day.trim(),
          aiText(activity.accomplishment, 180),
        ].filter(Boolean).join(' · ');
        const photoDescription = [activityDescription, aiText(photo.detail, 120)]
          .filter(Boolean)
          .join(' — ');
        candidates.push({
          id: `daily:${month.key}:${weekIndex}:${dayIndex}`,
          photo: { ...photo, detail: photoDescription },
          description: photoDescription,
        });
      });

      return {
        key: month.key,
        label: month.label,
        activityCount: month.activities.filter(({ weekIndex, dayIndex, activity }) => (
          activity.date.trim()
          || activity.accomplishment.trim()
          || Boolean(getDailyJournalPhoto(
            form.appendices.dailyJournal[weekIndex],
            dayIndex,
            form.appendices.dailyJournalLayout,
          ))
        )).length,
        datedActivityCount: month.activities.filter(({ activity }) => activity.date.trim()).length,
        periodCovered: month.periodCovered,
        candidates,
        selectedIds: candidates
          .filter((candidate) => candidate.id.startsWith(`monthly:${month.key}:`))
          .map((candidate) => candidate.id),
        generationFocus: '',
        generationUnit: 'paragraphs',
        generationCount: 1,
        drafts: {},
        generationError: '',
      };
    });

    setMonthlyPhotoSelection({
      preference: '',
      groups,
      error: '',
    });
    const detectedMonths = groups.filter((group) => group.activityCount > 0);
    setStatus(
      detectedMonths.length
        ? `Detected ${detectedMonths.length} journal month${detectedMonths.length === 1 ? '' : 's'} from daily entry dates. Review the month groups before switching layouts.`
        : 'No dated journal months detected. Add or correct daily dates to separate entries by month.',
    );
  };

  const handleDailyJournalLayoutChange = (layout: 'current' | 'report' | 'no-photo' | 'monthly') => {
    if (layout === 'monthly' && form.appendices.dailyJournalLayout !== 'monthly') {
      openMonthlyPhotoSelection();
      return;
    }
    updateDailyJournalLayout(layout);
  };

  const saveMonthlyPhotoSelection = () => {
    if (!monthlyPhotoSelection) return;

    const invalidGroup = monthlyPhotoSelection.groups.find((group) => {
      if (!group.candidates.length) return false;
      const minimum = Math.min(2, group.candidates.length);
      return group.selectedIds.length < minimum || group.selectedIds.length > 4;
    });
    if (invalidGroup) {
      setMonthlyPhotoSelection((current) => current
        ? {
            ...current,
            error: `Select ${Math.min(2, invalidGroup.candidates.length)}–${Math.min(4, invalidGroup.candidates.length)} photos for ${invalidGroup.label}.`,
          }
        : current);
      return;
    }

    setForm((previous) => {
      const summaries = { ...previous.appendices.dailyJournalMonthlySummaries };
      for (const group of monthlyPhotoSelection.groups) {
        const selectedIds = new Set(group.selectedIds);
        summaries[group.key] = {
          ...summaries[group.key],
          photos: group.candidates
            .filter((candidate) => selectedIds.has(candidate.id))
            .map((candidate) => candidate.photo),
        };
      }
      return {
        ...previous,
        appendices: {
          ...previous.appendices,
          dailyJournalLayout: 'monthly',
          dailyJournalMonthlySummaries: summaries,
        },
      };
    });
    setMonthlyPhotoSelection(null);
    setStatus('Monthly layout selected with your chosen photos.');
  };

  const updateMonthlyJournalSummary = (
    monthKey: string,
    field: keyof MonthlyJournalSummary,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      appendices: {
        ...prev.appendices,
        dailyJournalMonthlySummaries: {
          ...prev.appendices.dailyJournalMonthlySummaries,
          [monthKey]: {
            ...prev.appendices.dailyJournalMonthlySummaries[monthKey],
            [field]: value,
          },
        },
      },
    }));
  };

  const moveMonthlyJournalMonth = (monthKey: string, value: string) => {
    const targetMatch = value.match(/^(\d{4}|unspecified)-(\d{1,2})$/);
    const sourceMatch = monthKey.match(/^(\d{4}|unspecified)-(\d{1,2})$/);
    if (!targetMatch || !sourceMatch) return;

    const targetYear = targetMatch[1] === 'unspecified' ? null : Number(targetMatch[1]);
    const targetMonthIndex = Number(targetMatch[2]) - 1;
    const oldMonthIndex = Number(sourceMatch[2]) - 1;
    if (targetMonthIndex < 0 || targetMonthIndex >= MONTH_NAMES.length) return;

    const targetKey = `${targetMatch[1]}-${targetMonthIndex + 1}`;
    if (targetKey === monthKey) return;

    const groups = getMonthlyJournalGroups(
      form.appendices.dailyJournal,
      form.appendices.dailyJournalMonthlySummaries,
    );
    const sourceGroup = groups.find((group) => group.key === monthKey);
    if (!sourceGroup) return;

    const targetGroup = groups.find((group) => group.key === targetKey);
    const targetHasSummary = Object.prototype.hasOwnProperty.call(
      form.appendices.dailyJournalMonthlySummaries,
      targetKey,
    );
    if (targetGroup?.activities.length || targetHasSummary) {
      setStatus('That month already has journal data. Choose an empty month to avoid merging or overwriting entries.');
      return;
    }

    const dateUpdates = new Map<string, string>();
    for (const { weekIndex, dayIndex, activity } of sourceGroup.activities) {
      const updatedDate = moveJournalDateToMonth(
        activity.date,
        oldMonthIndex,
        targetMonthIndex,
        targetYear,
      );
      if (!updatedDate) {
        setStatus(`Could not move “${activity.date}” because its date format was not recognized. Edit that date in the journal first.`);
        return;
      }
      dateUpdates.set(`${weekIndex}:${dayIndex}`, updatedDate);
    }

    setForm((previous) => {
      const summaries = { ...previous.appendices.dailyJournalMonthlySummaries };
      const sourceSummary = summaries[monthKey] || {};
      const movedSummary = { ...sourceSummary };
      if (movedSummary.periodCovered) {
        movedSummary.periodCovered = moveMonthText(
          movedSummary.periodCovered,
          oldMonthIndex,
          targetMonthIndex,
          targetYear,
        );
      }
      delete summaries[monthKey];
      summaries[targetKey] = movedSummary;

      return {
        ...previous,
        appendices: {
          ...previous.appendices,
          dailyJournal: previous.appendices.dailyJournal.map((week, weekIndex) => ({
            ...week,
            activities: week.activities.map((activity, dayIndex) => ({
              ...activity,
              date: dateUpdates.get(`${weekIndex}:${dayIndex}`) ?? activity.date,
            })),
          })),
          dailyJournalMonthlySummaries: summaries,
        },
      };
    });
    setStatus(`Moved ${sourceGroup.label} to ${MONTH_NAMES[targetMonthIndex]}${targetYear ? ` ${targetYear}` : ''}.`);
  };

  const removeMonthlyJournalMonth = (monthKey: string) => {
    const groups = getMonthlyJournalGroups(
      form.appendices.dailyJournal,
      form.appendices.dailyJournalMonthlySummaries,
    );
    const month = groups.find((group) => group.key === monthKey);
    if (!month) return;

    const hasSummary = Object.prototype.hasOwnProperty.call(
      form.appendices.dailyJournalMonthlySummaries,
      monthKey,
    );
    if (!month.activities.length && !hasSummary) return;

    const confirmation = month.activities.length
      ? `Remove ${month.label} and its ${month.activities.length} dated journal entr${month.activities.length === 1 ? 'y' : 'ies'}? Matching daily photos and the monthly summary/photos will also be removed.`
      : `Remove ${month.label} and its monthly summary and photos?`;
    if (!window.confirm(confirmation)) return;

    const removedDays = new Map<number, Set<number>>();
    month.activities.forEach(({ weekIndex, dayIndex }) => {
      const indices = removedDays.get(weekIndex) || new Set<number>();
      indices.add(dayIndex);
      removedDays.set(weekIndex, indices);
    });

    setForm((previous) => {
      const summaries = { ...previous.appendices.dailyJournalMonthlySummaries };
      delete summaries[monthKey];
      return {
        ...previous,
        appendices: {
          ...previous.appendices,
          dailyJournal: normalizeDailyJournalDays(
            previous.appendices.dailyJournal.map((week, weekIndex) => {
              const indices = removedDays.get(weekIndex);
              if (!indices?.size) return week;
              const keepDay = (_: unknown, dayIndex: number) => !indices.has(dayIndex);
              const activities = week.activities.filter(keepDay);
              const keepPhoto = (_: JournalPhoto | null, photoIndex: number) => !indices.has(photoIndex);
              return {
                ...week,
                activities,
                totalHours: activities.reduce((total, activity) => total + (Number(activity.hours) || 0), 0),
                images: week.images?.filter(keepPhoto),
                currentLayoutImages: week.currentLayoutImages?.filter(keepPhoto),
                reportLayoutImages: week.reportLayoutImages?.filter(keepPhoto),
              };
            }),
          ),
          dailyJournalMonthlySummaries: summaries,
        },
      };
    });
    setStatus(`Removed ${month.label} and its associated journal data.`);
  };

  const handleDailyJournalDocxUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setPendingJournalImport(null);
    setJournalImportError('');
    if (!file.name.toLowerCase().endsWith('.docx')) {
      setJournalImportError('Choose a Word .docx file.');
      return;
    }

    setIsImportingJournal(true);
    setStatus('Reading Daily Journal tables...');
    try {
      const importedJournal = await parseDailyJournalDocx(file);
      setPendingJournalImport(importedJournal);
      setStatus('Review imported Daily Journal');
    } catch (error) {
      console.error('Error importing Daily Journal DOCX:', error);
      const message = error instanceof Error ? error.message : 'Could not read the DOCX file.';
      setJournalImportError(message);
      setStatus('Daily Journal import failed');
    } finally {
      setIsImportingJournal(false);
    }
  };

  const confirmDailyJournalImport = () => {
    if (!pendingJournalImport) return;
    setForm((prev) => ({
      ...prev,
      appendices: {
        ...prev.appendices,
        dailyJournal: normalizeDailyJournalDays(pendingJournalImport.weeks) as typeof prev.appendices.dailyJournal
      }
    }));
    setStatus(`Imported ${pendingJournalImport.activityCount} journal days`);
    setPendingJournalImport(null);
  };

  const addWeek = () => {
    setForm((prev) => {
      const nextWeekNum = prev.appendices.dailyJournal.length + 1;
      const startDayNum = prev.appendices.dailyJournal.reduce((acc, w) => acc + w.activities.length, 0) + 1;
      return {
        ...prev,
        appendices: {
          ...prev.appendices,
          dailyJournal: [
            ...prev.appendices.dailyJournal,
            {
              weekNumber: nextWeekNum,
              totalHours: 40,
              narrative: '',
              activities: Array.from({ length: 5 }, (_, i) => ({
                day: `Day ${startDayNum + i}`,
                date: '',
                accomplishment: '',
                hours: 8
              })),
              images: []
            }
          ]
        }
      };
    });
  };

  const addMonth = () => {
    setForm((prev) => {
      const monthKey = getNextMonthlyJournalKey(
        prev.appendices.dailyJournal,
        prev.appendices.dailyJournalMonthlySummaries,
      );
      return {
        ...prev,
        appendices: {
          ...prev.appendices,
          dailyJournalMonthlySummaries: {
            ...prev.appendices.dailyJournalMonthlySummaries,
            [monthKey]: {
              periodCovered: '',
              actualDutyDays: '',
              totalHoursRendered: '',
              activitiesPerformed: '',
              learningExperience: '',
              photos: [],
            },
          },
        },
      };
    });
    setStatus('Added a monthly journal section');
  };

  const removeWeek = (weekIndex: number) => {
    setForm((prev) => {
      const updated = prev.appendices.dailyJournal.filter((_, idx) => idx !== weekIndex);
      return {
        ...prev,
        appendices: {
          ...prev.appendices,
          dailyJournal: normalizeDailyJournalDays(updated as NarrativeJournalWeek[]) as typeof prev.appendices.dailyJournal
        }
      };
    });
  };

  const addDay = (weekIndex: number) => {
    setForm((prev) => {
      const journal = [...prev.appendices.dailyJournal];
      const nextDayNumber = journal.reduce((acc, week) => acc + week.activities.length, 0) + 1;
      journal[weekIndex].activities.push({ day: `Day ${nextDayNumber}`, date: '', accomplishment: '', hours: 8 });
      journal[weekIndex].totalHours = journal[weekIndex].activities.reduce((acc, curr) => acc + (Number(curr.hours) || 0), 0);

      let dayCounter = 1;
      const reindexedJournal = journal.map((week) => ({
        ...week,
        activities: week.activities.map((activity) => ({
          ...activity,
          day: `Day ${dayCounter++}`
        }))
      }));

      return { ...prev, appendices: { ...prev.appendices, dailyJournal: reindexedJournal } };
    });
  };

  const updateDayActivity = (weekIndex: number, dayIndex: number, key: string, value: any) => {
    setForm((prev) => {
      const journal = [...prev.appendices.dailyJournal];
      const activities = [...journal[weekIndex].activities];
      activities[dayIndex] = { ...activities[dayIndex], [key]: value };
      journal[weekIndex].activities = activities;
      journal[weekIndex].totalHours = activities.reduce((acc, curr) => acc + (Number(curr.hours) || 0), 0);
      const normalized = normalizeDailyJournalDays(journal as NarrativeJournalWeek[]);
      return {
        ...prev,
        appendices: {
          ...prev.appendices,
          dailyJournal: normalized as typeof prev.appendices.dailyJournal
        }
      };
    });
  };

  const openMobileAccomplishmentEditor = (weekIndex: number, dayIndex: number, value: string) => {
    setDailyJournalGenerationError(null);
    setMobileAccomplishmentEditor({
      weekIndex,
      dayIndex,
      draft: value,
      focus: '',
      unit: 'paragraphs',
      count: 1,
    });
  };

  const saveMobileAccomplishment = () => {
    if (!mobileAccomplishmentEditor) return;
    updateDayActivity(
      mobileAccomplishmentEditor.weekIndex,
      mobileAccomplishmentEditor.dayIndex,
      'accomplishment',
      mobileAccomplishmentEditor.draft
    );
    setMobileAccomplishmentEditor(null);
  };

  const removeDay = (weekIndex: number, dayIndex: number) => {
    setForm((prev) => {
      const journal = [...prev.appendices.dailyJournal];
      journal[weekIndex].activities = journal[weekIndex].activities.filter((_, idx) => idx !== dayIndex);
      journal[weekIndex].totalHours = journal[weekIndex].activities.reduce((acc, curr) => acc + (Number(curr.hours) || 0), 0);

      let dayCounter = 1;
      const reindexedJournal = journal.map((week) => ({
        ...week,
        activities: week.activities.map((activity) => ({
          ...activity,
          day: `Day ${dayCounter++}`
        }))
      }));

      return { ...prev, appendices: { ...prev.appendices, dailyJournal: reindexedJournal } };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, appendixKey: keyof typeof defaultForm.appendices) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG).');
      return;
    }
    try {
      const compressed = await compressImageDataUrl(file);
      setForm((prev) => ({
        ...prev,
        appendices: { ...prev.appendices, [appendixKey]: compressed }
      }));
    } catch (error) {
      console.error(error);
      alert('The selected image could not be processed.');
    }
  };

  const handleOrganizationStructureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG).');
      return;
    }
    try {
      const compressed = await compressImageDataUrl(file, 1600, 0.8);
      updateField('organizationStructureImage', compressed);
    } catch (error) {
      console.error(error);
      alert('The organization structure image could not be processed.');
    }
  };

  const handleSchoolOrganizationStructureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG).');
      return;
    }
    try {
      const compressed = await compressImageDataUrl(file, 1600, 0.8);
      updateSchoolPlacementField('organizationStructureImage', compressed);
    } catch (error) {
      console.error(error);
      alert('The school organization structure image could not be processed.');
    }
  };

  const handleJournalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, weekIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG).');
      return;
    }
    try {
      const compressed = await compressImageDataUrl(file, 1200, 0.7);
      setForm((prev) => {
        const newJournal = [...prev.appendices.dailyJournal];
        const isReportLayout = prev.appendices.dailyJournalLayout === 'report';
        const imageKey = isReportLayout ? 'reportLayoutImages' : 'currentLayoutImages';
        
        // Initialize the layout-specific image array if it doesn't exist
        if (!(newJournal[weekIndex] as any)[imageKey]) {
          (newJournal[weekIndex] as any)[imageKey] = [];
        }
        
        const images = (newJournal[weekIndex] as any)[imageKey];
        if (images.length < 4) {
          images.push({ base64: compressed, detail: `Photo documentation for Week ${newJournal[weekIndex].weekNumber}` });
        } else {
          alert('Maximum of 4 images allowed per week.');
        }
        return { ...prev, appendices: { ...prev.appendices, dailyJournal: newJournal } };
      });
    } catch (error) {
      console.error(error);
      alert('The selected journal image could not be processed.');
    }
  };

  const handleMonthlyJournalImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    monthKey: string,
  ) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (files.length === 0) return;
    const existingPhotos = form.appendices.dailyJournalMonthlySummaries[monthKey]?.photos || [];
    if (existingPhotos.length + files.length > 4) {
      setStatus('Maximum of 4 photos allowed per month.');
      return;
    }

    try {
      const newPhotos = await Promise.all(files.map(async (file) => {
        if (!file.type.startsWith('image/')) {
          throw new Error('Choose image files for monthly photo documentation.');
        }
        return {
          base64: await compressImageDataUrl(file, 1200, 0.7),
          detail: file.name.replace(/\.[^.]+$/, ''),
        };
      }));
      setForm((previous) => ({
        ...previous,
        appendices: {
          ...previous.appendices,
          dailyJournalMonthlySummaries: {
            ...previous.appendices.dailyJournalMonthlySummaries,
            [monthKey]: {
              ...previous.appendices.dailyJournalMonthlySummaries[monthKey],
              photos: [
                ...(previous.appendices.dailyJournalMonthlySummaries[monthKey]?.photos || []),
                ...newPhotos,
              ],
            },
          },
        },
      }));
      setStatus(`Added ${newPhotos.length} monthly photo${newPhotos.length === 1 ? '' : 's'}.`);
    } catch (error) {
      console.error('Could not add monthly journal photos:', error);
      setStatus(error instanceof Error ? error.message : 'Could not add monthly photos.');
    }
  };

  const updateMonthlyJournalPhotoDetail = (monthKey: string, photoIndex: number, detail: string) => {
    setForm((previous) => {
      const summary = previous.appendices.dailyJournalMonthlySummaries[monthKey] || {};
      const photos = [...(summary.photos || [])];
      if (!photos[photoIndex]) return previous;
      photos[photoIndex] = { ...photos[photoIndex], detail };
      return {
        ...previous,
        appendices: {
          ...previous.appendices,
          dailyJournalMonthlySummaries: {
            ...previous.appendices.dailyJournalMonthlySummaries,
            [monthKey]: { ...summary, photos },
          },
        },
      };
    });
  };

  const removeMonthlyJournalPhoto = (monthKey: string, photoIndex: number) => {
    setForm((previous) => {
      const summary = previous.appendices.dailyJournalMonthlySummaries[monthKey] || {};
      const photos = (summary.photos || []).filter((_, index) => index !== photoIndex);
      return {
        ...previous,
        appendices: {
          ...previous.appendices,
          dailyJournalMonthlySummaries: {
            ...previous.appendices.dailyJournalMonthlySummaries,
            [monthKey]: { ...summary, photos },
          },
        },
      };
    });
  };

  const generateMonthlyJournalField = async (
    monthKey: string,
    monthLabel: string,
    field: 'activitiesPerformed' | 'learningExperience',
    options: AIGenerationOptions,
    selectedPhotos?: JournalPhoto[],
  ): Promise<string> => {
    const generationKey = `monthly-${monthKey}-${field}`;
    const month = getMonthlyJournalGroups(
      form.appendices.dailyJournal,
      form.appendices.dailyJournalMonthlySummaries,
    ).find((group) => group.key === monthKey);
    if (!month) throw new Error(`Could not find ${monthLabel} in the monthly journal.`);
    const summary = form.appendices.dailyJournalMonthlySummaries[monthKey] || {};
    const photos = (selectedPhotos || summary.photos || []).slice(0, 4);
    const activities = month.activities.slice(0, 40).map(({ weekNumber, activity }) => ({
      weekNumber,
      day: aiText(activity.day, 40),
      date: aiText(activity.date, 60),
      accomplishment: aiText(activity.accomplishment, 400),
      hours: activity.hours,
    })).filter((activity) => activity.accomplishment);
    if (!activities.length && !photos.length && !options.focus.trim()) {
      throw new Error(`Add daily activities, monthly photos, or generation details for ${monthLabel} before generating.`);
    }
    if (aiGenerating) {
      throw new Error('Another AI generation is already in progress. Wait for it to finish, then try again.');
    }

    setAiGenerating(generationKey);
    setStatus(`Generating ${field === 'activitiesPerformed' ? 'monthly activities' : 'monthly learning'} for ${monthLabel}...`);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: field === 'activitiesPerformed'
            ? 'Monthly Journal Activities Performed'
            : 'Monthly Journal Learning Experience',
          ...(photos.length ? { imageData: photos.map((photo) => photo.base64) } : {}),
          sourceDetails: {
            monthlyJournal: [{
              month: monthLabel,
              periodCovered: summary.periodCovered || month.periodCovered,
              actualDutyDays: summary.actualDutyDays || month.actualDutyDays,
              totalHoursRendered: summary.totalHoursRendered || month.totalHoursRendered,
              activitiesPerformed: aiText(summary.activitiesPerformed || '', 1500),
              learningExperience: aiText(summary.learningExperience || '', 1500),
              photoDetails: photos.map((photo) => aiText(photo.detail, 400)).filter(Boolean),
              activities,
            }],
          },
          currentText: aiText(summary[field] || '', 4000),
          focus: aiText(options.focus, 2000),
          instructions: field === 'activitiesPerformed'
            ? `Write the ${monthLabel} Activities Performed section using only the supplied ${monthLabel} daily entries, existing monthly summary, user focus, and that month's selected photos. Summarize actual recorded tasks; never use activities from another month or infer undocumented actions, outcomes, or dates.`
            : `Write the ${monthLabel} Learning / Experience section using only the supplied ${monthLabel} monthly summary, user focus, daily entries, and that month's photos. Do not infer personal learning, feelings, skills, or growth from tasks or photos alone. Use learning or experience only when the user explicitly states it; otherwise ask for the missing reflection. Never use details from another month.`,
          outputUnit: options.unit,
          outputCount: options.count,
        }),
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message = isRecord(result) && typeof result.error === 'string'
          ? result.error
          : 'Could not generate the monthly journal text. Please try again.';
        throw new Error(message);
      }
      if (!isRecord(result) || typeof result.text !== 'string' || !result.text.trim()) {
        throw new Error('The AI service returned no text. Please try again.');
      }

      setStatus(`${monthLabel} ${field === 'activitiesPerformed' ? 'Activities Performed' : 'Learning / Experience'} drafted. Review and edit the text.`);
      return result.text.trim();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not generate the monthly journal text.';
      setStatus(message);
      throw new Error(message);
    } finally {
      setAiGenerating('');
    }
  };

  const generateMonthlyPhotoSelectionDraft = async (
    monthKey: string,
    field: 'activitiesPerformed' | 'learningExperience',
  ) => {
    const group = monthlyPhotoSelection?.groups.find((item) => item.key === monthKey);
    if (!group) return;

    try {
      const selectedIds = new Set(group.selectedIds);
      const selectedPhotos = group.candidates
        .filter((candidate) => selectedIds.has(candidate.id))
        .map((candidate) => candidate.photo);
      const draft = await generateMonthlyJournalField(
        group.key,
        group.label,
        field,
        {
          focus: group.generationFocus,
          unit: group.generationUnit,
          count: group.generationCount,
        },
        selectedPhotos,
      );
      setMonthlyPhotoSelection((current) => current
        ? {
            ...current,
            groups: current.groups.map((currentGroup) => (
              currentGroup.key === monthKey
                ? {
                    ...currentGroup,
                    drafts: { ...currentGroup.drafts, [field]: draft },
                    generationError: '',
                  }
                : currentGroup
            )),
          }
        : current);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not generate the monthly journal text.';
      setMonthlyPhotoSelection((current) => current
        ? {
            ...current,
            groups: current.groups.map((currentGroup) => (
              currentGroup.key === monthKey
                ? { ...currentGroup, generationError: message }
                : currentGroup
            )),
          }
        : current);
    }
  };

  const handlePrimeReportImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG).');
      return;
    }
    try {
      const compressed = await compressImageDataUrl(file, 1400, 0.8);
      setForm((prev) => {
        const currentImages = [...(prev.appendices.primeReportImages || [])];
        if (currentImages.length > 1 && imageIndex >= currentImages.length) {
          alert('You can upload up to 2 images for the PRIME report.');
          return prev;
        }
        currentImages[imageIndex] = { base64: compressed, detail: `PRIME report photo ${imageIndex + 1}` };
        return {
          ...prev,
          appendices: {
            ...prev.appendices,
            primeReportImages: currentImages.slice(0, 2)
          }
        };
      });
    } catch (error) {
      console.error(error);
      alert('The selected PRIME report image could not be processed.');
    }
  };

  const updatePrimeReportImageDetail = (imageIndex: number, detail: string) => {
    setForm((prev) => {
      const currentImages = [...(prev.appendices.primeReportImages || [])];
      if (!currentImages[imageIndex]) return prev;
      currentImages[imageIndex] = { ...currentImages[imageIndex], detail };
      return {
        ...prev,
        appendices: {
          ...prev.appendices,
          primeReportImages: currentImages
        }
      };
    });
  };

  const handlePreview = async () => {
    setShowPreview(true);
    setPreviewZoom(window.innerWidth < 640 ? 0.3 : 1);
    setPreviewLoading(true);
    setPreviewError('');
    const previewKey = JSON.stringify(form);

    if (previewCacheRef.current?.key === previewKey) {
      setPreviewBlob(previewCacheRef.current.blob);
      setPreviewLoading(false);
      return;
    }

    previewRequestRef.current?.abort();
    const controller = new AbortController();
    previewRequestRef.current = controller;
    setPreviewBlob(null);

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-report-preview': 'true',
        },
        signal: controller.signal,
        body: await createReportRequestBody(form),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      const blob = await response.blob();
      if (controller.signal.aborted) return;
      previewCacheRef.current = { key: previewKey, blob };
      setPreviewBlob(blob);
    } catch (error) {
      if (controller.signal.aborted) return;
      const message = error instanceof Error ? error.message : 'Could not prepare the document preview.';
      setPreviewError(message);
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    const container = previewContainerRef.current;
    if (!showPreview || !previewBlob || !container) return;

    let cancelled = false;
    container.replaceChildren();
    setPreviewLoading(true);

    void import('docx-preview')
      .then(({ renderAsync }) => renderAsync(previewBlob, container, container, {
        className: 'report-docx',
        breakPages: true,
        ignoreWidth: false,
        ignoreHeight: false,
        ignoreLastRenderedPageBreak: false,
        renderHeaders: true,
        renderFooters: true,
        useBase64URL: true,
      }))
      .catch((error: unknown) => {
        if (!cancelled) {
          setPreviewError(error instanceof Error ? error.message : 'Could not render the document preview.');
        }
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });

    return () => {
      cancelled = true;
      container.replaceChildren();
    };
  }, [previewBlob, showPreview]);

  useEffect(() => {
    const container = importedDocumentPreviewRef.current;
    if (!importedDocumentToPreview || !container) return;

    let cancelled = false;
    container.replaceChildren();
    setImportedDocumentRendering(true);
    setImportedDocumentPreviewError('');

    void import('docx-preview')
      .then(({ renderAsync }) => renderAsync(importedDocumentToPreview.blob, container, container, {
        className: 'report-docx',
        breakPages: true,
        ignoreWidth: false,
        ignoreHeight: false,
        ignoreLastRenderedPageBreak: false,
        renderHeaders: true,
        renderFooters: true,
        useBase64URL: true,
      }))
      .catch((error: unknown) => {
        if (!cancelled) {
          setImportedDocumentPreviewError(
            error instanceof Error ? error.message : 'Could not render the imported DOCX preview.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setImportedDocumentRendering(false);
      });

    return () => {
      cancelled = true;
      container.replaceChildren();
    };
  }, [importedDocumentToPreview]);

  const handleGenerate = async () => {
    setLoading(true);
    setStatus('Generating DOCX...');
    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: await createReportRequestBody(form),
      });

      if (!response.ok) {
        const errorMessage = await readErrorMessage(response);
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileTitle = (activeDraft?.title || 'JRMSU')
        .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
        .trim()
        .replace(/[. ]+$/g, '') || 'JRMSU';
      link.download = `${fileTitle}_Narrative_Report.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus('Download started');
      setCompletionSlideIndex(0);
      setShowCompletionPopup(true);
    } catch (error: any) {
      setStatus('Error generating file');
      alert(error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAiDraft = async () => {
    setIsAiDrafting(true);
    setAiDraftError('');
    setStatus('Drafting report text with AI...');
    try {
      const selectFields = (
        source: Record<AiNarrativeFieldKey, string>,
        examples: Record<AiNarrativeFieldKey, string>,
      ) =>
        Object.fromEntries(
          (Object.keys(aiNarrativeFieldLabels) as AiNarrativeFieldKey[])
            .map((key) => [key, userProvidedText(source[key], examples[key], 4000)])
        );
      const requestBody = {
        organization: userProvidedText(form.trainingOrganization, defaultForm.trainingOrganization, 300),
        location: userProvidedText(form.trainingLocation, defaultForm.trainingLocation, 300),
        degreeProgram: userProvidedText(form.degreeProgram, defaultForm.degreeProgram, 300),
        yearLevel: userProvidedText(form.studentYear, defaultForm.studentYear, 100),
        trainingDuration: userProvidedText(form.trainingDuration, defaultForm.trainingDuration, 300),
        report: selectFields(form, defaultForm),
        dailyJournal: getUserJournalActivities(form),
        weeklyNarratives: form.appendices.dailyJournal.flatMap((week, weekIndex) => {
          const narrative = userProvidedText(
            week.narrative,
            defaultForm.appendices.dailyJournal[weekIndex]?.narrative || '',
            1000,
          );
          return narrative ? [{ weekNumber: week.weekNumber, narrative }] : [];
        }),
        schoolPlacement: form.schoolPlacement.enabled
          ? {
              enabled: true,
              organization: userProvidedText(
                form.schoolPlacement.trainingOrganization,
                defaultForm.schoolPlacement.trainingOrganization,
                300,
              ),
              location: userProvidedText(
                form.schoolPlacement.trainingLocation,
                defaultForm.schoolPlacement.trainingLocation,
                300,
              ),
              details: selectFields(form.schoolPlacement, defaultForm.schoolPlacement),
            }
          : { enabled: false },
      };

      const response = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) throw new Error(await readErrorMessage(response));

      const generated: unknown = await response.json();
      if (!isRecord(generated) || !isRecord(generated.report)) {
        throw new Error('The AI service returned an invalid draft. Please try again.');
      }

      const fields: AiDraftField[] = [];
      const appendGeneratedFields = (source: Record<string, unknown>, scope: AiDraftField['scope']) => {
        for (const key of Object.keys(aiNarrativeFieldLabels) as AiNarrativeFieldKey[]) {
          const value = source[key];
          if (typeof value !== 'string') {
            throw new Error('The AI service returned an incomplete draft. Please try again.');
          }
          fields.push({
            scope,
            key,
            label: aiNarrativeFieldLabels[key],
            value,
            selected: true,
          });
        }
      };

      appendGeneratedFields(generated.report, 'report');
      if (form.schoolPlacement.enabled) {
        if (!isRecord(generated.schoolPlacement)) {
          throw new Error('The AI service returned an incomplete school placement draft. Please try again.');
        }
        appendGeneratedFields(generated.schoolPlacement, 'schoolPlacement');
      }

      setAiDrafts(fields);
      setShowAiDraftReview(true);
      setStatus('AI draft ready for review');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI draft generation failed.';
      setAiDraftError(message);
      setStatus('AI draft failed');
    } finally {
      setIsAiDrafting(false);
    }
  };

  const applyAiDrafts = () => {
    const reportUpdates: Partial<Record<AiNarrativeFieldKey, string>> = {};
    const schoolPlacementUpdates: Partial<Record<AiNarrativeFieldKey, string>> = {};
    let selectedCount = 0;

    for (const draft of aiDrafts) {
      if (!draft.selected) continue;
      selectedCount += 1;
      if (draft.scope === 'report') reportUpdates[draft.key] = draft.value;
      else schoolPlacementUpdates[draft.key] = draft.value;
    }

    if (selectedCount === 0) return;
    setForm((previous) => ({
      ...previous,
      ...reportUpdates,
      schoolPlacement: { ...previous.schoolPlacement, ...schoolPlacementUpdates },
    }));
    setShowAiDraftReview(false);
    setStatus(`Applied ${selectedCount} AI-drafted fields. Review the report before exporting.`);
  };

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-slate-950 px-3 sm:px-4 md:px-6 lg:px-8 py-6 pb-24 sm:py-8 sm:pb-8 md:py-12 text-slate-100">
      {monthlyPhotoSelection && (
        <div
          className="fixed inset-0 z-[1600] flex items-center justify-center bg-slate-950/85 p-2 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="monthly-photo-selection-title"
          onKeyDown={(event) => {
            if (event.key === 'Escape') setMonthlyPhotoSelection(null);
          }}
        >
          <div className="flex max-h-[calc(100dvh-1rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-3xl">
            <header className="border-b border-slate-800 p-4 sm:p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Monthly Journal Photos</p>
              <h2 id="monthly-photo-selection-title" className="mt-1 text-xl font-bold text-white">Choose the photos for your monthly layout</h2>
              <p className="mt-2 text-sm text-slate-300">
                Daily entries are grouped by their dates. Switching layouts keeps the original daily entries and photos; only your monthly selections and summaries are updated here. Choose photos and, if useful, generate month-specific summaries from that month’s entries.
              </p>
              <div className="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.06] p-3">
                <p className="text-xs font-semibold text-cyan-100">
                  Detected {monthlyPhotoSelection.groups.filter((group) => group.activityCount > 0).length} month group(s) from daily journal entries
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {monthlyPhotoSelection.groups.filter((group) => group.activityCount > 0).map((group) => (
                    <span key={group.key} className="rounded-full border border-slate-700 bg-slate-950/70 px-2.5 py-1 text-[11px] text-slate-200">
                      {group.label}: {group.activityCount} entr{group.activityCount === 1 ? 'y' : 'ies'}
                      {group.periodCovered ? ` · ${group.periodCovered}` : ''}
                    </span>
                  ))}
                </div>
                {monthlyPhotoSelection.groups.some((group) => group.key === 'month-not-set' && group.activityCount > 0) && (
                  <p className="mt-2 text-xs text-amber-200">
                    Some entries have blank or unrecognized dates and are grouped under MONTH NOT SET. Correct those dates in the daily journal to assign them to a month.
                  </p>
                )}
              </div>
              <label className="mt-4 block text-xs font-semibold text-slate-300">
                What kind of pictures do you want to show? (optional)
                <input
                  type="text"
                  value={monthlyPhotoSelection.preference}
                  onChange={(event) => setMonthlyPhotoSelection((current) => current
                    ? { ...current, preference: event.target.value, error: '' }
                    : current)}
                  placeholder="For example: equipment setup, completed tasks, or group activities"
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                />
                <span className="mt-1 block font-normal text-slate-500">
                  The preference filters captions and activity details to help you find matching photos; you choose the final pictures yourself.
                </span>
              </label>
            </header>
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
              {monthlyPhotoSelection.groups.map((group) => {
                const selectedIds = new Set(group.selectedIds);
                const preferenceWords = monthlyPhotoSelection.preference
                  .toLowerCase()
                  .split(/\s+/)
                  .filter(Boolean);
                const visibleCandidates = group.candidates.filter((candidate) => {
                  const searchableText = `${candidate.description} ${candidate.photo.detail}`.toLowerCase();
                  return preferenceWords.every((word) => searchableText.includes(word));
                });
                const minimum = Math.min(2, group.candidates.length);
                return (
                  <section key={group.key} className="rounded-xl border border-slate-700 bg-slate-950/50 p-3 sm:p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-bold text-white">{group.label}</h3>
                      <span className="text-xs text-slate-400">
                        {group.activityCount > 0
                          ? `${group.activityCount} daily entr${group.activityCount === 1 ? 'y' : 'ies'}${group.periodCovered ? ` · ${group.periodCovered}` : ''} · `
                          : 'No daily entries · '}
                        {group.candidates.length
                          ? `selected ${group.selectedIds.length}, choose ${minimum}–${Math.min(4, group.candidates.length)} photos`
                          : 'no photos available'}
                      </span>
                    </div>
                    {group.candidates.length === 0 ? (
                      <p className="text-sm text-amber-200">
                        No daily photos are available for this month. You can continue and upload monthly photos after switching layouts.
                      </p>
                    ) : visibleCandidates.length === 0 ? (
                      <p className="text-sm text-slate-400">No photo captions or activity details match that preference. Clear or change the preference to see all photos.</p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {visibleCandidates.map((candidate) => {
                          const isSelected = selectedIds.has(candidate.id);
                          const isAtLimit = group.selectedIds.length >= 4;
                          return (
                            <label
                              key={candidate.id}
                              className={`cursor-pointer overflow-hidden rounded-xl border transition ${
                                isSelected ? 'border-cyan-400 ring-2 ring-cyan-500/30' : 'border-slate-700 hover:border-slate-500'
                              } ${!isSelected && isAtLimit ? 'cursor-not-allowed opacity-50' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={!isSelected && isAtLimit}
                                onChange={() => setMonthlyPhotoSelection((current) => {
                                  if (!current) return current;
                                  return {
                                    ...current,
                                    error: '',
                                    groups: current.groups.map((currentGroup) => {
                                      if (currentGroup.key !== group.key) return currentGroup;
                                      const currentSelected = new Set(currentGroup.selectedIds);
                                      if (currentSelected.has(candidate.id)) currentSelected.delete(candidate.id);
                                      else if (currentSelected.size < 4) currentSelected.add(candidate.id);
                                      return {
                                        ...currentGroup,
                                        selectedIds: Array.from(currentSelected),
                                        drafts: {},
                                        generationError: '',
                                      };
                                    }),
                                  };
                                })}
                                className="sr-only"
                              />
                              <img
                                src={candidate.photo.base64}
                                alt={`Photo option for ${group.label}: ${candidate.description}`}
                                className="h-36 w-full object-cover"
                              />
                              <span className="block p-2.5">
                                <span className="block text-xs font-semibold text-slate-100">{candidate.description || candidate.photo.detail}</span>
                                {candidate.id.startsWith('monthly:') && (
                                  <span className="mt-1 block text-[10px] text-cyan-300">Existing monthly photo</span>
                                )}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                    <div className="mt-4 space-y-3 border-t border-slate-800 pt-4">
                      <label className="block text-xs font-semibold text-slate-300">
                        Optional AI focus for {group.label}
                        <input
                          type="text"
                          value={group.generationFocus}
                          disabled={Boolean(aiGenerating)}
                          onChange={(event) => setMonthlyPhotoSelection((current) => current
                            ? {
                                ...current,
                                groups: current.groups.map((currentGroup) => (
                                  currentGroup.key === group.key
                                    ? {
                                        ...currentGroup,
                                        generationFocus: event.target.value,
                                        drafts: {},
                                        generationError: '',
                                      }
                                    : currentGroup
                                )),
                              }
                            : current)}
                          placeholder="Add this month’s details or reflection (optional)"
                          className="mt-1.5 w-full rounded-xl border border-violet-400/25 bg-violet-500/[0.06] px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
                        />
                      </label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block text-xs font-semibold text-slate-300">
                          Output type
                          <select
                            value={group.generationUnit}
                            disabled={Boolean(aiGenerating)}
                            onChange={(event) => setMonthlyPhotoSelection((current) => current
                              ? {
                                  ...current,
                                  groups: current.groups.map((currentGroup) => (
                                    currentGroup.key === group.key
                                      ? {
                                          ...currentGroup,
                                          generationUnit: event.target.value === 'sentences' ? 'sentences' : 'paragraphs',
                                          drafts: {},
                                        }
                                      : currentGroup
                                  )),
                                }
                              : current)}
                            className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100"
                          >
                            <option value="paragraphs">Paragraphs</option>
                            <option value="sentences">Sentences</option>
                          </select>
                        </label>
                        <label className="block text-xs font-semibold text-slate-300">
                          Number of {group.generationUnit}
                          <select
                            value={group.generationCount}
                            disabled={Boolean(aiGenerating)}
                            onChange={(event) => setMonthlyPhotoSelection((current) => current
                              ? {
                                  ...current,
                                  groups: current.groups.map((currentGroup) => (
                                    currentGroup.key === group.key
                                      ? {
                                          ...currentGroup,
                                          generationCount: Number(event.target.value),
                                          drafts: {},
                                        }
                                      : currentGroup
                                  )),
                                }
                              : current)}
                            className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100"
                          >
                            {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => (
                              <option key={count} value={count}>{count}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <div className="grid gap-3 lg:grid-cols-2">
                        {([
                          { field: 'activitiesPerformed', label: 'Activities Performed' },
                          { field: 'learningExperience', label: 'Learning / Experience' },
                        ] as const).map(({ field, label }) => (
                          <div key={field} className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                            <button
                              type="button"
                              onClick={() => void generateMonthlyPhotoSelectionDraft(group.key, field)}
                              disabled={Boolean(aiGenerating)}
                              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/10 px-3 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Sparkles size={15} aria-hidden="true" />
                              {aiGenerating === `monthly-${group.key}-${field}` ? 'Generating...' : `Generate ${label} with AI`}
                            </button>
                            {group.drafts[field] !== undefined && (
                              <>
                                <label className="block text-xs font-semibold text-slate-300">
                                  Review and edit {group.label} · {label}
                                  <textarea
                                    value={group.drafts[field]}
                                    onChange={(event) => setMonthlyPhotoSelection((current) => current
                                      ? {
                                          ...current,
                                          groups: current.groups.map((currentGroup) => (
                                            currentGroup.key === group.key
                                              ? {
                                                  ...currentGroup,
                                                  drafts: {
                                                    ...currentGroup.drafts,
                                                    [field]: event.target.value,
                                                  },
                                                }
                                              : currentGroup
                                          )),
                                        }
                                      : current)}
                                    rows={4}
                                    className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm leading-6 text-slate-100"
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => updateMonthlyJournalSummary(group.key, field, group.drafts[field] || '')}
                                  className="min-h-10 rounded-lg bg-cyan-500 px-3 text-xs font-bold text-slate-950"
                                >
                                  Use this draft for {group.label}
                                </button>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                      {group.generationError && (
                        <p role="alert" className="rounded-lg border border-rose-400/30 bg-rose-950/40 p-3 text-sm text-rose-200">
                          {group.generationError}
                        </p>
                      )}
                      <p className="text-[11px] leading-5 text-slate-400">
                        AI uses only {group.label} daily entries, this month’s selected photos, its monthly summary, and your focus. Tasks or photos alone are not treated as proof of personal learning.
                      </p>
                    </div>
                  </section>
                );
              })}
              {monthlyPhotoSelection.error && (
                <p role="alert" className="rounded-lg border border-rose-400/30 bg-rose-950/40 p-3 text-sm text-rose-200">
                  {monthlyPhotoSelection.error}
                </p>
              )}
            </div>
            <footer className="flex flex-col-reverse gap-3 border-t border-slate-800 p-4 sm:flex-row sm:justify-end sm:p-5">
              <button
                type="button"
                onClick={() => setMonthlyPhotoSelection(null)}
                className="min-h-11 rounded-xl border border-slate-700 px-4 text-sm font-semibold text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveMonthlyPhotoSelection}
                className="min-h-11 rounded-xl bg-cyan-500 px-4 text-sm font-bold text-slate-950"
              >
                Use selected photos and switch layout
              </button>
            </footer>
          </div>
        </div>
      )}

      {showAiDraftReview && (
        <div
          className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-950/85 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-draft-title"
        >
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl sm:rounded-3xl">
            <div className="border-b border-slate-800 p-4 sm:p-6">
              <h2 id="ai-draft-title" className="text-xl font-bold text-white">Review AI-drafted report text</h2>
              <p className="mt-2 text-sm text-slate-300">
                Review and edit each draft before applying it. Uncheck any field you want to keep unchanged.
              </p>
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
              {aiDrafts.map((draft, index) => (
                <section key={`${draft.scope}-${draft.key}`} className="rounded-xl border border-slate-700 bg-slate-950/70 p-3 sm:p-4">
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <input
                      type="checkbox"
                      checked={draft.selected}
                      onChange={(event) => setAiDrafts((previous) => previous.map((item, itemIndex) => (
                        itemIndex === index ? { ...item, selected: event.target.checked } : item
                      )))}
                      className="h-4 w-4 accent-cyan-400"
                    />
                    <span>{draft.scope === 'schoolPlacement' ? 'School placement · ' : ''}{draft.label}</span>
                  </label>
                  <textarea
                    value={draft.value}
                    onChange={(event) => setAiDrafts((previous) => previous.map((item, itemIndex) => (
                      itemIndex === index ? { ...item, value: event.target.value } : item
                    )))}
                    rows={3}
                    className="w-full resize-y rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm leading-6 text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  />
                </section>
              ))}
            </div>
            <div className="flex flex-col-reverse gap-3 border-t border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <button
                type="button"
                onClick={() => setAiDrafts((previous) => previous.map((draft) => ({ ...draft, selected: true })))}

                className="min-h-11 rounded-xl border border-slate-700 px-4 text-sm font-semibold text-slate-200"
              >
                Select all fields
              </button>
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowAiDraftReview(false)}
                  className="min-h-11 rounded-xl border border-slate-700 px-4 text-sm font-semibold text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyAiDrafts}
                  disabled={!aiDrafts.some((draft) => draft.selected)}
                  className="min-h-11 rounded-xl bg-cyan-500 px-4 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Apply selected fields
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mobileAccomplishmentEditor && (
        <div
          className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-950/80 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-accomplishment-title"
          onKeyDown={(event) => {
            if (event.key === 'Escape') setMobileAccomplishmentEditor(null);
          }}
        >
          <div className="flex h-[100dvh] w-full flex-col bg-slate-950 sm:h-[min(80dvh,900px)] sm:max-h-[calc(100dvh-3rem)] sm:max-w-3xl sm:overflow-hidden sm:rounded-2xl sm:border sm:border-slate-700 sm:shadow-[0_25px_80px_rgba(15,23,42,0.8)]">
            <header className="border-b border-slate-800 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:pt-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Daily Journal</p>
              <h2 id="mobile-accomplishment-title" className="mt-1 text-lg font-bold text-white">
                Week {form.appendices.dailyJournal[mobileAccomplishmentEditor.weekIndex]?.weekNumber} · {form.appendices.dailyJournal[mobileAccomplishmentEditor.weekIndex]?.activities[mobileAccomplishmentEditor.dayIndex]?.day || `Day ${mobileAccomplishmentEditor.dayIndex + 1}`}
              </h2>
              <p className="mt-1 text-xs text-slate-400">Accomplishment</p>
            </header>
            <textarea
              autoFocus
              value={mobileAccomplishmentEditor.draft}
              onChange={(event) => setMobileAccomplishmentEditor((current) => current ? { ...current, draft: event.target.value } : current)}
              className="min-h-0 flex-1 resize-none overflow-y-auto overscroll-contain bg-slate-950 px-4 py-4 text-base leading-6 text-slate-100 placeholder:text-slate-500 focus:outline-none sm:px-6"
              placeholder="Describe your accomplishment"
              aria-label="Accomplishment details"
            />
            <footer className="space-y-3 border-t border-slate-800 bg-slate-950 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-4">
              <div className="space-y-3">
                <label htmlFor="journal-generation-focus" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-violet-300">
                  Optional generation focus or main points
                </label>
                <input
                  id="journal-generation-focus"
                  value={mobileAccomplishmentEditor.focus}
                  onChange={(event) => setMobileAccomplishmentEditor((current) => current ? { ...current, focus: event.target.value } : current)}
                  placeholder="Add details to focus on (optional)"
                  className="w-full rounded-xl border border-violet-400/25 bg-violet-500/[0.06] px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-violet-300">
                    Output type
                    <select
                      value={mobileAccomplishmentEditor.unit}
                      onChange={(event) => setMobileAccomplishmentEditor((current) => current ? {
                        ...current,
                        unit: event.target.value === 'sentences' ? 'sentences' : 'paragraphs',
                      } : current)}
                      className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-sm font-medium normal-case tracking-normal text-slate-100 focus:border-violet-400 focus:outline-none"
                    >
                      <option value="paragraphs">Paragraphs</option>
                      <option value="sentences">Sentences</option>
                    </select>
                  </label>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-violet-300">
                    Number of {mobileAccomplishmentEditor.unit}
                    <select
                      value={mobileAccomplishmentEditor.count}
                      onChange={(event) => setMobileAccomplishmentEditor((current) => current ? {
                        ...current,
                        count: Number(event.target.value),
                      } : current)}
                      className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-sm font-medium normal-case tracking-normal text-slate-100 focus:border-violet-400 focus:outline-none"
                    >
                      {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => (
                        <option key={count} value={count}>{count}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              {dailyJournalGenerationError?.weekIndex === mobileAccomplishmentEditor.weekIndex
                && dailyJournalGenerationError.dayIndex === mobileAccomplishmentEditor.dayIndex && (
                  <p role="alert" className="text-sm text-rose-300">{dailyJournalGenerationError.message}</p>
                )}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void generateDailyJournalAccomplishment()}
                  disabled={
                    Boolean(aiGenerating)
                    || !getDailyJournalPhoto(
                      form.appendices.dailyJournal[mobileAccomplishmentEditor.weekIndex],
                      mobileAccomplishmentEditor.dayIndex,
                      form.appendices.dailyJournalLayout,
                    )
                  }
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/10 px-3 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:min-w-36"
                >
                  <Sparkles size={15} aria-hidden="true" />
                  {aiGenerating === `journal-${mobileAccomplishmentEditor.weekIndex}-${mobileAccomplishmentEditor.dayIndex}`
                    ? 'Generating...'
                    : 'Generate with AI'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDailyJournalGenerationError(null);
                    setMobileAccomplishmentEditor(null);
                  }}
                  className="min-h-11 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm font-semibold text-slate-200 sm:flex-none sm:min-w-28"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveMobileAccomplishment}
                  className="min-h-11 flex-1 rounded-xl bg-cyan-500 px-4 text-sm font-bold text-slate-950 sm:flex-none sm:min-w-28"
                >
                  Save
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}

      {showNewDraftDialog && (
        <div
          className="fixed inset-0 z-[1400] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-narrative-title"
          onKeyDown={(event) => {
            if (event.key === 'Escape') setShowNewDraftDialog(false);
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl sm:p-6">
            <h2 id="new-narrative-title" className="text-xl font-bold text-white">Create a new narrative</h2>
            <p className="mt-2 text-sm text-slate-300">Your current report will be saved so you can return to it later.</p>
            <input
              ref={narrativeImportFileRef}
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleNarrativeDocxUpload}
              className="hidden"
              aria-label="Choose a complete narrative DOCX file"
            />
            <label className="mt-5 block text-sm font-medium text-slate-200">
              Narrative name
              <input
                autoFocus
                value={newDraftTitle}
                onChange={(event) => setNewDraftTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !pendingNarrativeImport && !isImportingNarrative) createNarrative();
                }}
                className={fieldClass}
                placeholder="For example, Office OJT"
              />
            </label>
            {narrativeImportError && (
              <p role="alert" className="mt-4 rounded-lg border border-rose-400/30 bg-rose-950/40 p-3 text-sm text-rose-200">
                {narrativeImportError}
              </p>
            )}
            <button
              type="button"
              onClick={() => narrativeImportFileRef.current?.click()}
              disabled={isImportingNarrative}
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20 disabled:cursor-wait disabled:opacity-60"
            >
              <FileText size={17} aria-hidden="true" />
              {isImportingNarrative ? 'Reading DOCX...' : 'Import complete narrative DOCX'}
            </button>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Import the full report and review its pages. Recognized content will be placed into matching editable form fields.
            </p>
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowNewDraftDialog(false)}
                className="min-h-11 rounded-xl border border-slate-700 px-4 text-sm font-semibold text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={createNarrative}
                disabled={isImportingNarrative || pendingNarrativeImport !== null}
                className="min-h-11 rounded-xl bg-cyan-500 px-4 text-sm font-bold text-slate-950"
              >
                Create narrative
              </button>
            </div>
          </div>
        </div>
      )}

      {importedDocumentToPreview && (
        <div
          className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-950/85 p-2 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="narrative-docx-preview-title"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setPendingNarrativeImport(null);
              setPreviewingImportedDocument(null);
            }
          }}
        >
          <div className="flex max-h-[calc(100dvh-1rem)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-3xl">
            <header className="border-b border-slate-800 p-4 sm:p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Full Narrative DOCX Preview</p>
              <h2 id="narrative-docx-preview-title" className="mt-1 break-words text-xl font-bold text-white">
                {importedDocumentToPreview.fileName}
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Read {importedDocumentToPreview.wordCount.toLocaleString()} words. Scroll through the rendered document to review the cover page, acknowledgement, contents, report sections, images, and appendices.
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Recognized headings and labeled details are mapped into their matching editor fields. Text that does not match a known field is preserved in the original DOCX preview.
              </p>
              {pendingNarrativeImport && (
                <div className="mt-3 rounded-lg border border-cyan-500/20 bg-cyan-500/[0.06] p-3 text-xs text-cyan-100">
                  <p className="font-semibold">
                    {pendingNarrativeImport.mappedFields.length
                      ? `Ready to fill ${pendingNarrativeImport.mappedFields.length} editor fields`
                      : 'No matching editor headings found'}
                  </p>
                  {pendingNarrativeImport.mappedFields.length > 0 && (
                    <p className="mt-1 leading-5 text-cyan-100/80">
                      {pendingNarrativeImport.mappedFields.join(' · ')}
                    </p>
                  )}
                  {pendingNarrativeImport.mappedFields.length === 0 && (
                    <p className="mt-1 leading-5 text-cyan-100/80">
                      The new narrative will start with blank fields. Review the document text and update its headings or enter the fields manually.
                    </p>
                  )}
                </div>
              )}
              {pendingNarrativeImport && (
                <label className="mt-3 block text-xs text-slate-300">
                  Narrative name
                  <input
                    value={newDraftTitle}
                    onChange={(event) => setNewDraftTitle(event.target.value)}
                    className={fieldClass}
                    aria-label="Name for imported narrative"
                  />
                </label>
              )}
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5" aria-busy={importedDocumentRendering}>
              {importedDocumentRendering && (
                <p className="mb-3 rounded-lg bg-slate-950/90 px-4 py-2 text-center text-xs font-medium text-cyan-200">
                  Rendering all document pages...
                </p>
              )}
              {importedDocumentPreviewError && (
                <p role="alert" className="mb-3 rounded-lg border border-rose-400/30 bg-rose-950/70 p-4 text-sm text-rose-200">
                  {importedDocumentPreviewError}
                </p>
              )}
              <div ref={importedDocumentPreviewRef} className="report-preview-pages" />
              <details className="mt-5 rounded-xl border border-slate-700 bg-slate-950/70 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-cyan-200">
                  Read extracted document text ({importedDocumentToPreview.wordCount.toLocaleString()} words)
                </summary>
                <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-slate-300">
                  {importedDocumentToPreview.extractedText}
                </pre>
              </details>
            </div>

            <footer className="flex flex-col-reverse gap-3 border-t border-slate-800 p-4 sm:flex-row sm:justify-end sm:p-5">
              <button
                type="button"
                onClick={() => {
                  setPendingNarrativeImport(null);
                  setPreviewingImportedDocument(null);
                }}
                className="min-h-11 rounded-xl border border-slate-700 px-4 text-sm font-semibold text-slate-200"
              >
                {pendingNarrativeImport ? 'Cancel import' : 'Close preview'}
              </button>
              {pendingNarrativeImport && (
                <button
                  type="button"
                  onClick={createNarrativeFromDocx}
                  className="min-h-11 rounded-xl bg-cyan-500 px-4 text-sm font-bold text-slate-950"
                >
                  Import into editor
                </button>
              )}
            </footer>
          </div>
        </div>
      )}

      {pendingJournalImport && (
        <div
          className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-950/85 p-2 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="journal-import-title"
          onKeyDown={(event) => {
            if (event.key === 'Escape') setPendingJournalImport(null);
          }}
        >
          <div className="flex max-h-[calc(100dvh-1rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-3xl">
            <header className="border-b border-slate-800 p-4 sm:p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Daily Journal Import</p>
              <h2 id="journal-import-title" className="mt-1 break-words text-xl font-bold text-white">{pendingJournalImport.fileName}</h2>
              <p className="mt-2 text-sm text-slate-300">
                Found {pendingJournalImport.weeks.length} weeks, {pendingJournalImport.activityCount} days, and {pendingJournalImport.imageCount} day photos.
                {!pendingJournalImport.hoursImported && ' No hours column was found, so hours will be left blank.'}
              </p>
              {pendingJournalImport.daysWithoutImages > 0 && (
                <p className="mt-2 text-xs text-amber-200">
                  {pendingJournalImport.daysWithoutImages} day{pendingJournalImport.daysWithoutImages === 1 ? '' : 's'} have no photo; those entries will stay without an attachment.
                </p>
              )}
              {pendingJournalImport.rowsWithMultipleImages > 0 && (
                <p className="mt-2 text-xs text-amber-200">
                  {pendingJournalImport.rowsWithMultipleImages} day rows contain multiple photos. The importer keeps the first photo in each row, matching the current one-photo-per-day editor.
                </p>
              )}
              <p className="mt-3 rounded-lg border border-cyan-500/20 bg-cyan-500/[0.06] p-3 text-xs text-cyan-100">
                Confirming replaces only the Daily Journal entries. Your selected journal output layout and other report sections will stay unchanged.
              </p>
            </header>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
              {pendingJournalImport.weeks.map((week) => (
                <section key={week.weekNumber} className="overflow-hidden rounded-xl border border-slate-700">
                  <h3 className="border-b border-slate-700 bg-slate-950/70 px-3 py-2 text-sm font-bold text-cyan-200">
                    Week {week.weekNumber} · {week.activities.length} days
                  </h3>
                  <div className="divide-y divide-slate-800">
                    {week.activities.map((activity, dayIndex) => {
                      const photo = week.currentLayoutImages?.[dayIndex];
                      return (
                        <div key={`${week.weekNumber}-${dayIndex}`} className="grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_112px] sm:items-center">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-300">{activity.day} · {activity.date || 'No date'}</p>
                            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-100">{activity.accomplishment || 'No accomplishment text'}</p>
                            {activity.hours !== '' && <p className="mt-1 text-xs text-slate-400">{activity.hours} hours</p>}
                          </div>
                          {photo ? (
                            <img
                              src={photo.base64}
                              alt={`Imported documentation for ${activity.date || activity.day}`}
                              className="h-24 w-full rounded-lg border border-slate-700 object-cover sm:h-20"
                            />
                          ) : (
                            <span className="self-center text-xs text-slate-500">No photo</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            <footer className="flex flex-col-reverse gap-3 border-t border-slate-800 p-4 sm:flex-row sm:justify-end sm:p-5">
              <button
                type="button"
                onClick={() => setPendingJournalImport(null)}
                className="min-h-11 rounded-xl border border-slate-700 px-4 text-sm font-semibold text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDailyJournalImport}
                className="min-h-11 rounded-xl bg-cyan-500 px-4 text-sm font-bold text-slate-950"
              >
                Import Daily Journal
              </button>
            </footer>
          </div>
        </div>
      )}

      {showPreview && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/80 p-2 backdrop-blur-sm sm:p-4">
          <div className="report-preview-dialog relative flex max-h-[calc(100dvh-1rem)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/95 p-3 shadow-[0_25px_80px_rgba(15,23,42,0.8)] sm:max-h-[calc(100dvh-2rem)] sm:rounded-[28px] sm:p-6">
            <div className="report-preview-toolbar mb-3 flex flex-col items-stretch gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300/80 font-semibold">Document Preview</p>
                <h3 className="text-2xl font-bold text-white">Report pages</h3>
              </div>
              <div className="report-preview-controls flex items-center justify-between gap-2 sm:justify-end">
                <div className="flex items-center rounded-xl border border-slate-700 bg-slate-800/80 p-1">
                  <button type="button" onClick={() => setPreviewZoom((zoom) => Math.max(0.3, Number((zoom - 0.05).toFixed(2))))} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-200 transition hover:bg-slate-700 hover:text-white disabled:opacity-40" aria-label="Zoom out" title="Zoom out" disabled={previewZoom <= 0.3}>
                    <ZoomOut size={17} />
                  </button>
                  <span className="min-w-14 px-2 text-center text-xs font-semibold text-cyan-200" aria-live="polite">{Math.round(previewZoom * 100)}%</span>
                  <button type="button" onClick={() => setPreviewZoom((zoom) => Math.min(1.6, Number((zoom + 0.05).toFixed(2))))} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-200 transition hover:bg-slate-700 hover:text-white disabled:opacity-40" aria-label="Zoom in" title="Zoom in" disabled={previewZoom >= 1.6}>
                    <ZoomIn size={17} />
                  </button>
                  <button type="button" onClick={() => setPreviewZoom(window.innerWidth < 640 ? 0.3 : 1)} className="ml-1 flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white" aria-label="Auto fit preview" title="Auto fit">
                    <Maximize2 size={15} />
                    <span>Fit</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowPreview(false);
                    setPreviewBlob(null);
                    setPreviewError('');
                    setPreviewZoom(0.3);
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-200 transition hover:border-slate-500 hover:text-white"
                  aria-label="Close preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="report-preview-viewport relative min-h-48 flex-1 overflow-auto rounded-xl bg-slate-800 p-2 sm:max-h-[75vh] sm:p-4" aria-busy={previewLoading}>
              {previewLoading && (
                <div className="absolute inset-x-0 top-3 z-10 mx-auto w-fit rounded-full bg-slate-950/90 px-4 py-2 text-xs font-medium text-cyan-200 shadow-lg">
                  Rendering report pages...
                </div>
              )}
              {previewError && (
                <p role="alert" className="rounded-lg border border-rose-400/30 bg-rose-950/70 p-4 text-sm text-rose-200">
                  {previewError}
                </p>
              )}
              <div ref={previewContainerRef} className="report-preview-pages" style={{ zoom: previewZoom } as React.CSSProperties} />
            </div>
          </div>
        </div>
      )}

      {showCompletionPopup && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-cyan-500/30 bg-slate-900/95 shadow-[0_25px_80px_rgba(34,211,238,0.18)] ring-1 ring-white/5">
            <button
              type="button"
              onClick={() => setShowCompletionPopup(false)}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-800/80 text-slate-200 transition hover:bg-slate-700/90 hover:text-white"
              aria-label="Close completion popup"
            >
              <X size={16} />
            </button>

            <div className="p-5 pb-4">
              <div className="mb-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-300">Report complete</p>
                <h3 className="mt-2 text-2xl font-black text-white">Ayaw mog saba ni Sir</h3>
              </div>

              <div className="relative overflow-hidden rounded-[22px] border border-slate-700 bg-slate-950/80">
                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${completionSlideIndex * 100}%)` }}
                >
                  <div className="min-w-full">
                    <Image src={memeScene} alt="Meme completion slide" className="h-72 w-full object-cover" sizes="100vw" />
                  </div>
                  <div className="min-w-full">
                    <Image src={completionScene} alt="Completion celebration slide" className="h-72 w-full object-cover" sizes="100vw" />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-center gap-2">
                {[0, 1].map((dot) => (
                  <span
                    key={dot}
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${completionSlideIndex === dot ? 'bg-cyan-400 scale-110' : 'bg-slate-600'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isMounted && (
        <Joyride
          steps={tourSteps}
          run={runTour}
          continuous={true}
          scrollToFirstStep={true}
          onEvent={handleJoyrideCallback}
          tooltipComponent={GuideTooltip}
          options={{
            primaryColor: '#06b6d4',
            backgroundColor: '#0f172a',
            textColor: '#f1f5f9',
            zIndex: 1000,
            overlayColor: 'rgba(15, 23, 42, 0.48)',
            beaconSize: 42,
            arrowColor: '#0f172a',
            scrollOffset: 120,
            scrollDuration: 500,
            spotlightPadding: 18,
            showProgress: true,
          }}
          styles={{
            arrow: {
              color: '#0f172a',
            },
            floater: {
              filter: 'drop-shadow(0 18px 40px rgba(34, 211, 238, 0.15))',
            },
            tooltip: {
              borderRadius: 22,
              padding: 0,
              backgroundColor: 'transparent',
              boxShadow: 'none',
            },
            buttonPrimary: {
              backgroundColor: '#06b6d4',
              borderRadius: 999,
              fontWeight: 700,
              color: '#ffffff',
              padding: '0.7rem 1rem',
            },
            buttonBack: {
              color: '#cbd5e1',
            },
            buttonSkip: {
              color: '#cbd5e1',
            },
          }}
          locale={{
            back: 'Back',
            close: 'Close',
            last: 'Finish',
            next: 'Next',
            skip: 'Skip',
          }}
        />
      )}

      <div className="mx-auto min-w-0 max-w-7xl space-y-8 sm:space-y-12">
        <header className="min-w-0 overflow-hidden rounded-[24px] border border-cyan-500/20 bg-slate-900/80 p-6 shadow-glow backdrop-blur-xl sm:rounded-[32px] sm:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300 sm:text-sm font-semibold">JRMSU</p>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
                Narrative Report Generator
              </h1>
              <p className="text-sm text-slate-300">
                Replace the sample/example details in each form with your actual OJT information while keeping the final Word output neat and presentable.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                onClick={() => setRunTour(true)}
                className="tour-start-btn flex items-center gap-2 rounded-2xl bg-cyan-500/20 px-4 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-sm font-bold text-cyan-300 hover:bg-cyan-500/30 transition-colors border border-cyan-500/30 active:scale-95 touch-auto"
                type="button"
              >
                <HelpCircle size={18} className="sm:w-5 sm:h-5" />
                <span>Show Me How</span>
              </button>

              <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-left sm:px-5 sm:py-3.5 md:text-right">
                <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-200 sm:text-xs font-semibold">Status</p>
                <p className="mt-1.5 text-lg font-bold text-cyan-300 sm:text-xl">{status}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 lg:flex-row lg:items-end lg:justify-between sm:p-5">
          <label className="block min-w-0 flex-1 text-xs font-semibold uppercase tracking-wider text-cyan-300/80">
            Current narrative
            <select
              value={activeDraftId}
              onChange={(event) => switchNarrative(event.target.value)}
              disabled={!isMounted}
              className={`${fieldClass} mt-2 normal-case tracking-normal`}
              aria-label="Select a narrative to edit"
            >
              {drafts.map((draft) => (
                <option key={draft.id} value={draft.id}>{draft.title}</option>
              ))}
            </select>
            <span className="mt-2 block text-xs font-normal normal-case tracking-normal text-slate-400">
              {drafts.length} {drafts.length === 1 ? 'narrative' : 'narratives'} saved in this browser. Changes save automatically.
            </span>
          </label>
          <label className="block min-w-0 flex-1 text-xs font-semibold uppercase tracking-wider text-cyan-300/80">
            Report template
            <select
              value={form.reportTemplate}
              onChange={(event) => updateField('reportTemplate', event.target.value)}
              className={`${fieldClass} mt-2 normal-case tracking-normal`}
              aria-label="Choose report template"
            >
              <option value="current">Template 1 (Current System Layout)</option>
              <option value="docx-template">Template 2 (Narrative Report DOCX)</option>
            </select>
            <span className="mt-2 block text-xs font-normal normal-case tracking-normal text-slate-400">
              Choose the structure used for the generated Word report.
            </span>
          </label>
          <button
            type="button"
            onClick={openNewDraftDialog}
            disabled={!isMounted}
            className="min-h-11 shrink-0 rounded-xl bg-cyan-500 px-5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            + New narrative
          </button>
          {activeDraft?.importedDocument && (
            <button
              type="button"
              onClick={() => {
                setPreviewingImportedDocument(activeDraft.importedDocument || null);
                setImportedDocumentPreviewError('');
              }}
              className="min-h-11 shrink-0 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
            >
              View imported DOCX
            </button>
          )}
        </section>

        <section className="hidden gap-4 sm:grid sm:grid-cols-3 sm:gap-6">
          <Card label="Sections" value="8" color="cyan" />
          <Card label="Format" value="DOCX" color="violet" />
          <Card label="Mode" value="Web" color="emerald" />
        </section>

        <div className="grid min-w-0 gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <form className="tour-form min-w-0 max-w-full space-y-8 rounded-[24px] border border-slate-800 bg-slate-900/80 p-6 sm:rounded-[32px] sm:p-8">
            
            {/* Added tour-front-page class via modified SectionBlock */}
            <SectionBlock title="Front Page Details (Template Fixed)" className="tour-front-page">
              <div className="space-y-5">
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4 text-xs text-slate-300">
                  The cover-page logo, labels, spacing, and layout are fixed by the system. Enter only your report details below.
                </div>
                <div className="grid gap-3 sm:gap-5 md:grid-cols-2">
                  <label className="block text-xs sm:text-sm font-medium text-slate-200">
                    <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">Organization</span>
                    <input value={form.trainingOrganization} onChange={(e) => updateField('trainingOrganization', e.target.value)} className={fieldClass} />
                  </label>
                  <label className="block text-xs sm:text-sm font-medium text-slate-200">
                    <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">Location</span>
                    <input value={form.trainingLocation} onChange={(e) => updateField('trainingLocation', e.target.value)} className={fieldClass} />
                  </label>
                </div>
                <div className="grid gap-3 sm:gap-5 md:grid-cols-2">
                  <label className="block text-xs sm:text-sm font-medium text-slate-200">
                    <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">College/Faculty</span>
                    <input value={form.collegeFaculty} onChange={(e) => updateField('collegeFaculty', e.target.value)} className={fieldClass} />
                  </label>
                  <label className="block text-xs sm:text-sm font-medium text-slate-200">
                    <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">Degree Program</span>
                    <input value={form.degreeProgram} onChange={(e) => updateField('degreeProgram', e.target.value)} className={fieldClass} />
                  </label>
                </div>
                <div className="grid gap-3 sm:gap-5 md:grid-cols-3">
                  <label className="block text-xs sm:text-sm font-medium text-slate-200">
                    <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">Student Name</span>
                    <input value={form.studentName} onChange={(e) => updateField('studentName', e.target.value)} className={fieldClass} />
                  </label>
                  <label className="block text-xs sm:text-sm font-medium text-slate-200">
                    <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">Adviser Name</span>
                    <input value={form.submittedToName} onChange={(e) => updateField('submittedToName', e.target.value)} className={fieldClass} />
                  </label>
                  <label className="block text-xs sm:text-sm font-medium text-slate-200">
                    <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">Title/Position</span>
                    <input value={form.submittedToTitle} onChange={(e) => updateField('submittedToTitle', e.target.value)} className={fieldClass} />
                  </label>
                </div>
                {form.reportTemplate === 'docx-template' && (
                  <div className="grid gap-3 sm:gap-5 md:grid-cols-2">
                    <label className="block text-xs sm:text-sm font-medium text-slate-200">
                      <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">Training Duration</span>
                      <input
                        value={form.trainingDuration}
                        onChange={(e) => updateField('trainingDuration', e.target.value)}
                        placeholder="June 08 – September 21, 2026 (486 HRS)"
                        className={fieldClass}
                      />
                    </label>
                    <label className="block text-xs sm:text-sm font-medium text-slate-200">
                      <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">Student Year Level</span>
                      <input
                        value={form.studentYear}
                        onChange={(e) => updateField('studentYear', e.target.value)}
                        placeholder="3rd Year"
                        className={fieldClass}
                      />
                    </label>
                  </div>
                )}
              </div>
            </SectionBlock>

            <SectionBlock title="Page Layout Style" className="tour-page-layout">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5">
                  <p className="mb-3 text-xs text-slate-300">
                  Choose how the Introduction, Organization Analysis, Tasks and Duties, Case Analysis, and Reflections sections are arranged in the generated Word output.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <label className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200">
                    <input
                      type="radio"
                      name="section-layout"
                      checked={form.sectionLayout === 'compact'}
                      onChange={() => updateField('sectionLayout', 'compact')}
                      className="accent-cyan-400"
                    />
                    Compact layout
                  </label>
                  <label className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200">
                    <input
                      type="radio"
                      name="section-layout"
                      checked={form.sectionLayout === 'onePagePerSection'}
                      onChange={() => updateField('sectionLayout', 'onePagePerSection')}
                      className="accent-cyan-400"
                    />
                    One section per page
                  </label>
                </div>
              </div>
            </SectionBlock>

            <SectionBlock title="1. Acknowledgement" className="tour-acknowledgement">
              <div className="space-y-4 sm:space-y-5">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5">
                  <p className="mb-3 text-xs text-slate-300">The generated Word document uses 1.5 line and paragraph spacing for the acknowledgement through reflection sections.</p>
                </div>
                <label className="block text-xs sm:text-sm font-medium text-slate-200">
                  <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">Student Name</span>
                  <input value={form.studentName} onChange={(e) => updateField('studentName', e.target.value)} className={fieldClass} />
                </label>
                <label className="block text-xs sm:text-sm font-medium text-slate-200">
                  <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">Degree Program</span>
                  <input value={form.degreeProgram} onChange={(e) => updateField('degreeProgram', e.target.value)} className={fieldClass} />
                </label>
                <label className="block text-xs sm:text-sm font-medium text-slate-200">
                  <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">Acknowledgement</span>
                  <ExpandableTextarea
                    title="Acknowledgement"
                    value={form.acknowledgement}
                    onChange={(value) => updateField('acknowledgement', value)}
                    rows={4}
                    onGenerate={(topic) => generateFieldWithAI('acknowledgement', 'Acknowledgement', form.acknowledgement, 'Treat the user focus as the primary guide for whom to acknowledge and what contributions to mention. Use existing acknowledgement and report details only when they directly support that focus. Do not invent recipients or claim gratitude, support, guidance, opportunity, growth, or learning unless the focus or relevant source details explicitly support them. If recipients or contributions are missing, ask the user to provide them.', topic)}
                    generating={aiGenerating === 'acknowledgement'}
                  />
                </label>
              </div>
            </SectionBlock>

            <SectionBlock title="2. Table of Contents" className="tour-table-of-contents">
              <div className="space-y-4 sm:space-y-5">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5">
                  <p className="mb-3 text-xs text-slate-300">
                    {form.reportTemplate === 'docx-template'
                      ? 'The DOCX template layout generates this section automatically from the selected organizations, sections, appendices, and school placement.'
                      : 'This section appears immediately after the acknowledgement in the generated report and helps outline the main narrative sections.'}
                  </p>
                </div>
                {form.reportTemplate === 'docx-template' ? (
                  <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4 text-sm text-slate-300">
                    <span className="block font-semibold text-cyan-200">Automatic table of contents</span>
                    <span className="mt-1 block text-xs leading-relaxed text-slate-400">
                      ACKNOWLEDGEMENT, TABLE OF CONTENTS, LIST OF TABLES / FIGURES, Introduction, Organization / Company Analysis, Tasks and Duties, Case Analysis, Reflections, and Appendices.
                    </span>
                  </div>
                ) : (
                <label className="block text-xs sm:text-sm font-medium text-slate-200">
                  <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">Table of Contents</span>
                  <ExpandableTextarea title="Table of Contents" value={form.tableOfContents} onChange={(value) => updateField('tableOfContents', value)} rows={6} />
                </label>
                )}
              </div>
            </SectionBlock>

            <SectionBlock title="3. Introduction" className="tour-introduction">
              <div className="space-y-4 sm:space-y-5">
                <label className="block text-xs sm:text-sm font-medium text-slate-200">
                  <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">Background</span>
                  <ExpandableTextarea title="Background" value={form.background} onChange={(value) => updateField('background', value)} rows={4} onGenerate={(topic) => generateFieldWithAI('background', 'Background of the Organization', form.background, 'Organize only the organization facts explicitly supplied for this report. Do not infer the office role, history, services, or relevance from its name. If facts are missing, ask the user to provide them.', topic)} generating={aiGenerating === 'background'} />
                </label>
                <div className="grid gap-3 sm:gap-5 md:grid-cols-2">
                  <label className="block text-xs sm:text-sm font-medium text-slate-200">
                    <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">Vision</span>
                    <ExpandableTextarea title="Vision" value={form.vision} onChange={(value) => updateField('vision', value)} rows={3} onGenerate={(topic) => generateFieldWithAI('vision', 'Vision', form.vision, 'Use only an official vision statement explicitly included in the report. If none is provided, state that more information is needed; do not create one.', topic)} generating={aiGenerating === 'vision'} />
                  </label>
                  <label className="block text-xs sm:text-sm font-medium text-slate-200">
                    <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">Mission</span>
                    <ExpandableTextarea title="Mission" value={form.mission} onChange={(value) => updateField('mission', value)} rows={3} onGenerate={(topic) => generateFieldWithAI('mission', 'Mission', form.mission, 'Use only an official mission statement explicitly included in the report. If none is provided, state that more information is needed; do not create one.', topic)} generating={aiGenerating === 'mission'} />
                  </label>
                </div>
                <div className="grid gap-3 sm:gap-5 md:grid-cols-3">
                  <label className="block text-xs sm:text-sm font-medium text-slate-200">
                    <span className="text-emerald-300/70 text-[10px] uppercase tracking-wider block mb-1">Objectives</span>
                    <ExpandableTextarea title="Objectives" value={form.objectives} onChange={(value) => updateField('objectives', value)} rows={3} onGenerate={(topic) => generateFieldWithAI('objectives', 'Objectives', form.objectives, 'Use only objectives explicitly supplied for the organization. Do not create official goals or infer them from the organization name; ask for the source wording if none is provided.', topic)} generating={aiGenerating === 'objectives'} />
                  </label>
                  <label className="block text-xs sm:text-sm font-medium text-slate-200">
                    <span className="text-violet-300/70 text-[10px] uppercase tracking-wider block mb-1">Core Values</span>
                    <ExpandableTextarea title="Core Values" value={form.coreValues} onChange={(value) => updateField('coreValues', value)} rows={3} onGenerate={(topic) => generateFieldWithAI('coreValues', 'Core Values', form.coreValues, 'Use only official core values explicitly provided in the report. If none are provided, state that more information is needed; do not infer them from the organization.', topic)} generating={aiGenerating === 'coreValues'} />
                  </label>
                  <label className="block text-xs sm:text-sm font-medium text-slate-200">
                    <span className="text-orange-300/70 text-[10px] uppercase tracking-wider block mb-1">
                      {form.reportTemplate === 'docx-template' ? 'Products and Services Offered' : 'Services'}
                    </span>
                    <ExpandableTextarea
                      title={form.reportTemplate === 'docx-template' ? 'Products and Services Offered' : 'Services'}
                      value={form.services}
                      onChange={(value) => updateField('services', value)}
                      rows={3}
                      onGenerate={(topic) => generateFieldWithAI('services', 'Products and Services Offered', form.services, 'Describe only products or services explicitly supplied for the organization. Do not infer services from its name, industry, or student duties; ask for source details if they are missing.', topic)}
                      generating={aiGenerating === 'services'}
                    />
                  </label>
                </div>
                <div className="tour-organization-structure rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300/80">OJT Area Reference</p>
                      <p className="mt-1 text-sm text-slate-300">Attach the organization structure to show the people in your specific OJT area.</p>
                    </div>
                    <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-2.5 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300 hover:bg-cyan-400/20">
                      <ImagePlus size={17} aria-hidden="true" />
                      {form.organizationStructureImage ? 'Replace image' : 'Attach image'}
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleOrganizationStructureUpload}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  {form.organizationStructureImage && (
                    <div className="mt-4 overflow-hidden rounded-xl border border-slate-700 bg-slate-950/70">
                      <img
                        src={form.organizationStructureImage}
                        alt="Uploaded organization structure"
                        className="mx-auto max-h-80 w-full object-contain"
                      />
                      <div className="flex items-center justify-between gap-3 border-t border-slate-700 px-3 py-2">
                        <span className="text-xs text-emerald-300">Image attached</span>
                        <button
                          type="button"
                          onClick={() => updateField('organizationStructureImage', '')}
                          className="text-xs font-semibold text-rose-300 transition hover:text-rose-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </SectionBlock>

            <SectionBlock title="3. Organization Analysis" className="tour-organization-analysis">
              <div className="space-y-5">
                <div className="grid gap-3 sm:gap-5 md:grid-cols-2">
                  <label className="block text-xs sm:text-sm font-medium text-slate-200">
                    <span className="text-emerald-300/70 text-[10px] uppercase tracking-wider block mb-1">✓ Strengths</span>
                    <ExpandableTextarea title="Strengths" value={form.strengths} onChange={(value) => updateField('strengths', value)} rows={4} onGenerate={(topic) => generateFieldWithAI('strengths', 'Strengths', form.strengths, 'Rewrite or organize only strengths explicitly supported by supplied organization details. Do not invent staff qualities, resources, performance, or capabilities.', topic)} generating={aiGenerating === 'strengths'} />
                  </label>
                  <label className="block text-xs sm:text-sm font-medium text-slate-200">
                    <span className="text-rose-300/70 text-[10px] uppercase tracking-wider block mb-1">✗ Weaknesses</span>
                    <ExpandableTextarea title="Weaknesses" value={form.weaknesses} onChange={(value) => updateField('weaknesses', value)} rows={4} onGenerate={(topic) => generateFieldWithAI('weaknesses', 'Weaknesses', form.weaknesses, 'Rewrite or organize only weaknesses explicitly supported by supplied organization details. Do not assume resource, staffing, or process problems.', topic)} generating={aiGenerating === 'weaknesses'} />
                  </label>
                  <label className="block text-xs sm:text-sm font-medium text-slate-200">
                    <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">◆ Opportunities</span>
                    <ExpandableTextarea title="Opportunities" value={form.opportunities} onChange={(value) => updateField('opportunities', value)} rows={4} onGenerate={(topic) => generateFieldWithAI('opportunities', 'Opportunities', form.opportunities, 'Rewrite only opportunities supported by explicit organization details or user focus. Do not introduce generic trends or assume plans, resources, or needs.', topic)} generating={aiGenerating === 'opportunities'} />
                  </label>
                  <label className="block text-xs sm:text-sm font-medium text-slate-200">
                    <span className="text-yellow-300/70 text-[10px] uppercase tracking-wider block mb-1">⚠ Threats</span>
                    <ExpandableTextarea title="Threats" value={form.threats} onChange={(value) => updateField('threats', value)} rows={4} onGenerate={(topic) => generateFieldWithAI('threats', 'Threats', form.threats, 'Rewrite only threats explicitly supported by supplied organization details. Do not infer risks from generic industry knowledge.', topic)} generating={aiGenerating === 'threats'} />
                  </label>
                </div>
                <label className="block text-xs sm:text-sm font-medium text-slate-200">
                  <span className="text-blue-300/70 text-[10px] uppercase tracking-wider block mb-1">Recommendations</span>
                  <ExpandableTextarea title="Recommendations" value={form.recommendations} onChange={(value) => updateField('recommendations', value)} rows={4} onGenerate={(topic) => generateFieldWithAI('recommendations', 'Recommendations for Improvement', form.recommendations, 'Make recommendations only in response to a documented need in the supplied organization details or user focus. Do not present a proposed action as completed or invent a problem.', topic)} generating={aiGenerating === 'recommendations'} />
                </label>
              </div>
            </SectionBlock>

            <SectionBlock title="4. Tasks and Duties" className="tour-tasks-duties">
              <div className="space-y-4 sm:space-y-5">
                <label className="block text-xs sm:text-sm font-medium text-slate-200">
                  <span className="text-emerald-300/70 text-[10px] uppercase tracking-wider block mb-1">Assigned Tasks</span>
                  <ExpandableTextarea title="Assigned Tasks" value={form.tasks} onChange={(value) => updateField('tasks', value)} rows={4} onGenerate={(topic) => generateFieldWithAI('tasks', 'Assigned Tasks and Responsibilities', form.tasks, 'Treat the user focus as the primary instruction for which tasks to include. Use the existing draft and journal only for details directly matching that focus. Do not include an introduction, orientation, or team-introduction activity unless the focus asks for it. Do not invent duties or outcomes.', topic)} generating={aiGenerating === 'tasks'} />
                </label>
                <label className="block text-xs sm:text-sm font-medium text-slate-200">
                  <span className="text-blue-300/70 text-[10px] uppercase tracking-wider block mb-1">Procedures Conformed</span>
                  <ExpandableTextarea title="Procedures Conformed" value={form.procedures} onChange={(value) => updateField('procedures', value)} rows={4} onGenerate={(topic) => generateFieldWithAI('procedures', 'Duties and Procedures Conformed', form.procedures, 'Treat the user focus as the primary instruction for which procedures to describe. Use the existing draft and journal only for steps directly matching that focus. Do not introduce unrelated tasks or assume common workplace procedures.', topic)} generating={aiGenerating === 'procedures'} />
                </label>
              </div>
            </SectionBlock>

            <SectionBlock title="5. Case Analysis" className="tour-case-analysis">
              <div className="space-y-5">
                <div className="grid gap-3 sm:gap-5 md:grid-cols-2">
                  <label className="block text-xs sm:text-sm font-medium text-slate-200">
                    <span className="text-rose-300/70 text-[10px] uppercase tracking-wider block mb-1">Problem 1</span>
                    <ExpandableTextarea title="Problem 1" value={form.issue1} onChange={(value) => updateField('issue1', value)} rows={4} onGenerate={(topic) => generateFieldWithAI('issue1', 'Issue / Problem 1', form.issue1, 'Use a documented problem if present. Otherwise, derive one concise potential challenge from the task and objects in the weekly journal, and label it potential, not confirmed. Example: “helped arrange documents and papers” supports “A potential challenge was organizing the documents and papers clearly.” Do not add unstated reasons, setting, systems, standards, policies, protocols, requirements, failures, effects, mistakes, losses, delays, or consequences. If no concrete task supports a challenge, ask for more details.', topic)} generating={aiGenerating === 'issue1'} />
                  </label>
                  <label className="block text-xs sm:text-sm font-medium text-slate-200">
                    <span className="text-emerald-300/70 text-[10px] uppercase tracking-wider block mb-1">Solution 1</span>
                    <ExpandableTextarea title="Solution 1" value={form.issue1Action} onChange={(value) => updateField('issue1Action', value)} rows={4} onGenerate={(topic) => generateFieldWithAI('issue1Action', 'Strategy / Action for Problem 1', form.issue1Action, 'Describe only actions explicitly recorded as taken. Do not invent a solution, steps, or successful outcome.', topic)} generating={aiGenerating === 'issue1Action'} />
                  </label>
                  <label className="block text-xs sm:text-sm font-medium text-slate-200">
                    <span className="text-rose-300/70 text-[10px] uppercase tracking-wider block mb-1">Problem 2</span>
                    <ExpandableTextarea title="Problem 2" value={form.issue2} onChange={(value) => updateField('issue2', value)} rows={4} onGenerate={(topic) => generateFieldWithAI('issue2', 'Issue / Problem 2', form.issue2, 'Use a different explicitly documented problem or a distinct journal task. If you derive a challenge from a task, label it potential, keep it concise, and use only the task and objects named in the journal. Do not add unstated context, policies, standards, effects, or consequences. Do not repeat Problem 1. If no distinct issue is supported, ask for more details.', topic)} generating={aiGenerating === 'issue2'} />
                  </label>
                  <label className="block text-xs sm:text-sm font-medium text-slate-200">
                    <span className="text-emerald-300/70 text-[10px] uppercase tracking-wider block mb-1">Solution 2</span>
                    <ExpandableTextarea title="Solution 2" value={form.issue2Action} onChange={(value) => updateField('issue2Action', value)} rows={4} onGenerate={(topic) => generateFieldWithAI('issue2Action', 'Strategy / Action for Problem 2', form.issue2Action, 'Describe only actions explicitly recorded as taken for the second problem. Do not invent a solution, steps, or successful outcome.', topic)} generating={aiGenerating === 'issue2Action'} />
                  </label>
                </div>
                <label className="block text-xs sm:text-sm font-medium text-slate-200">
                  <span className="text-yellow-300/70 text-[10px] uppercase tracking-wider block mb-1">Lessons Learned</span>
                  <ExpandableTextarea title="Lessons Learned" value={form.lessons} onChange={(value) => updateField('lessons', value)} rows={4} onGenerate={(topic) => generateFieldWithAI('lessons', 'Lessons Learned', form.lessons, 'Write thoughtful lessons learned from the OJT situations without inventing details.', topic)} generating={aiGenerating === 'lessons'} />
                </label>
              </div>
            </SectionBlock>

            <SectionBlock title="6. Reflections" className="tour-reflections">
              <div className="space-y-4 sm:space-y-5">
                <label className="block text-xs sm:text-sm font-medium text-slate-200">
                  <span className="text-violet-300/70 text-[10px] uppercase tracking-wider block mb-1">Self-Evaluation</span>
                  <ExpandableTextarea title="Self-Evaluation" value={form.selfEvaluation} onChange={(value) => updateField('selfEvaluation', value)} rows={4} onGenerate={(topic) => generateFieldWithAI('selfEvaluation', 'Self-Evaluation', form.selfEvaluation, 'Use the user focus as the primary account of this reflection. Use the existing draft and report details only when they directly support that focus. Write in first person, and do not invent skills, feelings, or growth.', topic)} generating={aiGenerating === 'selfEvaluation'} />
                </label>
                <label className="block text-xs sm:text-sm font-medium text-slate-200">
                  <span className="text-violet-300/70 text-[10px] uppercase tracking-wider block mb-1">
                    {form.reportTemplate === 'docx-template' ? 'Relevancy of the Organization' : 'Relevancy to Course & Goals'}
                  </span>
                  <ExpandableTextarea
                    title={form.reportTemplate === 'docx-template' ? 'Relevancy of the Organization' : 'Relevancy to Course & Goals'}
                    value={form.relevancy}
                    onChange={(value) => updateField('relevancy', value)}
                    rows={4}
                    onGenerate={(topic) => generateFieldWithAI('relevancy', 'Relevancy of the Organization', form.relevancy, 'Use the user focus as the primary account of why the organization or experience is relevant. Use other report details only when they directly support that focus. Do not infer career goals, degree relevance, or learning outcomes.', topic)}
                    generating={aiGenerating === 'relevancy'}
                  />
                </label>
              </div>
            </SectionBlock>

            <SectionBlock title="School OJT Narrative (Second Placement)" className="tour-school-placement">
              <div className="space-y-5">
                <label className="flex items-start gap-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/[0.06] p-4 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={form.schoolPlacement.enabled}
                    onChange={(e) => setSchoolPlacementEnabled(e.target.checked)}
                    className="mt-1 accent-cyan-400"
                  />
                  <span>
                    <span className="block font-semibold text-cyan-200">I continued my OJT in another place</span>
                    <span className="mt-1 block text-xs text-slate-400">Enable this to create a separate Introduction through Reflections narrative for the school placement.</span>
                  </span>
                </label>

                {form.schoolPlacement.enabled && (
                  <div className="space-y-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5">
                    <p className="text-xs text-slate-400">
                      Generate with AI from the second-placement fields below. It uses only details entered for this placement; the Acknowledgement above remains shared by the report.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block text-xs sm:text-sm font-medium text-slate-200">
                        <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">School/OJT Unit</span>
                        <input value={form.schoolPlacement.trainingOrganization} onChange={(e) => updateSchoolPlacementField('trainingOrganization', e.target.value)} className={fieldClass} />
                      </label>
                      <label className="block text-xs sm:text-sm font-medium text-slate-200">
                        <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">Location</span>
                        <input value={form.schoolPlacement.trainingLocation} onChange={(e) => updateSchoolPlacementField('trainingLocation', e.target.value)} className={fieldClass} />
                      </label>
                    </div>
                    <PlacementNarrativeFields
                      placement={form.schoolPlacement}
                      reportTemplate={form.reportTemplate}
                      updateField={updateSchoolPlacementField}
                      generateField={generateSchoolPlacementFieldWithAI}
                      generatingField={aiGenerating}
                      onOrganizationImageUpload={handleSchoolOrganizationStructureUpload}
                      onRemoveOrganizationImage={() => updateSchoolPlacementField('organizationStructureImage', '')}
                    />
                  </div>
                )}
              </div>
            </SectionBlock>

            <SectionBlock title="7. Appendices" className="tour-appendices">
              <div className="space-y-6 sm:space-y-8">
                <div className="space-y-5">
                  <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-cyan-300">Daily Journal</h3>
                      <div className="flex flex-wrap justify-end gap-2">
                        <input
                          ref={journalImportFileRef}
                          type="file"
                          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleDailyJournalDocxUpload}
                          className="hidden"
                          aria-label="Choose a Daily Journal DOCX file"
                        />
                        <button
                          type="button"
                          onClick={() => journalImportFileRef.current?.click()}
                          disabled={isImportingJournal}
                          className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-2.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/20 disabled:cursor-wait disabled:opacity-60"
                        >
                          <FileText size={15} aria-hidden="true" />
                          {isImportingJournal ? 'Reading DOCX...' : 'Import DOCX'}
                        </button>
                        <button
                          type="button"
                          onClick={form.appendices.dailyJournalLayout === 'monthly' ? addMonth : addWeek}
                          className="rounded-xl bg-cyan-500/20 px-3 sm:px-3.5 py-2.5 sm:py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/30 transition active:scale-95 whitespace-nowrap"
                        >
                          {form.appendices.dailyJournalLayout === 'monthly' ? '+ Add Month' : '+ Add Week'}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">
                      Import a Word journal table. Day text and photos are matched by their table row; you can review before applying the import.
                    </p>
                    {journalImportError && (
                      <p role="alert" className="rounded-lg border border-rose-400/30 bg-rose-950/40 p-3 text-xs text-rose-200">
                        {journalImportError}
                      </p>
                    )}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Layout</span>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        <label className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200">
                          <input type="radio" name="daily-journal-layout" checked={form.appendices.dailyJournalLayout === 'current'} onChange={() => handleDailyJournalLayoutChange('current')} className="accent-cyan-400" />
                          Weekly layout
                        </label>
                        <label className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200">
                          <input type="radio" name="daily-journal-layout" checked={form.appendices.dailyJournalLayout === 'report'} onChange={() => handleDailyJournalLayoutChange('report')} className="accent-cyan-400" />
                          Daily layout
                        </label>
                        <label className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200">
                          <input type="radio" name="daily-journal-layout" checked={form.appendices.dailyJournalLayout === 'no-photo'} onChange={() => handleDailyJournalLayoutChange('no-photo')} className="accent-cyan-400" />
                          No-picture layout
                        </label>
                        <label className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200">
                          <input type="radio" name="daily-journal-layout" checked={form.appendices.dailyJournalLayout === 'monthly'} onChange={() => handleDailyJournalLayoutChange('monthly')} className="accent-cyan-400" />
                          Monthly layout
                        </label>
                      </div>
                    </div>
                  </div>

                  {form.appendices.dailyJournalLayout === 'monthly' ? (
                    <div className="space-y-5">
                      {getMonthlyJournalGroups(
                        form.appendices.dailyJournal,
                        form.appendices.dailyJournalMonthlySummaries,
                      ).map((month) => {
                        const monthKeyMatch = month.key.match(/^(\d{4}|unspecified)-(\d{1,2})$/);
                        const hasMonthlySummary = Object.prototype.hasOwnProperty.call(
                          form.appendices.dailyJournalMonthlySummaries,
                          month.key,
                        );
                        const canManageMonth = month.activities.length > 0 || hasMonthlySummary;
                        const occupiedMonthKeys = new Set([
                          ...getMonthlyJournalGroups(
                            form.appendices.dailyJournal,
                            form.appendices.dailyJournalMonthlySummaries,
                          )
                            .filter((group) => group.activities.length > 0)
                            .map((group) => group.key),
                          ...Object.keys(form.appendices.dailyJournalMonthlySummaries),
                        ]);
                        return (
                        <section key={month.key} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
                          <header className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-lg font-bold text-white">{month.label}</h3>
                            <div className="flex items-center gap-2">
                              {monthKeyMatch && (
                                monthKeyMatch[1] === 'unspecified' ? (
                                  <select
                                    value={month.key}
                                    onChange={(event) => moveMonthlyJournalMonth(month.key, event.target.value)}
                                    disabled={!canManageMonth}
                                    aria-label={`Change month for ${month.label}`}
                                    title={!canManageMonth ? 'Add details to this missing-month placeholder before changing it.' : 'Change this month'}
                                    className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {MONTH_NAMES.map((name, monthIndex) => {
                                      const optionKey = `unspecified-${monthIndex + 1}`;
                                      return (
                                        <option
                                          key={optionKey}
                                          value={optionKey}
                                          disabled={optionKey !== month.key && occupiedMonthKeys.has(optionKey)}
                                        >
                                          {name}
                                        </option>
                                      );
                                    })}
                                  </select>
                                ) : (
                                  <input
                                    type="month"
                                    value={`${monthKeyMatch[1]}-${String(Number(monthKeyMatch[2])).padStart(2, '0')}`}
                                    onChange={(event) => {
                                      if (event.target.value) {
                                        const [year, selectedMonth] = event.target.value.split('-');
                                        moveMonthlyJournalMonth(month.key, `${year}-${Number(selectedMonth)}`);
                                      }
                                    }}
                                    disabled={!canManageMonth}
                                    aria-label={`Change month for ${month.label}`}
                                    title={!canManageMonth ? 'Add details to this missing-month placeholder before changing it.' : 'Change this month'}
                                    className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                  />
                                )
                              )}
                      <p className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.06] p-3 text-xs leading-5 text-cyan-100">
                        Daily entries are grouped by their dates, and each month has its own Activities Performed and Learning / Experience fields. AI generation uses only the selected month’s entries, summary, and photos. For Learning / Experience, add what you personally learned in the generation focus; tasks and photos alone cannot confirm learning.
                      </p>
                              <button
                                type="button"
                                onClick={() => removeMonthlyJournalMonth(month.key)}
                                disabled={!canManageMonth}
                                title={!canManageMonth ? 'This is an empty placeholder for a missing month.' : `Remove ${month.label}`}
                                className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Remove
                              </button>
                            </div>
                          </header>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="block text-xs font-semibold text-slate-300">
                              Period Covered
                              <input
                                type="text"
                                value={month.periodCovered}
                                onChange={(event) => updateMonthlyJournalSummary(month.key, 'periodCovered', event.target.value)}
                                placeholder="e.g. June 23-30, 2026"
                                className={fieldClass}
                              />
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              <label className="block text-xs font-semibold text-slate-300">
                                Actual Duty Days
                                <input
                                  type="text"
                                  value={month.actualDutyDays}
                                  onChange={(event) => updateMonthlyJournalSummary(month.key, 'actualDutyDays', event.target.value)}
                                  className={fieldClass}
                                />
                              </label>
                              <label className="block text-xs font-semibold text-slate-300">
                                Total Hours Rendered
                                <input
                                  type="text"
                                  value={month.totalHoursRendered}
                                  onChange={(event) => updateMonthlyJournalSummary(month.key, 'totalHoursRendered', event.target.value)}
                                  className={fieldClass}
                                />
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-200">Activities Performed</label>
                            <ExpandableTextarea
                              title={`${month.label} · Activities Performed`}
                              value={month.activitiesPerformed}
                              onChange={(value) => updateMonthlyJournalSummary(month.key, 'activitiesPerformed', value)}
                              placeholder="Summarize the activities performed during this month."
                              onGenerate={(options) => generateMonthlyJournalField(month.key, month.label, 'activitiesPerformed', options)}
                              generating={aiGenerating === `monthly-${month.key}-activitiesPerformed`}
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-200">Learning / Experience</label>
                            <ExpandableTextarea
                              title={`${month.label} · Learning / Experience`}
                              value={month.learningExperience}
                              onChange={(value) => updateMonthlyJournalSummary(month.key, 'learningExperience', value)}
                              placeholder="Describe what you learned or experienced this month."
                              onGenerate={(options) => generateMonthlyJournalField(month.key, month.label, 'learningExperience', options)}
                              generating={aiGenerating === `monthly-${month.key}-learningExperience`}
                            />
                          </div>
                          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 sm:p-4">
                            <label className="block text-xs font-semibold text-slate-300">
                              Monthly Photo Documentation (Max 4)
                              <span className="mt-1 block font-normal text-slate-400">
                                These are the selected photos for this month’s report. Daily photos are copied here only after you select them.
                              </span>
                              <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                multiple
                                onChange={(event) => void handleMonthlyJournalImageUpload(event, month.key)}
                                disabled={(form.appendices.dailyJournalMonthlySummaries[month.key]?.photos?.length || 0) >= 4}
                                className={`${fileInputClass} disabled:cursor-not-allowed disabled:opacity-50`}
                              />
                            </label>
                            {(form.appendices.dailyJournalMonthlySummaries[month.key]?.photos || []).length > 0 && (
                              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                {(form.appendices.dailyJournalMonthlySummaries[month.key]?.photos || []).map((photo, photoIndex) => (
                                  <div key={`${month.key}-photo-${photoIndex}`} className="rounded-lg border border-slate-800 bg-slate-900/70 p-2">
                                    <div className="relative">
                                      <img
                                        src={photo.base64}
                                        alt={photo.detail || `Monthly photo ${photoIndex + 1}`}
                                        className="h-36 w-full rounded-md object-cover"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeMonthlyJournalPhoto(month.key, photoIndex)}
                                        aria-label={`Remove monthly photo ${photoIndex + 1}`}
                                        className="absolute right-2 top-2 rounded-md bg-slate-950/80 px-2 py-1 text-xs font-bold text-rose-300 hover:bg-rose-950"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                    <input
                                      type="text"
                                      value={photo.detail}
                                      onChange={(event) => updateMonthlyJournalPhotoDetail(month.key, photoIndex, event.target.value)}
                                      placeholder="Figure caption"
                                      aria-label={`Caption for monthly photo ${photoIndex + 1}`}
                                      className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </section>
                        );
                      })}
                      {form.appendices.dailyJournal.length === 0 && (
                        <p className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-400">
                          Add a journal week and enter dates to create monthly sections.
                        </p>
                      )}
                    </div>
                  ) : form.appendices.dailyJournalLayout === 'no-photo' ? (
                    <div className="space-y-4">
                      {form.appendices.dailyJournal.map((week, weekIdx) => (
                        <div key={weekIdx} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-white">WEEK {week.weekNumber}</span>
                            {form.appendices.dailyJournal.length > 1 && (
                              <button type="button" onClick={() => removeWeek(weekIdx)} className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded hover:bg-rose-900/20 transition active:scale-95">
                                Remove Week
                              </button>
                            )}
                          </div>
                          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
                            <div className="hidden sm:grid sm:grid-cols-[0.8fr_1fr_3fr_0.8fr] gap-px bg-slate-800 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                              <div className="bg-slate-900/80 px-3 py-2">Day</div>
                              <div className="bg-slate-900/80 px-3 py-2">Date</div>
                              <div className="bg-slate-900/80 px-3 py-2">Accomplishment</div>
                              <div className="bg-slate-900/80 px-3 py-2 text-center">No. of Working Hours</div>
                            </div>
                            <div className="space-y-3 p-2 sm:space-y-0 sm:p-0">
                              {week.activities.map((act, dayIdx) => (
                                <div key={dayIdx} className="grid gap-0 rounded-xl border border-slate-800 bg-slate-950/40 sm:rounded-none sm:border-0 sm:border-t sm:grid-cols-[0.8fr_1fr_3fr_0.8fr] sm:gap-px">
                                  <div className="border-b border-slate-800 p-3 sm:border-b-0 sm:border-r">
                                    <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:hidden">Day</span>
                                    <span className="text-xs text-slate-100">{act.day || `Day ${dayIdx + 1}`}</span>
                                  </div>
                                  <div className="border-b border-slate-800 p-3 sm:border-b-0 sm:border-r">
                                    <div className="mb-2 flex items-center justify-between sm:hidden">
                                      <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">Date</span>
                                      <button type="button" onClick={() => removeDay(weekIdx, dayIdx)} className="rounded-md border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-[9px] font-bold text-rose-300 transition hover:bg-rose-500/20" aria-label={`Delete date ${act.date || `Day ${dayIdx + 1}`}`}>✕</button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <input type="text" value={act.date} onChange={(e) => updateDayActivity(weekIdx, dayIdx, 'date', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none" placeholder="Date" />
                                      <button type="button" onClick={() => removeDay(weekIdx, dayIdx)} className="hidden rounded-md border border-rose-500/40 bg-rose-500/10 px-2 py-1.5 text-[10px] font-bold text-rose-300 transition hover:bg-rose-500/20 sm:inline-flex" aria-label={`Delete date ${act.date || `Day ${dayIdx + 1}`}`}>✕</button>
                                    </div>
                                  </div>
                                  <div className="p-3">
                                    <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:hidden">Accomplishment</span>
                                    <button
                                      type="button"
                                      onClick={() => openMobileAccomplishmentEditor(weekIdx, dayIdx, act.accomplishment)}
                                      aria-label={`Edit accomplishment for ${act.day || `Day ${dayIdx + 1}`}`}
                                      className="flex min-h-11 w-full items-start justify-between gap-2 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-left text-xs text-slate-100"
                                    >
                                      <span className="line-clamp-2 min-w-0 flex-1 whitespace-pre-wrap break-words">{act.accomplishment || 'Tap to add accomplishment'}</span>
                                      <Maximize2 size={15} className="mt-0.5 shrink-0 text-cyan-300" aria-hidden="true" />
                                    </button>
                                    <p className="mt-1 text-[10px] text-slate-500">
                                      {getDailyJournalPhoto(week, dayIdx, form.appendices.dailyJournalLayout)
                                        ? 'Photo available for AI drafting.'
                                        : 'Attach a photo to generate with AI.'}
                                    </p>
                                  </div>
                                  <div className="border-t border-slate-800 p-3 sm:border-t-0 sm:border-l">
                                    <label htmlFor={`no-photo-hours-${weekIdx}-${dayIdx}`} className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:hidden">No. of Working Hours</label>
                                    <input
                                      id={`no-photo-hours-${weekIdx}-${dayIdx}`}
                                      type="number"
                                      min="0"
                                      step="0.5"
                                      value={act.hours}
                                      onChange={(e) => updateDayActivity(weekIdx, dayIdx, 'hours', e.target.value)}
                                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                                      placeholder="Hours"
                                    />
                                  </div>
                                </div>
                              ))}
                              <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-t border-slate-700 bg-slate-900/80 px-3 py-3 sm:grid-cols-[0.8fr_1fr_3fr_0.8fr] sm:gap-px">
                                <div className="font-bold uppercase text-slate-200 sm:col-span-3">Total Number of Hours</div>
                                <div className="text-center font-bold text-white">{week.activities.reduce((total, activity) => total + (Number(activity.hours) || 0), 0)}</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <button type="button" onClick={() => addDay(weekIdx)} className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 px-3 py-1.5 rounded hover:bg-cyan-900/20 transition active:scale-95">
                              + Add Day
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : form.appendices.dailyJournalLayout === 'report' ? (
                    <div className="space-y-4">
                      {form.appendices.dailyJournal.map((week, weekIdx) => (
                        <div key={weekIdx} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-white">WEEK {week.weekNumber} • Total Hours: {week.totalHours}</span>
                            {form.appendices.dailyJournal.length > 1 && (
                              <button type="button" onClick={() => removeWeek(weekIdx)} className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded hover:bg-rose-900/20 transition active:scale-95">
                                Remove Week
                              </button>
                            )}
                          </div>

                          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
                            <div className="hidden sm:grid sm:grid-cols-[1.1fr_1.8fr_0.65fr_2fr] gap-px bg-slate-800 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                            <div className="bg-slate-900/80 px-3 py-2">Date</div>
                            <div className="bg-slate-900/80 px-3 py-2">Accomplishment</div>
                            <div className="bg-slate-900/80 px-3 py-2">Hours</div>
                            <div className="bg-slate-900/80 px-3 py-2">Documentation</div>
                          </div>

                            <div className="space-y-3 p-2 sm:space-y-0 sm:p-0">
                              {week.activities.map((act, dayIdx) => (
                                <div key={dayIdx} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40 sm:rounded-none sm:border-0 sm:border-t sm:bg-slate-950/40">
                                  <div className="grid gap-0 sm:grid-cols-[1.1fr_1.8fr_0.65fr_2fr] sm:gap-px">
                                    <div className="border-b border-slate-800 p-3 sm:border-b-0 sm:border-r">
                                      <div className="mb-2 flex items-center justify-between sm:hidden">
                                        <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">Date</span>
                                        <button type="button" onClick={() => removeDay(weekIdx, dayIdx)} className="rounded-md border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-[9px] font-bold text-rose-300 transition hover:bg-rose-500/20" aria-label={`Delete date ${act.date || `Day ${dayIdx + 1}`}`}>
                                          ✕
                                        </button>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <input type="text" value={act.date} onChange={(e) => updateDayActivity(weekIdx, dayIdx, 'date', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none" placeholder="Date" />
                                        <button type="button" onClick={() => removeDay(weekIdx, dayIdx)} className="hidden rounded-md border border-rose-500/40 bg-rose-500/10 px-2 py-1.5 text-[10px] font-bold text-rose-300 transition hover:bg-rose-500/20 sm:inline-flex" aria-label={`Delete date ${act.date || `Day ${dayIdx + 1}`}`}>
                                          ✕
                                        </button>
                                      </div>
                                    </div>

                                    <div className="border-b border-slate-800 p-3 sm:border-b-0 sm:border-r">
                                      <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:hidden">Accomplishment</span>
                                      <button
                                        type="button"
                                        onClick={() => openMobileAccomplishmentEditor(weekIdx, dayIdx, act.accomplishment)}
                                        aria-label={`Edit accomplishment for ${act.day || `Day ${dayIdx + 1}`}`}
                                        className="flex min-h-11 w-full items-start justify-between gap-2 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-left text-xs text-slate-100"
                                      >
                                        <span className="line-clamp-2 min-w-0 flex-1 whitespace-pre-wrap break-words">{act.accomplishment || 'Tap to add accomplishment'}</span>
                                        <Maximize2 size={15} className="mt-0.5 shrink-0 text-cyan-300" aria-hidden="true" />
                                      </button>
                                      <p className="mt-1 text-[10px] text-slate-500">
                                        {getDailyJournalPhoto(week, dayIdx, form.appendices.dailyJournalLayout)
                                          ? 'Photo available for AI drafting.'
                                          : 'Attach a photo to generate with AI.'}
                                      </p>
                                    </div>

                                    <div className="border-b border-slate-800 p-3 sm:border-b-0 sm:border-r">
                                      <label htmlFor={`daily-hours-${weekIdx}-${dayIdx}`} className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">Hours</label>
                                      <input
                                        id={`daily-hours-${weekIdx}-${dayIdx}`}
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={act.hours}
                                        onChange={(e) => updateDayActivity(weekIdx, dayIdx, 'hours', e.target.value)}
                                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                                        placeholder="Hours"
                                      />
                                    </div>

                                    <div className="p-3">
                                      <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:hidden">Documentation</span>
                                      <div className="space-y-2">
                                        <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={(e) => {
                                          const targetIndex = dayIdx;
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          if (!file.type.startsWith('image/')) {
                                            alert('Please upload an image file (PNG, JPG).');
                                            return;
                                          }
                                          compressImageDataUrl(file, 1200, 0.7).then((compressed) => {
                                            setForm((prev) => {
                                              const newJournal = [...prev.appendices.dailyJournal];
                                              const imageEntry = { base64: compressed, detail: `Documentation for ${act.day || 'Daily activity'}` };
                                              const isReportLayout = prev.appendices.dailyJournalLayout === 'report';

                                              const imageKey = isReportLayout ? 'reportLayoutImages' : 'currentLayoutImages';
                                              const existingImages = [...((newJournal[weekIdx] as any)[imageKey] || [])];
                                              const imageIndex = Math.min(targetIndex, existingImages.length);
                                              existingImages[imageIndex] = imageEntry;
                                              (newJournal[weekIdx] as any)[imageKey] = existingImages;

                                              return { ...prev, appendices: { ...prev.appendices, dailyJournal: newJournal } };
                                            });
                                          }).catch(() => alert('The selected journal image could not be processed.'));
                                        }} className={`${fileInputClass} max-w-full`} />
                                        {(() => {
                                          const isReportLayout = form.appendices.dailyJournalLayout === 'report';
                                          const imageKey = isReportLayout ? 'reportLayoutImages' : 'currentLayoutImages';
                                          const layoutImages = (week as any)[imageKey];
                                          return layoutImages && layoutImages[dayIdx] && (
                                            <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-2">
                                              <img src={layoutImages[dayIdx].base64} alt="Documentation" className="h-20 w-full rounded-md object-cover" />
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <button type="button" onClick={() => addDay(weekIdx)} className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 px-3 py-1.5 rounded hover:bg-cyan-900/20 transition active:scale-95">
                              + Add Day
                            </button>
                            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Daily layout</span>
                          </div>
                        </div>
                      ))}

                      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Report Footer</p>
                        <div className="grid gap-3 md:grid-cols-2">
                          <label className="block text-xs sm:text-sm font-medium text-slate-200">
                            <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">Prepared By Name</span>
                            <input type="text" value={form.appendices.reportFooter.preparedByName} onChange={(e) => updateReportFooter('preparedByName', e.target.value)} className={fieldClass} />
                          </label>
                          <label className="block text-xs sm:text-sm font-medium text-slate-200">
                            <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">Checked By Name</span>
                            <input type="text" value={form.appendices.reportFooter.checkedByName} onChange={(e) => updateReportFooter('checkedByName', e.target.value)} className={fieldClass} />
                          </label>
                          <label className="block text-xs sm:text-sm font-medium text-slate-200 md:col-span-2">
                            <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">Checked By Role</span>
                            <input type="text" value={form.appendices.reportFooter.checkedByRole} onChange={(e) => updateReportFooter('checkedByRole', e.target.value)} className={fieldClass} />
                          </label>
                          <label className="block text-xs sm:text-sm font-medium text-slate-200">
                            <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">Date Value</span>
                            <input type="text" value={form.appendices.reportFooter.dateValue} onChange={(e) => updateReportFooter('dateValue', e.target.value)} className={fieldClass} />
                          </label>
                          <div className="block text-xs sm:text-sm font-medium text-slate-200 md:col-span-2">
                            <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">Office-in-Charge</span>
                            <div className="px-4 py-2 rounded border border-slate-700 bg-slate-800/50 text-slate-300">Office-in-Charge</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {form.appendices.dailyJournal.map((week, weekIdx) => (
                        <div key={weekIdx} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">WEEK {week.weekNumber} (Total Hours: {week.totalHours})</span>
                            {form.appendices.dailyJournal.length > 1 && (
                              <button type="button" onClick={() => removeWeek(weekIdx)} className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded hover:bg-rose-900/20 transition active:scale-95">
                                Remove Week
                              </button>
                            )}
                          </div>
                          <div className="space-y-3">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily Activities</p>
                            {week.activities.map((act, dayIdx) => (
                              <div key={dayIdx} className="grid gap-2 sm:gap-2.5 grid-cols-2 sm:grid-cols-[1fr_1fr_2.5fr_1fr_auto] items-end bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                                <div className="col-span-1">
                                  <label className="text-[9px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">Day</label>
                                  <input type="text" placeholder="Day" value={act.day} onChange={(e) => updateDayActivity(weekIdx, dayIdx, 'day', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs text-slate-100 mt-0.5" />
                                </div>
                                <div className="col-span-1">
                                  <label className="text-[9px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">Date</label>
                                  <input type="text" placeholder="Date" value={act.date} onChange={(e) => updateDayActivity(weekIdx, dayIdx, 'date', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs text-slate-100 mt-0.5" />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                  <label className="text-[9px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">Accomplishment</label>
                                  <button
                                    type="button"
                                    onClick={() => openMobileAccomplishmentEditor(weekIdx, dayIdx, act.accomplishment)}
                                    aria-label={`Edit accomplishment for ${act.day || `Day ${dayIdx + 1}`}`}
                                    className="mt-0.5 flex min-h-11 w-full items-start justify-between gap-2 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-left text-xs text-slate-100"
                                  >
                                    <span className="line-clamp-2 min-w-0 flex-1 whitespace-pre-wrap break-words">{act.accomplishment || 'Tap to add accomplishment'}</span>
                                    <Maximize2 size={15} className="mt-0.5 shrink-0 text-cyan-300" aria-hidden="true" />
                                  </button>
                                  <p className="mt-1 text-[10px] text-slate-500">
                                    {getDailyJournalPhoto(week, dayIdx, form.appendices.dailyJournalLayout)
                                      ? 'Photo available for AI drafting.'
                                      : 'Attach a photo to generate with AI.'}
                                  </p>
                                </div>
                                <div className="col-span-1">
                                  <label className="text-[9px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">Hrs</label>
                                  <input type="number" placeholder="Hrs" value={act.hours} onChange={(e) => updateDayActivity(weekIdx, dayIdx, 'hours', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs text-slate-100 mt-0.5" />
                                </div>
                                <button type="button" onClick={() => removeDay(weekIdx, dayIdx)} className="col-span-1 text-rose-400 text-xs px-2 py-1.5 hover:text-rose-300 rounded hover:bg-rose-900/20">✕</button>
                              </div>
                            ))}
                            <button type="button" onClick={() => addDay(weekIdx)} className="mt-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 px-3 py-1.5 rounded hover:bg-cyan-900/20 transition active:scale-95">
                              + Add Day
                            </button>
                          </div>
                          <label className="block text-sm font-medium text-slate-200 pt-2">
                            Weekly Narrative Report
                            <ExpandableTextarea title="Weekly Narrative Report" value={week.narrative} onChange={(value) => {
                                const newJournal = [...form.appendices.dailyJournal];
                                newJournal[weekIdx].narrative = value;
                                setForm((prev) => ({ ...prev, appendices: { ...prev.appendices, dailyJournal: newJournal } }));
                              }} rows={2} className={fieldClass} onGenerate={(topic) => generateWeeklyNarrative(weekIdx, topic)} generating={aiGenerating === `weekly-${weekIdx}`} />
                          </label>
                          <div className="pt-2">
                            <label className="block text-sm font-medium text-slate-200">
                              Upload Pictures for Week {week.weekNumber} (Max 4)
                              <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={(e) => handleJournalImageUpload(e, weekIdx)} className={fileInputClass} />
                            </label>
                            {(() => {
                              const isReportLayout = form.appendices.dailyJournalLayout === 'report';
                              const imageKey = isReportLayout ? 'reportLayoutImages' : 'currentLayoutImages';
                              const layoutImages = ((week as any)[imageKey] || []) as (JournalPhoto | null)[];
                              const visibleImages = layoutImages.flatMap((image, index) => (
                                image ? [{ image, index }] : []
                              ));
                              const imageCount = visibleImages.length;
                              return imageCount > 0 && (
                                <div className={`mt-4 ${imageCount === 3 ? 'flex flex-wrap justify-center gap-4' : 'grid grid-cols-2 gap-4'}`}>
                                  {visibleImages.map(({ image: img, index: imgIdx }, visibleIdx) => (
                                    <div key={imgIdx} className={`flex flex-col bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition ${imageCount === 3 && visibleIdx === 2 ? 'w-full sm:w-1/2' : ''}`}>
                                      <div className="relative mb-2 overflow-hidden rounded-lg bg-slate-900 h-32 sm:h-40 flex items-center justify-center">
                                        <img src={img.base64} alt="Preview" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => {
                                            const newJournal = [...form.appendices.dailyJournal];
                                            const currentImages = [...((newJournal[weekIdx] as any)[imageKey] as (JournalPhoto | null)[])];
                                            if (currentImages.length === week.activities.length) {
                                              currentImages[imgIdx] = null;
                                            } else {
                                              currentImages.splice(imgIdx, 1);
                                            }
                                            (newJournal[weekIdx] as any)[imageKey] = currentImages;
                                            setForm((prev) => ({ ...prev, appendices: { ...prev.appendices, dailyJournal: newJournal } }));
                                          }} className="absolute top-1 right-1 text-xs text-rose-400 bg-slate-900/80 px-2 py-1 rounded hover:bg-rose-900/60 transition">✕</button>
                                      </div>
                                      <input type="text" placeholder="Caption / Picture Detail" value={img.detail} onChange={(e) => {
                                          const newJournal = [...form.appendices.dailyJournal];
                                          ((newJournal[weekIdx] as any)[imageKey])[imgIdx].detail = e.target.value;
                                          setForm((prev) => ({ ...prev, appendices: { ...prev.appendices, dailyJournal: newJournal } }));
                                        }} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none" />
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <label className="block text-xs sm:text-sm font-medium text-slate-200">
                    <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">PRIME Report Narrative</span>
                    <ExpandableTextarea
                      title="PRIME Report Narrative"
                      value={form.appendices.primeNarrative}
                      onChange={(value) => updateAppendixText('primeNarrative', value)}
                      rows={4}
                      onGenerate={(topic) => generatePrimeNarrativeWithAI(form.appendices.primeNarrative, topic)}
                      generating={aiGenerating === 'primeNarrative'}
                    />
                  </label>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">PRIME Photo Documentation (Max 2)</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      {[0, 1].map((imageIndex) => {
                        const currentImage = form.appendices.primeReportImages?.[imageIndex];
                        return (
                          <div key={imageIndex} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                            <label className="block text-xs font-medium text-slate-200">
                              <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-2">Picture {imageIndex + 1}</span>
                              <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                onChange={(e) => handlePrimeReportImageUpload(e, imageIndex)}
                                className={fileInputClass}
                              />
                            </label>

                            {currentImage && (
                              <div className="mt-3 space-y-2">
                                <img src={currentImage.base64} alt={`PRIME report photo ${imageIndex + 1}`} className="h-32 w-full rounded-lg object-cover border border-slate-700" />
                                <input
                                  type="text"
                                  value={currentImage.detail}
                                  onChange={(e) => updatePrimeReportImageDetail(imageIndex, e.target.value)}
                                  placeholder="Caption below photo"
                                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 sm:gap-5 md:grid-cols-2 pt-2">
                  <FileUpload label="Certificate of Participation (PRIME)" onChange={(e) => handleFileUpload(e, 'certParticipation')} />
                  <FileUpload label="Resume and Application Letter" onChange={(e) => handleFileUpload(e, 'resume')} />
                  <FileUpload label="Evaluation of Grades & Validated Enrolment" onChange={(e) => handleFileUpload(e, 'grades')} />
                  <FileUpload label="Medical Certificate & Parent's Waiver" onChange={(e) => handleFileUpload(e, 'medicalWaiver')} />
                  <FileUpload label="Letter of Acceptance" onChange={(e) => handleFileUpload(e, 'letterAcceptance')} />
                  <FileUpload label="Daily Time Record (DTR)" onChange={(e) => handleFileUpload(e, 'dtr')} />
                  <FileUpload label="Intern Rating Sheet & Eval" onChange={(e) => handleFileUpload(e, 'ratingSheet')} />
                  <FileUpload label="Cert. of Completion & MOA" onChange={(e) => handleFileUpload(e, 'certCompletion')} />
                </div>
              </div>
            </SectionBlock>
          </form>

          <aside className="flex flex-col gap-5 rounded-[24px] border border-slate-800 bg-gradient-to-br from-cyan-500/10 via-slate-900 to-violet-500/10 p-6 sm:rounded-[32px] sm:p-8">
            <h3 className="text-lg font-bold text-white sm:text-xl">Report Preview</h3>
            <div className="space-y-4 text-sm text-slate-300">
              <Box label="Student" value={form.studentName} />
              <Box label="Program" value={form.degreeProgram} />
              <Box label="Organization" value={form.trainingOrganization} />
              {form.schoolPlacement.enabled && (
                <Box label="Second OJT Placement" value={form.schoolPlacement.trainingOrganization} />
              )}
              <Box label="Status" value={status} />
            </div>
            <div className="mt-auto hidden rounded-2xl border border-slate-700 bg-slate-950/70 p-4 sm:block sm:p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 sm:text-xs font-semibold">Current flow</p>
              <div className="mt-4 space-y-3 sm:space-y-3.5">
                {[...sectionOrder.slice(0, -1), ...(form.schoolPlacement.enabled ? ['School OJT Narrative'] : []), sectionOrder[sectionOrder.length - 1]].map((section, index) => (
                  <div key={section} className="flex items-center gap-3.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/15 text-xs font-bold text-cyan-300">{index + 1}</span>
                    <span className="text-sm text-slate-200 sm:text-base font-medium">{section}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handlePreview}
                className="rounded-2xl border border-cyan-500/40 bg-slate-900/80 px-4 py-3.5 text-sm font-semibold text-cyan-300 transition hover:border-cyan-400 hover:bg-slate-800 active:scale-95"
              >
                Preview Report
              </button>
              <button
                type="button"
                onClick={handleAiDraft}
                disabled={isAiDrafting || loading}
                className="flex items-center justify-center gap-2 rounded-2xl border border-violet-400/40 bg-violet-950/40 px-4 py-3.5 text-sm font-semibold text-violet-200 transition hover:border-violet-300 hover:bg-violet-900/50 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
              >
                <Sparkles size={16} aria-hidden="true" />
                {isAiDrafting ? 'Drafting...' : 'Draft with AI'}
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || isAiDrafting}
                className="tour-generate-btn col-span-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
            <p className="text-xs leading-5 text-slate-400">
              AI drafting sends report details and journal text to your configured provider. Review drafts before applying them.
            </p>
            {aiDraftError && (
              <p role="alert" className="rounded-lg border border-rose-400/30 bg-rose-950/60 p-3 text-xs leading-5 text-rose-200">
                {aiDraftError}
              </p>
            )}
          </aside>
        </div>

        <footer className="flex justify-center pb-2">
          <a href="https://ianpadilla-opal.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 transition hover:text-cyan-300">
            Developed by <span className="font-semibold text-cyan-300">Ian P. Padilla</span>
          </a>
        </footer>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 gap-2 border-t border-slate-800 bg-slate-950/95 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-12px_30px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:hidden">
        <button
          type="button"
          onClick={handlePreview}
          className="flex min-h-12 items-center justify-center gap-1 rounded-xl border border-cyan-500/40 bg-slate-900 px-2 text-xs font-semibold text-cyan-200 active:bg-slate-800"
        >
          <Eye size={15} aria-hidden="true" />
          Preview
        </button>
        <button
          type="button"
          onClick={handleAiDraft}
          disabled={isAiDrafting || loading}
          className="flex min-h-12 items-center justify-center gap-1 rounded-xl border border-violet-400/40 bg-violet-950/50 px-2 text-xs font-semibold text-violet-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Sparkles size={15} aria-hidden="true" />
          {isAiDrafting ? 'Drafting' : 'AI draft'}
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || isAiDrafting}
          className="flex min-h-12 items-center justify-center gap-1 rounded-xl bg-cyan-500 px-2 text-xs font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FileText size={15} aria-hidden="true" />
          {loading ? 'Exporting' : 'Export'}
        </button>
      </div>
    </main>
  );
}

// Updated to accept className for the tour targeting
function SectionBlock({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-slate-800 bg-slate-950/60 p-5 sm:rounded-3xl sm:p-6 space-y-5 ${className}`}>
      <h2 className="text-lg font-bold text-white sm:text-xl">{title}</h2>
      {children}
    </section>
  );
}

function FileUpload({ label, onChange }: { label: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label className="block text-sm font-medium text-slate-200 space-y-1.5">
      {label}
      <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={onChange} className={fileInputClass} />
    </label>
  );
}

function Card({ label, value, color }: { label: string; value: string; color: 'cyan' | 'violet' | 'emerald' }) {
  const tone = { cyan: 'text-cyan-300', violet: 'text-violet-300', emerald: 'text-emerald-300' }[color];
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 sm:p-6 space-y-2">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 sm:text-xs font-semibold">{label}</p>
      <p className={`text-2xl font-bold sm:text-4xl ${tone}`}>{value}</p>
    </div>
  );
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 space-y-1.5">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 sm:text-xs font-semibold">{label}</p>
      <p className="text-sm font-semibold text-white sm:text-base">{value}</p>
    </div>
  );
}

function ExpandableTextarea({
  title,
  value,
  onChange,
  rows = 4,
  placeholder,
  className = fieldClass,
  onGenerate,
  generating = false,
  generateDisabled = false,
  generateDisabledMessage = '',
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  className?: string;
  onGenerate?: (options: AIGenerationOptions) => Promise<string | null> | void;
  generating?: boolean;
  generateDisabled?: boolean;
  generateDisabledMessage?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [generationTopic, setGenerationTopic] = useState('');
  const [generationUnit, setGenerationUnit] = useState<AIGenerationLength['unit']>('paragraphs');
  const [generationCount, setGenerationCount] = useState(1);
  const [generationError, setGenerationError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setDraft(value);
  }, [value, isOpen]);

  const openEditor = () => {
    setDraft(value);
    setGenerationTopic('');
    setGenerationUnit('paragraphs');
    setGenerationCount(1);
    setGenerationError('');
    setIsOpen(true);
  };

  return (
    <>
      <div className="space-y-2">
        <button
          type="button"
          onClick={openEditor}
          aria-label={`Edit ${title}`}
          aria-haspopup="dialog"
          className={`${className} group relative flex min-h-24 w-full cursor-pointer items-start justify-between gap-3 text-left`}
        >
          <span className={`line-clamp-3 min-w-0 flex-1 whitespace-pre-wrap break-words ${value ? 'text-slate-100' : 'text-slate-500'}`}>
            {value || placeholder || `Click to add ${title.toLowerCase()}`}
          </span>
          <Maximize2 size={16} className="mt-0.5 shrink-0 text-cyan-300" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-950/80 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Edit ${title}`}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setIsOpen(false);
          }}
        >
          <div className="flex h-[100dvh] w-full flex-col bg-slate-950 sm:h-[min(80dvh,900px)] sm:max-h-[calc(100dvh-3rem)] sm:max-w-3xl sm:overflow-hidden sm:rounded-2xl sm:border sm:border-slate-700 sm:shadow-[0_25px_80px_rgba(15,23,42,0.8)]">
            <header className="border-b border-slate-800 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:pt-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Report Details</p>
              <h2 className="mt-1 text-lg font-bold text-white">{title}</h2>
            </header>
            <textarea
              autoFocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={Math.max(rows, 8)}
              className="min-h-0 flex-1 resize-none overflow-y-auto overscroll-contain bg-slate-950 px-4 py-4 text-base leading-6 text-slate-100 placeholder:text-slate-500 focus:outline-none sm:px-6"
              placeholder={placeholder || `Enter ${title.toLowerCase()}`}
              aria-label={title}
            />
            <footer className="space-y-3 border-t border-slate-800 bg-slate-950 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-4">
              {onGenerate && (
                <div className="space-y-3">
                  {generateDisabled && generateDisabledMessage && (
                    <p className="text-xs text-slate-400">{generateDisabledMessage}</p>
                  )}
                  <label htmlFor={`generation-topic-${title}`} className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-violet-300">
                    Optional generation focus or main points
                  </label>
                  <input
                    id={`generation-topic-${title}`}
                    value={generationTopic}
                    onChange={(event) => setGenerationTopic(event.target.value)}
                    placeholder="Add details to focus on (optional)"
                    className="w-full rounded-xl border border-violet-400/25 bg-violet-500/[0.06] px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-violet-300">
                      Output type
                      <select
                        value={generationUnit}
                        onChange={(event) => setGenerationUnit(event.target.value === 'sentences' ? 'sentences' : 'paragraphs')}
                        className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-sm font-medium normal-case tracking-normal text-slate-100 focus:border-violet-400 focus:outline-none"
                      >
                        <option value="paragraphs">Paragraphs</option>
                        <option value="sentences">Sentences</option>
                      </select>
                    </label>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-violet-300">
                      Number of {generationUnit}
                      <select
                        value={generationCount}
                        onChange={(event) => setGenerationCount(Number(event.target.value))}
                        className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-sm font-medium normal-case tracking-normal text-slate-100 focus:border-violet-400 focus:outline-none"
                      >
                        {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => (
                          <option key={count} value={count}>{count}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              )}
              {generationError && (
                <p role="alert" className="text-sm text-rose-300">
                  {generationError}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                {onGenerate && (
                  <button
                    type="button"
                    onClick={async () => {
                      setGenerationError('');
                      try {
                        const generatedText = await onGenerate({
                          focus: generationTopic,
                          unit: generationUnit,
                          count: generationCount,
                        });
                        if (!generatedText?.trim()) {
                          throw new Error('The AI service returned no text. Please try again.');
                        }
                        setDraft(generatedText.trim());
                      } catch (error) {
                        setGenerationError(error instanceof Error ? error.message : 'Could not generate text. Please try again.');
                      }
                    }}
                    disabled={generating || generateDisabled}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/10 px-3 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20 disabled:cursor-wait disabled:opacity-60 sm:flex-none sm:min-w-36"
                  >
                    <Sparkles size={15} aria-hidden="true" />
                    {generating
                      ? 'Generating...'
                      : 'Generate with AI'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="min-h-11 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm font-semibold text-slate-200 sm:flex-none sm:min-w-28"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange(draft);
                    setIsOpen(false);
                  }}
                  className="min-h-11 flex-1 rounded-xl bg-cyan-500 px-4 text-sm font-bold text-slate-950 sm:flex-none sm:min-w-28"
                >
                  Save
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}

function PlacementNarrativeFields({
  placement,
  reportTemplate,
  updateField,
  generateField,
  generatingField,
  onOrganizationImageUpload,
  onRemoveOrganizationImage,
}: {
  placement: typeof defaultForm.schoolPlacement;
  reportTemplate: typeof defaultForm.reportTemplate;
  updateField: (key: keyof typeof defaultForm.schoolPlacement, value: string) => void;
  generateField: (
    key: AiNarrativeFieldKey,
    title: string,
    currentText: string,
    instructions: string,
    options: AIGenerationOptions,
  ) => Promise<string | null>;
  generatingField: string;
  onOrganizationImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveOrganizationImage: () => void;
}) {
  const schoolFieldAI = (
    key: AiNarrativeFieldKey,
    title: string,
    instructions: string,
  ) => ({
    onGenerate: (options: AIGenerationOptions) => generateField(
      key,
      title,
      placement[key],
      instructions,
      options,
    ),
    generating: generatingField === `schoolPlacement.${key}`,
  });

  return (
    <div className="space-y-5">
      <SectionBlock title="1. Introduction">
        <div className="space-y-4 sm:space-y-5">
          <label className="block text-xs sm:text-sm font-medium text-slate-200">
            <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">Background</span>
            <ExpandableTextarea
              title="School OJT Background"
              value={placement.background}
              onChange={(value) => updateField('background', value)}
              rows={4}
              {...schoolFieldAI('background', 'School OJT Background', 'Use only explicit school-placement details. Do not invent institutional history, dates, roles, or services; ask for source information if it is missing.')}
            />
          </label>
          <div className="grid gap-3 sm:gap-5 md:grid-cols-2">
            <label className="block text-xs sm:text-sm font-medium text-slate-200">
              <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">Vision</span>
              <ExpandableTextarea
                title="School OJT Vision"
                value={placement.vision}
                onChange={(value) => updateField('vision', value)}
                rows={3}
                {...schoolFieldAI('vision', 'School OJT Vision', 'Use only the official vision statement explicitly supplied for this second placement. If it is not supplied, ask the user to provide it; do not infer or invent official wording.')}
              />
            </label>
            <label className="block text-xs sm:text-sm font-medium text-slate-200">
              <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">Mission</span>
              <ExpandableTextarea
                title="School OJT Mission"
                value={placement.mission}
                onChange={(value) => updateField('mission', value)}
                rows={3}
                {...schoolFieldAI('mission', 'School OJT Mission', 'Use only the official mission statement explicitly supplied for this second placement. If it is not supplied, ask the user to provide it; do not infer or invent official wording.')}
              />
            </label>
          </div>
          <div className="grid gap-3 sm:gap-5 md:grid-cols-3">
            <label className="block text-xs sm:text-sm font-medium text-slate-200">
              <span className="text-emerald-300/70 text-[10px] uppercase tracking-wider block mb-1">Objectives</span>
              <ExpandableTextarea
                title="School OJT Objectives"
                value={placement.objectives}
                onChange={(value) => updateField('objectives', value)}
                rows={3}
                {...schoolFieldAI('objectives', 'School OJT Objectives', 'Use only explicit objectives supplied for this second placement. Do not create official goals or claims; request the source wording if it is missing.')}
              />
            </label>
            <label className="block text-xs sm:text-sm font-medium text-slate-200">
              <span className="text-violet-300/70 text-[10px] uppercase tracking-wider block mb-1">Core Values</span>
              <ExpandableTextarea
                title="School OJT Core Values"
                value={placement.coreValues}
                onChange={(value) => updateField('coreValues', value)}
                rows={3}
                {...schoolFieldAI('coreValues', 'School OJT Core Values', 'Use only explicit core values supplied for this second placement. Do not invent official values; request the source wording if it is missing.')}
              />
            </label>
            <label className="block text-xs sm:text-sm font-medium text-slate-200">
              <span className="text-orange-300/70 text-[10px] uppercase tracking-wider block mb-1">
                {reportTemplate === 'docx-template' ? 'Products and Services Offered' : 'Services'}
              </span>
              <ExpandableTextarea
                title={reportTemplate === 'docx-template' ? 'School OJT Products and Services Offered' : 'School OJT Services'}
                value={placement.services}
                onChange={(value) => updateField('services', value)}
                rows={3}
                {...schoolFieldAI('services', 'School OJT Services', 'Describe only services explicitly supplied for this second placement. Do not assume the organization provides particular services; ask for source details if they are missing.')}
              />
            </label>
          </div>
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300/80">School OJT Area Reference</p>
                <p className="mt-1 text-sm text-slate-300">Attach the organization structure for the school-based OJT area.</p>
              </div>
              <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-2.5 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300 hover:bg-cyan-400/20">
                {placement.organizationStructureImage ? 'Replace image' : 'Attach image'}
                <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={onOrganizationImageUpload} className="sr-only" />
              </label>
            </div>
            {placement.organizationStructureImage && (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-700 bg-slate-950/70">
                <img src={placement.organizationStructureImage} alt="Uploaded school organization structure" className="mx-auto max-h-80 w-full object-contain" />
                <div className="flex items-center justify-between gap-3 border-t border-slate-700 px-3 py-2">
                  <span className="text-xs text-emerald-300">Image attached</span>
                  <button type="button" onClick={onRemoveOrganizationImage} className="text-xs font-semibold text-rose-300 transition hover:text-rose-200">Remove</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </SectionBlock>

      <SectionBlock title="2. Organization Analysis">
        <div className="space-y-5">
          <div className="grid gap-3 sm:gap-5 md:grid-cols-2">
            {(['strengths', 'weaknesses', 'opportunities', 'threats'] as const).map((key) => (
              <label key={key} className="block text-xs sm:text-sm font-medium text-slate-200">
                <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">{key}</span>
                <ExpandableTextarea
                  title={`School OJT ${key}`}
                  value={placement[key]}
                  onChange={(value) => updateField(key, value)}
                  rows={4}
                  {...schoolFieldAI(key, `School OJT ${key}`, 'Use only details supplied for this second placement. Keep the analysis specific to the entered facts and do not invent conditions, outcomes, or organizational claims.')}
                />
              </label>
            ))}
          </div>
          <label className="block text-xs sm:text-sm font-medium text-slate-200">
            <span className="text-blue-300/70 text-[10px] uppercase tracking-wider block mb-1">Recommendations</span>
            <ExpandableTextarea
              title="School OJT Recommendations"
              value={placement.recommendations}
              onChange={(value) => updateField('recommendations', value)}
              rows={4}
              {...schoolFieldAI('recommendations', 'School OJT Recommendations', 'Base recommendations only on documented details for this second placement. Clearly keep recommendations as proposed actions, not actions already completed.')}
            />
          </label>
        </div>
      </SectionBlock>

      <SectionBlock title="3. Tasks and Duties">
        <div className="space-y-4 sm:space-y-5">
          <label className="block text-xs sm:text-sm font-medium text-slate-200">
            <span className="text-emerald-300/70 text-[10px] uppercase tracking-wider block mb-1">Assigned Tasks</span>
            <ExpandableTextarea
              title="School OJT Assigned Tasks"
              value={placement.tasks}
              onChange={(value) => updateField('tasks', value)}
              rows={4}
              {...schoolFieldAI('tasks', 'School OJT Assigned Tasks', 'Treat the user focus as the primary instruction for which second-placement tasks to include. Use the existing draft only for details that match the focus. Do not import work from the first placement, include unrelated introduction activities, or invent tools, procedures, or results.')}
            />
          </label>
          <label className="block text-xs sm:text-sm font-medium text-slate-200">
            <span className="text-blue-300/70 text-[10px] uppercase tracking-wider block mb-1">Procedures Conformed</span>
            <ExpandableTextarea
              title="School OJT Procedures Conformed"
              value={placement.procedures}
              onChange={(value) => updateField('procedures', value)}
              rows={4}
              {...schoolFieldAI('procedures', 'School OJT Procedures Conformed', 'Treat the user focus as the primary instruction for which second-placement procedures to describe. Use the existing draft only for steps that match the focus. Do not import work from the first placement or invent policies, standards, or steps.')}
            />
          </label>
        </div>
      </SectionBlock>

      <SectionBlock title="4. Case Analysis">
        <div className="space-y-5">
          <div className="grid gap-3 sm:gap-5 md:grid-cols-2">
            {([['issue1', 'Problem 1'], ['issue1Action', 'Solution 1'], ['issue2', 'Problem 2'], ['issue2Action', 'Solution 2']] as const).map(([key, label]) => (
              <label key={key} className="block text-xs sm:text-sm font-medium text-slate-200">
                <span className="text-cyan-300/70 text-[10px] uppercase tracking-wider block mb-1">{label}</span>
                <ExpandableTextarea
                  title={`School OJT ${label}`}
                  value={placement[key]}
                  onChange={(value) => updateField(key, value)}
                  rows={4}
                  {...schoolFieldAI(key, `School OJT ${label}`, key.endsWith('Action')
                    ? 'Report only actions actually taken in the second placement and explicitly supported by its task details or the user focus. If no steps are documented, ask the user to provide them; never invent a solution or successful result.'
                    : 'Use a documented issue if supplied. Otherwise describe one clearly labeled potential challenge grounded in a concrete second-placement task. Do not add a solution, recommendation, outcome, or unsupported personal experience.')}
                />
              </label>
            ))}
          </div>
          <label className="block text-xs sm:text-sm font-medium text-slate-200">
            <span className="text-yellow-300/70 text-[10px] uppercase tracking-wider block mb-1">Lessons Learned</span>
            <ExpandableTextarea
              title="School OJT Lessons Learned"
              value={placement.lessons}
              onChange={(value) => updateField('lessons', value)}
              rows={4}
              {...schoolFieldAI('lessons', 'School OJT Lessons Learned', 'Derive lessons only from the documented second-placement tasks and situations. Do not invent skills, incidents, or outcomes.')}
            />
          </label>
        </div>
      </SectionBlock>

      <SectionBlock title="5. Reflections">
        <div className="space-y-4 sm:space-y-5">
          <label className="block text-xs sm:text-sm font-medium text-slate-200">
            <span className="text-violet-300/70 text-[10px] uppercase tracking-wider block mb-1">Self-Evaluation</span>
            <ExpandableTextarea
              title="School OJT Self-Evaluation"
              value={placement.selfEvaluation}
              onChange={(value) => updateField('selfEvaluation', value)}
              rows={4}
              {...schoolFieldAI('selfEvaluation', 'School OJT Self-Evaluation', 'Use the user focus as the primary account of this second-placement reflection. Use the existing draft and other second-placement details only when they directly support that focus. Write in first person and do not invent a skill, achievement, or experience.')}
            />
          </label>
          <label className="block text-xs sm:text-sm font-medium text-slate-200">
            <span className="text-violet-300/70 text-[10px] uppercase tracking-wider block mb-1">
              {reportTemplate === 'docx-template' ? 'Relevancy of the Organization' : 'Relevancy to Course & Goals'}
            </span>
            <ExpandableTextarea
              title={reportTemplate === 'docx-template' ? 'School OJT Relevancy of the Organization' : 'School OJT Relevancy to Course & Goals'}
              value={placement.relevancy}
              onChange={(value) => updateField('relevancy', value)}
              rows={4}
              {...schoolFieldAI('relevancy', 'School OJT Relevancy of the Organization', 'Use the user focus as the primary account of why this second placement is relevant. Use other second-placement details only when they directly support that focus. Do not infer the student’s course, career goals, or learning outcomes.')}
            />
          </label>
        </div>
      </SectionBlock>
    </div>
  );
}
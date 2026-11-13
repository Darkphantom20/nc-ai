export type MonthlyJournalSummary = {
  periodCovered?: string;
  actualDutyDays?: string;
  totalHoursRendered?: string;
  activitiesPerformed?: string;
  learningExperience?: string;
  photos?: { base64: string; detail: string }[];
};

export type MonthlyJournalActivity = {
  day: string;
  date: string;
  accomplishment: string;
  hours: number | string;
};

export type MonthlyJournalWeek = {
  weekNumber: number;
  activities: MonthlyJournalActivity[];
};

export type MonthlyJournalGroup = {
  key: string;
  label: string;
  activities: {
    weekIndex: number;
    dayIndex: number;
    weekNumber: number;
    activity: MonthlyJournalActivity;
  }[];
  periodCovered: string;
  actualDutyDays: string;
  totalHoursRendered: string;
  activitiesPerformed: string;
  learningExperience: string;
};

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function normalizeJournalDate(date: string, fallbackYear?: number): string | null {
  const trimmedDate = date.trim();
  if (!trimmedDate) return null;

  const isoDate = trimmedDate.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoDate) {
    return makeIsoDate(Number(isoDate[1]), Number(isoDate[2]), Number(isoDate[3]));
  }

  const numericDate = trimmedDate.match(/^(\d{1,2})[-/](\d{1,2})(?:[-/](\d{2,4}))?$/);
  if (numericDate) {
    const year = numericDate[3]
      ? normalizeJournalYear(Number(numericDate[3]))
      : fallbackYear;
    if (!year) return null;
    return makeIsoDate(year, Number(numericDate[1]), Number(numericDate[2]));
  }

  const monthIndex = MONTH_NAMES.findIndex((month) => (
    new RegExp(`\\b${month}\\b|\\b${month.slice(0, 3)}\\b`, 'i').test(trimmedDate)
  ));
  if (monthIndex < 0) return null;

  const yearMatch = trimmedDate.match(/\b(?:19|20)\d{2}\b/);
  const year = yearMatch ? Number(yearMatch[0]) : fallbackYear;
  if (!year) return null;

  const day = trimmedDate
    .match(/\b\d{1,2}\b/g)
    ?.map(Number)
    .find((number) => number >= 1 && number <= 31);
  if (!day) return null;
  return makeIsoDate(year, monthIndex + 1, day);
}

export function isJournalDateOnOrAfter(
  date: string,
  startDate: string,
): boolean | null {
  const start = normalizeJournalDate(startDate);
  if (!start) return null;
  const fallbackYear = Number(start.slice(0, 4));
  const activity = normalizeJournalDate(date, fallbackYear);
  if (!activity) return null;
  return activity >= start;
}

export type JournalPlacement = 'first' | 'school' | 'transition' | 'unknown';

export function getJournalPlacement(
  date: string,
  firstPlacementEndDate: string,
  secondPlacementStartDate: string,
): JournalPlacement {
  const firstEnd = firstPlacementEndDate ? normalizeJournalDate(firstPlacementEndDate) : null;
  const secondStart = secondPlacementStartDate ? normalizeJournalDate(secondPlacementStartDate) : null;
  const boundaryYear = secondStart || firstEnd;
  const yearsDiffer = firstEnd && secondStart && firstEnd.slice(0, 4) !== secondStart.slice(0, 4);
  const hasExplicitYear = /\b(?:19|20)\d{2}\b/.test(date)
    || /^\s*\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\s*$/.test(date);
  if (yearsDiffer && !hasExplicitYear) return 'unknown';
  const activity = normalizeJournalDate(date, boundaryYear ? Number(boundaryYear.slice(0, 4)) : undefined);
  if (!activity) return 'unknown';
  if (secondStart && activity >= secondStart) return 'school';
  if (firstEnd && activity <= firstEnd) return 'first';
  if (firstEnd && secondStart && activity > firstEnd && activity < secondStart) return 'transition';
  if (secondStart) return 'first';
  if (firstEnd) return 'unknown';
  return 'first';
}

function normalizeJournalYear(year: number): number {
  return year < 100 ? (year < 50 ? 2000 + year : 1900 + year) : year;
}

function makeIsoDate(year: number, month: number, day: number): string | null {
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year
    || parsed.getUTCMonth() !== month - 1
    || parsed.getUTCDate() !== day
  ) {
    return null;
  }
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getActivityMonth(date: string): { monthIndex: number; year: string } | null {
  const trimmedDate = date.trim();
  if (!trimmedDate) return null;

  const namedMonthIndex = MONTH_NAMES.findIndex((month) => (
    new RegExp(`\\b${month}\\b|\\b${month.slice(0, 3)}\\b`, 'i').test(trimmedDate)
  ));
  const year = trimmedDate.match(/\b(?:19|20)\d{2}\b/)?.[0] || '';
  if (namedMonthIndex >= 0) {
    const normalizedDate = normalizeJournalDate(trimmedDate, 2000);
    if (!normalizedDate || Number(normalizedDate.slice(5, 7)) !== namedMonthIndex + 1) return null;
    return { monthIndex: namedMonthIndex, year: year || '' };
  }

  const numericDate = trimmedDate.match(/\b(?:(\d{4})[-/](\d{1,2})[-/]\d{1,2}|(\d{1,2})[-/]\d{1,2}(?:[-/](\d{2,4}))?)\b/);
  if (!numericDate) return null;
  const normalizedDate = normalizeJournalDate(trimmedDate, 2000);
  if (!normalizedDate) return null;
  const monthNumber = Number(normalizedDate.slice(5, 7));
  if (monthNumber < 1 || monthNumber > 12) return null;
  return {
    monthIndex: monthNumber - 1,
    year: numericDate[1] || numericDate[4]
      ? normalizedDate.slice(0, 4)
      : '',
  };
}

export function getMonthlyJournalGroups(
  weeks: readonly MonthlyJournalWeek[],
  summaries: Record<string, MonthlyJournalSummary> = {},
): MonthlyJournalGroup[] {
  const groups = new Map<string, MonthlyJournalGroup>();
  const explicitYears = new Set([
    ...weeks.flatMap((week) => week.activities
      .map((activity) => getActivityMonth(activity.date)?.year || '')
      .filter(Boolean)),
    ...Object.keys(summaries)
      .map((key) => key.match(/^(\d{4})-\d{1,2}$/)?.[1] || '')
      .filter(Boolean),
  ]);
  const inferredYear = explicitYears.size === 1 ? Array.from(explicitYears)[0] : '';

  weeks.forEach((week, weekIndex) => {
    week.activities.forEach((activity, dayIndex) => {
      const month = getActivityMonth(activity.date);
      if (month && !month.year) month.year = inferredYear;
      const key = month ? `${month.year || 'unspecified'}-${month.monthIndex + 1}` : 'month-not-set';
      const label = month
        ? `${MONTH_NAMES[month.monthIndex].toUpperCase()}${month.year ? ` ${month.year}` : ''}`
        : 'MONTH NOT SET';
      const group = groups.get(key) || {
        key,
        label,
        activities: [],
        periodCovered: '',
        actualDutyDays: '',
        totalHoursRendered: '',
        activitiesPerformed: '',
        learningExperience: '',
      };
      group.activities.push({ weekIndex, dayIndex, weekNumber: week.weekNumber, activity });
      groups.set(key, group);
    });
  });

  Object.keys(summaries).forEach((key) => {
    if (groups.has(key)) return;
    const keyMatch = key.match(/^(\d{4}|unspecified)-(\d{1,2})$/);
    const monthIndex = keyMatch ? Number(keyMatch[2]) - 1 : -1;
    if (monthIndex < 0 || monthIndex >= MONTH_NAMES.length) return;
    groups.set(key, {
      key,
      label: `${MONTH_NAMES[monthIndex].toUpperCase()}${keyMatch?.[1] === 'unspecified' ? '' : ` ${keyMatch?.[1]}`}`,
      activities: [],
      periodCovered: '',
      actualDutyDays: '',
      totalHoursRendered: '',
      activitiesPerformed: '',
      learningExperience: '',
    });
  });

  const datedMonths = Array.from(groups.keys())
    .map((key) => {
      const match = key.match(/^(\d{4}|unspecified)-(\d{1,2})$/);
      if (!match) return null;
      const year = match[1];
      const month = Number(match[2]);
      const ordinal = year === 'unspecified' ? month - 1 : Number(year) * 12 + month - 1;
      return { year, month, ordinal };
    })
    .filter((month): month is { year: string; month: number; ordinal: number } => month !== null)
    .sort((left, right) => (
      left.year === right.year
        ? left.ordinal - right.ordinal
        : left.year === 'unspecified'
          ? -1
          : right.year === 'unspecified'
            ? 1
            : Number(left.year) - Number(right.year)
    ));

  for (let index = 1; index < datedMonths.length; index += 1) {
    const previous = datedMonths[index - 1];
    const current = datedMonths[index];
    if ((previous.year === 'unspecified') !== (current.year === 'unspecified')) continue;
    const gap = current.ordinal - previous.ordinal;
    if (gap < 2 || gap > 12) continue;

    for (let offset = 1; offset < gap; offset += 1) {
      const ordinal = previous.ordinal + offset;
      const year = previous.year === 'unspecified'
        ? 'unspecified'
        : String(Math.floor(ordinal / 12));
      const month = (ordinal % 12) + 1;
      const key = `${year}-${month}`;
      if (groups.has(key)) continue;
      groups.set(key, {
        key,
        label: `${MONTH_NAMES[month - 1].toUpperCase()}${year === 'unspecified' ? '' : ` ${year}`}`,
        activities: [],
        periodCovered: '',
        actualDutyDays: '',
        totalHoursRendered: '',
        activitiesPerformed: '',
        learningExperience: '',
      });
    }
  }

  return Array.from(groups.values())
    .sort((left, right) => left.key === 'month-not-set'
      ? 1
      : right.key === 'month-not-set'
        ? -1
        : left.key.localeCompare(right.key, undefined, { numeric: true }))
    .map((group) => {
      const summary = summaries[group.key] || {};
      const yearMatch = group.key.match(/^(\d{4})-/);
      const fallbackYear = yearMatch ? Number(yearMatch[1]) : 2000;
      const datedActivities = group.activities.flatMap((entry) => {
        const normalizedDate = normalizeJournalDate(entry.activity.date, fallbackYear);
        return normalizedDate ? [{ ...entry, normalizedDate }] : [];
      }).sort((left, right) => left.normalizedDate.localeCompare(right.normalizedDate));
      const uniqueDutyDates = new Set(
        group.activities
          .filter(({ activity }) => Number.isFinite(Number(activity.hours)) && Number(activity.hours) > 0)
          .map(({ activity, weekIndex, dayIndex }) => (
            normalizeJournalDate(activity.date, fallbackYear) || `${weekIndex}-${dayIndex}`
          )),
      );
      const totalHours = group.activities.reduce(
        (total, { activity }) => {
          const hours = Number(activity.hours);
          return total + (Number.isFinite(hours) && hours > 0 ? hours : 0);
        },
        0,
      );
      const firstDatedActivity = datedActivities[0];
      const lastDatedActivity = datedActivities[datedActivities.length - 1];
      const firstDate = firstDatedActivity?.activity.date.trim() || '';
      const lastDate = lastDatedActivity?.activity.date.trim() || '';
      const periodCovered = firstDatedActivity?.normalizedDate === lastDatedActivity?.normalizedDate
        ? firstDate
        : [firstDate, lastDate].filter(Boolean).join(' – ');

      return {
        ...group,
        periodCovered: summary.periodCovered || (group.activities.length ? periodCovered : ''),
        actualDutyDays: summary.actualDutyDays || (group.activities.length ? String(uniqueDutyDates.size) : ''),
        totalHoursRendered: summary.totalHoursRendered || (
          group.activities.length ? String(Number(totalHours.toFixed(2))) : ''
        ),
        activitiesPerformed: summary.activitiesPerformed ?? '',
        learningExperience: summary.learningExperience ?? '',
      };
    });
}

export function getNextMonthlyJournalKey(
  weeks: readonly MonthlyJournalWeek[],
  summaries: Record<string, MonthlyJournalSummary> = {},
  now = new Date(),
): string {
  const months = getMonthlyJournalGroups(weeks, summaries)
    .map(({ key }) => {
      const match = key.match(/^(\d{4}|unspecified)-(\d{1,2})$/);
      if (!match) return null;
      return { year: match[1], month: Number(match[2]) };
    })
    .filter((month): month is { year: string; month: number } => month !== null)
    .sort((left, right) => (
      left.year === right.year
        ? left.month - right.month
        : left.year === 'unspecified'
          ? -1
          : right.year === 'unspecified'
            ? 1
            : Number(left.year) - Number(right.year)
    ));
  const latest = months[months.length - 1];
  if (!latest) return `${now.getFullYear()}-${now.getMonth() + 1}`;

  if (latest.month < 12) return `${latest.year}-${latest.month + 1}`;
  if (latest.year === 'unspecified') return `${now.getFullYear() + 1}-1`;
  return `${Number(latest.year) + 1}-1`;
}

export type MonthlyJournalSummary = {
  periodCovered?: string;
  actualDutyDays?: string;
  totalHoursRendered?: string;
  activitiesPerformed?: string;
  learningExperience?: string;
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

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getActivityMonth(date: string): { monthIndex: number; year: string } | null {
  const namedMonthIndex = MONTHS.findIndex((month) => (
    new RegExp(`\\b${month}\\b|\\b${month.slice(0, 3)}\\b`, 'i').test(date)
  ));
  const year = date.match(/\b(?:19|20)\d{2}\b/)?.[0] || '';
  if (namedMonthIndex >= 0) return { monthIndex: namedMonthIndex, year };

  const numericDate = date.match(/\b(?:(\d{4})[-/](\d{1,2})[-/]\d{1,2}|(\d{1,2})[-/]\d{1,2}(?:[-/](\d{2,4}))?)\b/);
  if (!numericDate) return null;
  const monthNumber = Number(numericDate[2] || numericDate[3]);
  if (monthNumber < 1 || monthNumber > 12) return null;
  return {
    monthIndex: monthNumber - 1,
    year: numericDate[1] || numericDate[4] || '',
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
        ? `${MONTHS[month.monthIndex].toUpperCase()}${month.year ? ` ${month.year}` : ''}`
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
    if (monthIndex < 0 || monthIndex >= MONTHS.length) return;
    groups.set(key, {
      key,
      label: `${MONTHS[monthIndex].toUpperCase()}${keyMatch?.[1] === 'unspecified' ? '' : ` ${keyMatch?.[1]}`}`,
      activities: [],
      periodCovered: '',
      actualDutyDays: '',
      totalHoursRendered: '',
      activitiesPerformed: '',
      learningExperience: '',
    });
  });

  return Array.from(groups.values())
    .sort((left, right) => left.key === 'month-not-set'
      ? 1
      : right.key === 'month-not-set'
        ? -1
        : left.key.localeCompare(right.key, undefined, { numeric: true }))
    .map((group) => {
      const summary = summaries[group.key] || {};
      const datedActivities = group.activities.filter(({ activity }) => activity.date.trim());
      const uniqueDutyDates = new Set(
        group.activities
          .filter(({ activity }) => (Number(activity.hours) || 0) > 0)
          .map(({ activity, weekIndex, dayIndex }) => activity.date.trim().toLowerCase() || `${weekIndex}-${dayIndex}`),
      );
      const totalHours = group.activities.reduce(
        (total, { activity }) => total + (Number(activity.hours) || 0),
        0,
      );
      const firstDate = datedActivities[0]?.activity.date.trim() || '';
      const lastDate = datedActivities[datedActivities.length - 1]?.activity.date.trim() || '';

      return {
        ...group,
        periodCovered: summary.periodCovered ?? (firstDate === lastDate ? firstDate : [firstDate, lastDate].filter(Boolean).join(' – ')),
        actualDutyDays: summary.actualDutyDays ?? String(uniqueDutyDates.size),
        totalHoursRendered: summary.totalHoursRendered ?? String(Number(totalHours.toFixed(2))),
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

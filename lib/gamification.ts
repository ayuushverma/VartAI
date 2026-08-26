import { db } from "@/lib/db";

export const DAILY_GOAL = 1;

export type GamificationActivity = {
  completedAt: Date;
  mistakeCount: number;
  vocabularyCount: number;
};

export type GamificationSummary = {
  xp: number;
  todayProgress: number;
  dailyGoal: number;
  dailyGoalComplete: boolean;
  currentStreak: number;
  milestones: Milestone[];
  achievements: Achievement[];
  nextMilestone: Milestone | null;
};

export type Milestone = {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  complete: boolean;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  requirement: string;
  icon: string;
  unlocked: boolean;
};

const achievementDefinitions = [
  {
    id: "first-conversation",
    title: "First conversation",
    description: "Complete your first evaluated conversation.",
    requirement: "1 evaluated conversation",
    icon: "chat",
    unlocked: (activityCount: number) => activityCount >= 1,
  },
  {
    id: "steady-practice",
    title: "Steady practice",
    description: "Complete conversations on three different days.",
    requirement: "3 learning days",
    icon: "calendar",
    unlocked: (_activityCount: number, learningDays: number) => learningDays >= 3,
  },
  {
    id: "vocabulary-builder",
    title: "Vocabulary builder",
    description: "Learn ten vocabulary items through conversation.",
    requirement: "10 vocabulary items",
    icon: "word",
    unlocked: (_activityCount: number, _learningDays: number, vocabularyCount: number) => vocabularyCount >= 10,
  },
] as const;

export function calculateActivityXp(activity: GamificationActivity) {
  return 50 + Math.min(activity.mistakeCount, 5) * 2 + Math.min(activity.vocabularyCount, 10);
}

export function calculateGamificationSummary(
  activities: GamificationActivity[],
  timezone = "UTC",
  now = new Date(),
): GamificationSummary {
  const sortedActivities = [...activities].sort(
    (left, right) => right.completedAt.getTime() - left.completedAt.getTime(),
  );
  const today = dateInTimezone(now, timezone);
  const activityDates = new Set(
    sortedActivities.map((activity) => dateInTimezone(activity.completedAt, timezone)),
  );
  const todayProgress = sortedActivities.filter(
    (activity) => dateInTimezone(activity.completedAt, timezone) === today,
  ).length;
  const currentStreak = calculateStreak([...activityDates], today);
  const vocabularyCount = sortedActivities.reduce(
    (total, activity) => total + activity.vocabularyCount,
    0,
  );
  const milestones = buildMilestones(sortedActivities.length, vocabularyCount, activityDates.size);
  const achievements = achievementDefinitions.map((definition) => ({
    id: definition.id,
    title: definition.title,
    description: definition.description,
    requirement: definition.requirement,
    icon: definition.icon,
    unlocked: definition.unlocked(
      sortedActivities.length,
      activityDates.size,
      vocabularyCount,
    ),
  }));

  return {
    xp: sortedActivities.reduce((total, activity) => total + calculateActivityXp(activity), 0),
    todayProgress,
    dailyGoal: DAILY_GOAL,
    dailyGoalComplete: todayProgress >= DAILY_GOAL,
    currentStreak,
    milestones,
    achievements,
    nextMilestone: milestones.find((milestone) => !milestone.complete) ?? null,
  };
}

export async function getGamificationSummary(
  userId: string,
  timezone = "UTC",
  now = new Date(),
) {
  const conversations = await db.conversation.findMany({
    where: { userId, sessionEvaluation: { isNot: null } },
    select: {
      sessionEvaluation: { select: { createdAt: true } },
      _count: { select: { mistakes: true, vocabulary: true } },
    },
  });

  return calculateGamificationSummary(
    conversations.flatMap((conversation) =>
      conversation.sessionEvaluation
        ? [{
            completedAt: conversation.sessionEvaluation.createdAt,
            mistakeCount: conversation._count.mistakes,
            vocabularyCount: conversation._count.vocabulary,
          }]
        : [],
    ),
    timezone,
    now,
  );
}

function buildMilestones(conversationCount: number, vocabularyCount: number, learningDays: number) {
  return [
    milestone("first-conversation", "First conversation", "Complete one evaluated conversation.", conversationCount, 1),
    milestone("five-conversations", "Five conversations", "Complete five evaluated conversations.", conversationCount, 5),
    milestone("ten-conversations", "Ten conversations", "Complete ten evaluated conversations.", conversationCount, 10),
    milestone("first-week", "First week of learning", "Practice on seven different days.", learningDays, 7),
    milestone("vocabulary-ten", "Vocabulary set", "Learn ten vocabulary items.", vocabularyCount, 10),
  ];
}

function milestone(id: string, title: string, description: string, progress: number, target: number): Milestone {
  return { id, title, description, progress: Math.min(progress, target), target, complete: progress >= target };
}

export function calculateStreak(activityDates: string[], today: string) {
  const dates = new Set(activityDates);
  let cursor = today;
  let streak = 0;
  while (dates.has(cursor)) {
    streak += 1;
    cursor = previousDate(cursor);
  }
  return streak;
}

function dateInTimezone(date: Date, timezone: string) {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function previousDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function getEarnedSessionXp(mistakeCount: number, vocabularyCount: number) {
  return calculateActivityXp({
    completedAt: new Date(0),
    mistakeCount,
    vocabularyCount,
  });
}
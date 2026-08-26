import assert from "node:assert/strict";
import {
  calculateActivityXp,
  calculateGamificationSummary,
  calculateStreak,
} from "@/lib/gamification";

const dayOne = new Date("2026-08-24T12:00:00Z");
const dayTwo = new Date("2026-08-25T12:00:00Z");
const dayFour = new Date("2026-08-27T12:00:00Z");
const activity = (completedAt: Date, vocabularyCount = 0) => ({
  completedAt,
  mistakeCount: 1,
  vocabularyCount,
});

assert.equal(calculateActivityXp(activity(dayOne, 2)), 54);
assert.equal(calculateStreak(["2026-08-24", "2026-08-25"], "2026-08-25"), 2);
assert.equal(calculateStreak(["2026-08-24"], "2026-08-25"), 0);
assert.equal(calculateStreak(["2026-08-24"], "2026-08-24"), 1);

const summary = calculateGamificationSummary(
  [activity(dayOne, 5), activity(dayTwo, 5), activity(dayFour)],
  "UTC",
  dayTwo,
);
assert.equal(summary.xp, 166);
assert.equal(summary.todayProgress, 1);
assert.equal(summary.dailyGoalComplete, true);
assert.equal(summary.currentStreak, 2);
assert.equal(summary.milestones[0].complete, true);
assert.equal(summary.achievements[0].unlocked, true);

const empty = calculateGamificationSummary([], "UTC", dayTwo);
assert.equal(empty.xp, 0);
assert.equal(empty.currentStreak, 0);
assert.equal(empty.todayProgress, 0);
assert.equal(empty.achievements.every((achievement) => !achievement.unlocked), true);
console.log("Gamification test passed.");
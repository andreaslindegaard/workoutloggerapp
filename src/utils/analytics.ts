// src/utils/analytics.ts
// Helper functions to compute training volume and frequency analytics.

import {
  PerformedExercise,
  PerformedSet,
  SessionStats,
  WorkoutSession,
} from "../models/workoutModels";

const volumeForSet = (set: PerformedSet): number => {
  if (set.weight == null || set.reps == null) return 0;
  return set.weight * set.reps;
};

export const computeSessionStats = (session: WorkoutSession): SessionStats => {
  const allSets: PerformedSet[] = session.performedExercises.flatMap(
    (ex: PerformedExercise) => ex.sets
  );
  const completedSets = allSets.filter((s) => s.isCompleted);
  const totalSets = completedSets.length;
  const totalReps = completedSets.reduce(
    (sum, s) => sum + (s.reps ?? 0),
    0
  );
  const totalVolume = completedSets.reduce(
    (sum, s) => sum + volumeForSet(s),
    0
  );
  let durationMinutes: number | undefined;
  if (session.startedAt && session.finishedAt) {
    durationMinutes =
      (new Date(session.finishedAt).getTime() -
        new Date(session.startedAt).getTime()) /
      60000;
  }
  return {
    totalSets,
    totalReps,
    totalVolume,
    durationMinutes: durationMinutes != null ? Math.round(durationMinutes) : undefined,
  };
};

/**
 * Returns sessions in chronological order (oldest first) with attached stats.
 */
export const buildTimeSeriesStats = (sessions: WorkoutSession[]) => {
  return sessions
    .slice()
    .sort(
      (a, b) =>
        new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
    )
    .map((session) => ({
      session,
      stats: computeSessionStats(session),
    }));
};

// src/models/workoutModels.ts
// High-verbosity, well-documented core domain models for the workout app.

/**
 * Basic unit type for weights, distances etc.
 * This allows the user to pick their preferred units in their profile/settings.
 */
export type UnitSystem = "metric" | "imperial";

/**
 * A single set configuration inside a RoutineExercise.
 * For example: 3 sets of 8-10 reps @ 60kg.
 * In the routine template we store *targets*, not actual performed values.
 */
export interface RoutineSetTemplate {
  id: string;                 // Unique id for this set template
  targetReps?: number;        // Suggested reps per set
  targetTimeSec?: number;     // Suggested time in seconds (for timed exercises)
  targetWeight?: number;      // Suggested weight (in user's preferred unit)
  notes?: string;             // Optional cue: "slow eccentric", "RPE 8", etc.
}

/**
 * A single exercise in the exercise database.
 * Could be built-in or user-created.
 */
export interface ExerciseDefinition {
  id: string;                 // Unique exercise id
  name: string;               // "Barbell Bench Press"
  primaryMuscleGroup: string; // "Chest", "Back", "Legs" etc.
  secondaryMuscleGroups?: string[];
  equipment?: string;         // "Barbell", "Dumbbell", "Machine", "Bodyweight"
  isCustom: boolean;          // True if user created this exercise
  instructions?: string;      // Optional short how-to
  videoUrl?: string;          // Optional URL for guidance
  tags?: string[];            // "compound", "push", "pull", "beginner"
}

/**
 * An exercise placed inside a specific routine, with its own order and set plan.
 */
export interface RoutineExercise {
  id: string;                          // Unique id for this exercise within the routine
  exerciseId: string;                  // FK to ExerciseDefinition.id
  orderIndex: number;                  // 0-based order for display / execution
  setTemplates: RoutineSetTemplate[];  // Planned sets in this routine
  restSecondsBetweenSets?: number;     // Optional rest timer suggestion
}

/**
 * A workout routine/template that the user can run multiple times.
 * Example: "Push Day A", "Legs", "Full Body Beginner".
 */
export interface Routine {
  id: string;
  name: string;
  description?: string;
  isFavorite?: boolean;
  // Days of week this routine is "scheduled" for (for reminders & calendar views)
  scheduledWeekdays?: number[]; // 0 (Sun) - 6 (Sat)
  exercises: RoutineExercise[];
  lastUsedAt?: string;          // ISO date string
}

/**
 * A single set the user actually performed in a workout.
 */
export interface PerformedSet {
  id: string;
  routineSetTemplateId?: string;  // Optional link back to template
  reps?: number;
  timeSec?: number;
  weight?: number;
  isCompleted: boolean;
  rpe?: number;                   // Optional RPE for more advanced tracking
  notes?: string;
}

/**
 * Performed exercise during one workout session.
 */
export interface PerformedExercise {
  id: string;
  routineExerciseId?: string;   // Which routine exercise it came from
  exerciseId: string;           // FK to ExerciseDefinition.id (denormalized)
  orderIndex: number;           // Order within this session
  sets: PerformedSet[];
}

/**
 * A logged workout session.
 * These are the primary objects for analytics and history.
 */
export interface WorkoutSession {
  id: string;
  routineId?: string;           // optional FK if created from a routine
  customName?: string;          // falls back to routine name or freeform name
  startedAt: string;            // ISO datetime
  finishedAt?: string;          // ISO datetime when completed
  performedExercises: PerformedExercise[];
  notes?: string;
}

/**
 * Lightweight stats about training volume for one session.
 */
export interface SessionStats {
  totalSets: number;
  totalReps: number;
  totalVolume: number; // sum(weight * reps) for all sets with weight
  durationMinutes?: number;
}

/**
 * User profile with "premium" style personalization.
 */
export interface UserProfile {
  id: string;
  displayName: string;
  email?: string;
  unitSystem: UnitSystem;
  birthYear?: number;
  heightCm?: number;
  bodyweightKg?: number;
  weeklyWorkoutGoal?: number; // sessions/week
  createdAt: string;
}

/**
 * Root persisted app state.
 * This makes it straightforward to export/import as a single JSON object.
 */
export interface PersistedAppState {
  userProfile: UserProfile | null;
  routines: Routine[];
  exerciseLibrary: ExerciseDefinition[];
  workoutHistory: WorkoutSession[];
  // For reminders / scheduling
  notificationSettings: {
    enabled: boolean;
    defaultReminderHour: number; // e.g. 18 = 18:00 local time
  };
  // For analytics caching if needed
  lastAnalyticsRebuildAt?: string;
}

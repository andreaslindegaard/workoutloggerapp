// src/store/workoutStore.tsx
// Central app state store using React Context + reducer.
// Provides premium-like capabilities: routines, history, profiles, analytics.

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  ReactNode,
} from "react";
import {
  PersistedAppState,
  Routine,
  WorkoutSession,
  ExerciseDefinition,
  UserProfile,
} from "../models/workoutModels";
import { AsyncKeyValueStorage, STORAGE_KEYS } from "../storage/storage";

// ---- Utility: simple id generator ----
const generateId = () =>
  Math.random().toString(36).substring(2) + Date.now().toString(36);

// ---- Default initial app state ----
const createInitialState = (): PersistedAppState => ({
  userProfile: null,
  routines: [],
  exerciseLibrary: [],
  workoutHistory: [],
  notificationSettings: {
    enabled: false,
    defaultReminderHour: 18,
  },
});

// ---- Actions ----
type Action =
  | { type: "HYDRATE"; payload: PersistedAppState }
  | { type: "SET_PROFILE"; payload: UserProfile }
  | { type: "UPSERT_ROUTINE"; payload: Routine }
  | { type: "DELETE_ROUTINE"; payload: { routineId: string } }
  | { type: "ADD_WORKOUT_SESSION"; payload: WorkoutSession }
  | { type: "UPSERT_EXERCISE_DEF"; payload: ExerciseDefinition }
  | { type: "DELETE_EXERCISE_DEF"; payload: { exerciseId: string } }
  | {
      type: "SET_NOTIFICATION_SETTINGS";
      payload: PersistedAppState["notificationSettings"];
    }
  | { type: "RESET_ALL" };

// ---- Reducer ----
function workoutReducer(
  state: PersistedAppState,
  action: Action
): PersistedAppState {
  switch (action.type) {
    case "HYDRATE":
      return action.payload;
    case "SET_PROFILE":
      return { ...state, userProfile: action.payload };
    case "UPSERT_ROUTINE": {
      const existingIndex = state.routines.findIndex(
        (r) => r.id === action.payload.id
      );
      const routines =
        existingIndex === -1
          ? [...state.routines, action.payload]
          : state.routines.map((r, idx) =>
              idx === existingIndex ? action.payload : r
            );
      return { ...state, routines };
    }
    case "DELETE_ROUTINE": {
      const routines = state.routines.filter(
        (r) => r.id !== action.payload.routineId
      );
      return { ...state, routines };
    }
    case "ADD_WORKOUT_SESSION": {
      const history = [...state.workoutHistory, action.payload];
      return { ...state, workoutHistory: history };
    }
    case "UPSERT_EXERCISE_DEF": {
      const idx = state.exerciseLibrary.findIndex(
        (e) => e.id === action.payload.id
      );
      const exerciseLibrary =
        idx === -1
          ? [...state.exerciseLibrary, action.payload]
          : state.exerciseLibrary.map((e, i) =>
              i === idx ? action.payload : e
            );
      return { ...state, exerciseLibrary };
    }
    case "DELETE_EXERCISE_DEF": {
      const exerciseLibrary = state.exerciseLibrary.filter(
        (e) => e.id !== action.payload.exerciseId
      );
      return { ...state, exerciseLibrary };
    }
    case "SET_NOTIFICATION_SETTINGS":
      return { ...state, notificationSettings: action.payload };
    case "RESET_ALL":
      return createInitialState();
    default:
      return state;
  }
}

// ---- Context ----
interface WorkoutStoreContextValue {
  state: PersistedAppState;
  actions: {
    hydrateFromStorage: () => Promise<void>;
    saveToStorage: () => Promise<void>;
    createOrUpdateRoutine: (partial: Omit<Routine, "id"> & { id?: string }) => Routine;
    deleteRoutine: (routineId: string) => void;
    logWorkoutSession: (session: Omit<WorkoutSession, "id">) => WorkoutSession;
    upsertExercise: (
      exercise: Omit<ExerciseDefinition, "id"> & { id?: string }
    ) => ExerciseDefinition;
    deleteExercise: (exerciseId: string) => void;
    setUserProfile: (profile: Omit<UserProfile, "id"> & { id?: string }) => UserProfile;
    setNotificationSettings: (
      settings: PersistedAppState["notificationSettings"]
    ) => void;
    exportAllData: () => string;
    importAllData: (data: string) => void;
    resetAll: () => void;
  };
}

const WorkoutStoreContext = createContext<WorkoutStoreContextValue | null>(
  null
);

// ---- Provider ----
export const WorkoutStoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(workoutReducer, undefined, createInitialState);

  // Hydrate from storage once on mount
  useEffect(() => {
    void hydrateFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hydrateFromStorage = async () => {
    try {
      const json = await AsyncKeyValueStorage.getItem(STORAGE_KEYS.APP_STATE);
      if (!json) return;
      const parsed: PersistedAppState = JSON.parse(json);
      dispatch({ type: "HYDRATE", payload: parsed });
    } catch (error) {
      console.warn("Failed to hydrate app state", error);
    }
  };

  const saveToStorage = async () => {
    try {
      const json = JSON.stringify(state);
      await AsyncKeyValueStorage.setItem(STORAGE_KEYS.APP_STATE, json);
    } catch (error) {
      console.warn("Failed to save app state", error);
    }
  };

  // Helper to ensure entities get stable IDs
  const ensureId = (maybeId?: string) => maybeId ?? generateId();

  const createOrUpdateRoutine: WorkoutStoreContextValue["actions"]["createOrUpdateRoutine"] =
    (partial) => {
      const routine: Routine = {
        id: ensureId(partial.id),
        name: partial.name,
        description: partial.description,
        isFavorite: partial.isFavorite ?? false,
        scheduledWeekdays: partial.scheduledWeekdays ?? [],
        exercises: partial.exercises ?? [],
        lastUsedAt: partial.lastUsedAt,
      };
      dispatch({ type: "UPSERT_ROUTINE", payload: routine });
      void saveToStorage();
      return routine;
    };

  const deleteRoutine = (routineId: string) => {
    dispatch({ type: "DELETE_ROUTINE", payload: { routineId } });
    void saveToStorage();
  };

  const logWorkoutSession: WorkoutStoreContextValue["actions"]["logWorkoutSession"] =
    (sessionInput) => {
      const session: WorkoutSession = {
        ...sessionInput,
        id: ensureId(),
      };
      dispatch({ type: "ADD_WORKOUT_SESSION", payload: session });
      void saveToStorage();
      return session;
    };

  const upsertExercise: WorkoutStoreContextValue["actions"]["upsertExercise"] =
    (exerciseInput) => {
      const exercise: ExerciseDefinition = {
        ...exerciseInput,
        id: ensureId(exerciseInput.id),
      };
      dispatch({ type: "UPSERT_EXERCISE_DEF", payload: exercise });
      void saveToStorage();
      return exercise;
    };

  const deleteExercise = (exerciseId: string) => {
    dispatch({ type: "DELETE_EXERCISE_DEF", payload: { exerciseId } });
    void saveToStorage();
  };

  const setUserProfile: WorkoutStoreContextValue["actions"]["setUserProfile"] =
    (profileInput) => {
      const profile: UserProfile = {
        ...profileInput,
        id: ensureId(profileInput.id),
        createdAt: profileInput.createdAt ?? new Date().toISOString(),
      };
      dispatch({ type: "SET_PROFILE", payload: profile });
      void saveToStorage();
      return profile;
    };

  const setNotificationSettings: WorkoutStoreContextValue["actions"]["setNotificationSettings"] =
    (settings) => {
      dispatch({ type: "SET_NOTIFICATION_SETTINGS", payload: settings });
      void saveToStorage();
    };

  const exportAllData = () => {
    return JSON.stringify(state, null, 2);
  };

  const importAllData = (data: string) => {
    try {
      const parsed: PersistedAppState = JSON.parse(data);
      dispatch({ type: "HYDRATE", payload: parsed });
      void saveToStorage();
    } catch (error) {
      console.warn("Failed to import data", error);
    }
  };

  const resetAll = () => {
    dispatch({ type: "RESET_ALL" });
    void saveToStorage();
  };

  return (
    <WorkoutStoreContext.Provider
      value={{
        state,
        actions: {
          hydrateFromStorage,
          saveToStorage,
          createOrUpdateRoutine,
          deleteRoutine,
          logWorkoutSession,
          upsertExercise,
          deleteExercise,
          setUserProfile,
          setNotificationSettings,
          exportAllData,
          importAllData,
          resetAll,
        },
      }}
    >
      {children}
    </WorkoutStoreContext.Provider>
  );
};

// ---- Hook ----
export const useWorkoutStore = (): WorkoutStoreContextValue => {
  const ctx = useContext(WorkoutStoreContext);
  if (!ctx) {
    throw new Error("useWorkoutStore must be used within WorkoutStoreProvider");
  }
  return ctx;
};

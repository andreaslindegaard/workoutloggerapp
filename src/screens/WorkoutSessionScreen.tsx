// src/screens/WorkoutSessionScreen.tsx
// Handles live logging of a workout session based on a routine.

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import {
  PerformedExercise,
  PerformedSet,
  Routine,
  RoutineExercise,
  WorkoutSession,
} from "../models/workoutModels";
import { useWorkoutStore } from "../store/workoutStore";

type RootStackParamList = {
  WorkoutSession: { routineId: string };
};

type WorkoutSessionRouteProp = RouteProp<RootStackParamList, "WorkoutSession">;

const generateId = () =>
  Math.random().toString(36).substring(2) + Date.now().toString(36);

const buildInitialSession = (routine: Routine): WorkoutSession => {
  const performedExercises: PerformedExercise[] = routine.exercises
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((re: RoutineExercise) => ({
      id: generateId(),
      routineExerciseId: re.id,
      exerciseId: re.exerciseId,
      orderIndex: re.orderIndex,
      sets: re.setTemplates.map((st) => ({
        id: generateId(),
        routineSetTemplateId: st.id,
        reps: st.targetReps,
        weight: st.targetWeight,
        timeSec: st.targetTimeSec,
        isCompleted: false,
      })),
    }));

  return {
    id: generateId(),
    routineId: routine.id,
    startedAt: new Date().toISOString(),
    performedExercises,
    notes: "",
  };
};

export const WorkoutSessionScreen: React.FC = () => {
  const route = useRoute<WorkoutSessionRouteProp>();
  const navigation = useNavigation();
  const {
    state: { routines, exerciseLibrary },
    actions: { logWorkoutSession },
  } = useWorkoutStore();

  const routine = routines.find((r) => r.id === route.params.routineId);
  if (!routine) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Routine not found.</Text>
      </View>
    );
  }

  const [session, setSession] = useState<WorkoutSession>(
    buildInitialSession(routine)
  );

  const title = useMemo(
    () => routine.name || "Workout",
    [routine.name]
  );

  const updateSet = (exerciseId: string, setId: string, patch: Partial<PerformedSet>) => {
    setSession((prev) => ({
      ...prev,
      performedExercises: prev.performedExercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((set) =>
            set.id === setId ? { ...set, ...patch } : set
          ),
        };
      }),
    }));
  };

  const toggleSetCompleted = (exerciseId: string, setId: string) => {
    setSession((prev) => ({
      ...prev,
      performedExercises: prev.performedExercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((set) =>
                set.id === setId
                  ? { ...set, isCompleted: !set.isCompleted }
                  : set
              ),
            }
          : ex
      ),
    }));
  };

  const handleFinish = () => {
    const finishedSession: Omit<WorkoutSession, "id"> = {
      ...session,
      finishedAt: new Date().toISOString(),
    };
    logWorkoutSession(finishedSession);
    navigation.goBack();
  };

  const totalCompletedSets = session.performedExercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.isCompleted).length,
    0
  );
  const totalSets = session.performedExercises.reduce(
    (acc, ex) => acc + ex.sets.length,
    0
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <TouchableOpacity
          style={[
            styles.finishButton,
            totalCompletedSets === 0 && { opacity: 0.4 },
          ]}
          disabled={totalCompletedSets === 0}
          onPress={handleFinish}
        >
          <Text style={styles.finishButtonText}>Finish</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.progressText}>
        {totalCompletedSets}/{totalSets} sets completed
      </Text>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {session.performedExercises
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((ex) => {
            const def = exerciseLibrary.find((d) => d.id === ex.exerciseId);
            const name = def?.name ?? "Exercise";
            return (
              <View key={ex.id} style={styles.exerciseCard}>
                <Text style={styles.exerciseTitle}>{name}</Text>
                {ex.sets.map((set, idx) => (
                  <TouchableOpacity
                    key={set.id}
                    style={[
                      styles.setRow,
                      set.isCompleted && styles.setRowCompleted,
                    ]}
                    onPress={() => toggleSetCompleted(ex.id, set.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.setIndex}>Set {idx + 1}</Text>
                    <TextInput
                      style={styles.setInput}
                      keyboardType="numeric"
                      value={set.reps != null ? String(set.reps) : ""}
                      onChangeText={(text) =>
                        updateSet(ex.id, set.id, {
                          reps: text ? Number(text) : undefined,
                        })
                      }
                      placeholder="Reps"
                      placeholderTextColor="#6B7280"
                    />
                    <Text style={styles.setLabel}>reps</Text>
                    <TextInput
                      style={styles.setInput}
                      keyboardType="numeric"
                      value={set.weight != null ? String(set.weight) : ""}
                      onChangeText={(text) =>
                        updateSet(ex.id, set.id, {
                          weight: text ? Number(text) : undefined,
                        })
                      }
                      placeholder="kg"
                      placeholderTextColor="#6B7280"
                    />
                    <Text style={styles.setLabel}>kg</Text>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050316", padding: 16 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  linkText: { color: "#9CA3AF", fontSize: 14 },
  headerTitle: { color: "white", fontWeight: "600", fontSize: 18 },
  finishButton: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  finishButtonText: { color: "white", fontWeight: "600" },
  progressText: { color: "#9CA3AF", fontSize: 13, marginBottom: 8 },
  exerciseCard: {
    backgroundColor: "#0B1120",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  exerciseTitle: { color: "white", fontSize: 15, fontWeight: "500" },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    padding: 6,
    borderRadius: 999,
    backgroundColor: "#020617",
  },
  setRowCompleted: {
    backgroundColor: "#065F46",
  },
  setIndex: { color: "#E5E7EB", width: 60, fontSize: 13 },
  setInput: {
    backgroundColor: "#020617",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: "white",
    fontSize: 13,
    minWidth: 60,
    marginHorizontal: 4,
  },
  setLabel: { color: "#9CA3AF", fontSize: 12, marginRight: 4 },
  errorText: { flex: 1, color: "white", textAlign: "center", marginTop: 40 },
});

// src/screens/RoutineEditorScreen.tsx
// Full-featured routine editor: add/remove/reorder exercises, sets, targets.

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import {
  ExerciseDefinition,
  Routine,
  RoutineExercise,
  RoutineSetTemplate,
} from "../models/workoutModels";
import { useWorkoutStore } from "../store/workoutStore";

type RootStackParamList = {
  RoutineEditor: { routineId?: string };
};

type RoutineEditorRouteProp = RouteProp<RootStackParamList, "RoutineEditor">;

const generateId = () =>
  Math.random().toString(36).substring(2) + Date.now().toString(36);

export const RoutineEditorScreen: React.FC = () => {
  const route = useRoute<RoutineEditorRouteProp>();
  const navigation = useNavigation();
  const {
    state: { routines, exerciseLibrary },
    actions: { createOrUpdateRoutine, upsertExercise },
  } = useWorkoutStore();

  const existingRoutine = routines.find((r) => r.id === route.params?.routineId);

  const [name, setName] = useState(existingRoutine?.name ?? "New Routine");
  const [description, setDescription] = useState(
    existingRoutine?.description ?? ""
  );
  const [exercises, setExercises] = useState<RoutineExercise[]>(
    existingRoutine?.exercises ?? []
  );

  const usedExerciseDefinitions: ExerciseDefinition[] = useMemo(
    () =>
      exercises
        .map((re) => exerciseLibrary.find((e) => e.id === re.exerciseId))
        .filter(Boolean) as ExerciseDefinition[],
    [exercises, exerciseLibrary]
  );

  const handleAddExercise = (exerciseDef: ExerciseDefinition) => {
    setExercises((prev) => [
      ...prev,
      {
        id: generateId(),
        exerciseId: exerciseDef.id,
        orderIndex: prev.length,
        setTemplates: [
          {
            id: generateId(),
            targetReps: 8,
          },
          {
            id: generateId(),
            targetReps: 8,
          },
          {
            id: generateId(),
            targetReps: 8,
          },
        ],
      },
    ]);
  };

  const handleQuickCreateCustomExercise = (name: string) => {
    const exercise = upsertExercise({
      name,
      isCustom: true,
      primaryMuscleGroup: "Custom",
      equipment: "Unknown",
    });
    handleAddExercise(exercise);
  };

  const moveExercise = (index: number, direction: -1 | 1) => {
    setExercises((prev) => {
      const newArr = [...prev];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= newArr.length) return prev;
      const [item] = newArr.splice(index, 1);
      newArr.splice(newIndex, 0, item);
      return newArr.map((ex, idx) => ({ ...ex, orderIndex: idx }));
    });
  };

  const deleteExercise = (id: string) => {
    setExercises((prev) =>
      prev
        .filter((ex) => ex.id !== id)
        .map((ex, idx) => ({ ...ex, orderIndex: idx }))
    );
  };

  const updateSetTemplate = (
    routineExerciseId: string,
    setId: string,
    patch: Partial<RoutineSetTemplate>
  ) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== routineExerciseId) return ex;
        return {
          ...ex,
          setTemplates: ex.setTemplates.map((set) =>
            set.id === setId ? { ...set, ...patch } : set
          ),
        };
      })
    );
  };

  const addSetToExercise = (routineExerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === routineExerciseId
          ? {
              ...ex,
              setTemplates: [
                ...ex.setTemplates,
                { id: generateId(), targetReps: 8 },
              ],
            }
          : ex
      )
    );
  };

  const removeSetFromExercise = (routineExerciseId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== routineExerciseId) return ex;
        return {
          ...ex,
          setTemplates: ex.setTemplates.filter((s) => s.id !== setId),
        };
      })
    );
  };

  const handleSave = () => {
    const routine: Omit<Routine, "id"> & { id?: string } = {
      id: existingRoutine?.id,
      name: name.trim() || "Unnamed Routine",
      description: description.trim(),
      exercises: exercises.map((ex, idx) => ({
        ...ex,
        orderIndex: idx,
      })),
      isFavorite: existingRoutine?.isFavorite ?? false,
      scheduledWeekdays: existingRoutine?.scheduledWeekdays ?? [],
      lastUsedAt: existingRoutine?.lastUsedAt,
    };
    const saved = createOrUpdateRoutine(routine);
    navigation.goBack();
    console.log("Routine saved:", saved.id);
  };

  // Simple quick-add UI: in a real app you'd open a separate Exercise Library modal
  const [quickExerciseName, setQuickExerciseName] = useState("");

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {existingRoutine ? "Edit Routine" : "New Routine"}
        </Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Routine name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Push Day A"
          placeholderTextColor="#6B7280"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={[styles.input, { height: 60 }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Upper body push focus"
          placeholderTextColor="#6B7280"
          multiline
        />
      </View>

      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Exercises</Text>
          <Text style={styles.labelSmall}>
            {exercises.length} item{exercises.length !== 1 ? "s" : ""}
          </Text>
        </View>

        <FlatList
          data={exercises.sort((a, b) => a.orderIndex - b.orderIndex)}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
            const def = exerciseLibrary.find((e) => e.id === item.exerciseId);
            const title = def?.name ?? "Unknown exercise";
            return (
              <View style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseTitle}>
                    {index + 1}. {title}
                  </Text>
                  <View style={styles.exerciseHeaderButtons}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => moveExercise(index, -1)}
                    >
                      <Text style={styles.iconButtonText}>↑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => moveExercise(index, 1)}
                    >
                      <Text style={styles.iconButtonText}>↓</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButtonDanger}
                      onPress={() => deleteExercise(item.id)}
                    >
                      <Text style={styles.iconButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.subLabel}>Sets</Text>
                {item.setTemplates.map((setTemplate, idx) => (
                  <View key={setTemplate.id} style={styles.setRow}>
                    <Text style={styles.setLabel}>Set {idx + 1}</Text>
                    <TextInput
                      style={styles.setInput}
                      keyboardType="numeric"
                      placeholder="Reps"
                      placeholderTextColor="#6B7280"
                      value={
                        setTemplate.targetReps != null
                          ? String(setTemplate.targetReps)
                          : ""
                      }
                      onChangeText={(text) =>
                        updateSetTemplate(item.id, setTemplate.id, {
                          targetReps: text ? Number(text) : undefined,
                        })
                      }
                    />
                    <Text style={styles.setSuffix}>reps</Text>
                    <TouchableOpacity
                      style={styles.iconButtonDanger}
                      onPress={() =>
                        removeSetFromExercise(item.id, setTemplate.id)
                      }
                    >
                      <Text style={styles.iconButtonText}>-</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => addSetToExercise(item.id)}
                >
                  <Text style={styles.secondaryButtonText}>+ Add set</Text>
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No exercises yet. Add one below to get started.
            </Text>
          }
        />

        <View style={styles.quickAddContainer}>
          <Text style={styles.subLabel}>Quick add exercise</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={quickExerciseName}
              onChangeText={setQuickExerciseName}
              placeholder="e.g. Bench Press"
              placeholderTextColor="#6B7280"
            />
            <TouchableOpacity
              style={[styles.primaryButton, { marginLeft: 8 }]}
              onPress={() => {
                if (!quickExerciseName.trim()) return;
                handleQuickCreateCustomExercise(quickExerciseName.trim());
                setQuickExerciseName("");
              }}
            >
              <Text style={styles.primaryButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.helperText}>
            This will create a custom exercise in your library and add it here.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050316", padding: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  linkText: { color: "#9CA3AF", fontSize: 14 },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "600" },
  saveButton: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  saveButtonText: { color: "white", fontWeight: "600" },
  section: { marginBottom: 16 },
  label: { color: "#E5E7EB", fontSize: 14, marginBottom: 6 },
  labelSmall: { color: "#9CA3AF", fontSize: 12 },
  input: {
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "white",
    fontSize: 14,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 4,
  },
  exerciseCard: {
    backgroundColor: "#0B1120",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  exerciseHeaderButtons: { flexDirection: "row" },
  exerciseTitle: { color: "white", fontSize: 15, fontWeight: "500" },
  iconButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#111827",
    marginLeft: 4,
  },
  iconButtonDanger: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#7F1D1D",
    marginLeft: 4,
  },
  iconButtonText: { color: "white", fontSize: 12 },
  subLabel: { color: "#9CA3AF", fontSize: 13, marginBottom: 4 },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  setLabel: { color: "#E5E7EB", width: 60, fontSize: 13 },
  setInput: {
    backgroundColor: "#020617",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: "white",
    fontSize: 13,
    width: 70,
    marginRight: 4,
  },
  setSuffix: { color: "#9CA3AF", fontSize: 12, marginRight: 4 },
  secondaryButton: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#111827",
  },
  secondaryButtonText: { color: "#E5E7EB", fontSize: 13 },
  emptyText: { color: "#6B7280", fontSize: 13, marginTop: 4 },
  quickAddContainer: { marginTop: 12 },
  row: { flexDirection: "row", alignItems: "center" },
  primaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#7C3AED",
  },
  primaryButtonText: { color: "white", fontWeight: "600", fontSize: 13 },
  helperText: { color: "#6B7280", fontSize: 12, marginTop: 4 },
});

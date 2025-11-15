// src/screens/ExerciseLibraryScreen.tsx
// Searchable library, supports custom exercises.

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useWorkoutStore } from "../store/workoutStore";
import { ExerciseDefinition } from "../models/workoutModels";

export const ExerciseLibraryScreen: React.FC = () => {
  const {
    state: { exerciseLibrary },
    actions: { upsertExercise },
  } = useWorkoutStore();
  const [query, setQuery] = useState("");
  const [newName, setNewName] = useState("");

  const filtered = exerciseLibrary.filter((ex) =>
    ex.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleCreate = () => {
    if (!newName.trim()) return;
    upsertExercise({
      name: newName.trim(),
      isCustom: true,
      primaryMuscleGroup: "Custom",
      equipment: "Unknown",
    });
    setNewName("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercise Library</Text>
      <TextInput
        style={styles.input}
        placeholder="Search"
        placeholderTextColor="#6B7280"
        value={query}
        onChangeText={setQuery}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            <Text style={styles.tag}>
              {item.isCustom ? "Custom" : item.primaryMuscleGroup}
            </Text>
          </View>
        )}
      />

      <View style={styles.createRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="New custom exercise"
          placeholderTextColor="#6B7280"
          value={newName}
          onChangeText={setNewName}
        />
        <TouchableOpacity style={styles.button} onPress={handleCreate}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050316", padding: 16 },
  title: { color: "white", fontSize: 24, fontWeight: "700", marginBottom: 12 },
  input: {
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "white",
    fontSize: 14,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  exerciseName: { color: "white", fontSize: 14 },
  tag: { color: "#9CA3AF", fontSize: 12 },
  createRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  button: {
    marginLeft: 8,
    backgroundColor: "#7C3AED",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  buttonText: { color: "white", fontSize: 13, fontWeight: "600" },
});

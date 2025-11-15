// src/screens/RoutineListScreen.tsx
// Displays list of routines and allows creation/edit.

import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useWorkoutStore } from "../store/workoutStore";
import { Routine } from "../models/workoutModels";

type Nav = ReturnType<typeof useNavigation>;

export const RoutineListScreen: React.FC = () => {
  const {
    state: { routines },
  } = useWorkoutStore();
  const navigation = useNavigation<Nav>();

  const renderRoutine = ({ item }: { item: Routine }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("RoutineEditor" as never, { routineId: item.id } as never)
      }
    >
      <Text style={styles.cardTitle}>{item.name}</Text>
      {item.description ? (
        <Text style={styles.cardSubtitle}>{item.description}</Text>
      ) : null}
      <Text style={styles.cardMeta}>
        {item.exercises.length} exercise{item.exercises.length !== 1 ? "s" : ""}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Routines</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            navigation.navigate("RoutineEditor" as never, {} as never)
          }
        >
          <Text style={styles.primaryButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {routines.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No routines yet</Text>
          <Text style={styles.emptyText}>
            Create your first routine to start logging structured workouts.
          </Text>
        </View>
      ) : (
        <FlatList
          data={routines.sort((a, b) => a.name.localeCompare(b.name))}
          keyExtractor={(r) => r.id}
          renderItem={renderRoutine}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#050316" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { fontSize: 24, fontWeight: "700", color: "white" },
  primaryButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#7C3AED",
  },
  primaryButtonText: { color: "white", fontWeight: "600" },
  card: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "white" },
  cardSubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
  },
  cardMeta: { fontSize: 12, color: "#6B7280", marginTop: 8 },
  emptyState: { marginTop: 32 },
  emptyTitle: { fontSize: 18, color: "white", marginBottom: 4 },
  emptyText: { fontSize: 14, color: "#9CA3AF" },
});

// src/screens/TodayScreen.tsx
// Home dashboard: quick start from routine + summary of recent activity.

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
import { Routine, WorkoutSession } from "../models/workoutModels";

type Nav = ReturnType<typeof useNavigation>;

const computeSessionDuration = (session: WorkoutSession): number | undefined => {
  if (!session.finishedAt) return undefined;
  const start = new Date(session.startedAt).getTime();
  const end = new Date(session.finishedAt).getTime();
  return Math.round((end - start) / 60000);
};

export const TodayScreen: React.FC = () => {
  const {
    state: { routines, workoutHistory, userProfile },
  } = useWorkoutStore();
  const navigation = useNavigation<Nav>();

  const sortedHistory = [...workoutHistory].sort(
    (a, b) =>
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

  const weeklyGoal = userProfile?.weeklyWorkoutGoal ?? 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today</Text>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Quick start</Text>
        {routines.length === 0 ? (
          <Text style={styles.mutedText}>
            No routines yet. Create one under "Routines" tab.
          </Text>
        ) : (
          <FlatList
            data={routines}
            keyExtractor={(r) => r.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.routineChip}
                onPress={() =>
                  navigation.navigate("WorkoutSession" as never, {
                    routineId: item.id,
                  } as never)
                }
              >
                <Text style={styles.routineChipText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>This week</Text>
        <Text style={styles.mutedText}>
          Goal: {weeklyGoal || "not set"} session
          {weeklyGoal === 1 ? "" : "s"}
        </Text>
        {/* In a full app, compute count of sessions in current week and render a small chart */}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Recent workouts</Text>
        {sortedHistory.length === 0 ? (
          <Text style={styles.mutedText}>
            Your recent workouts will appear here.
          </Text>
        ) : (
          <FlatList
            data={sortedHistory.slice(0, 5)}
            keyExtractor={(s) => s.id}
            renderItem={({ item }) => {
              const routine = routines.find((r) => r.id === item.routineId);
              const title = item.customName ?? routine?.name ?? "Workout";
              const duration = computeSessionDuration(item);
              return (
                <View style={styles.sessionRow}>
                  <View>
                    <Text style={styles.sessionTitle}>{title}</Text>
                    <Text style={styles.sessionMeta}>
                      {new Date(item.startedAt).toLocaleString()}
                      {duration != null ? ` • ${duration} min` : ""}
                    </Text>
                  </View>
                  <Text style={styles.sessionMeta}>
                    {item.performedExercises.length} exercise
                    {item.performedExercises.length === 1 ? "" : "s"}
                  </Text>
                </View>
              );
            }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#050316" },
  title: { fontSize: 24, fontWeight: "700", color: "white", marginBottom: 12 },
  sectionCard: {
    backgroundColor: "#0B1120",
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
  },
  sectionTitle: { color: "white", fontSize: 16, fontWeight: "600" },
  mutedText: { color: "#6B7280", fontSize: 13, marginTop: 4 },
  routineChip: {
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
    marginTop: 8,
  },
  routineChipText: { color: "white", fontSize: 13 },
  sessionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 8,
  },
  sessionTitle: { color: "white", fontSize: 14, fontWeight: "500" },
  sessionMeta: { color: "#9CA3AF", fontSize: 12 },
});

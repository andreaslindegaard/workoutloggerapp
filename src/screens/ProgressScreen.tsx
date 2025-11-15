// src/screens/ProgressScreen.tsx
// Analytics: volume over time, frequency, and personal best-like stats.

import React, { useMemo } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useWorkoutStore } from "../store/workoutStore";
import { buildTimeSeriesStats } from "../utils/analytics";

export const ProgressScreen: React.FC = () => {
  const {
    state: { workoutHistory, routines },
  } = useWorkoutStore();

  const timeSeries = useMemo(
    () => buildTimeSeriesStats(workoutHistory),
    [workoutHistory]
  );

  const totalWorkouts = workoutHistory.length;
  const totalVolume = timeSeries.reduce(
    (sum, entry) => sum + entry.stats.totalVolume,
    0
  );

  // For a real chart: map to data points: [{ x: date, y: volume }, ...]
  const volumeByDate = timeSeries.map((entry) => ({
    date: new Date(entry.session.startedAt),
    volume: entry.stats.totalVolume,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progress</Text>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Workouts</Text>
          <Text style={styles.metricValue}>{totalWorkouts}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total volume</Text>
          <Text style={styles.metricValue}>
            {Math.round(totalVolume)}{" "}
            <Text style={styles.metricSuffix}>kg·reps</Text>
          </Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Volume trend</Text>
        <Text style={styles.mutedText}>
          Plug this data into a line chart for a premium experience.
        </Text>
        {volumeByDate.length === 0 ? (
          <Text style={styles.mutedText}>No workouts logged yet.</Text>
        ) : (
          <FlatList
            style={{ marginTop: 8 }}
            data={volumeByDate.slice(-10)}
            keyExtractor={(item) => item.date.toISOString()}
            renderItem={({ item }) => (
              <View style={styles.rowBetween}>
                <Text style={styles.rowText}>
                  {item.date.toLocaleDateString()}
                </Text>
                <Text style={styles.rowText}>{Math.round(item.volume)}</Text>
              </View>
            )}
          />
        )}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Recent sessions</Text>
        <FlatList
          data={timeSeries.slice(-5).reverse()}
          keyExtractor={(entry) => entry.session.id}
          renderItem={({ item }) => {
            const routine = routines.find(
              (r) => r.id === item.session.routineId
            );
            return (
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.rowText}>
                    {routine?.name ?? item.session.customName ?? "Workout"}
                  </Text>
                  <Text style={styles.subRowText}>
                    {new Date(
                      item.session.startedAt
                    ).toLocaleDateString()}{" "}
                    • {item.stats.totalSets} sets •{" "}
                    {Math.round(item.stats.totalVolume)} kg·reps
                  </Text>
                </View>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050316", padding: 16 },
  title: { color: "white", fontSize: 24, fontWeight: "700", marginBottom: 12 },
  metricsRow: { flexDirection: "row", justifyContent: "space-between" },
  metricCard: {
    flex: 1,
    backgroundColor: "#0B1120",
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    marginRight: 8,
  },
  metricLabel: { color: "#9CA3AF", fontSize: 12 },
  metricValue: { color: "white", fontSize: 18, fontWeight: "600" },
  metricSuffix: { color: "#9CA3AF", fontSize: 12 },
  sectionCard: {
    backgroundColor: "#0B1120",
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
  },
  sectionTitle: { color: "white", fontSize: 16, fontWeight: "600" },
  mutedText: { color: "#6B7280", fontSize: 13, marginTop: 4 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  rowText: { color: "white", fontSize: 13 },
  subRowText: { color: "#9CA3AF", fontSize: 12 },
});

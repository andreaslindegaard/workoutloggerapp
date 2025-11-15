// src/screens/ProfileScreen.tsx
// User profile, settings, reminders, and export/import.

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useWorkoutStore } from "../store/workoutStore";

export const ProfileScreen: React.FC = () => {
  const {
    state: { userProfile, notificationSettings },
    actions: {
      setUserProfile,
      setNotificationSettings,
      exportAllData,
      importAllData,
      resetAll,
    },
  } = useWorkoutStore();

  const [displayName, setDisplayName] = useState(
    userProfile?.displayName ?? ""
  );
  const [weeklyGoal, setWeeklyGoal] = useState(
    userProfile?.weeklyWorkoutGoal?.toString() ?? ""
  );
  const [unitSystem, setUnitSystem] = useState(
    userProfile?.unitSystem ?? "metric"
  );
  const [reminderEnabled, setReminderEnabled] = useState(
    notificationSettings.enabled
  );
  const [reminderHour, setReminderHour] = useState(
    notificationSettings.defaultReminderHour.toString()
  );
  const [exportText, setExportText] = useState("");
  const [importText, setImportText] = useState("");

  const handleSaveProfile = () => {
    setUserProfile({
      id: userProfile?.id,
      displayName: displayName.trim() || "Athlete",
      unitSystem,
      weeklyWorkoutGoal: weeklyGoal ? Number(weeklyGoal) : undefined,
      createdAt: userProfile?.createdAt,
    });
  };

  const handleSaveNotifications = () => {
    setNotificationSettings({
      enabled: reminderEnabled,
      defaultReminderHour: Number(reminderHour) || 18,
    });
    // In a real app, here you'd schedule/cancel native notifications
    // via expo-notifications or a similar API.
  };

  const handleExport = () => {
    const json = exportAllData();
    setExportText(json);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    importAllData(importText);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.title}>Profile & Settings</Text>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <Text style={styles.label}>Display name</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Your name"
          placeholderTextColor="#6B7280"
        />

        <Text style={styles.label}>Unit system</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.chip,
              unitSystem === "metric" && styles.chipActive,
            ]}
            onPress={() => setUnitSystem("metric")}
          >
            <Text
              style={[
                styles.chipText,
                unitSystem === "metric" && styles.chipTextActive,
              ]}
            >
              Metric (kg)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.chip,
              unitSystem === "imperial" && styles.chipActive,
            ]}
            onPress={() => setUnitSystem("imperial")}
          >
            <Text
              style={[
                styles.chipText,
                unitSystem === "imperial" && styles.chipTextActive,
              ]}
            >
              Imperial (lb)
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Weekly workout goal</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={weeklyGoal}
          onChangeText={setWeeklyGoal}
          placeholder="e.g. 3"
          placeholderTextColor="#6B7280"
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleSaveProfile}>
          <Text style={styles.primaryButtonText}>Save profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Reminders</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.chip,
              reminderEnabled && styles.chipActive,
            ]}
            onPress={() => setReminderEnabled(true)}
          >
            <Text
              style={[
                styles.chipText,
                reminderEnabled && styles.chipTextActive,
              ]}
            >
              On
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.chip,
              !reminderEnabled && styles.chipActive,
            ]}
            onPress={() => setReminderEnabled(false)}
          >
            <Text
              style={[
                styles.chipText,
                !reminderEnabled && styles.chipTextActive,
              ]}
            >
              Off
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Reminder time (hour 0–23)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={reminderHour}
          onChangeText={setReminderHour}
          placeholder="18"
          placeholderTextColor="#6B7280"
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSaveNotifications}
        >
          <Text style={styles.primaryButtonText}>Save reminder settings</Text>
        </TouchableOpacity>

        <Text style={styles.helperText}>
          Use native notifications (e.g. expo-notifications) to schedule daily
          reminders based on these settings.
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Export / Import</Text>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleExport}>
          <Text style={styles.secondaryButtonText}>Export all data</Text>
        </TouchableOpacity>
        <Text style={styles.helperText}>
          Tap to generate a JSON backup of your routines, history, and settings.
        </Text>

        <Text style={styles.label}>Exported JSON</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          value={exportText}
          multiline
        />

        <Text style={styles.label}>Import JSON</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          value={importText}
          onChangeText={setImportText}
          placeholder="Paste exported JSON here"
          placeholderTextColor="#6B7280"
          multiline
        />

        <TouchableOpacity style={styles.secondaryButton} onPress={handleImport}>
          <Text style={styles.secondaryButtonText}>Import data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { marginTop: 8, borderColor: "#7F1D1D" }]}
          onPress={resetAll}
        >
          <Text style={[styles.secondaryButtonText, { color: "#FCA5A5" }]}>
            Reset all data
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050316" },
  title: { color: "white", fontSize: 24, fontWeight: "700", margin: 16 },
  sectionCard: {
    backgroundColor: "#0B1120",
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: { color: "white", fontSize: 16, fontWeight: "600", marginBottom: 8 },
  label: { color: "#E5E7EB", fontSize: 13, marginTop: 8, marginBottom: 4 },
  input: {
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "white",
    fontSize: 14,
  },
  row: { flexDirection: "row", marginTop: 4 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4B5563",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: "#111827",
    borderColor: "#7C3AED",
  },
  chipText: { color: "#9CA3AF", fontSize: 13 },
  chipTextActive: { color: "white" },
  primaryButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#22C55E",
  },
  primaryButtonText: { color: "white", fontWeight: "600", fontSize: 13 },
  secondaryButton: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4B5563",
  },
  secondaryButtonText: { color: "#E5E7EB", fontSize: 13 },
  helperText: { color: "#6B7280", fontSize: 12, marginTop: 4 },
});

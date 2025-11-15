// src/storage/storage.ts
// Thin abstraction over persistent storage (AsyncStorage-like).
// You can replace this with your platform-specific storage implementation.

export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/**
 * Example implementation using React Native's AsyncStorage.
 * Replace the import with the real one in your project.
 */
// import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_PREFIX = "workoutlogger_";

export const AsyncKeyValueStorage: KeyValueStorage = {
  async getItem(key: string) {
    // return await AsyncStorage.getItem(STORAGE_PREFIX + key);
    // Placeholder implementation for documentation:
    throw new Error(
      "AsyncKeyValueStorage.getItem must be wired to AsyncStorage in a real app."
    );
  },
  async setItem(key: string, value: string) {
    // await AsyncStorage.setItem(STORAGE_PREFIX + key, value);
    throw new Error(
      "AsyncKeyValueStorage.setItem must be wired to AsyncStorage in a real app."
    );
  },
  async removeItem(key: string) {
    // await AsyncStorage.removeItem(STORAGE_PREFIX + key);
    throw new Error(
      "AsyncKeyValueStorage.removeItem must be wired to AsyncStorage in a real app."
    );
  },
};

export const STORAGE_KEYS = {
  APP_STATE: "APP_STATE_V1",
};

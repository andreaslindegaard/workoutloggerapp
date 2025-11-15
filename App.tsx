// App.tsx
// Entry point with navigation shell and tabs.

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { WorkoutStoreProvider } from "./store/workoutStore";
import { TodayScreen } from "./screens/TodayScreen";
import { RoutineListScreen } from "./screens/RoutineListScreen";
import { ProgressScreen } from "./screens/ProgressScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
// For icons, you can use @expo/vector-icons (Ionicons, MaterialIcons, etc.)

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <WorkoutStoreProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarLabelStyle: { fontSize: 12 },
          }}
        >
          <Tab.Screen name="Today" component={TodayScreen} />
          <Tab.Screen name="Routines" component={RoutineListScreen} />
          <Tab.Screen name="Progress" component={ProgressScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </WorkoutStoreProvider>
  );
};

export default App;

import { useState } from "react";
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from "react-native-safe-area-context";
import MealScreen from "./src/screens/MealScreen";
import TrainingScreen from "./src/screens/TrainingScreen";
import TabBar from "./src/components/TabBar";

export default function App() {
  const [activeTab, setActiveTab] = useState('meals');

  return (
    <View style={s.root}>
      <StatusBar style="dark" backgroundColor="#f2f2f7" />
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <View style={s.screen}>
          {activeTab === 'meals' ? <MealScreen /> : <TrainingScreen />}
        </View>
        <TabBar activeTab={activeTab} onSelect={setActiveTab} />
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#f2f2f7' },
  safe:   { flex: 1, backgroundColor: '#f2f2f7' },
  screen: { flex: 1 },
});

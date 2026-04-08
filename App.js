import { useState } from "react";
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import MealScreen from "./src/screens/MealScreen";
import TrainingScreen from "./src/screens/TrainingScreen";
import TabBar from "./src/components/TabBar";


export default function App() {
  const [activeTab, setActiveTab] = useState('meals');

  return (
    <View style={s.root}>
      <StatusBar barStyle={"dark-content"} backgroundColor={"#fef3ee"} />
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        {activeTab === 'meals' ? <MealScreen /> : <TrainingScreen />}
        <TabBar activeTab={activeTab} onSelect={setActiveTab} />
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fef3ee' },
  safe: { flex: 1, backgroundColor: '#fef3ee' },
});

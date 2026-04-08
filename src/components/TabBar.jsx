import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function TabBar({ activeTab, onSelect }) {
  return (
    <View style={s.bar}>
      <TouchableOpacity
        style={[s.tab, activeTab === 'training' && s.tabActive]}
        onPress={() => onSelect('training')}
        activeOpacity={0.75}
      >
        <Text style={[s.label, activeTab === 'training' && s.labelActive]}>Training</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[s.tab, activeTab === 'meals' && s.tabActive]}
        onPress={() => onSelect('meals')}
        activeOpacity={0.75}
      >
        <Text style={[s.label, activeTab === 'meals' && s.labelActive]}>Meal Plan</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f5ddd4',
    paddingBottom: 4,
    paddingTop: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#f0d0c4',
    alignItems: 'center',
    backgroundColor: '#fff8f4',
  },
  tabActive: {
    backgroundColor: '#2c1810',
    borderColor: '#2c1810',
  },
  label: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '600',
    color: '#c8a89c',
    letterSpacing: 0.3,
  },
  labelActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
});

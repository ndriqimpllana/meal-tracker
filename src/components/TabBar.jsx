import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const TABS = [
  { id: 'meals',    label: 'Nutrition', icon: '🥗' },
  { id: 'training', label: 'Training',  icon: '🏋️' },
];

export default function TabBar({ activeTab, onSelect }) {
  return (
    <View style={s.wrapper}>
      <View style={s.bar}>
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[s.tab, active && s.tabActive]}
              onPress={() => onSelect(tab.id)}
              activeOpacity={0.8}
            >
              <Text style={s.tabIcon}>{tab.icon}</Text>
              <Text style={[s.label, active && s.labelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0d0c4',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    shadowColor: '#2c1810',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: '#f5ece8',
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 13,
    gap: 7,
  },
  tabActive: {
    backgroundColor: '#1a0f0a',
    shadowColor: '#1a0f0a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 4,
  },
  tabIcon:     { fontSize: 17 },
  label:       { fontSize: 13, fontWeight: '600', color: '#c8a89c', letterSpacing: 0.2 },
  labelActive: { color: '#ffffff', fontWeight: '700' },
});

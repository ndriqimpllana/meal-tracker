import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const TABS = [
  { id: 'meals',    label: 'Nutrition', icon: '🥗' },
  { id: 'training', label: 'Training',  icon: '🏋️' },
];

export default function TabBar({ activeTab, onSelect }) {
  return (
    <View style={s.wrapper}>
      <View style={s.pill}>
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[s.tab, active && s.tabActive]}
              onPress={() => onSelect(tab.id)}
              activeOpacity={0.85}
            >
              <Text style={s.icon}>{tab.icon}</Text>
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
    backgroundColor: '#f2f2f7',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1e',
    borderRadius: 30,
    padding: 5,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  tabActive: {
    backgroundColor: '#30d158',
    shadowColor: '#30d158',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  icon:        { fontSize: 17 },
  label:       { fontSize: 14, fontWeight: '700', color: '#6b7280' },
  labelActive: { color: '#1a1a1e', fontWeight: '800' },
});

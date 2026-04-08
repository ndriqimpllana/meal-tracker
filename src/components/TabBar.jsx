import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';


export default function TabBar ({ activeTab, onSelect}) {
    return (
        <View style={s.bar}>
            <TouchableOpacity
                style={[s.tab, activeTab === 'training' && s.tabActive]}
                onPress={() => onSelect('training')}
                activeOpacity={0.7}
            >
                <Text style={[s.label, activeTab === 'training' && s.labelActive]}>Training</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[s.tab, activeTab === 'meals' && s.tabActive]}
                onPress={() => onSelect('meals')}
                activeOpacity={0.7}
            >
                <Text style={[s.label, activeTab === 'meals' && s.labelActive]}>Meal Plan</Text>
            </TouchableOpacity>
        </View>
    );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#0b0f1a',
    borderTopWidth: 1,
    borderTopColor: '#253048',
    paddingBottom: 4,
    paddingTop: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#253048',
    alignItems: 'center',
    backgroundColor: '#131929',
  },
  tabActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  label: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#536080',
    letterSpacing: 0.5,
  },
  labelActive: {
    color: '#000000',
    fontWeight: '600',
  },
});

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
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#242424',
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
    borderColor: '#242424',
    alignItems: 'center',
    backgroundColor: '#111111',
  },
  tabActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  label: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#666666',
    letterSpacing: 0.5,
  },
  labelActive: {
    color: '#000000',
    fontWeight: '600',
  },
});
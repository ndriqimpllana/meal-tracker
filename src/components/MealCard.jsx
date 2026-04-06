import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function MealCard({ meal, checked, onToggle }) {
  return (
    <TouchableOpacity
      style={[s.card, checked && s.cardChecked]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={[s.circle, checked && s.circleChecked]}>
        {checked && <Text style={s.checkmark}>✓</Text>}
      </View>
      <View style={s.info}>
        <Text style={s.slot}>{meal.slot}</Text>
        <Text style={s.name}>{meal.name}</Text>
        <Text style={s.macros}>{meal.macros}</Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 10,
  },
  cardChecked: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: '#333333',
  },

  circle: {
    flexShrink: 0,
    width: 20,
    height: 20,
    marginTop: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#3a3a3a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleChecked: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  checkmark: {
    fontSize: 10,
    color: '#000000',
    lineHeight: 12,
  },

  info: { flex: 1 },
  slot: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#666666',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  name: {
    fontSize: 13,
    fontWeight: '500',
    color: '#ffffff',
    lineHeight: 19,
  },
  macros: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#666666',
    marginTop: 6,
  },
});

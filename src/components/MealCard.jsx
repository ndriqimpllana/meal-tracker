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
        <Text style={[s.slot, checked && s.dimText]}>{meal.slot}</Text>
        <Text style={[s.name, checked && s.dimText]}>{meal.name}</Text>
        <Text style={[s.desc, checked && s.dimText]}>{meal.desc}</Text>
        <View style={s.macroRow}>
          <Text style={[s.macroKcal,    checked && s.dimText]}>{meal.kcal} kcal</Text>
          <Text style={[s.macroDot,     checked && s.dimText]}>·</Text>
          <Text style={[s.macroProtein, checked && s.dimText]}>{meal.protein}g P</Text>
          <Text style={[s.macroDot,     checked && s.dimText]}>·</Text>
          <Text style={[s.macroCarbs,   checked && s.dimText]}>{meal.carbs}g C</Text>
          <Text style={[s.macroDot,     checked && s.dimText]}>·</Text>
          <Text style={[s.macroFat,     checked && s.dimText]}>{meal.fat}g F</Text>
          <Text style={[s.macroDot,     checked && s.dimText]}>·</Text>
          <Text style={[s.macroFiber,   checked && s.dimText]}>{meal.fiber}g fib</Text>
        </View>
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
    backgroundColor: '#131929',
    borderWidth: 1,
    borderColor: '#253048',
    borderRadius: 10,
  },
  cardChecked: {
    backgroundColor: '#0e1220',
    borderColor: '#1c2640',
  },

  circle: {
    flexShrink: 0,
    width: 20,
    height: 20,
    marginTop: 2,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#3d4f6b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleChecked: {
    backgroundColor: '#4ade80',
    borderColor: '#4ade80',
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
    color: '#536080',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e8edf5',
    lineHeight: 20,
    marginBottom: 4,
  },
  desc: {
    fontSize: 12,
    color: '#8b9cbf',
    lineHeight: 18,
    marginBottom: 8,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 3,
  },
  macroKcal:    { fontFamily: 'monospace', fontSize: 10, color: '#fb923c' },
  macroProtein: { fontFamily: 'monospace', fontSize: 10, color: '#c084fc' },
  macroCarbs:   { fontFamily: 'monospace', fontSize: 10, color: '#fbbf24' },
  macroFat:     { fontFamily: 'monospace', fontSize: 10, color: '#f87171' },
  macroFiber:   { fontFamily: 'monospace', fontSize: 10, color: '#2dd4bf' },
  macroDot: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#3d4f6b',
  },
  dimText: {
    color: '#2d3a52',
  },
});

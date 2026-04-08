import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function MealCard({ meal, checked, onToggle }) {
  return (
    <TouchableOpacity
      style={[s.card, checked && s.cardChecked]}
      onPress={onToggle}
      activeOpacity={0.75}
    >
      <View style={s.accentBar} />
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
    paddingLeft: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#f5ddd4',
    borderRadius: 14,
    shadowColor: '#c4906c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  cardChecked: {
    backgroundColor: '#fdf8f6',
    borderColor: '#f0e4de',
    shadowOpacity: 0.04,
  },

  accentBar: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: '#f97316',
    borderRadius: 2,
    marginRight: 2,
    flexShrink: 0,
  },

  circle: {
    flexShrink: 0,
    width: 22,
    height: 22,
    marginTop: 2,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#f0d0c4',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff8f4',
  },
  circleChecked: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  checkmark: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '700',
    lineHeight: 13,
  },

  info: { flex: 1, paddingRight: 12 },
  slot: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#f97316',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 3,
    fontWeight: '700',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2c1810',
    lineHeight: 21,
    marginBottom: 4,
  },
  desc: {
    fontSize: 12,
    color: '#9b7060',
    lineHeight: 18,
    marginBottom: 8,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 3,
  },
  macroKcal:    { fontFamily: 'monospace', fontSize: 10, color: '#f97316', fontWeight: '600' },
  macroProtein: { fontFamily: 'monospace', fontSize: 10, color: '#a855f7', fontWeight: '600' },
  macroCarbs:   { fontFamily: 'monospace', fontSize: 10, color: '#f59e0b', fontWeight: '600' },
  macroFat:     { fontFamily: 'monospace', fontSize: 10, color: '#ef4444', fontWeight: '600' },
  macroFiber:   { fontFamily: 'monospace', fontSize: 10, color: '#14b8a6', fontWeight: '600' },
  macroDot: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#e8c8bc',
  },
  dimText: { color: '#d4b8b0' },
});

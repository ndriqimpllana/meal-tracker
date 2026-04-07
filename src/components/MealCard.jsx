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
          <Text style={[s.macroChip, checked && s.dimText]}>{meal.kcal} kcal</Text>
          <Text style={[s.macroDot, checked && s.dimText]}>·</Text>
          <Text style={[s.macroChip, checked && s.dimText]}>{meal.protein}g P</Text>
          <Text style={[s.macroDot, checked && s.dimText]}>·</Text>
          <Text style={[s.macroChip, checked && s.dimText]}>{meal.carbs}g C</Text>
          <Text style={[s.macroDot, checked && s.dimText]}>·</Text>
          <Text style={[s.macroChip, checked && s.dimText]}>{meal.fat}g F</Text>
          <Text style={[s.macroDot, checked && s.dimText]}>·</Text>
          <Text style={[s.macroChip, checked && s.dimText]}>{meal.fiber}g fib</Text>
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
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 10,
  },
  cardChecked: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: '#1e1e1e',
  },

  circle: {
    flexShrink: 0,
    width: 20,
    height: 20,
    marginTop: 2,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    lineHeight: 20,
    marginBottom: 4,
  },
  desc: {
    fontSize: 12,
    color: '#888888',
    lineHeight: 18,
    marginBottom: 8,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 3,
  },
  macroChip: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#555555',
    letterSpacing: 0.2,
  },
  macroDot: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#333333',
  },
  dimText: {
    color: '#333333',
  },
});

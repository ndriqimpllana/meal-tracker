import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const SLOT_COLORS = {
  Breakfast: '#f59e0b',
  Lunch:     '#30d158',
  Dinner:    '#0a84ff',
  Snack:     '#af52de',
};

export default function MealCard({ meal, checked, onToggle }) {
  const accentColor = SLOT_COLORS[meal.slot] ?? '#9ca3af';

  return (
    <TouchableOpacity
      style={[s.card, checked && s.cardChecked]}
      onPress={onToggle}
      activeOpacity={0.78}
    >
      {/* Left accent */}
      <View style={[s.bar, { backgroundColor: checked ? '#d1d5db' : accentColor }]} />

      <View style={s.body}>
        {/* Top row */}
        <View style={s.topRow}>
          <View style={s.titleBlock}>
            <Text style={[s.slot, { color: checked ? '#9ca3af' : accentColor }]}>{meal.slot}</Text>
            <Text style={[s.name, checked && s.dimText]}>{meal.name}</Text>
          </View>
          {/* Check circle */}
          <View style={[s.circle, checked && s.circleChecked]}>
            {checked && <Text style={s.checkmark}>✓</Text>}
          </View>
        </View>

        {/* Description */}
        {meal.desc ? (
          <Text style={[s.desc, checked && s.dimText]}>{meal.desc}</Text>
        ) : null}

        {/* Macro chips */}
        <View style={s.chips}>
          <View style={[s.chip, s.chipCal,     checked && s.chipDim]}>
            <Text style={[s.chipText, checked && s.dimText]}>{meal.kcal} kcal</Text>
          </View>
          <View style={[s.chip, s.chipProtein, checked && s.chipDim]}>
            <Text style={[s.chipText, { color: checked ? '#9ca3af' : '#7c3aed' }]}>{meal.protein}g P</Text>
          </View>
          <View style={[s.chip, s.chipCarbs,   checked && s.chipDim]}>
            <Text style={[s.chipText, { color: checked ? '#9ca3af' : '#d97706' }]}>{meal.carbs}g C</Text>
          </View>
          <View style={[s.chip, s.chipFat,     checked && s.chipDim]}>
            <Text style={[s.chipText, { color: checked ? '#9ca3af' : '#ef4444' }]}>{meal.fat}g F</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 2,
  },
  cardChecked: {
    backgroundColor: '#fafafa',
    shadowOpacity: 0.03,
    elevation: 1,
  },

  bar:  { width: 5, backgroundColor: '#f59e0b' },

  body: { flex: 1, padding: 14, gap: 8 },

  topRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleBlock: { flex: 1, gap: 2 },
  slot: {
    fontSize: 10, fontWeight: '800', letterSpacing: 1,
    textTransform: 'uppercase',
  },
  name: { fontSize: 15, fontWeight: '700', color: '#1a1a1e', lineHeight: 20 },

  circle: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: '#e5e7eb',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  circleChecked: { backgroundColor: '#30d158', borderColor: '#30d158' },
  checkmark: { fontSize: 13, color: '#ffffff', fontWeight: '800', lineHeight: 15 },

  desc: { fontSize: 12, color: '#6b7280', lineHeight: 18 },
  dimText: { color: '#9ca3af' },

  chips:       { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  chip:        { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  chipDim:     { backgroundColor: '#f3f4f6' },
  chipCal:     { backgroundColor: '#fff7ed' },
  chipProtein: { backgroundColor: '#f5f3ff' },
  chipCarbs:   { backgroundColor: '#fffbeb' },
  chipFat:     { backgroundColor: '#fef2f2' },
  chipText:    { fontSize: 10, fontWeight: '700', color: '#f97316' },
});

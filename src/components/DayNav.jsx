import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const DAYS_SHORT = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function DayNav({ days, activeDay, todayIndex, checkedMap, onSelect }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={s.scroll}
      contentContainerStyle={s.row}
    >
      {days.map((d, i) => {
        const done      = d.meals.every((_, mi) => checkedMap[`${i}-${mi}`]);
        const any       = d.meals.some((_, mi) => checkedMap[`${i}-${mi}`]);
        const isActive  = i === activeDay;
        const isToday   = i === todayIndex;

        let dotColor = '#d1d5db';
        if (done)  dotColor = '#30d158';
        else if (any) dotColor = '#f59e0b';
        else if (d.type === 'training') dotColor = '#0a84ff';
        if (isActive) dotColor = 'rgba(255,255,255,0.55)';

        return (
          <TouchableOpacity
            key={i}
            style={[s.day, isActive && s.dayActive]}
            onPress={() => onSelect(i)}
            activeOpacity={0.75}
          >
            <Text style={[s.label, isActive && s.labelActive]}>
              {isToday ? 'TODAY' : DAYS_SHORT[i]}
            </Text>
            <Text style={[s.num, isActive && s.numActive]}>{i + 1}</Text>
            <View style={[s.dot, { backgroundColor: dotColor }]} />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { marginBottom: 20 },
  row:    { gap: 8, paddingRight: 4 },

  day: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 12,
    minWidth: 60,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  dayActive: {
    backgroundColor: '#1a1a1e',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 5,
  },
  label:       { fontSize: 9, fontWeight: '700', color: '#9ca3af', letterSpacing: 0.8 },
  labelActive: { color: '#9ca3af' },
  num:         { fontSize: 20, fontWeight: '800', color: '#1a1a1e' },
  numActive:   { color: '#ffffff' },
  dot: {
    width: 5, height: 5, borderRadius: 2.5,
  },
});

import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

export default function DayNav({ days, activeDay, todayIndex, checkedMap, onSelect }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={s.nav}
      contentContainerStyle={s.navContent}
    >
      {days.map((d, i) => {
        const done = d.meals.every((_, mi) => checkedMap[`${i}-${mi}`]);
        const any = d.meals.some((_, mi) => checkedMap[`${i}-${mi}`]);
        const isActive = i === activeDay;
        const isTraining = d.type === 'training';
        const isToday = i === todayIndex;

        return (
          <TouchableOpacity
            key={i}
            style={[
              s.btn,
              isActive && s.btnActive,
              !isActive && isTraining && s.btnTraining,
            ]}
            onPress={() => onSelect(i)}
            activeOpacity={0.7}
          >
            <Text style={[s.short, isActive && s.activeText]}>
              {isToday && isActive ? 'TODAY' : d.short}
            </Text>
            <Text style={[s.num, isActive && s.activeText]}>{i + 1}</Text>
            <View style={[
              s.dot,
              isActive ? s.dotActive :
              done ? s.dotDone :
              any ? s.dotPartial :
              isTraining ? s.dotTraining :
              s.dotDefault,
            ]} />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  nav: { marginBottom: 20 },
  navContent: { gap: 6, paddingBottom: 4 },

  btn: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#253048',
    backgroundColor: '#131929',
    overflow: 'hidden',
  },
  btnActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  btnTraining: {
    borderColor: '#253048',
  },

  short: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#536080',
    letterSpacing: 0.5,
  },
  num: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e8edf5',
  },
  activeText: { color: '#000000' },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dotDefault:  { backgroundColor: '#3d4f6b' },
  dotActive:   { backgroundColor: '#000000' },
  dotTraining: { backgroundColor: '#60a5fa', opacity: 0.6 },
  dotDone:     { backgroundColor: '#4ade80' },
  dotPartial:  { backgroundColor: '#fbbf24' },
});

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
        const any  = d.meals.some((_, mi) => checkedMap[`${i}-${mi}`]);
        const isActive   = i === activeDay;
        const isTraining = d.type === 'training';
        const isToday    = i === todayIndex;

        return (
          <TouchableOpacity
            key={i}
            style={[s.btn, isActive && s.btnActive, !isActive && isTraining && s.btnTraining]}
            onPress={() => onSelect(i)}
            activeOpacity={0.75}
          >
            <Text style={[s.short, isActive && s.activeText]}>
              {isToday && isActive ? 'TODAY' : d.short}
            </Text>
            <Text style={[s.num, isActive && s.activeText]}>{i + 1}</Text>
            <View style={[
              s.dot,
              isActive   ? s.dotActive   :
              done       ? s.dotDone     :
              any        ? s.dotPartial  :
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
    paddingVertical: 9,
    minWidth: 54,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#f0d0c4',
    backgroundColor: '#fff8f4',
    shadowColor: '#c4906c',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  btnActive: {
    backgroundColor: '#2c1810',
    borderColor: '#2c1810',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  btnTraining: {
    borderColor: '#e8c8bc',
  },

  short: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#c8a89c',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  num: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2c1810',
  },
  activeText: { color: '#ffffff' },

  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotDefault:  { backgroundColor: '#e8c8bc' },
  dotActive:   { backgroundColor: 'rgba(255,255,255,0.5)' },
  dotTraining: { backgroundColor: '#3b82f6', opacity: 0.7 },
  dotDone:     { backgroundColor: '#16a34a' },
  dotPartial:  { backgroundColor: '#f59e0b' },
});

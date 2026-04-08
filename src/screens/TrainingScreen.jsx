import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useWorkouts, useWorkoutLogs } from '../hooks/useWorkouts';
import ExerciseSearchModal from '../components/ExerciseSearchModal';
import LogSetModal from '../components/LogSetModal';

const ACCENT = '#4ade80';

const TRAINING_DAYS = [
  { index: 0, short: 'MON', name: 'Monday' },
  { index: 1, short: 'TUE', name: 'Tuesday' },
  { index: 3, short: 'THU', name: 'Thursday' },
  { index: 4, short: 'FRI', name: 'Friday' },
  { index: 5, short: 'SAT', name: 'Saturday' },
];

const dayMap = [6, 0, 1, 2, 3, 4, 5];
const todayIndex = dayMap[new Date().getDay()];
const defaultDay = TRAINING_DAYS.find(d => d.index === todayIndex) ?? TRAINING_DAYS[0];

export default function TrainingScreen() {
  const [activeDay, setActiveDay]     = useState(defaultDay.index);
  const [searchVisible, setSearchVisible] = useState(false);
  const [selectedEx, setSelectedEx]   = useState(null);
  const [plan, setPlan]               = useWorkouts();
  const [logs, setLogs]               = useWorkoutLogs();

  const today    = new Date().toISOString().split('T')[0];
  const exercises = plan[activeDay] ?? [];

  const addExercise = (ex) => {
    setPlan(prev => ({
      ...prev,
      [activeDay]: [...(prev[activeDay] ?? []), ex],
    }));
  };

  const removeExercise = (exId) => {
    Alert.alert(
      'Remove Exercise',
      'Remove this exercise from the day?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive', onPress: () => {
            setPlan(prev => ({
              ...prev,
              [activeDay]: (prev[activeDay] ?? []).filter(e => e.id !== exId),
            }));
          }
        },
      ]
    );
  };

  const getSets = (exId) => logs[today]?.[exId] ?? [];

  const getPreviousSessions = (exId) => {
    return Object.entries(logs)
      .filter(([date]) => date !== today)
      .map(([date, dayLog]) => {
        const sets = dayLog[exId];
        if (!sets || sets.length === 0) return null;
        return {
          date,
          sets: sets.length,
          maxWeight: Math.max(...sets.map(s => s.weight)),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  };

  const getLastSession = (exId) => {
    const sessions = getPreviousSessions(exId);
    return sessions[0] ?? null;
  };

  const addSet = (exId, set) => {
    setLogs(prev => ({
      ...prev,
      [today]: {
        ...(prev[today] ?? {}),
        [exId]: [...(prev[today]?.[exId] ?? []), set],
      },
    }));
  };

  const removeSet = (exId, index) => {
    setLogs(prev => {
      const sets = [...(prev[today]?.[exId] ?? [])];
      sets.splice(index, 1);
      return { ...prev, [today]: { ...(prev[today] ?? {}), [exId]: sets } };
    });
  };

  return (
    <View style={s.root}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.appLabel}>Training</Text>
          <Text style={s.title}>Your workouts</Text>
        </View>

        {/* Day selector */}
        <View style={s.dayRow}>
          {TRAINING_DAYS.map(d => (
            <TouchableOpacity
              key={d.index}
              style={[s.dayBtn, activeDay === d.index && s.dayBtnActive]}
              onPress={() => setActiveDay(d.index)}
              activeOpacity={0.7}
            >
              <Text style={[s.dayShort, activeDay === d.index && s.dayShortActive]}>{d.short}</Text>
              {todayIndex === d.index && (
                <View style={[s.todayDot, activeDay === d.index && s.todayDotActive]} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Exercise list */}
        <View style={s.exerciseList}>
          {exercises.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyText}>No exercises added yet</Text>
              <Text style={s.emptySubText}>Tap + to add exercises to this day</Text>
            </View>
          ) : (
            exercises.map((ex, i) => {
              const todaySets  = getSets(ex.id);
              const lastSesh   = getLastSession(ex.id);
              const hasLoggedToday = todaySets.length > 0;

              return (
                <TouchableOpacity
                  key={i}
                  style={[s.exCard, hasLoggedToday && s.exCardActive]}
                  onPress={() => setSelectedEx(ex)}
                  onLongPress={() => removeExercise(ex.id)}
                  activeOpacity={0.7}
                  delayLongPress={500}
                >
                  <View style={s.exCardTop}>
                    <View style={s.exCardLeft}>
                      <Text style={s.exName}>{ex.name}</Text>
                      <Text style={s.exMeta}>{ex.category} · {ex.equipment}</Text>
                    </View>
                    {hasLoggedToday && (
                      <View style={s.setsBadge}>
                        <Text style={s.setsBadgeText}>{todaySets.length}</Text>
                        <Text style={s.setsBadgeLabel}>sets</Text>
                      </View>
                    )}
                  </View>

                  <View style={s.exCardBottom}>
                    {lastSesh ? (
                      <Text style={s.lastSession}>
                        Last: {lastSesh.sets} sets · {lastSesh.maxWeight} kg max · {lastSesh.date}
                      </Text>
                    ) : (
                      <Text style={s.lastSession}>No previous session</Text>
                    )}
                    <Text style={s.longPressHint}>Hold to remove</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

      </ScrollView>

      {/* Add button */}
      <TouchableOpacity style={s.addBtn} onPress={() => setSearchVisible(true)} activeOpacity={0.8}>
        <Text style={s.addBtnText}>+ Add Exercise</Text>
      </TouchableOpacity>

      <ExerciseSearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        onAdd={addExercise}
      />
      <LogSetModal
        visible={!!selectedEx}
        exercise={selectedEx}
        date={today}
        sets={selectedEx ? getSets(selectedEx.id) : []}
        previousSessions={selectedEx ? getPreviousSessions(selectedEx.id) : []}
        onAdd={(set) => addSet(selectedEx.id, set)}
        onRemove={(i) => removeSet(selectedEx.id, i)}
        onClose={() => setSelectedEx(null)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000000' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },

  header: {
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#242424',
    marginBottom: 20,
  },
  appLabel: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#666666',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
  },

  dayRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 24,
  },
  dayBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#242424',
    backgroundColor: '#111111',
    gap: 4,
  },
  dayBtnActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  dayShort: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#666666',
    letterSpacing: 0.5,
  },
  dayShortActive: { color: '#000000' },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ACCENT,
  },
  todayDotActive: {
    backgroundColor: '#000000',
  },

  exerciseList: { gap: 10 },
  empty: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 6,
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptySubText: {
    color: '#666666',
    fontFamily: 'monospace',
    fontSize: 11,
  },

  exCard: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 10,
    padding: 14,
    gap: 10,
  },
  exCardActive: {
    borderColor: ACCENT + '55',
    backgroundColor: '#0d1a0d',
  },
  exCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  exCardLeft: { flex: 1, gap: 3 },
  exName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  exMeta: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#666666',
  },
  setsBadge: {
    alignItems: 'center',
    backgroundColor: ACCENT + '22',
    borderWidth: 1,
    borderColor: ACCENT + '55',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  setsBadgeText: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '600',
    color: ACCENT,
  },
  setsBadgeLabel: {
    fontFamily: 'monospace',
    fontSize: 8,
    color: ACCENT,
    opacity: 0.7,
  },
  exCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastSession: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#444444',
    flex: 1,
  },
  longPressHint: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#333333',
  },

  addBtn: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addBtnText: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 0.5,
  },
});

import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useWorkouts, useWorkoutLogs } from '../hooks/useWorkouts';
import ExerciseSearchModal from '../components/ExerciseSearchModal';
import LogSetModal from '../components/LogSetModal';
import SessionSummaryModal from '../components/SessionSummaryModal';
import SwipeableCard from '../components/SwipeableCard';

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
  const [activeDay, setActiveDay]         = useState(defaultDay.index);
  const [searchVisible, setSearchVisible] = useState(false);
  const [selectedEx, setSelectedEx]       = useState(null);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [copyVisible, setCopyVisible]       = useState(false);
  const [removeTarget, setRemoveTarget]     = useState(null);
  const [plan, setPlan]                   = useWorkouts();
  const [logs, setLogs]                   = useWorkoutLogs();

  const today     = new Date().toISOString().split('T')[0];
  const exercises = plan[activeDay] ?? [];

  // Volume for today
  const todayLog     = logs[today] ?? {};
  const totalSetsToday  = exercises.reduce((sum, ex) => sum + (todayLog[ex.id]?.length ?? 0), 0);
  const totalVolumeToday = exercises.reduce((sum, ex) => {
    const sets = todayLog[ex.id] ?? [];
    return sum + sets.reduce((s, set) => s + set.weight * set.reps, 0);
  }, 0);
  const hasLoggedToday = totalSetsToday > 0;

  const addExercise = (ex) => {
    setPlan(prev => ({
      ...prev,
      [activeDay]: [...(prev[activeDay] ?? []), ex],
    }));
  };

  const removeExercise = (exId) => setRemoveTarget(exId);

  const confirmRemove = () => {
    setPlan(prev => ({
      ...prev,
      [activeDay]: (prev[activeDay] ?? []).filter(e => e.id !== removeTarget),
    }));
    setRemoveTarget(null);
  };

  const copyPlanToDay = (targetDayIndex) => {
    const currentExercises = plan[activeDay] ?? [];
    const targetExercises  = plan[targetDayIndex] ?? [];
    const existingIds = new Set(targetExercises.map(e => e.id));
    const toAdd = currentExercises.filter(e => !existingIds.has(e.id));
    setPlan(prev => ({
      ...prev,
      [targetDayIndex]: [...targetExercises, ...toAdd],
    }));
    setCopyVisible(false);
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
          sets:      sets.length,
          maxWeight: Math.max(...sets.map(s => s.weight)),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 8);
  };

  const getLastSession = (exId) => getPreviousSessions(exId)[0] ?? null;

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

  const otherDays = TRAINING_DAYS.filter(d => d.index !== activeDay);

  return (
    <View style={s.root}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.headerTop}>
            <View>
              <Text style={s.appLabel}>Training</Text>
              <Text style={s.title}>Your workouts</Text>
            </View>
            {exercises.length > 0 && (
              <TouchableOpacity style={s.copyBtn} onPress={() => setCopyVisible(true)} activeOpacity={0.7}>
                <Text style={s.copyBtnText}>Copy Plan</Text>
              </TouchableOpacity>
            )}
          </View>
          {hasLoggedToday && (
            <View style={s.volumeRow}>
              <Text style={s.volumeText}>
                Today: <Text style={s.volumeAccent}>{totalVolumeToday.toLocaleString()} lbs</Text>
                {'  ·  '}
                <Text style={s.volumeAccent}>{totalSetsToday} sets</Text>
              </Text>
            </View>
          )}
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
              const todaySets      = getSets(ex.id);
              const lastSesh       = getLastSession(ex.id);
              const hasLogged      = todaySets.length > 0;

              return (
                <SwipeableCard
                  key={i}
                  style={[s.exCard, hasLogged && s.exCardActive]}
                  onSwipe={() => removeExercise(ex.id)}
                >
                  <TouchableOpacity
                    onPress={() => setSelectedEx(ex)}
                    activeOpacity={0.7}
                  >
                    <View style={s.exCardTop}>
                      <View style={s.exCardLeft}>
                        <Text style={s.exName}>{ex.name}</Text>
                        <Text style={s.exMeta}>{ex.category} · {ex.equipment}</Text>
                      </View>
                      {hasLogged && (
                        <View style={s.setsBadge}>
                          <Text style={s.setsBadgeText}>{todaySets.length}</Text>
                          <Text style={s.setsBadgeLabel}>sets</Text>
                        </View>
                      )}
                    </View>
                    <View style={s.exCardBottom}>
                      <Text style={s.lastSession}>
                        {lastSesh
                          ? `Last: ${lastSesh.sets} sets · ${lastSesh.maxWeight} lbs max · ${lastSesh.date}`
                          : 'No previous session'}
                      </Text>
                      <Text style={s.swipeHint}>Swipe to remove</Text>
                    </View>
                  </TouchableOpacity>
                </SwipeableCard>
              );
            })
          )}
        </View>

      </ScrollView>

      {/* Bottom buttons */}
      <View style={s.bottomBtns}>
        {hasLoggedToday && (
          <TouchableOpacity style={s.finishBtn} onPress={() => setSummaryVisible(true)} activeOpacity={0.8}>
            <Text style={s.finishBtnText}>Finish Workout</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={s.addBtn} onPress={() => setSearchVisible(true)} activeOpacity={0.8}>
          <Text style={s.addBtnText}>+ Add Exercise</Text>
        </TouchableOpacity>
      </View>

      {/* Remove exercise modal */}
      <Modal visible={!!removeTarget} transparent animationType="fade">
        <View style={s.copyOverlay}>
          <View style={s.copyDialog}>
            <Text style={s.copyTitle}>Remove Exercise?</Text>
            <Text style={s.copySubtitle}>This will remove it from {TRAINING_DAYS.find(d => d.index === activeDay)?.name}</Text>
            <View style={s.dialogBtns}>
              <TouchableOpacity style={s.dialogCancel} onPress={() => setRemoveTarget(null)} activeOpacity={0.7}>
                <Text style={s.dialogCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.dialogRemove} onPress={confirmRemove} activeOpacity={0.7}>
                <Text style={s.dialogRemoveText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Copy plan modal */}
      <Modal visible={copyVisible} transparent animationType="fade">
        <View style={s.copyOverlay}>
          <View style={s.copyDialog}>
            <Text style={s.copyTitle}>Copy to which day?</Text>
            <Text style={s.copySubtitle}>
              Copies {exercises.length} exercise{exercises.length !== 1 ? 's' : ''} from {TRAINING_DAYS.find(d => d.index === activeDay)?.name}
            </Text>
            <View style={s.copyDayList}>
              {otherDays.map(d => (
                <TouchableOpacity key={d.index} style={s.copyDayBtn} onPress={() => copyPlanToDay(d.index)} activeOpacity={0.7}>
                  <Text style={s.copyDayText}>{d.name}</Text>
                  <Text style={s.copyDayCount}>{(plan[d.index] ?? []).length} exercises</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={s.copyCancelBtn} onPress={() => setCopyVisible(false)} activeOpacity={0.7}>
              <Text style={s.copyCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
      <SessionSummaryModal
        visible={summaryVisible}
        onClose={() => setSummaryVisible(false)}
        exercises={exercises}
        logs={logs}
        date={today}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000000' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 120 },

  header: {
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#242424',
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
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
  copyBtn: {
    borderWidth: 1,
    borderColor: '#242424',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    marginTop: 4,
  },
  copyBtnText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#666666',
    letterSpacing: 0.5,
  },
  volumeRow: { marginTop: 4 },
  volumeText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#555555',
  },
  volumeAccent: {
    color: ACCENT,
    fontWeight: '600',
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
  todayDotActive: { backgroundColor: '#000000' },

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
  swipeHint: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#333333',
  },

  bottomBtns: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    gap: 8,
  },
  finishBtn: {
    backgroundColor: '#0d1a0d',
    borderWidth: 1,
    borderColor: ACCENT + '55',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  finishBtnText: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '600',
    color: ACCENT,
    letterSpacing: 0.5,
  },
  addBtn: {
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

  // Copy modal
  copyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyDialog: {
    width: 300,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 12,
    padding: 20,
  },
  copyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  copySubtitle: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#555555',
    marginBottom: 16,
  },
  copyDayList: { gap: 8, marginBottom: 12 },
  copyDayBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 8,
    backgroundColor: '#0a0a0a',
  },
  copyDayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  copyDayCount: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#555555',
  },
  copyCancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 8,
  },
  copyCancelText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#666666',
  },

  dialogBtns: { flexDirection: 'row', gap: 10 },
  dialogCancel: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 6,
    alignItems: 'center',
  },
  dialogCancelText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#666666',
  },
  dialogRemove: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#1a0a0a',
    borderWidth: 1,
    borderColor: '#f8717155',
    borderRadius: 6,
    alignItems: 'center',
  },
  dialogRemoveText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#f87171',
    fontWeight: '600',
  },
});

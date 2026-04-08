import { useState, useMemo, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useWorkouts, useWorkoutLogs } from '../hooks/useWorkouts';
import { useStorage } from '../hooks/useStorage';
import ExerciseSearchModal from '../components/ExerciseSearchModal';
import LogSetModal from '../components/LogSetModal';
import SessionSummaryModal from '../components/SessionSummaryModal';
import WorkoutHistoryModal from '../components/WorkoutHistoryModal';
import SwipeableCard from '../components/SwipeableCard';

const ACCENT = '#4ade80';

const TRAINING_DAYS = [
  { index: 0, short: 'MON', name: 'Monday' },
  { index: 1, short: 'TUE', name: 'Tuesday' },
  { index: 3, short: 'THU', name: 'Thursday' },
  { index: 4, short: 'FRI', name: 'Friday' },
  { index: 5, short: 'SAT', name: 'Saturday' },
];

export default function TrainingScreen() {
  const dayMap     = [6, 0, 1, 2, 3, 4, 5];
  const todayIndex = dayMap[new Date().getDay()];
  const today      = new Date().toISOString().split('T')[0];
  const defaultDay = TRAINING_DAYS.find(d => d.index === todayIndex) ?? TRAINING_DAYS[0];

  const [activeDay, setActiveDay]                   = useState(defaultDay.index);
  const [searchVisible, setSearchVisible]           = useState(false);
  const [selectedEx, setSelectedEx]                 = useState(null);
  const [summaryVisible, setSummaryVisible]         = useState(false);
  const [copyVisible, setCopyVisible]               = useState(false);
  const [removeTarget, setRemoveTarget]             = useState(null);
  const [historyVisible, setHistoryVisible]         = useState(false);
  const [plan, setPlan]                             = useWorkouts();
  const [logs, setLogs]                             = useWorkoutLogs();
  const [completedWorkouts, setCompletedWorkouts]   = useStorage('completedWorkouts', {});
  const workoutStartRef                             = useRef(null);

  const exercises = useMemo(() => plan[activeDay] ?? [], [plan, activeDay]);
  const todayLog  = useMemo(() => logs[today] ?? {}, [logs, today]);
  const otherDays = useMemo(() => TRAINING_DAYS.filter(d => d.index !== activeDay), [activeDay]);

  // Volume stats — only recomputed when exercises or todayLog change
  const { totalSetsToday, totalVolumeToday } = useMemo(() => {
    let sets = 0, volume = 0;
    exercises.forEach(ex => {
      const exSets = todayLog[ex.id] ?? [];
      sets += exSets.length;
      volume += exSets.reduce((s, set) => s + set.weight * set.reps, 0);
    });
    return { totalSetsToday: sets, totalVolumeToday: volume };
  }, [exercises, todayLog]);

  // Previous sessions per exercise — computed once per logs change, cached by exId
  const previousSessionsMap = useMemo(() => {
    const map = {};
    const pastDates = Object.entries(logs).filter(([date]) => date !== today);
    // collect all exercise ids across all days
    const allExIds = new Set(Object.values(plan).flat().map(e => e.id));
    allExIds.forEach(exId => {
      map[exId] = pastDates
        .map(([date, dayLog]) => {
          const sets = dayLog[exId];
          if (!sets?.length) return null;
          return { date, sets: sets.length, maxWeight: Math.max(...sets.map(s => s.weight)) };
        })
        .filter(Boolean)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 8);
    });
    return map;
  }, [logs, plan, today]);

  const addExercise = useCallback((ex) => {
    setPlan(prev => ({
      ...prev,
      [activeDay]: [...(prev[activeDay] ?? []), ex],
    }));
  }, [activeDay, setPlan]);

  const removeExercise = useCallback((exId) => setRemoveTarget(exId), []);

  const confirmRemove = useCallback(() => {
    setPlan(prev => ({
      ...prev,
      [activeDay]: (prev[activeDay] ?? []).filter(e => e.id !== removeTarget),
    }));
    setRemoveTarget(null);
  }, [activeDay, removeTarget, setPlan]);

  const copyPlanToDay = useCallback((targetDayIndex) => {
    const currentExercises = plan[activeDay] ?? [];
    const targetExercises  = plan[targetDayIndex] ?? [];
    const existingIds = new Set(targetExercises.map(e => e.id));
    setPlan(prev => ({
      ...prev,
      [targetDayIndex]: [...targetExercises, ...currentExercises.filter(e => !existingIds.has(e.id))],
    }));
    setCopyVisible(false);
  }, [activeDay, plan, setPlan]);

  const getSets = useCallback((exId) => todayLog[exId] ?? [], [todayLog]);

  const addSet = useCallback((exId, set) => {
    if (!workoutStartRef.current) workoutStartRef.current = Date.now();
    setLogs(prev => ({
      ...prev,
      [today]: {
        ...(prev[today] ?? {}),
        [exId]: [...(prev[today]?.[exId] ?? []), set],
      },
    }));
  }, [setLogs, today]);

  const removeSet = useCallback((exId, index) => {
    setLogs(prev => {
      const sets = [...(prev[today]?.[exId] ?? [])];
      sets.splice(index, 1);
      return { ...prev, [today]: { ...(prev[today] ?? {}), [exId]: sets } };
    });
  }, [setLogs, today]);

  const activeDayName = useMemo(
    () => TRAINING_DAYS.find(d => d.index === activeDay)?.name,
    [activeDay]
  );

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
            <View style={s.headerBtns}>
              <TouchableOpacity style={[s.headerBtn, s.headerBtnHistory]} onPress={() => setHistoryVisible(true)} activeOpacity={0.7}>
                <Text style={[s.headerBtnText, s.headerBtnHistoryText]}>History</Text>
              </TouchableOpacity>
              {exercises.length > 0 && (
                <TouchableOpacity style={s.headerBtn} onPress={() => setCopyVisible(true)} activeOpacity={0.7}>
                  <Text style={s.headerBtnText}>Copy Plan</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          {totalSetsToday > 0 && (
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
              <Text style={s.emptySubText}>Tap the button to get started</Text>
            </View>
          ) : (
            exercises.map((ex, i) => {
              const todaySets = getSets(ex.id);
              const lastSesh  = previousSessionsMap[ex.id]?.[0] ?? null;
              const hasLogged = todaySets.length > 0;

              return (
                <SwipeableCard
                  key={ex.id ?? i}
                  style={[s.exCard, hasLogged && s.exCardActive]}
                  onSwipe={() => removeExercise(ex.id)}
                >
                  <TouchableOpacity onPress={() => setSelectedEx(ex)} activeOpacity={0.7}>
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

      {/* Centered add button — only when no exercises */}
      {exercises.length === 0 && (
        <View style={s.centerBtnWrap} pointerEvents="box-none">
          <TouchableOpacity style={s.addBtn} onPress={() => setSearchVisible(true)} activeOpacity={0.8}>
            <Text style={s.addBtnText}>+ Add Exercise</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom buttons — only when exercises exist */}
      {exercises.length > 0 && (
        <View style={s.bottomBtns}>
          {totalSetsToday > 0 && (
            <TouchableOpacity style={s.finishBtn} onPress={() => setSummaryVisible(true)} activeOpacity={0.8}>
              <Text style={s.finishBtnText}>Finish Workout</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.addBtn} onPress={() => setSearchVisible(true)} activeOpacity={0.8}>
            <Text style={s.addBtnText}>+ Add Exercise</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Remove exercise modal */}
      <Modal visible={!!removeTarget} transparent animationType="fade">
        <View style={s.copyOverlay}>
          <View style={s.copyDialog}>
            <Text style={s.copyTitle}>Remove Exercise?</Text>
            <Text style={s.copySubtitle}>This will remove it from {activeDayName}</Text>
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
              Copies {exercises.length} exercise{exercises.length !== 1 ? 's' : ''} from {activeDayName}
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

      {searchVisible && (
        <ExerciseSearchModal
          visible={searchVisible}
          onClose={() => setSearchVisible(false)}
          onAdd={addExercise}
        />
      )}
      {selectedEx && (
        <LogSetModal
          visible={!!selectedEx}
          exercise={selectedEx}
          date={today}
          sets={getSets(selectedEx.id)}
          previousSessions={previousSessionsMap[selectedEx.id] ?? []}
          onAdd={(set) => addSet(selectedEx.id, set)}
          onRemove={(i) => removeSet(selectedEx.id, i)}
          onClose={() => setSelectedEx(null)}
        />
      )}
      {summaryVisible && (
        <SessionSummaryModal
          visible={summaryVisible}
          duration={workoutStartRef.current ? Math.floor((Date.now() - workoutStartRef.current) / 1000) : 0}
          onClose={() => {
            const duration = workoutStartRef.current
              ? Math.floor((Date.now() - workoutStartRef.current) / 1000)
              : 0;
            // Save snapshot to history before clearing
            const snapshot = {
              date: today,
              duration,
              exercises: exercises
                .map(ex => ({ ...ex, sets: logs[today]?.[ex.id] ?? [] }))
                .filter(ex => ex.sets.length > 0),
            };
            setCompletedWorkouts(prev => ({ ...prev, [today]: snapshot }));
            // Reset today's session
            setLogs(prev => { const n = { ...prev }; delete n[today]; return n; });
            workoutStartRef.current = null;
            setSummaryVisible(false);
          }}
          exercises={exercises}
          logs={logs}
          date={today}
        />
      )}
      <WorkoutHistoryModal
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
        completedWorkouts={completedWorkouts}
        onDelete={(date) => setCompletedWorkouts(prev => {
          const next = { ...prev };
          delete next[date];
          return next;
        })}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0b0f1a' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 120 },

  header: {
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#253048',
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
    color: '#536080',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#e8edf5',
  },
  headerBtns: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  headerBtn: {
    borderWidth: 1,
    borderColor: '#253048',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    marginTop: 4,
  },
  headerBtnHistory: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  headerBtnHistoryText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '700',
  },
  headerBtnText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#536080',
    letterSpacing: 0.5,
  },
  volumeRow: { marginTop: 4 },
  volumeText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#536080',
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
    borderColor: '#253048',
    backgroundColor: '#131929',
    gap: 4,
  },
  dayBtnActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  dayShort: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#536080',
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
    height: 340,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyText: {
    color: '#e8edf5',
    fontSize: 14,
    fontWeight: '600',
  },
  emptySubText: {
    color: '#536080',
    fontFamily: 'monospace',
    fontSize: 11,
  },
  centerBtnWrap: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    bottom: 0,
    justifyContent: 'center',
  },

  exCard: {
    backgroundColor: '#131929',
    borderWidth: 1,
    borderColor: '#253048',
    borderRadius: 10,
    padding: 14,
    gap: 10,
  },
  exCardActive: {
    borderColor: ACCENT + '55',
    backgroundColor: '#0d1a14',
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
    color: '#e8edf5',
  },
  exMeta: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#536080',
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
    color: '#3d4f6b',
    flex: 1,
  },
  swipeHint: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#2d3a52',
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

  copyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyDialog: {
    width: 310,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  copyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0a0a0a',
    marginBottom: 4,
  },
  copySubtitle: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#888888',
    marginBottom: 20,
  },
  copyDayList: { gap: 8, marginBottom: 12 },
  copyDayBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderRadius: 10,
    backgroundColor: '#f7f9ff',
  },
  copyDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a0a0a',
  },
  copyDayCount: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#888888',
  },
  copyCancelBtn: {
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    backgroundColor: '#f7f7f7',
  },
  copyCancelText: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '600',
    color: '#555555',
  },

  dialogBtns: { flexDirection: 'row', gap: 10 },
  dialogCancel: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
  dialogCancelText: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '600',
    color: '#555555',
  },
  dialogRemove: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    alignItems: 'center',
  },
  dialogRemoveText: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});

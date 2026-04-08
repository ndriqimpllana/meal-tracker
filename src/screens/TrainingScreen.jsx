import { useState, useMemo, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useWorkouts, useWorkoutLogs } from '../hooks/useWorkouts';
import { useStorage } from '../hooks/useStorage';
import { useCardioLogs } from '../hooks/useCardioLogs';
import ExerciseSearchModal from '../components/ExerciseSearchModal';
import LogSetModal from '../components/LogSetModal';
import SessionSummaryModal from '../components/SessionSummaryModal';
import WorkoutHistoryModal from '../components/WorkoutHistoryModal';
import SwipeableCard from '../components/SwipeableCard';
import CardioLogModal, { ACTIVITY_TYPES } from '../components/CardioLogModal';

const TRAINING_DAYS = [
  { index: 0, short: 'MON', name: 'Monday' },
  { index: 1, short: 'TUE', name: 'Tuesday' },
  { index: 3, short: 'THU', name: 'Thursday' },
  { index: 4, short: 'FRI', name: 'Friday' },
  { index: 5, short: 'SAT', name: 'Saturday' },
];

function localDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function TrainingScreen() {
  const dayMap     = [6, 0, 1, 2, 3, 4, 5];
  const todayIndex = dayMap[new Date().getDay()];
  const today      = localDateStr();
  const defaultDay = TRAINING_DAYS.find(d => d.index === todayIndex) ?? TRAINING_DAYS[0];

  const [mode, setMode]                           = useState('gym');
  const [activeDay, setActiveDay]                 = useState(defaultDay.index);
  const [searchVisible, setSearchVisible]         = useState(false);
  const [selectedEx, setSelectedEx]               = useState(null);
  const [summaryVisible, setSummaryVisible]       = useState(false);
  const [copyVisible, setCopyVisible]             = useState(false);
  const [removeTarget, setRemoveTarget]           = useState(null);
  const [historyVisible, setHistoryVisible]       = useState(false);
  const [cardioModalVisible, setCardioModalVisible] = useState(false);
  const [plan, setPlan]                           = useWorkouts();
  const [logs, setLogs]                           = useWorkoutLogs();
  const [cardioLogs, setCardioLogs]               = useCardioLogs();
  const [completedWorkouts, setCompletedWorkouts] = useStorage('completedWorkouts', {});
  const workoutStartRef                           = useRef(null);

  const exercises = useMemo(() => plan[activeDay] ?? [], [plan, activeDay]);
  const todayLog  = useMemo(() => logs[today] ?? {}, [logs, today]);
  const otherDays = useMemo(() => TRAINING_DAYS.filter(d => d.index !== activeDay), [activeDay]);

  const { totalSetsToday, totalVolumeToday } = useMemo(() => {
    let sets = 0, volume = 0;
    exercises.forEach(ex => {
      const exSets = todayLog[ex.id] ?? [];
      sets += exSets.length;
      volume += exSets.reduce((s, set) => s + set.weight * set.reps, 0);
    });
    return { totalSetsToday: sets, totalVolumeToday: volume };
  }, [exercises, todayLog]);

  const previousSessionsMap = useMemo(() => {
    const map = {};
    const pastDates = Object.entries(logs).filter(([date]) => date !== today);
    const allExIds  = new Set(Object.values(plan).flat().map(e => e.id));
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

  // ── Cardio stats (last 7 days) ──────────────────────────────────────────────
  const cardioWeekStats = useMemo(() => {
    let activities = 0, minutes = 0, distance = 0, calories = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      (cardioLogs[ds] ?? []).forEach(e => {
        if (e.type !== 'rest') {
          activities++;
          minutes  += e.duration || 0;
          distance += e.distance || 0;
          calories += e.calories || 0;
        }
      });
    }
    return {
      activities,
      minutes,
      distanceFmt: distance > 0 ? distance.toFixed(1) : '—',
      caloriesFmt: calories > 0 ? String(calories)    : '—',
    };
  }, [cardioLogs]);

  const recentCardioEntries = useMemo(() => {
    const result = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const entries = cardioLogs[ds] ?? [];
      if (entries.length > 0) {
        result.push({
          date:     ds,
          dayLabel: i === 0 ? 'TODAY' : i === 1 ? 'YESTERDAY' : ds.slice(5),
          entries,
        });
      }
    }
    return result;
  }, [cardioLogs]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const addExercise    = useCallback((ex) => setPlan(prev => ({ ...prev, [activeDay]: [...(prev[activeDay] ?? []), ex] })), [activeDay, setPlan]);
  const removeExercise = useCallback((exId) => setRemoveTarget(exId), []);
  const confirmRemove  = useCallback(() => {
    setPlan(prev => ({ ...prev, [activeDay]: (prev[activeDay] ?? []).filter(e => e.id !== removeTarget) }));
    setRemoveTarget(null);
  }, [activeDay, removeTarget, setPlan]);

  const copyPlanToDay = useCallback((targetDayIndex) => {
    const curr = plan[activeDay] ?? [];
    const tgt  = plan[targetDayIndex] ?? [];
    const existingIds = new Set(tgt.map(e => e.id));
    setPlan(prev => ({ ...prev, [targetDayIndex]: [...tgt, ...curr.filter(e => !existingIds.has(e.id))] }));
    setCopyVisible(false);
  }, [activeDay, plan, setPlan]);

  const getSets   = useCallback((exId) => todayLog[exId] ?? [], [todayLog]);
  const addSet    = useCallback((exId, set) => {
    if (!workoutStartRef.current) workoutStartRef.current = Date.now();
    setLogs(prev => ({ ...prev, [today]: { ...(prev[today] ?? {}), [exId]: [...(prev[today]?.[exId] ?? []), set] } }));
  }, [setLogs, today]);
  const removeSet = useCallback((exId, index) => {
    setLogs(prev => {
      const sets = [...(prev[today]?.[exId] ?? [])];
      sets.splice(index, 1);
      return { ...prev, [today]: { ...(prev[today] ?? {}), [exId]: sets } };
    });
  }, [setLogs, today]);

  const saveCardioEntry = useCallback((entry) => {
    setCardioLogs(prev => {
      const existing = prev[entry.date] ?? [];
      return { ...prev, [entry.date]: [...existing.filter(e => e.id !== entry.id), entry] };
    });
  }, [setCardioLogs]);

  const deleteCardioEntry = useCallback((date, id) => {
    setCardioLogs(prev => ({
      ...prev,
      [date]: (prev[date] ?? []).filter(e => e.id !== id),
    }));
  }, [setCardioLogs]);

  const activeDayName = useMemo(() => TRAINING_DAYS.find(d => d.index === activeDay)?.name, [activeDay]);

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
              <TouchableOpacity style={[s.headerBtn, s.headerBtnHistory]} onPress={() => setHistoryVisible(true)} activeOpacity={0.75}>
                <Text style={[s.headerBtnText, s.headerBtnHistoryText]}>History</Text>
              </TouchableOpacity>
              {mode === 'gym' && exercises.length > 0 && (
                <TouchableOpacity style={s.headerBtn} onPress={() => setCopyVisible(true)} activeOpacity={0.75}>
                  <Text style={s.headerBtnText}>Copy Plan</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          {mode === 'gym' && totalSetsToday > 0 && (
            <View style={s.volumeRow}>
              <Text style={s.volumeText}>
                Today: <Text style={s.volumeAccent}>{totalVolumeToday.toLocaleString()} lbs</Text>
                {'  ·  '}<Text style={s.volumeAccent}>{totalSetsToday} sets</Text>
              </Text>
            </View>
          )}
        </View>

        {/* Mode toggle */}
        <View style={s.modeToggle}>
          <TouchableOpacity
            style={[s.modeBtn, mode === 'gym' && s.modeBtnActive]}
            onPress={() => setMode('gym')}
            activeOpacity={0.75}
          >
            <Text style={[s.modeBtnText, mode === 'gym' && s.modeBtnTextActive]}>🏋️  Gym</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.modeBtn, mode === 'cardio' && s.modeBtnActive]}
            onPress={() => setMode('cardio')}
            activeOpacity={0.75}
          >
            <Text style={[s.modeBtnText, mode === 'cardio' && s.modeBtnTextActive]}>🏃  Cardio</Text>
          </TouchableOpacity>
        </View>

        {/* ── GYM MODE ─────────────────────────────────────────────────────── */}
        {mode === 'gym' && (
          <>
            {/* Day selector */}
            <View style={s.dayRow}>
              {TRAINING_DAYS.map(d => (
                <TouchableOpacity
                  key={d.index}
                  style={[s.dayBtn, activeDay === d.index && s.dayBtnActive]}
                  onPress={() => setActiveDay(d.index)}
                  activeOpacity={0.75}
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
                  <Text style={s.emptySubText}>Tap the button below to get started</Text>
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
                      <TouchableOpacity onPress={() => setSelectedEx(ex)} activeOpacity={0.75}>
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
                            {lastSesh ? `Last: ${lastSesh.sets} sets · ${lastSesh.maxWeight} lbs max · ${lastSesh.date}` : 'No previous session'}
                          </Text>
                          <Text style={s.swipeHint}>Swipe to remove</Text>
                        </View>
                      </TouchableOpacity>
                    </SwipeableCard>
                  );
                })
              )}
            </View>
          </>
        )}

        {/* ── CARDIO MODE ──────────────────────────────────────────────────── */}
        {mode === 'cardio' && (
          <>
            {/* Week stats */}
            <View style={s.cardioStatRow}>
              {[
                { label: 'Activities', value: String(cardioWeekStats.activities), color: '#f97316' },
                { label: 'Minutes',    value: String(cardioWeekStats.minutes),    color: '#16a34a' },
                { label: 'Miles',      value: cardioWeekStats.distanceFmt,        color: '#3b82f6' },
                { label: 'Calories',   value: cardioWeekStats.caloriesFmt,        color: '#ef4444' },
              ].map(({ label, value, color }) => (
                <View key={label} style={s.cardioStatBox}>
                  <Text style={[s.cardioStatVal, { color }]}>{value}</Text>
                  <Text style={s.cardioStatLbl}>{label}</Text>
                </View>
              ))}
            </View>
            <Text style={s.cardioWeekLabel}>LAST 7 DAYS</Text>

            {/* Entry list */}
            {recentCardioEntries.length === 0 ? (
              <View style={s.cardioEmpty}>
                <Text style={s.cardioEmptyEmoji}>🏃</Text>
                <Text style={s.cardioEmptyText}>No activities logged yet</Text>
                <Text style={s.cardioEmptyHint}>Tap Log Activity to get started</Text>
              </View>
            ) : (
              recentCardioEntries.map(({ date, dayLabel, entries }) => (
                <View key={date} style={s.cardioGroup}>
                  <Text style={s.cardioGroupLabel}>{dayLabel}</Text>
                  {entries.map(entry => {
                    const actType = ACTIVITY_TYPES.find(t => t.id === entry.type);
                    const metaParts = [];
                    if (entry.type !== 'rest' && entry.duration > 0) metaParts.push(`${entry.duration} min`);
                    if (entry.distance > 0) metaParts.push(`${entry.distance} mi`);
                    if (entry.calories > 0) metaParts.push(`${entry.calories} kcal`);
                    if (entry.type === 'rest') metaParts.push('Recovery day');
                    return (
                      <View key={entry.id} style={s.cardioEntry}>
                        <View style={[s.cardioEntryBar, { backgroundColor: actType?.color ?? '#f97316' }]} />
                        <View style={s.cardioEntryContent}>
                          <View style={s.cardioEntryTop}>
                            <Text style={s.cardioEntryTitle}>{actType?.emoji ?? '🏅'}  {actType?.label ?? entry.type}</Text>
                            <TouchableOpacity onPress={() => deleteCardioEntry(date, entry.id)} activeOpacity={0.75}>
                              <Text style={s.cardioEntryDelete}>✕</Text>
                            </TouchableOpacity>
                          </View>
                          {metaParts.length > 0 && (
                            <Text style={s.cardioEntryMeta}>{metaParts.join(' · ')}</Text>
                          )}
                          {entry.notes.length > 0 && (
                            <Text style={s.cardioEntryNotes}>{entry.notes}</Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))
            )}
          </>
        )}

      </ScrollView>

      {/* ── BOTTOM BUTTONS ──────────────────────────────────────────────────── */}
      {mode === 'gym' && exercises.length === 0 && (
        <View style={s.centerBtnWrap} pointerEvents="box-none">
          <TouchableOpacity style={s.addBtn} onPress={() => setSearchVisible(true)} activeOpacity={0.8}>
            <Text style={s.addBtnText}>+ Add Exercise</Text>
          </TouchableOpacity>
        </View>
      )}

      {mode === 'gym' && exercises.length > 0 && (
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

      {mode === 'cardio' && (
        <View style={s.bottomBtns}>
          <TouchableOpacity style={s.addBtn} onPress={() => setCardioModalVisible(true)} activeOpacity={0.8}>
            <Text style={s.addBtnText}>+ Log Activity</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Remove modal */}
      <Modal visible={!!removeTarget} transparent animationType="fade">
        <View style={s.copyOverlay}>
          <View style={s.copyDialog}>
            <Text style={s.copyTitle}>Remove Exercise?</Text>
            <Text style={s.copySubtitle}>This will remove it from {activeDayName}</Text>
            <View style={s.dialogBtns}>
              <TouchableOpacity style={s.dialogCancel} onPress={() => setRemoveTarget(null)} activeOpacity={0.75}>
                <Text style={s.dialogCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.dialogRemove} onPress={confirmRemove} activeOpacity={0.75}>
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
            <Text style={s.copySubtitle}>Copies {exercises.length} exercise{exercises.length !== 1 ? 's' : ''} from {activeDayName}</Text>
            <View style={s.copyDayList}>
              {otherDays.map(d => (
                <TouchableOpacity key={d.index} style={s.copyDayBtn} onPress={() => copyPlanToDay(d.index)} activeOpacity={0.75}>
                  <Text style={s.copyDayText}>{d.name}</Text>
                  <Text style={s.copyDayCount}>{(plan[d.index] ?? []).length} exercises</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={s.copyCancelBtn} onPress={() => setCopyVisible(false)} activeOpacity={0.75}>
              <Text style={s.copyCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {searchVisible && (
        <ExerciseSearchModal visible={searchVisible} onClose={() => setSearchVisible(false)} onAdd={addExercise} />
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
            const duration = workoutStartRef.current ? Math.floor((Date.now() - workoutStartRef.current) / 1000) : 0;
            const snapshot = { date: today, duration, exercises: exercises.map(ex => ({ ...ex, sets: logs[today]?.[ex.id] ?? [] })).filter(ex => ex.sets.length > 0) };
            setCompletedWorkouts(prev => ({ ...prev, [today]: snapshot }));
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
        onDelete={(date) => setCompletedWorkouts(prev => { const next = { ...prev }; delete next[date]; return next; })}
      />
      <CardioLogModal
        visible={cardioModalVisible}
        onClose={() => setCardioModalVisible(false)}
        onSave={saveCardioEntry}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#fef3ee' },
  scroll:  { flex: 1 },
  content: { padding: 16, paddingBottom: 120 },

  header: { paddingTop: 16, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f5ddd4', marginBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  appLabel: { fontFamily: 'monospace', fontSize: 10, color: '#f97316', letterSpacing: 1.5, fontWeight: '700', marginBottom: 4 },
  title:    { fontSize: 22, fontWeight: '700', color: '#2c1810' },
  headerBtns: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', marginTop: 4 },
  headerBtn: {
    borderWidth: 1.5, borderColor: '#f0d0c4', paddingHorizontal: 11, paddingVertical: 6,
    borderRadius: 8, backgroundColor: '#fff8f4',
  },
  headerBtnText:        { fontFamily: 'monospace', fontSize: 10, color: '#c8a89c', fontWeight: '600', letterSpacing: 0.3 },
  headerBtnHistory:     { backgroundColor: '#2c1810', borderColor: '#2c1810', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  headerBtnHistoryText: { fontSize: 12, color: '#ffffff', fontWeight: '700' },
  volumeRow:   { marginTop: 4 },
  volumeText:  { fontFamily: 'monospace', fontSize: 11, color: '#c8a89c' },
  volumeAccent:{ color: '#16a34a', fontWeight: '700' },

  modeToggle: {
    flexDirection: 'row', gap: 4, marginBottom: 20,
    backgroundColor: '#f5ece8', borderRadius: 14, padding: 4,
  },
  modeBtn: { flex: 1, paddingVertical: 12, borderRadius: 11, alignItems: 'center' },
  modeBtnActive: {
    backgroundColor: '#2c1810',
    shadowColor: '#2c1810', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3,
  },
  modeBtnText:       { fontFamily: 'monospace', fontSize: 13, fontWeight: '600', color: '#c8a89c' },
  modeBtnTextActive: { color: '#ffffff', fontWeight: '700' },

  dayRow: { flexDirection: 'row', gap: 6, marginBottom: 24 },
  dayBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#f0d0c4', backgroundColor: '#fff8f4', gap: 4,
    shadowColor: '#c4906c', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 3, elevation: 1,
  },
  dayBtnActive:   { backgroundColor: '#2c1810', borderColor: '#2c1810', shadowOpacity: 0.15, elevation: 4 },
  dayShort:       { fontFamily: 'monospace', fontSize: 10, color: '#c8a89c', letterSpacing: 0.5, fontWeight: '600' },
  dayShortActive: { color: '#ffffff' },
  todayDot:       { width: 4, height: 4, borderRadius: 2, backgroundColor: '#16a34a' },
  todayDotActive: { backgroundColor: 'rgba(255,255,255,0.6)' },

  exerciseList: { gap: 10 },
  empty: { height: 340, alignItems: 'center', justifyContent: 'center', gap: 6 },
  emptyText:    { color: '#2c1810', fontSize: 15, fontWeight: '700' },
  emptySubText: { color: '#c8a89c', fontFamily: 'monospace', fontSize: 11 },

  exCard: {
    backgroundColor: '#ffffff', borderWidth: 1.5, borderColor: '#f5ddd4',
    borderRadius: 14, padding: 14, gap: 10,
    shadowColor: '#c4906c', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  exCardActive: { borderColor: '#16a34a66', backgroundColor: '#f0fdf4', shadowColor: '#16a34a' },
  exCardTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  exCardLeft: { flex: 1, gap: 3 },
  exName: { fontSize: 15, fontWeight: '700', color: '#2c1810' },
  exMeta: { fontFamily: 'monospace', fontSize: 10, color: '#c8a89c' },
  setsBadge: {
    alignItems: 'center', backgroundColor: '#dcfce7', borderWidth: 1.5,
    borderColor: '#16a34a55', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  setsBadgeText:  { fontFamily: 'monospace', fontSize: 16, fontWeight: '700', color: '#16a34a' },
  setsBadgeLabel: { fontFamily: 'monospace', fontSize: 8, color: '#16a34a', opacity: 0.7 },
  exCardBottom:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastSession: { fontFamily: 'monospace', fontSize: 10, color: '#d4b8b0', flex: 1 },
  swipeHint:   { fontFamily: 'monospace', fontSize: 9, color: '#e8c8bc' },

  // ── Cardio styles ─────────────────────────────────────────────────────────
  cardioStatRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  cardioStatBox: {
    flex: 1, backgroundColor: '#ffffff', borderWidth: 1.5, borderColor: '#f5ddd4',
    borderRadius: 12, padding: 12, alignItems: 'center', gap: 3,
    shadowColor: '#c4906c', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4, elevation: 1,
  },
  cardioStatVal: { fontFamily: 'monospace', fontSize: 17, fontWeight: '700' },
  cardioStatLbl: { fontFamily: 'monospace', fontSize: 8, color: '#c8a89c', letterSpacing: 0.5 },
  cardioWeekLabel: {
    fontFamily: 'monospace', fontSize: 9, color: '#d4b8b0',
    letterSpacing: 1, fontWeight: '700', textAlign: 'center', marginTop: 6, marginBottom: 20,
  },

  cardioEmpty: { height: 280, alignItems: 'center', justifyContent: 'center', gap: 8 },
  cardioEmptyEmoji: { fontSize: 52 },
  cardioEmptyText:  { fontSize: 15, fontWeight: '700', color: '#2c1810' },
  cardioEmptyHint:  { fontFamily: 'monospace', fontSize: 11, color: '#c8a89c' },

  cardioGroup:      { marginBottom: 16 },
  cardioGroupLabel: { fontFamily: 'monospace', fontSize: 9, color: '#f97316', letterSpacing: 1.5, fontWeight: '700', marginBottom: 8 },
  cardioEntry: {
    flexDirection: 'row', backgroundColor: '#ffffff', borderWidth: 1.5, borderColor: '#f5ddd4',
    borderRadius: 12, overflow: 'hidden', marginBottom: 8,
    shadowColor: '#c4906c', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4, elevation: 1,
  },
  cardioEntryBar:     { width: 4 },
  cardioEntryContent: { flex: 1, padding: 12, gap: 4 },
  cardioEntryTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardioEntryTitle:   { fontSize: 14, fontWeight: '700', color: '#2c1810' },
  cardioEntryDelete:  { fontFamily: 'monospace', fontSize: 13, color: '#f0d0c4', paddingLeft: 10 },
  cardioEntryMeta:    { fontFamily: 'monospace', fontSize: 10, color: '#c8a89c' },
  cardioEntryNotes:   { fontSize: 11, color: '#9b7060', fontStyle: 'italic' },

  centerBtnWrap: { position: 'absolute', top: 0, left: 16, right: 16, bottom: 0, justifyContent: 'center' },
  bottomBtns:    { position: 'absolute', bottom: 16, left: 16, right: 16, gap: 8 },
  finishBtn: {
    backgroundColor: '#f0fdf4', borderWidth: 1.5, borderColor: '#16a34a66',
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
    shadowColor: '#16a34a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6,
  },
  finishBtnText: { fontFamily: 'monospace', fontSize: 13, fontWeight: '700', color: '#16a34a', letterSpacing: 0.5 },
  addBtn: {
    backgroundColor: '#2c1810', borderRadius: 12, paddingVertical: 15, alignItems: 'center',
    shadowColor: '#2c1810', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  addBtnText: { fontFamily: 'monospace', fontSize: 13, fontWeight: '700', color: '#ffffff', letterSpacing: 0.5 },

  copyOverlay: { flex: 1, backgroundColor: 'rgba(44,24,16,0.45)', justifyContent: 'center', alignItems: 'center' },
  copyDialog: {
    width: 310, backgroundColor: '#ffffff', borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 12,
  },
  copyTitle:    { fontSize: 22, fontWeight: '700', color: '#2c1810', marginBottom: 4 },
  copySubtitle: { fontFamily: 'monospace', fontSize: 11, color: '#9b7060', marginBottom: 20 },
  copyDayList:  { gap: 8, marginBottom: 12 },
  copyDayBtn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderWidth: 1.5, borderColor: '#f0d0c4', borderRadius: 12, backgroundColor: '#fff8f4',
  },
  copyDayText:  { fontSize: 14, fontWeight: '700', color: '#2c1810' },
  copyDayCount: { fontFamily: 'monospace', fontSize: 11, color: '#c8a89c' },
  copyCancelBtn: {
    paddingVertical: 13, alignItems: 'center', borderWidth: 1.5,
    borderColor: '#e5e7eb', borderRadius: 12, backgroundColor: '#f9fafb',
  },
  copyCancelText: { fontFamily: 'monospace', fontSize: 13, fontWeight: '600', color: '#6b7280' },

  dialogBtns: { flexDirection: 'row', gap: 10 },
  dialogCancel: {
    flex: 1, paddingVertical: 14, borderWidth: 1.5,
    borderColor: '#e5e7eb', borderRadius: 12, alignItems: 'center', backgroundColor: '#f9fafb',
  },
  dialogCancelText: { fontFamily: 'monospace', fontSize: 13, fontWeight: '600', color: '#6b7280' },
  dialogRemove:     { flex: 1, paddingVertical: 14, backgroundColor: '#ef4444', borderRadius: 12, alignItems: 'center' },
  dialogRemoveText: { fontFamily: 'monospace', fontSize: 13, fontWeight: '700', color: '#ffffff' },
});

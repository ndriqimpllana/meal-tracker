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
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export default function TrainingScreen() {
  const todayIndex  = [6,0,1,2,3,4,5][new Date().getDay()];
  const today       = localDateStr();
  const defaultDay  = TRAINING_DAYS.find(d => d.index === todayIndex) ?? TRAINING_DAYS[0];

  const [mode, setMode]                             = useState('gym');
  const [activeDay, setActiveDay]                   = useState(defaultDay.index);
  const [searchVisible, setSearchVisible]           = useState(false);
  const [selectedEx, setSelectedEx]                 = useState(null);
  const [summaryVisible, setSummaryVisible]         = useState(false);
  const [copyVisible, setCopyVisible]               = useState(false);
  const [removeTarget, setRemoveTarget]             = useState(null);
  const [historyVisible, setHistoryVisible]         = useState(false);
  const [cardioModal, setCardioModal]               = useState(false);
  const [plan, setPlan]                             = useWorkouts();
  const [logs, setLogs]                             = useWorkoutLogs();
  const [cardioLogs, setCardioLogs]                 = useCardioLogs();
  const [completedWorkouts, setCompletedWorkouts]   = useStorage('completedWorkouts', {});
  const workoutStartRef                             = useRef(null);

  const exercises = useMemo(() => plan[activeDay] ?? [], [plan, activeDay]);
  const todayLog  = useMemo(() => logs[today] ?? {}, [logs, today]);
  const otherDays = useMemo(() => TRAINING_DAYS.filter(d => d.index !== activeDay), [activeDay]);

  const { totalSets, totalVolume } = useMemo(() => {
    let sets = 0, vol = 0;
    exercises.forEach(ex => {
      const s = todayLog[ex.id] ?? [];
      sets += s.length;
      vol  += s.reduce((acc, set) => acc + set.weight * set.reps, 0);
    });
    return { totalSets: sets, totalVolume: vol };
  }, [exercises, todayLog]);

  const prevSessionsMap = useMemo(() => {
    const map = {};
    const past = Object.entries(logs).filter(([d]) => d !== today);
    new Set(Object.values(plan).flat().map(e => e.id)).forEach(id => {
      map[id] = past
        .map(([date, dl]) => {
          const s = dl[id]; if (!s?.length) return null;
          return { date, sets: s.length, maxWeight: Math.max(...s.map(x => x.weight)) };
        })
        .filter(Boolean).sort((a,b) => b.date.localeCompare(a.date)).slice(0,8);
    });
    return map;
  }, [logs, plan, today]);

  // ── Cardio: last 7 days ──────────────────────────────────────────────────
  const cardioStats = useMemo(() => {
    let activities = 0, minutes = 0, distance = 0, calories = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      (cardioLogs[ds] ?? []).forEach(e => {
        if (e.type !== 'rest') { activities++; minutes += e.duration||0; distance += e.distance||0; calories += e.calories||0; }
      });
    }
    return { activities, minutes, dist: distance>0?distance.toFixed(1):'—', cal: calories>0?String(calories):'—' };
  }, [cardioLogs]);

  const recentCardio = useMemo(() => {
    const out = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const entries = cardioLogs[ds] ?? [];
      if (entries.length) out.push({ date: ds, dayLabel: i===0?'TODAY':i===1?'YESTERDAY':ds.slice(5), entries });
    }
    return out;
  }, [cardioLogs]);

  // ── Gym handlers ─────────────────────────────────────────────────────────
  const addExercise   = useCallback((ex) => setPlan(p => ({ ...p, [activeDay]: [...(p[activeDay]??[]), ex] })), [activeDay, setPlan]);
  const removeExercise= useCallback((id) => setRemoveTarget(id), []);
  const confirmRemove = useCallback(() => {
    setPlan(p => ({ ...p, [activeDay]: (p[activeDay]??[]).filter(e => e.id !== removeTarget) }));
    setRemoveTarget(null);
  }, [activeDay, removeTarget, setPlan]);
  const copyPlan = useCallback((targetDay) => {
    const curr = plan[activeDay]??[], tgt = plan[targetDay]??[];
    const ids = new Set(tgt.map(e => e.id));
    setPlan(p => ({ ...p, [targetDay]: [...tgt, ...curr.filter(e => !ids.has(e.id))] }));
    setCopyVisible(false);
  }, [activeDay, plan, setPlan]);
  const getSets   = useCallback((id) => todayLog[id] ?? [], [todayLog]);
  const addSet    = useCallback((id, set) => {
    if (!workoutStartRef.current) workoutStartRef.current = Date.now();
    setLogs(p => ({ ...p, [today]: { ...(p[today]??{}), [id]: [...(p[today]?.[id]??[]), set] } }));
  }, [setLogs, today]);
  const removeSet = useCallback((id, idx) => {
    setLogs(p => {
      const s = [...(p[today]?.[id]??[])]; s.splice(idx,1);
      return { ...p, [today]: { ...(p[today]??{}), [id]: s } };
    });
  }, [setLogs, today]);
  const saveCardio = useCallback((entry) => {
    setCardioLogs(p => ({ ...p, [entry.date]: [...(p[entry.date]??[]).filter(e => e.id !== entry.id), entry] }));
  }, [setCardioLogs]);
  const deleteCardio = useCallback((date, id) => {
    setCardioLogs(p => ({ ...p, [date]: (p[date]??[]).filter(e => e.id !== id) }));
  }, [setCardioLogs]);

  const activeDayName = TRAINING_DAYS.find(d => d.index === activeDay)?.name;

  return (
    <View style={s.root}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View>
            <Text style={s.label}>TRAINING</Text>
            <Text style={s.title}>Your Workouts</Text>
          </View>
          <TouchableOpacity style={s.historyBtn} onPress={() => setHistoryVisible(true)} activeOpacity={0.75}>
            <Text style={s.historyBtnText}>📋  History</Text>
          </TouchableOpacity>
        </View>

        {/* ── Mode toggle ─────────────────────────────────────────────────── */}
        <View style={s.toggle}>
          <TouchableOpacity style={[s.toggleBtn, mode==='gym' && s.toggleBtnActive]} onPress={() => setMode('gym')} activeOpacity={0.8}>
            <Text style={[s.toggleText, mode==='gym' && s.toggleTextActive]}>🏋️  Gym</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.toggleBtn, mode==='cardio' && s.toggleBtnActive]} onPress={() => setMode('cardio')} activeOpacity={0.8}>
            <Text style={[s.toggleText, mode==='cardio' && s.toggleTextActive]}>🏃  Cardio</Text>
          </TouchableOpacity>
        </View>

        {/* ═══════════════════ GYM MODE ═══════════════════════════════════ */}
        {mode === 'gym' && (
          <>
            {/* Day selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.daysScroll} contentContainerStyle={s.daysRow}>
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
            </ScrollView>

            {/* Today stats */}
            {totalSets > 0 && (
              <View style={s.statsRow}>
                <View style={s.statPill}>
                  <Text style={s.statVal}>{totalSets}</Text>
                  <Text style={s.statLbl}>Sets</Text>
                </View>
                <View style={s.statPill}>
                  <Text style={[s.statVal, { color: '#30d158' }]}>{totalVolume.toLocaleString()}</Text>
                  <Text style={s.statLbl}>Total lbs</Text>
                </View>
                {exercises.length > 0 && (
                  <TouchableOpacity style={s.copyBtn} onPress={() => setCopyVisible(true)} activeOpacity={0.75}>
                    <Text style={s.copyBtnText}>Copy Plan →</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Exercise list */}
            <View style={s.exList}>
              {exercises.length === 0 ? (
                <View style={s.emptyState}>
                  <Text style={s.emptyEmoji}>🏋️</Text>
                  <Text style={s.emptyTitle}>No exercises yet</Text>
                  <Text style={s.emptyHint}>Tap Add Exercise to get started</Text>
                </View>
              ) : (
                exercises.map((ex, i) => {
                  const todaySets = getSets(ex.id);
                  const lastSesh  = prevSessionsMap[ex.id]?.[0] ?? null;
                  const hasLogged = todaySets.length > 0;
                  return (
                    <SwipeableCard key={ex.id??i} onSwipe={() => removeExercise(ex.id)}>
                      <TouchableOpacity
                        style={[s.exCard, hasLogged && s.exCardDone]}
                        onPress={() => setSelectedEx(ex)}
                        activeOpacity={0.78}
                      >
                        <View style={s.exCardLeft}>
                          <Text style={s.exName}>{ex.name}</Text>
                          <Text style={s.exMeta}>{ex.category} · {ex.equipment}</Text>
                          <Text style={s.exPrev}>{lastSesh ? `Last: ${lastSesh.sets} sets · ${lastSesh.maxWeight} lbs max` : 'No previous session'}</Text>
                        </View>
                        <View style={s.exCardRight}>
                          {hasLogged ? (
                            <View style={s.setBadge}>
                              <Text style={s.setBadgeNum}>{todaySets.length}</Text>
                              <Text style={s.setBadgeLbl}>sets</Text>
                            </View>
                          ) : (
                            <Text style={s.tapHint}>Tap to log →</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    </SwipeableCard>
                  );
                })
              )}
            </View>
          </>
        )}

        {/* ═══════════════════ CARDIO MODE ═════════════════════════════════ */}
        {mode === 'cardio' && (
          <>
            {/* Week stats */}
            <View style={s.cardioStats}>
              {[
                { lbl:'Activities', val:String(cardioStats.activities), color:'#ff6b35' },
                { lbl:'Minutes',    val:String(cardioStats.minutes),    color:'#30d158' },
                { lbl:'Miles',      val:cardioStats.dist,               color:'#0a84ff' },
                { lbl:'Calories',   val:cardioStats.cal,                color:'#ef4444' },
              ].map(({ lbl, val, color }) => (
                <View key={lbl} style={s.cardioStatBox}>
                  <Text style={[s.cardioStatVal, { color }]}>{val}</Text>
                  <Text style={s.cardioStatLbl}>{lbl}</Text>
                </View>
              ))}
            </View>
            <Text style={s.cardioWeekLabel}>LAST 7 DAYS</Text>

            {recentCardio.length === 0 ? (
              <View style={s.emptyState}>
                <Text style={s.emptyEmoji}>🏃</Text>
                <Text style={s.emptyTitle}>No activities yet</Text>
                <Text style={s.emptyHint}>Tap Log Activity to start tracking</Text>
              </View>
            ) : (
              recentCardio.map(({ date, dayLabel, entries }) => (
                <View key={date} style={s.cardioGroup}>
                  <Text style={s.cardioGroupLabel}>{dayLabel}</Text>
                  {entries.map(entry => {
                    const t = ACTIVITY_TYPES.find(a => a.id === entry.type);
                    const meta = [];
                    if (entry.type!=='rest' && entry.duration>0) meta.push(`${entry.duration} min`);
                    if (entry.distance>0) meta.push(`${entry.distance} mi`);
                    if (entry.calories>0) meta.push(`${entry.calories} kcal`);
                    if (entry.type==='rest') meta.push('Recovery day');
                    return (
                      <View key={entry.id} style={s.cardioEntry}>
                        <View style={[s.entryAccent, { backgroundColor: t?.color ?? '#9ca3af' }]} />
                        <View style={s.entryBody}>
                          <View style={s.entryTop}>
                            <Text style={s.entryName}>{t?.emoji}  {t?.label ?? entry.type}</Text>
                            <TouchableOpacity onPress={() => deleteCardio(date, entry.id)} activeOpacity={0.75}>
                              <Text style={s.entryDelete}>✕</Text>
                            </TouchableOpacity>
                          </View>
                          {meta.length>0 && <Text style={s.entryMeta}>{meta.join(' · ')}</Text>}
                          {entry.notes?.length>0 && <Text style={s.entryNotes}>{entry.notes}</Text>}
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

      {/* ── FAB area ──────────────────────────────────────────────────────── */}
      {mode === 'gym' && exercises.length === 0 && (
        <View style={s.centerFab} pointerEvents="box-none">
          <TouchableOpacity style={s.fab} onPress={() => setSearchVisible(true)} activeOpacity={0.85}>
            <Text style={s.fabText}>+ Add Exercise</Text>
          </TouchableOpacity>
        </View>
      )}

      {mode === 'gym' && exercises.length > 0 && (
        <View style={s.bottomFab}>
          {totalSets > 0 && (
            <TouchableOpacity style={s.finishBtn} onPress={() => setSummaryVisible(true)} activeOpacity={0.85}>
              <Text style={s.finishBtnText}>✓  Finish Workout</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.fab} onPress={() => setSearchVisible(true)} activeOpacity={0.85}>
            <Text style={s.fabText}>+ Add Exercise</Text>
          </TouchableOpacity>
        </View>
      )}

      {mode === 'cardio' && (
        <View style={s.bottomFab}>
          <TouchableOpacity style={s.fab} onPress={() => setCardioModal(true)} activeOpacity={0.85}>
            <Text style={s.fabText}>+ Log Activity</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Remove dialog */}
      <Modal visible={!!removeTarget} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={s.dialog}>
            <Text style={s.dialogTitle}>Remove Exercise?</Text>
            <Text style={s.dialogSub}>Removes from {activeDayName}</Text>
            <View style={s.dialogBtns}>
              <TouchableOpacity style={s.dialogCancel} onPress={() => setRemoveTarget(null)} activeOpacity={0.75}>
                <Text style={s.dialogCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.dialogDanger} onPress={confirmRemove} activeOpacity={0.75}>
                <Text style={s.dialogDangerText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Copy plan dialog */}
      <Modal visible={copyVisible} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={s.dialog}>
            <Text style={s.dialogTitle}>Copy to which day?</Text>
            <Text style={s.dialogSub}>{exercises.length} exercise{exercises.length!==1?'s':''} from {activeDayName}</Text>
            <View style={s.copyList}>
              {otherDays.map(d => (
                <TouchableOpacity key={d.index} style={s.copyRow} onPress={() => copyPlan(d.index)} activeOpacity={0.75}>
                  <Text style={s.copyRowName}>{d.name}</Text>
                  <Text style={s.copyRowCount}>{(plan[d.index]??[]).length} exercises →</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={s.dialogCancel} onPress={() => setCopyVisible(false)} activeOpacity={0.75}>
              <Text style={s.dialogCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {searchVisible && <ExerciseSearchModal visible={searchVisible} onClose={() => setSearchVisible(false)} onAdd={addExercise} />}
      {selectedEx && (
        <LogSetModal
          visible={!!selectedEx}
          exercise={selectedEx}
          date={today}
          sets={getSets(selectedEx.id)}
          previousSessions={prevSessionsMap[selectedEx.id] ?? []}
          onAdd={(set) => addSet(selectedEx.id, set)}
          onRemove={(i) => removeSet(selectedEx.id, i)}
          onClose={() => setSelectedEx(null)}
        />
      )}
      {summaryVisible && (
        <SessionSummaryModal
          visible={summaryVisible}
          duration={workoutStartRef.current ? Math.floor((Date.now()-workoutStartRef.current)/1000) : 0}
          onClose={() => {
            const dur = workoutStartRef.current ? Math.floor((Date.now()-workoutStartRef.current)/1000) : 0;
            const snap = { date:today, duration:dur, exercises: exercises.map(ex => ({ ...ex, sets: logs[today]?.[ex.id]??[] })).filter(e => e.sets.length>0) };
            setCompletedWorkouts(p => ({ ...p, [today]: snap }));
            setLogs(p => { const n={...p}; delete n[today]; return n; });
            workoutStartRef.current = null;
            setSummaryVisible(false);
          }}
          exercises={exercises}
          logs={logs}
          date={today}
        />
      )}
      <WorkoutHistoryModal visible={historyVisible} onClose={() => setHistoryVisible(false)} completedWorkouts={completedWorkouts}
        onDelete={(d) => setCompletedWorkouts(p => { const n={...p}; delete n[d]; return n; })}
      />
      <CardioLogModal visible={cardioModal} onClose={() => setCardioModal(false)} onSave={saveCardio} />
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#f2f2f7' },
  scroll:  { flex: 1 },
  content: { padding: 20, paddingBottom: 120 },

  header: { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 },
  label:  { fontSize:10, fontWeight:'800', color:'#30d158', letterSpacing:2 },
  title:  { fontSize:28, fontWeight:'800', color:'#1a1a1e', letterSpacing:-0.5 },
  historyBtn: {
    backgroundColor:'#1a1a1e', borderRadius:20, paddingHorizontal:16, paddingVertical:10, marginTop:4,
    shadowColor:'#1a1a1e', shadowOffset:{width:0,height:3}, shadowOpacity:0.25, shadowRadius:10, elevation:5,
  },
  historyBtnText: { fontSize:13, fontWeight:'800', color:'#ffffff' },

  toggle: {
    flexDirection:'row', backgroundColor:'#e5e7eb', borderRadius:16, padding:4, gap:4, marginBottom:22,
  },
  toggleBtn:       { flex:1, paddingVertical:13, borderRadius:13, alignItems:'center' },
  toggleBtnActive: {
    backgroundColor:'#1a1a1e',
    shadowColor:'#1a1a1e', shadowOffset:{width:0,height:2}, shadowOpacity:0.2, shadowRadius:8, elevation:3,
  },
  toggleText:       { fontSize:14, fontWeight:'700', color:'#9ca3af' },
  toggleTextActive: { color:'#ffffff', fontWeight:'800' },

  daysScroll: { marginBottom:16 },
  daysRow:    { gap:8, paddingRight:4 },
  dayBtn: {
    alignItems:'center', paddingVertical:12, paddingHorizontal:14, borderRadius:14, gap:4,
    backgroundColor:'#ffffff',
    shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.06, shadowRadius:8, elevation:2,
  },
  dayBtnActive:   { backgroundColor:'#1a1a1e', shadowOpacity:0.18, elevation:5 },
  dayShort:       { fontSize:10, fontWeight:'800', color:'#9ca3af', letterSpacing:0.5 },
  dayShortActive: { color:'#ffffff' },
  todayDot:       { width:5, height:5, borderRadius:2.5, backgroundColor:'#30d158' },
  todayDotActive: { backgroundColor:'rgba(255,255,255,0.55)' },

  statsRow: { flexDirection:'row', alignItems:'center', gap:8, marginBottom:18 },
  statPill: {
    backgroundColor:'#ffffff', borderRadius:12, paddingHorizontal:16, paddingVertical:10, alignItems:'center', gap:2,
    shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.06, shadowRadius:8, elevation:1,
  },
  statVal: { fontSize:18, fontWeight:'800', color:'#1a1a1e' },
  statLbl: { fontSize:9, fontWeight:'700', color:'#9ca3af', letterSpacing:0.5, textTransform:'uppercase' },
  copyBtn: {
    marginLeft:'auto', backgroundColor:'#f3f4f6', borderRadius:12,
    paddingHorizontal:14, paddingVertical:10,
  },
  copyBtnText: { fontSize:12, fontWeight:'700', color:'#6b7280' },

  exList: { gap:10 },
  emptyState: { height:280, alignItems:'center', justifyContent:'center', gap:8 },
  emptyEmoji: { fontSize:52 },
  emptyTitle: { fontSize:16, fontWeight:'800', color:'#1a1a1e' },
  emptyHint:  { fontSize:12, fontWeight:'500', color:'#9ca3af' },

  exCard: {
    flexDirection:'row', justifyContent:'space-between', alignItems:'center',
    backgroundColor:'#ffffff', borderRadius:18, padding:16, gap:12,
    shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.07, shadowRadius:14, elevation:2,
  },
  exCardDone: { backgroundColor:'#f0fdf4' },
  exCardLeft: { flex:1, gap:5 },
  exName:     { fontSize:15, fontWeight:'700', color:'#1a1a1e' },
  exMeta:     { fontSize:11, fontWeight:'500', color:'#9ca3af' },
  exPrev:     { fontSize:10, fontWeight:'500', color:'#d1d5db' },
  exCardRight:{ alignItems:'center' },
  setBadge:   { alignItems:'center', backgroundColor:'#dcfce7', borderRadius:10, paddingHorizontal:12, paddingVertical:6, gap:1 },
  setBadgeNum:{ fontSize:18, fontWeight:'800', color:'#16a34a' },
  setBadgeLbl:{ fontSize:8, fontWeight:'700', color:'#16a34a', opacity:0.8 },
  tapHint:    { fontSize:11, fontWeight:'600', color:'#d1d5db' },

  // Cardio
  cardioStats: { flexDirection:'row', gap:8, marginBottom:4 },
  cardioStatBox: {
    flex:1, backgroundColor:'#ffffff', borderRadius:14, padding:12, alignItems:'center', gap:3,
    shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.06, shadowRadius:8, elevation:1,
  },
  cardioStatVal: { fontSize:18, fontWeight:'800' },
  cardioStatLbl: { fontSize:8, fontWeight:'700', color:'#9ca3af', letterSpacing:0.5, textTransform:'uppercase' },
  cardioWeekLabel: { fontSize:9, fontWeight:'700', color:'#d1d5db', textAlign:'center', letterSpacing:1.5, marginTop:6, marginBottom:20 },
  cardioGroup:      { marginBottom:16 },
  cardioGroupLabel: { fontSize:10, fontWeight:'800', color:'#ff6b35', letterSpacing:1.5, marginBottom:8 },
  cardioEntry: {
    flexDirection:'row', backgroundColor:'#ffffff', borderRadius:14, overflow:'hidden', marginBottom:8,
    shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.06, shadowRadius:8, elevation:1,
  },
  entryAccent:  { width:4 },
  entryBody:    { flex:1, padding:14, gap:4 },
  entryTop:     { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  entryName:    { fontSize:14, fontWeight:'700', color:'#1a1a1e' },
  entryDelete:  { fontSize:14, color:'#d1d5db', paddingLeft:12 },
  entryMeta:    { fontSize:11, fontWeight:'500', color:'#9ca3af' },
  entryNotes:   { fontSize:11, color:'#6b7280', fontStyle:'italic' },

  centerFab: { position:'absolute', top:0, left:20, right:20, bottom:0, justifyContent:'center' },
  bottomFab: { position:'absolute', bottom:16, left:20, right:20, gap:8 },
  fab: {
    backgroundColor:'#1a1a1e', borderRadius:16, paddingVertical:17, alignItems:'center',
    shadowColor:'#1a1a1e', shadowOffset:{width:0,height:4}, shadowOpacity:0.3, shadowRadius:14, elevation:8,
  },
  fabText: { fontSize:15, fontWeight:'800', color:'#ffffff', letterSpacing:0.3 },
  finishBtn: {
    backgroundColor:'#dcfce7', borderRadius:16, paddingVertical:15, alignItems:'center',
    borderWidth:2, borderColor:'#86efac',
  },
  finishBtnText: { fontSize:15, fontWeight:'800', color:'#16a34a', letterSpacing:0.3 },

  overlay: { flex:1, backgroundColor:'rgba(0,0,0,0.45)', justifyContent:'center', alignItems:'center' },
  dialog: {
    width:310, backgroundColor:'#ffffff', borderRadius:24, padding:24, gap:4,
    shadowColor:'#000', shadowOffset:{width:0,height:8}, shadowOpacity:0.15, shadowRadius:24, elevation:14,
  },
  dialogTitle: { fontSize:20, fontWeight:'800', color:'#1a1a1e' },
  dialogSub:   { fontSize:12, color:'#6b7280', marginBottom:16 },
  dialogBtns:  { flexDirection:'row', gap:10, marginTop:4 },
  dialogCancel: { flex:1, paddingVertical:14, borderRadius:12, alignItems:'center', backgroundColor:'#f3f4f6' },
  dialogCancelText: { fontSize:14, fontWeight:'700', color:'#6b7280' },
  dialogDanger: { flex:1, paddingVertical:14, borderRadius:12, alignItems:'center', backgroundColor:'#ef4444' },
  dialogDangerText: { fontSize:14, fontWeight:'800', color:'#ffffff' },
  copyList:    { gap:8, marginBottom:12 },
  copyRow: {
    flexDirection:'row', justifyContent:'space-between', alignItems:'center',
    padding:14, backgroundColor:'#f9fafb', borderRadius:12,
  },
  copyRowName:  { fontSize:14, fontWeight:'700', color:'#1a1a1e' },
  copyRowCount: { fontSize:12, fontWeight:'500', color:'#9ca3af' },
});

import { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Modal, Animated,
} from 'react-native';
import { DAYS } from '../data/days';
import { useStorage } from '../hooks/useStorage';
import { useBodyWeight } from '../hooks/useBodyWeight';
import DayNav from '../components/DayNav';
import MealCard from '../components/MealCard';
import BodyWeightModal from '../components/BodyWeightModal';

const WATER_GOAL = 100;
const WATER_STEP = 8;
const CONFETTI_COLORS = ['#30d158', '#0a84ff', '#ff6b35', '#f59e0b', '#af52de', '#ff375f', '#32ade6', '#ff9500'];

function localDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function WaterCelebration({ onDone }) {
  const fade  = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  const particles = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      angle:    (i / 24) * Math.PI * 2 + (Math.random() - 0.5) * 0.6,
      dist:     80 + Math.random() * 110,
      color:    CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size:     6 + Math.random() * 8,
      isCircle: Math.random() > 0.5,
      delay:    Math.floor(Math.random() * 150),
      rot:      1 + Math.random() * 2.5,
    })), []);
  const pAnims = useRef(particles.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, bounciness: 16, useNativeDriver: true }).start();
    const bursts = pAnims.map((a, i) =>
      Animated.timing(a, { toValue: 1, duration: 850 + particles[i].delay, delay: particles[i].delay, useNativeDriver: true })
    );
    Animated.parallel([
      ...bursts,
      Animated.timing(fade, { toValue: 0, duration: 480, delay: 2500, useNativeDriver: true }),
    ]).start(() => onDone());
  }, []);

  return (
    <Animated.View style={[s.celebOverlay, { opacity: fade }]} pointerEvents="none">
      <Animated.View style={[s.celebCard, { transform: [{ scale }] }]}>
        <View style={s.particleOrigin}>
          {particles.map((p, i) => {
            const tx = pAnims[i].interpolate({ inputRange: [0,1], outputRange: [0, Math.cos(p.angle)*p.dist] });
            const ty = pAnims[i].interpolate({ inputRange: [0,1], outputRange: [0, Math.sin(p.angle)*p.dist] });
            const op = pAnims[i].interpolate({ inputRange: [0,0.6,1], outputRange: [1,1,0] });
            const ro = pAnims[i].interpolate({ inputRange: [0,1], outputRange: ['0deg', `${Math.round(p.rot*360)}deg`] });
            return (
              <Animated.View key={i} style={{
                position:'absolute', width:p.size, height:p.isCircle?p.size:p.size*0.45,
                backgroundColor:p.color, borderRadius:p.isCircle?p.size/2:2,
                transform:[{translateX:tx},{translateY:ty},{rotate:ro}], opacity:op,
              }} />
            );
          })}
        </View>
        <Text style={s.celebEmoji}>💧</Text>
        <Text style={s.celebTitle}>All Done!</Text>
        <Text style={s.celebSub}>Great job today 👍</Text>
        <Text style={s.celebGoal}>{WATER_GOAL} oz reached</Text>
      </Animated.View>
    </Animated.View>
  );
}

export default function MealScreen() {
  const todayStr   = localDateStr();
  const todayIndex = [6,0,1,2,3,4,5][new Date().getDay()];

  const [bodyWeightEntries]              = useBodyWeight();
  const [activeDay, setActiveDay]        = useState(todayIndex);
  const [checked, setChecked]            = useStorage('mealChecked', {});
  const [waterLog, setWaterLog]          = useStorage('waterLog', {});
  const [celebrated, setCelebrated]      = useStorage('waterCelebrated', {});
  const [resetVisible, setResetVisible]  = useState(false);
  const [weightVisible, setWeightVisible]= useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const latestWeight = useMemo(() =>
    [...bodyWeightEntries].sort((a,b) => b.date.localeCompare(a.date))[0] ?? null,
    [bodyWeightEntries]
  );

  const waterOz  = waterLog[todayStr] ?? 0;
  const waterPct = Math.min(Math.round((waterOz / WATER_GOAL) * 100), 100);

  useEffect(() => {
    if (waterOz >= WATER_GOAL && !celebrated[todayStr]) {
      setCelebrated(p => ({ ...p, [todayStr]: true }));
      setShowCelebration(true);
    }
  }, [waterOz]);

  const addWater    = () => setWaterLog(p => ({ ...p, [todayStr]: Math.min((p[todayStr]??0)+WATER_STEP, WATER_GOAL) }));
  const removeWater = () => setWaterLog(p => ({ ...p, [todayStr]: Math.max((p[todayStr]??0)-WATER_STEP, 0) }));
  const toggleMeal  = (di, mi) => { const k = `${di}-${mi}`; setChecked(p => ({ ...p, [k]: !p[k] })); };
  const confirmReset= () => { setChecked({}); setResetVisible(false); };

  const day    = DAYS[activeDay];
  const dayDone= day.meals.filter((_,i) => checked[`${activeDay}-${i}`]).length;
  const dayPct = Math.round((dayDone / day.meals.length) * 100);

  const DAY_NAMES = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  return (
    <View style={s.root}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.label}>NUTRITION</Text>
            <Text style={s.title}>Meal Plan</Text>
            {latestWeight && (
              <Text style={s.sub}>{latestWeight.weight} lbs · recomposition</Text>
            )}
          </View>
          <View style={s.headerRight}>
            <TouchableOpacity style={[s.hBtn, s.hBtnBlue]} onPress={() => setWeightVisible(true)} activeOpacity={0.75}>
              <Text style={s.hBtnText}>⚖️ Weight</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.hBtn, s.hBtnRed]} onPress={() => setResetVisible(true)} activeOpacity={0.75}>
              <Text style={[s.hBtnText, { color: '#ef4444' }]}>↺ Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Water card ─────────────────────────────────────────────────── */}
        <View style={s.waterCard}>
          <View style={s.waterTop}>
            <View>
              <Text style={s.waterLabel}>💧  HYDRATION</Text>
              <View style={s.waterAmtRow}>
                <Text style={s.waterAmt}>{waterOz}</Text>
                <Text style={s.waterUnit}> / {WATER_GOAL} oz</Text>
              </View>
            </View>
            <View style={s.waterRing}>
              <Text style={s.waterPct}>{waterPct}%</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={s.waterBar}>
            <View style={[s.waterFill, { width: `${waterPct}%` }]} />
          </View>

          {/* Buttons */}
          <View style={s.waterBtns}>
            <TouchableOpacity style={s.waterBtnMinus} onPress={removeWater} activeOpacity={0.75}>
              <Text style={s.waterBtnMinusText}>−  8 oz</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.waterBtnPlus} onPress={addWater} activeOpacity={0.75}>
              <Text style={s.waterBtnPlusText}>+  8 oz</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Day nav ────────────────────────────────────────────────────── */}
        <DayNav days={DAYS} activeDay={activeDay} todayIndex={todayIndex} checkedMap={checked} onSelect={setActiveDay} />

        {/* ── Day header ─────────────────────────────────────────────────── */}
        <View style={s.dayHeader}>
          <Text style={s.dayName}>{DAY_NAMES[activeDay]}</Text>
          <View style={[s.dayBadge, day.type === 'training' ? s.badgeTrain : s.badgeRest]}>
            <Text style={[s.dayBadgeText, day.type === 'training' ? s.badgeTrainText : s.badgeRestText]}>
              {day.type === 'training' ? '🏋️  TRAINING' : '😴  REST'}
            </Text>
          </View>
        </View>

        {/* ── Calorie hero ───────────────────────────────────────────────── */}
        <View style={s.calCard}>
          <View style={s.calLeft}>
            <Text style={s.calLabel}>DAILY CALORIES</Text>
            <View style={s.calRow}>
              <Text style={s.calVal}>{day.cal}</Text>
              <Text style={s.calUnit}>kcal</Text>
            </View>
          </View>
          <Text style={s.calEmoji}>🔥</Text>
        </View>

        {/* ── Macro grid ─────────────────────────────────────────────────── */}
        <View style={s.macroGrid}>
          {[
            { val:`${day.protein}g`, lbl:'Protein', bg:'#f5f3ff', clr:'#7c3aed' },
            { val:`${day.carbs}g`,   lbl:'Carbs',   bg:'#fffbeb', clr:'#d97706' },
            { val:`${day.fat}g`,     lbl:'Fat',     bg:'#fef2f2', clr:'#ef4444' },
            { val:`${day.fiber}g`,   lbl:'Fiber',   bg:'#f0fdf4', clr:'#16a34a' },
          ].map(({ val, lbl, bg, clr }) => (
            <View key={lbl} style={[s.macroTile, { backgroundColor: bg }]}>
              <Text style={[s.macroVal, { color: clr }]}>{val}</Text>
              <Text style={s.macroLbl}>{lbl}</Text>
            </View>
          ))}
        </View>

        {/* ── Day progress ───────────────────────────────────────────────── */}
        <View style={s.progressCard}>
          <View style={s.progressTop}>
            <Text style={s.progressLabel}>MEALS TODAY</Text>
            <Text style={s.progressCount}><Text style={s.progressBold}>{dayDone}</Text> / {day.meals.length}</Text>
          </View>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${dayPct}%` }]} />
          </View>
        </View>

        {/* ── Meals list ─────────────────────────────────────────────────── */}
        <View style={s.mealsList}>
          {day.meals
            .map((meal, i) => ({ meal, i }))
            .filter(({ i }) => !checked[`${activeDay}-${i}`])
            .map(({ meal, i }) => (
              <MealCard key={i} meal={meal} checked={false} onToggle={() => toggleMeal(activeDay, i)} />
            ))}
        </View>

        {day.note && (
          <View style={s.noteBox}>
            <Text style={s.noteLabel}>📌  NOTE</Text>
            <Text style={s.noteText}>{day.note}</Text>
          </View>
        )}

      </ScrollView>

      {/* ── Reset modal ──────────────────────────────────────────────────── */}
      <Modal transparent visible={resetVisible} animationType="fade">
        <View style={s.overlay}>
          <View style={s.dialog}>
            <Text style={s.dialogTitle}>Reset Week?</Text>
            <Text style={s.dialogSub}>All meal checks will be cleared.</Text>
            <View style={s.dialogBtns}>
              <TouchableOpacity style={s.dialogCancel} onPress={() => setResetVisible(false)} activeOpacity={0.75}>
                <Text style={s.dialogCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.dialogDanger} onPress={confirmReset} activeOpacity={0.75}>
                <Text style={s.dialogDangerText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BodyWeightModal visible={weightVisible} onClose={() => setWeightVisible(false)} />
      {showCelebration && <WaterCelebration onDone={() => setShowCelebration(false)} />}
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#f2f2f7' },
  scroll:  { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },

  // Header
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  headerLeft:  { gap: 2 },
  headerRight: { gap: 6, alignItems: 'flex-end', marginTop: 4 },
  label:  { fontSize: 10, fontWeight: '800', color: '#ff6b35', letterSpacing: 2 },
  title:  { fontSize: 28, fontWeight: '800', color: '#1a1a1e', letterSpacing: -0.5 },
  sub:    { fontSize: 12, color: '#9ca3af', fontWeight: '500', marginTop: 2 },
  hBtn:   { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  hBtnBlue:  { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
  hBtnRed:   { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  hBtnText:  { fontSize: 11, fontWeight: '700', color: '#3b82f6' },

  // Water card
  waterCard: {
    backgroundColor: '#0a84ff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    gap: 14,
    shadowColor: '#0a84ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  waterTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  waterLabel:  { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.75)', letterSpacing: 1.5, marginBottom: 4 },
  waterAmtRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  waterAmt:    { fontSize: 36, fontWeight: '800', color: '#ffffff', lineHeight: 38 },
  waterUnit:   { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: 6 },
  waterRing: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
  },
  waterPct:  { fontSize: 16, fontWeight: '800', color: '#ffffff' },
  waterBar:  { height: 8, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 4, overflow: 'hidden' },
  waterFill: { height: '100%', backgroundColor: '#ffffff', borderRadius: 4 },
  waterBtns: { flexDirection: 'row', gap: 10 },
  waterBtnMinus: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12, paddingVertical: 13, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
  },
  waterBtnMinusText: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
  waterBtnPlus: {
    flex: 2, backgroundColor: '#ffffff',
    borderRadius: 12, paddingVertical: 13, alignItems: 'center',
  },
  waterBtnPlusText: { fontSize: 14, fontWeight: '800', color: '#0a84ff' },

  // Day header
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  dayName:   { fontSize: 22, fontWeight: '800', color: '#1a1a1e' },
  dayBadge:  { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeTrain:     { backgroundColor: '#1a1a1e' },
  badgeTrainText: { fontSize: 10, fontWeight: '800', color: '#ffffff' },
  badgeRest:      { backgroundColor: '#f3f4f6', borderWidth: 1.5, borderColor: '#e5e7eb' },
  badgeRestText:  { fontSize: 10, fontWeight: '700', color: '#9ca3af' },
  dayBadgeText:   { letterSpacing: 0.5 },

  // Calorie hero
  calCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  calLeft:  { gap: 4 },
  calLabel: { fontSize: 10, fontWeight: '800', color: '#ff6b35', letterSpacing: 1.5 },
  calRow:   { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  calVal:   { fontSize: 44, fontWeight: '800', color: '#1a1a1e', lineHeight: 48 },
  calUnit:  { fontSize: 16, fontWeight: '600', color: '#9ca3af', marginBottom: 8 },
  calEmoji: { fontSize: 52 },

  // Macro grid
  macroGrid: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  macroTile: {
    flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  macroVal: { fontSize: 16, fontWeight: '800' },
  macroLbl: { fontSize: 9, fontWeight: '700', color: '#9ca3af', letterSpacing: 0.5, textTransform: 'uppercase' },

  // Progress
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  progressTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel:{ fontSize: 10, fontWeight: '800', color: '#9ca3af', letterSpacing: 1 },
  progressCount:{ fontSize: 13, color: '#6b7280' },
  progressBold: { fontWeight: '800', color: '#1a1a1e', fontSize: 14 },
  progressBar:  { height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#30d158', borderRadius: 3 },

  mealsList: { gap: 10, marginBottom: 16 },

  // Note
  noteBox: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    gap: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b35',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  noteLabel: { fontSize: 10, fontWeight: '800', color: '#ff6b35', letterSpacing: 1 },
  noteText:  { fontSize: 12, color: '#6b7280', lineHeight: 20 },

  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  dialog: {
    width: 300, backgroundColor: '#ffffff', borderRadius: 24, padding: 24, gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 14,
  },
  dialogTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a1e' },
  dialogSub:   { fontSize: 13, color: '#6b7280', marginBottom: 14 },
  dialogBtns:  { flexDirection: 'row', gap: 10, marginTop: 4 },
  dialogCancel: {
    flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  dialogCancelText: { fontSize: 14, fontWeight: '700', color: '#6b7280' },
  dialogDanger: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#ef4444' },
  dialogDangerText: { fontSize: 14, fontWeight: '800', color: '#ffffff' },

  // Celebration
  celebOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)',
  },
  celebCard: {
    backgroundColor: '#ffffff', borderRadius: 28, paddingVertical: 36, paddingHorizontal: 44,
    alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 12,
  },
  particleOrigin: { position: 'absolute', width: 0, height: 0, alignSelf: 'center' },
  celebEmoji: { fontSize: 52, marginBottom: 4 },
  celebTitle: { fontSize: 32, fontWeight: '800', color: '#1a1a1e' },
  celebSub:   { fontSize: 16, fontWeight: '600', color: '#6b7280' },
  celebGoal:  { fontSize: 11, fontWeight: '700', color: '#0a84ff', marginTop: 4, letterSpacing: 0.5 },
});

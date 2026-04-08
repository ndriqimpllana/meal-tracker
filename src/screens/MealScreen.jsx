import { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Modal, Animated,
} from 'react-native';
import { DAYS } from '../data/days';
import { useStorage } from '../hooks/useStorage';
import DayNav from '../components/DayNav';
import MealCard from '../components/MealCard';
import BodyWeightModal from '../components/BodyWeightModal';

const WATER_GOAL_OZ = 100;
const WATER_STEP_OZ = 8;

const MACRO_COLORS = {
  cal:     '#fb923c',
  protein: '#c084fc',
  carbs:   '#fbbf24',
  fat:     '#f87171',
  fiber:   '#2dd4bf',
};

const CONFETTI_COLORS = ['#4ade80', '#60a5fa', '#f87171', '#fbbf24', '#c084fc', '#fb923c', '#34d399', '#f472b6'];

// Derive local date string (YYYY-MM-DD) using device timezone, not UTC
function localDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ── Celebration overlay ──────────────────────────────────────────────────────
const PARTICLE_COUNT = 28;

function WaterCelebration({ onDone }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;

  const particles = useMemo(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      angle: (i / PARTICLE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.5,
      distance: 90 + Math.random() * 110,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 7 + Math.random() * 8,
      isRect: Math.random() > 0.45,
      delay: Math.floor(Math.random() * 180),
      rotations: 1 + Math.random() * 2.5,
    })), []);

  const particleAnims = useRef(particles.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Pop card in
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, bounciness: 14 }).start();

    // Fire confetti
    const bursts = particleAnims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 900 + particles[i].delay,
        delay: particles[i].delay,
        useNativeDriver: true,
      })
    );

    // Fade out overlay after 2.6s
    const fadeOut = Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      delay: 2600,
      useNativeDriver: true,
    });

    Animated.parallel([...bursts, fadeOut]).start(() => onDone());
  }, []);

  return (
    <Animated.View style={[s.celebOverlay, { opacity: fadeAnim }]} pointerEvents="none">
      <Animated.View style={[s.celebCard, { transform: [{ scale: scaleAnim }] }]}>
        {/* Confetti burst origin */}
        <View style={s.celebParticleOrigin}>
          {particles.map((p, i) => {
            const tx = particleAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(p.angle) * p.distance] });
            const ty = particleAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(p.angle) * p.distance] });
            const opacity = particleAnims[i].interpolate({ inputRange: [0, 0.65, 1], outputRange: [1, 1, 0] });
            const rotate = particleAnims[i].interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${Math.round(p.rotations * 360)}deg`] });
            return (
              <Animated.View
                key={i}
                style={{
                  position: 'absolute',
                  width: p.size,
                  height: p.isRect ? p.size * 0.45 : p.size,
                  backgroundColor: p.color,
                  borderRadius: p.isRect ? 2 : p.size / 2,
                  transform: [{ translateX: tx }, { translateY: ty }, { rotate }],
                  opacity,
                }}
              />
            );
          })}
        </View>

        <Text style={s.celebEmoji}>💧</Text>
        <Text style={s.celebTitle}>All Done!</Text>
        <Text style={s.celebSub}>Great job today 👍</Text>
        <Text style={s.celebGoal}>{WATER_GOAL_OZ} oz reached</Text>
      </Animated.View>
    </Animated.View>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────
export default function MealScreen() {
  const today     = new Date().getDay(); // 0=Sun
  const dayMap    = [6, 0, 1, 2, 3, 4, 5];
  const todayIndex = dayMap[today];
  const todayStr  = localDateStr();

  const [activeDay, setActiveDay]         = useState(todayIndex);
  const [checked, setChecked]             = useStorage('mealChecked', {});
  const [waterLog, setWaterLog]           = useStorage('waterLog', {});
  const [celebratedDates, setCelebrated]  = useStorage('waterCelebrated', {});
  const [resetVisible, setResetVisible]   = useState(false);
  const [weightVisible, setWeightVisible] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Always read today's water from today's key — defaults to 0 (auto-resets per day)
  const waterOz  = waterLog[todayStr] ?? 0;
  const waterPct = Math.min(Math.round((waterOz / WATER_GOAL_OZ) * 100), 100);

  // Show celebration when goal is first hit today
  useEffect(() => {
    if (waterOz >= WATER_GOAL_OZ && !celebratedDates[todayStr]) {
      setCelebrated(prev => ({ ...prev, [todayStr]: true }));
      setShowCelebration(true);
    }
  }, [waterOz]);

  const addWater = () => {
    setWaterLog(prev => ({
      ...prev,
      [todayStr]: Math.min((prev[todayStr] ?? 0) + WATER_STEP_OZ, WATER_GOAL_OZ),
    }));
  };

  const removeWater = () => {
    setWaterLog(prev => ({
      ...prev,
      [todayStr]: Math.max((prev[todayStr] ?? 0) - WATER_STEP_OZ, 0),
    }));
  };

  const toggleMeal = (dayIdx, mealIdx) => {
    const key = `${dayIdx}-${mealIdx}`;
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const resetAll    = () => setResetVisible(true);
  const confirmReset = () => { setChecked({}); setResetVisible(false); };

  const day     = DAYS[activeDay];
  const dayDone = day.meals.filter((_, i) => checked[`${activeDay}-${i}`]).length;
  const dayPct  = Math.round((dayDone / day.meals.length) * 100);

  const macros = [
    { val: String(day.cal),   lbl: 'Calories', color: MACRO_COLORS.cal     },
    { val: `${day.protein}g`, lbl: 'Protein',  color: MACRO_COLORS.protein },
    { val: `${day.carbs}g`,   lbl: 'Carbs',    color: MACRO_COLORS.carbs   },
    { val: `${day.fat}g`,     lbl: 'Fat',      color: MACRO_COLORS.fat     },
    { val: `${day.fiber}g`,   lbl: 'Fiber',    color: MACRO_COLORS.fiber   },
  ];

  return (
    <View style={s.root}>
      <View style={s.safe}>
        <ScrollView style={s.scroll} contentContainerStyle={s.content}>

          {/* ── Header ── */}
          <View style={s.header}>
            <View style={s.headerTop}>
              <View>
                <Text style={s.title}>Your plan{'\n'}181 lbs · recomp</Text>
              </View>
              <View style={s.headerBtns}>
                <TouchableOpacity style={[s.headerBtn, s.headerBtnLog]} onPress={() => setWeightVisible(true)} activeOpacity={0.6}>
                  <Text style={[s.headerBtnText, s.headerBtnLogText]}>Log Weight</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.headerBtn, s.headerBtnReset]} onPress={resetAll} activeOpacity={0.6}>
                  <Text style={[s.headerBtnText, s.headerBtnResetText]}>Reset week</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Water tracker card ── */}
            <View style={s.waterCard}>
              <View style={s.waterCardTop}>
                <View style={s.waterLabelRow}>
                  <Text style={s.waterLabel}>💧 WATER</Text>
                  <Text style={s.waterCount}>
                    <Text style={s.waterOz}>{waterOz}</Text>
                    {` / ${WATER_GOAL_OZ} oz`}
                  </Text>
                </View>
                <Text style={s.waterPct}>{waterPct}%</Text>
              </View>

              <View style={s.waterBar}>
                <View style={[s.waterFill, { width: `${waterPct}%` }]} />
              </View>

              <View style={s.waterBtns}>
                <TouchableOpacity style={s.waterMinus} onPress={removeWater} activeOpacity={0.7}>
                  <Text style={s.waterMinusText}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.waterPlus} onPress={addWater} activeOpacity={0.7}>
                  <Text style={s.waterPlusText}>+ 8 oz</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ── Day nav ── */}
          <DayNav days={DAYS} activeDay={activeDay} todayIndex={todayIndex} checkedMap={checked} onSelect={setActiveDay} />

          {/* ── Day header ── */}
          <View style={s.dayHeader}>
            <Text style={s.dayName}>{day.name}</Text>
            <View style={[s.badge, day.type === 'training' ? s.badgeTrain : s.badgeRest]}>
              <Text style={[s.badgeText, day.type === 'training' ? s.badgeTrainText : s.badgeRestText]}>
                {day.type === 'training' ? 'TRAINING' : 'REST'}
              </Text>
            </View>
          </View>

          {/* ── Macro strip ── */}
          <View style={s.macroStrip}>
            {macros.map(({ val, lbl, color }) => (
              <View key={lbl} style={[s.macroBox, { borderColor: color + '50', backgroundColor: color + '12' }]}>
                <Text style={[s.macroVal, { color }]}>{val}</Text>
                <Text style={s.macroLbl}>{lbl}</Text>
              </View>
            ))}
          </View>

          {/* ── Meals list ── */}
          <View style={s.mealsList}>
            {day.meals
              .map((meal, i) => ({ meal, i }))
              .filter(({ i }) => !checked[`${activeDay}-${i}`])
              .map(({ meal, i }) => (
                <MealCard key={i} meal={meal} checked={false} onToggle={() => toggleMeal(activeDay, i)} />
              ))
            }
          </View>

          {/* ── Day summary ── */}
          <View style={s.daySummary}>
            <Text style={s.summaryLabel}>Day progress</Text>
            <View style={s.summaryBar}>
              <View style={[s.summaryFill, { width: `${dayPct}%` }]} />
            </View>
            <Text style={s.summaryCount}>
              <Text style={s.bold}>{dayDone}</Text>{' of '}
              <Text style={s.bold}>{day.meals.length}</Text>{' meals eaten'}
            </Text>
          </View>

          {day.note && (
            <View style={s.noteBox}>
              <Text style={s.noteText}>{day.note}</Text>
            </View>
          )}

        </ScrollView>

        {/* Reset modal */}
        <Modal transparent visible={resetVisible} animationType="fade">
          <View style={s.overlay}>
            <View style={s.dialog}>
              <Text style={s.dialogTitle}>Reset Week?</Text>
              <View style={s.dialogBtns}>
                <TouchableOpacity style={s.dialogCancel} onPress={() => setResetVisible(false)} activeOpacity={0.7}>
                  <Text style={s.dialogCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.dialogReset} onPress={confirmReset} activeOpacity={0.7}>
                  <Text style={s.dialogResetText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <BodyWeightModal visible={weightVisible} onClose={() => setWeightVisible(false)} />

        {/* Celebration overlay */}
        {showCelebration && (
          <WaterCelebration onDone={() => setShowCelebration(false)} />
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0b0f1a' },
  safe: { flex: 1, backgroundColor: '#0b0f1a' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 60 },

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
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#e8edf5',
    lineHeight: 28,
  },
  headerBtns: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', marginTop: 4 },
  headerBtn: {
    borderWidth: 1,
    borderColor: '#253048',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  headerBtnText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#536080',
    letterSpacing: 0.5,
  },
  headerBtnLog: { borderColor: '#60a5fa55', backgroundColor: '#0e1e3a' },
  headerBtnLogText: { color: '#60a5fa' },
  headerBtnReset: { borderColor: '#f8717155', backgroundColor: '#1a0e0e' },
  headerBtnResetText: { color: '#f87171' },

  // ── Water card ──
  waterCard: {
    backgroundColor: '#0e1e3a',
    borderWidth: 1,
    borderColor: '#60a5fa44',
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  waterCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  waterLabelRow: { gap: 4 },
  waterLabel: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#60a5fa',
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  waterCount: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#536080',
  },
  waterOz: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e8edf5',
  },
  waterPct: {
    fontFamily: 'monospace',
    fontSize: 22,
    fontWeight: '700',
    color: '#60a5fa',
  },
  waterBar: {
    height: 8,
    backgroundColor: '#1c2e50',
    borderRadius: 4,
    overflow: 'hidden',
  },
  waterFill: {
    height: '100%',
    backgroundColor: '#60a5fa',
    borderRadius: 4,
  },
  waterBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  waterMinus: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterMinusText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 22,
  },
  waterPlus: {
    flex: 3,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterPlusText: {
    fontFamily: 'monospace',
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },

  // Day section
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dayName: { fontSize: 20, fontWeight: '600', color: '#e8edf5' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontFamily: 'monospace', fontSize: 10, letterSpacing: 0.5 },
  badgeTrain: { backgroundColor: '#ffffff' },
  badgeTrainText: { color: '#000000' },
  badgeRest: { backgroundColor: '#1b2438', borderWidth: 1, borderColor: '#253048' },
  badgeRestText: { color: '#536080' },

  // Macros
  macroStrip: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  macroBox: {
    flex: 1, borderWidth: 1, borderRadius: 8, padding: 8, alignItems: 'center',
  },
  macroVal: { fontFamily: 'monospace', fontSize: 13, fontWeight: '600' },
  macroLbl: { fontSize: 8, color: '#536080', marginTop: 2, letterSpacing: 0.3 },

  mealsList: { gap: 8, marginBottom: 16 },

  // Summary
  daySummary: {
    backgroundColor: '#131929',
    borderWidth: 1,
    borderColor: '#253048',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  summaryLabel: {
    fontFamily: 'monospace', fontSize: 10, color: '#536080',
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8,
  },
  summaryBar: {
    height: 4, backgroundColor: '#1c2640', borderRadius: 2, overflow: 'hidden', marginBottom: 8,
  },
  summaryFill: { height: '100%', backgroundColor: '#4ade80', borderRadius: 2 },
  summaryCount: { fontSize: 12, color: '#536080' },
  bold: { color: '#e8edf5', fontWeight: '500' },

  noteBox: {
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: '#131929', borderLeftWidth: 2, borderLeftColor: '#4ade80', borderRadius: 8,
  },
  noteText: { fontSize: 12, color: '#8b9cbf', lineHeight: 20 },

  // Reset modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center' },
  dialog: {
    width: 280, backgroundColor: '#131929', borderWidth: 1,
    borderColor: '#253048', borderRadius: 12, padding: 24,
  },
  dialogTitle: { fontSize: 18, fontWeight: '600', color: '#e8edf5', marginBottom: 24 },
  dialogBtns: { flexDirection: 'row', gap: 10 },
  dialogCancel: {
    flex: 1, paddingVertical: 10, borderWidth: 1,
    borderColor: '#253048', borderRadius: 6, alignItems: 'center',
  },
  dialogCancelText: { fontFamily: 'monospace', fontSize: 12, color: '#536080' },
  dialogReset: {
    flex: 1, paddingVertical: 10, backgroundColor: '#ffffff', borderRadius: 6, alignItems: 'center',
  },
  dialogResetText: { fontFamily: 'monospace', fontSize: 12, color: '#000000', fontWeight: '600' },

  // ── Celebration ──
  celebOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  celebCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 44,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  celebParticleOrigin: {
    position: 'absolute',
    width: 0,
    height: 0,
    alignSelf: 'center',
  },
  celebEmoji: { fontSize: 52, marginBottom: 4 },
  celebTitle: { fontSize: 32, fontWeight: '800', color: '#0a0a0a' },
  celebSub: { fontSize: 16, color: '#444444', fontWeight: '600' },
  celebGoal: {
    fontFamily: 'monospace', fontSize: 11,
    color: '#60a5fa', marginTop: 4, letterSpacing: 0.5,
  },
});

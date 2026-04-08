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

const WATER_GOAL_OZ = 100;
const WATER_STEP_OZ = 8;

const MACRO_COLORS = {
  cal:     '#f97316',
  protein: '#a855f7',
  carbs:   '#f59e0b',
  fat:     '#ef4444',
  fiber:   '#14b8a6',
};

const CONFETTI_COLORS = ['#4ade80', '#60a5fa', '#f87171', '#fbbf24', '#c084fc', '#fb923c', '#34d399', '#f472b6'];

function localDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const PARTICLE_COUNT = 28;

function WaterCelebration({ onDone }) {
  const fadeAnim  = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;

  const particles = useMemo(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      angle:     (i / PARTICLE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.5,
      distance:  90 + Math.random() * 110,
      color:     CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size:      7 + Math.random() * 8,
      isRect:    Math.random() > 0.45,
      delay:     Math.floor(Math.random() * 180),
      rotations: 1 + Math.random() * 2.5,
    })), []);

  const particleAnims = useRef(particles.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, bounciness: 14 }).start();
    const bursts = particleAnims.map((anim, i) =>
      Animated.timing(anim, { toValue: 1, duration: 900 + particles[i].delay, delay: particles[i].delay, useNativeDriver: true })
    );
    const fadeOut = Animated.timing(fadeAnim, { toValue: 0, duration: 500, delay: 2600, useNativeDriver: true });
    Animated.parallel([...bursts, fadeOut]).start(() => onDone());
  }, []);

  return (
    <Animated.View style={[s.celebOverlay, { opacity: fadeAnim }]} pointerEvents="none">
      <Animated.View style={[s.celebCard, { transform: [{ scale: scaleAnim }] }]}>
        <View style={s.celebParticleOrigin}>
          {particles.map((p, i) => {
            const tx      = particleAnims[i].interpolate({ inputRange: [0,1], outputRange: [0, Math.cos(p.angle)*p.distance] });
            const ty      = particleAnims[i].interpolate({ inputRange: [0,1], outputRange: [0, Math.sin(p.angle)*p.distance] });
            const opacity = particleAnims[i].interpolate({ inputRange: [0,0.65,1], outputRange: [1,1,0] });
            const rotate  = particleAnims[i].interpolate({ inputRange: [0,1], outputRange: ['0deg', `${Math.round(p.rotations*360)}deg`] });
            return (
              <Animated.View key={i} style={{ position:'absolute', width:p.size, height:p.isRect?p.size*0.45:p.size, backgroundColor:p.color, borderRadius:p.isRect?2:p.size/2, transform:[{translateX:tx},{translateY:ty},{rotate}], opacity }} />
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

export default function MealScreen() {
  const today      = new Date().getDay();
  const dayMap     = [6, 0, 1, 2, 3, 4, 5];
  const todayIndex = dayMap[today];
  const todayStr   = localDateStr();

  const [bodyWeightEntries]               = useBodyWeight();
  const latestWeight = useMemo(() =>
    [...bodyWeightEntries].sort((a, b) => b.date.localeCompare(a.date))[0] ?? null,
    [bodyWeightEntries]
  );

  const [activeDay, setActiveDay]         = useState(todayIndex);
  const [checked, setChecked]             = useStorage('mealChecked', {});
  const [waterLog, setWaterLog]           = useStorage('waterLog', {});
  const [celebratedDates, setCelebrated]  = useStorage('waterCelebrated', {});
  const [resetVisible, setResetVisible]   = useState(false);
  const [weightVisible, setWeightVisible] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const waterOz  = waterLog[todayStr] ?? 0;
  const waterPct = Math.min(Math.round((waterOz / WATER_GOAL_OZ) * 100), 100);

  useEffect(() => {
    if (waterOz >= WATER_GOAL_OZ && !celebratedDates[todayStr]) {
      setCelebrated(prev => ({ ...prev, [todayStr]: true }));
      setShowCelebration(true);
    }
  }, [waterOz]);

  const addWater = () => setWaterLog(prev => ({ ...prev, [todayStr]: Math.min((prev[todayStr] ?? 0) + WATER_STEP_OZ, WATER_GOAL_OZ) }));
  const removeWater = () => setWaterLog(prev => ({ ...prev, [todayStr]: Math.max((prev[todayStr] ?? 0) - WATER_STEP_OZ, 0) }));
  const toggleMeal = (dayIdx, mealIdx) => { const key = `${dayIdx}-${mealIdx}`; setChecked(prev => ({ ...prev, [key]: !prev[key] })); };
  const confirmReset = () => { setChecked({}); setResetVisible(false); };

  const day     = DAYS[activeDay];
  const dayDone = day.meals.filter((_, i) => checked[`${activeDay}-${i}`]).length;
  const dayPct  = Math.round((dayDone / day.meals.length) * 100);

  const macros = [
    { val: `${day.protein}g`, lbl: 'Protein', color: MACRO_COLORS.protein },
    { val: `${day.carbs}g`,   lbl: 'Carbs',   color: MACRO_COLORS.carbs   },
    { val: `${day.fat}g`,     lbl: 'Fat',     color: MACRO_COLORS.fat     },
    { val: `${day.fiber}g`,   lbl: 'Fiber',   color: MACRO_COLORS.fiber   },
  ];

  return (
    <View style={s.root}>
      <View style={s.safe}>
        <ScrollView style={s.scroll} contentContainerStyle={s.content}>

          {/* Header */}
          <View style={s.header}>
            <View style={s.headerTop}>
              <View>
                <Text style={s.appLabel}>Meal Plan</Text>
                <Text style={s.title}>Your plan{latestWeight ? `\n${latestWeight.weight} lbs · recomp` : ''}</Text>
              </View>
              <View style={s.headerBtns}>
                <TouchableOpacity style={[s.headerBtn, s.headerBtnLog]} onPress={() => setWeightVisible(true)} activeOpacity={0.75}>
                  <Text style={[s.headerBtnText, s.headerBtnLogText]}>Log Weight</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.headerBtn, s.headerBtnReset]} onPress={() => setResetVisible(true)} activeOpacity={0.75}>
                  <Text style={[s.headerBtnText, s.headerBtnResetText]}>Reset week</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Water card */}
            <View style={s.waterCard}>
              <View style={s.waterCardTop}>
                <View style={s.waterLabelRow}>
                  <Text style={s.waterLabel}>💧 WATER</Text>
                  <Text style={s.waterCount}>
                    <Text style={s.waterOzVal}>{waterOz}</Text>
                    {` / ${WATER_GOAL_OZ} oz`}
                  </Text>
                </View>
                <Text style={s.waterPct}>{waterPct}%</Text>
              </View>
              <View style={s.waterBar}>
                <View style={[s.waterFill, { width: `${waterPct}%` }]} />
              </View>
              <View style={s.waterBtns}>
                <TouchableOpacity style={s.waterMinus} onPress={removeWater} activeOpacity={0.75}>
                  <Text style={s.waterMinusText}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.waterPlus} onPress={addWater} activeOpacity={0.75}>
                  <Text style={s.waterPlusText}>+ 8 oz</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Day nav */}
          <DayNav days={DAYS} activeDay={activeDay} todayIndex={todayIndex} checkedMap={checked} onSelect={setActiveDay} />

          {/* Day header */}
          <View style={s.dayHeader}>
            <Text style={s.dayName}>{day.name}</Text>
            <View style={[s.badge, day.type === 'training' ? s.badgeTrain : s.badgeRest]}>
              <Text style={[s.badgeText, day.type === 'training' ? s.badgeTrainText : s.badgeRestText]}>
                {day.type === 'training' ? 'TRAINING' : 'REST'}
              </Text>
            </View>
          </View>

          {/* Calorie hero */}
          <View style={[s.calHero, { borderColor: MACRO_COLORS.cal + '30', backgroundColor: MACRO_COLORS.cal + '0c' }]}>
            <View style={s.calHeroLeft}>
              <Text style={s.calHeroLabel}>DAILY CALORIES</Text>
              <View style={s.calHeroValRow}>
                <Text style={s.calHeroVal}>{day.cal}</Text>
                <Text style={s.calHeroUnit}>kcal</Text>
              </View>
            </View>
            <Text style={s.calHeroEmoji}>🔥</Text>
          </View>

          {/* Macro tiles */}
          <View style={s.macroStrip}>
            {macros.map(({ val, lbl, color }) => (
              <View key={lbl} style={[s.macroBox, { borderColor: color + '40', backgroundColor: color + '14' }]}>
                <Text style={[s.macroVal, { color }]}>{val}</Text>
                <Text style={s.macroLbl}>{lbl}</Text>
              </View>
            ))}
          </View>

          {/* Meals */}
          <View style={s.mealsList}>
            {day.meals
              .map((meal, i) => ({ meal, i }))
              .filter(({ i }) => !checked[`${activeDay}-${i}`])
              .map(({ meal, i }) => (
                <MealCard key={i} meal={meal} checked={false} onToggle={() => toggleMeal(activeDay, i)} />
              ))}
          </View>

          {/* Day summary */}
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
              <Text style={s.dialogSub}>All meal checks will be cleared.</Text>
              <View style={s.dialogBtns}>
                <TouchableOpacity style={s.dialogCancel} onPress={() => setResetVisible(false)} activeOpacity={0.75}>
                  <Text style={s.dialogCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.dialogReset} onPress={confirmReset} activeOpacity={0.75}>
                  <Text style={s.dialogResetText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <BodyWeightModal visible={weightVisible} onClose={() => setWeightVisible(false)} />

        {showCelebration && <WaterCelebration onDone={() => setShowCelebration(false)} />}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fef3ee' },
  safe: { flex: 1, backgroundColor: '#fef3ee' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 60 },

  header: {
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5ddd4',
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  appLabel: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#f97316',
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c1810',
    lineHeight: 28,
  },
  headerBtns: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', marginTop: 4 },
  headerBtn: {
    borderWidth: 1.5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerBtnText: { fontFamily: 'monospace', fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  headerBtnLog:      { borderColor: '#3b82f640', backgroundColor: '#eff6ff' },
  headerBtnLogText:  { color: '#2563eb' },
  headerBtnReset:    { borderColor: '#ef444440', backgroundColor: '#fff1f2' },
  headerBtnResetText:{ color: '#ef4444' },

  // Water
  waterCard: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  waterCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  waterLabelRow: { gap: 3 },
  waterLabel: { fontFamily: 'monospace', fontSize: 11, color: '#3b82f6', letterSpacing: 1.2, fontWeight: '700' },
  waterCount:  { fontFamily: 'monospace', fontSize: 12, color: '#6b7280' },
  waterOzVal:  { fontSize: 16, fontWeight: '700', color: '#1e3a5f' },
  waterPct:    { fontFamily: 'monospace', fontSize: 22, fontWeight: '700', color: '#3b82f6' },
  waterBar: { height: 10, backgroundColor: '#dbeafe', borderRadius: 5, overflow: 'hidden' },
  waterFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 5 },
  waterBtns: { flexDirection: 'row', gap: 10 },
  waterMinus: {
    flex: 1, backgroundColor: '#f3f4f6', borderRadius: 10, borderWidth: 1.5,
    borderColor: '#e5e7eb', paddingVertical: 13, alignItems: 'center',
  },
  waterMinusText: { fontSize: 20, fontWeight: '700', color: '#374151', lineHeight: 22 },
  waterPlus: {
    flex: 3, backgroundColor: '#2c1810', borderRadius: 10,
    paddingVertical: 13, alignItems: 'center',
  },
  waterPlusText: { fontFamily: 'monospace', fontSize: 15, fontWeight: '700', color: '#ffffff' },

  // Day
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  dayName: { fontSize: 20, fontWeight: '700', color: '#2c1810' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontFamily: 'monospace', fontSize: 10, letterSpacing: 0.5, fontWeight: '700' },
  badgeTrain:     { backgroundColor: '#2c1810' },
  badgeTrainText: { color: '#ffffff' },
  badgeRest:      { backgroundColor: '#f5ece8', borderWidth: 1.5, borderColor: '#f0d0c4' },
  badgeRestText:  { color: '#c8a89c' },

  // Calorie hero
  calHero: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 16, padding: 18, marginBottom: 10,
    shadowColor: '#f97316', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  calHeroLeft:   { gap: 4 },
  calHeroLabel:  { fontFamily: 'monospace', fontSize: 9, color: '#f97316', letterSpacing: 1.5, fontWeight: '700' },
  calHeroValRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  calHeroVal:    { fontSize: 40, fontWeight: '800', color: '#2c1810', lineHeight: 44 },
  calHeroUnit:   { fontFamily: 'monospace', fontSize: 14, color: '#c8a89c', marginBottom: 5 },
  calHeroEmoji:  { fontSize: 44 },

  // Macros
  macroStrip: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  macroBox: {
    flex: 1, borderWidth: 1.5, borderRadius: 12, padding: 11, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3,
  },
  macroVal: { fontFamily: 'monospace', fontSize: 14, fontWeight: '800' },
  macroLbl: { fontSize: 9, color: '#9b7060', marginTop: 3, letterSpacing: 0.3, fontWeight: '600' },

  mealsList: { gap: 10, marginBottom: 16 },

  // Summary
  daySummary: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#f5ddd4',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#c4906c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 1,
  },
  summaryLabel: {
    fontFamily: 'monospace', fontSize: 10, color: '#c8a89c',
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10, fontWeight: '700',
  },
  summaryBar: { height: 6, backgroundColor: '#f5ece8', borderRadius: 3, overflow: 'hidden', marginBottom: 10 },
  summaryFill: { height: '100%', backgroundColor: '#16a34a', borderRadius: 3 },
  summaryCount: { fontSize: 13, color: '#9b7060' },
  bold: { color: '#2c1810', fontWeight: '700' },

  noteBox: {
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: '#ffffff', borderLeftWidth: 3, borderLeftColor: '#f97316',
    borderRadius: 10, borderWidth: 1.5, borderColor: '#f5ddd4',
  },
  noteText: { fontSize: 12, color: '#9b7060', lineHeight: 20 },

  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(44,24,16,0.45)', justifyContent: 'center', alignItems: 'center' },
  dialog: {
    width: 290, backgroundColor: '#ffffff', borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  dialogTitle: { fontSize: 20, fontWeight: '700', color: '#2c1810', marginBottom: 4 },
  dialogSub: { fontFamily: 'monospace', fontSize: 11, color: '#9b7060', marginBottom: 20 },
  dialogBtns: { flexDirection: 'row', gap: 10 },
  dialogCancel: {
    flex: 1, paddingVertical: 13, borderWidth: 1.5,
    borderColor: '#e5e7eb', borderRadius: 10, alignItems: 'center', backgroundColor: '#f9fafb',
  },
  dialogCancelText: { fontFamily: 'monospace', fontSize: 13, color: '#6b7280', fontWeight: '600' },
  dialogReset: { flex: 1, paddingVertical: 13, backgroundColor: '#ef4444', borderRadius: 10, alignItems: 'center' },
  dialogResetText: { fontFamily: 'monospace', fontSize: 13, color: '#ffffff', fontWeight: '700' },

  // Celebration
  celebOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(44,24,16,0.4)',
  },
  celebCard: {
    backgroundColor: '#ffffff', borderRadius: 28, paddingVertical: 36, paddingHorizontal: 44,
    alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 12,
  },
  celebParticleOrigin: { position: 'absolute', width: 0, height: 0, alignSelf: 'center' },
  celebEmoji: { fontSize: 52, marginBottom: 4 },
  celebTitle: { fontSize: 32, fontWeight: '800', color: '#2c1810' },
  celebSub:   { fontSize: 16, color: '#9b7060', fontWeight: '600' },
  celebGoal:  { fontFamily: 'monospace', fontSize: 11, color: '#3b82f6', marginTop: 4, letterSpacing: 0.5 },
});

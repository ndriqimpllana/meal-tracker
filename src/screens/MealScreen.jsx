import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Modal,
} from 'react-native';
import { DAYS } from '../data/days';
import { useStorage } from '../hooks/useStorage';
import DayNav from '../components/DayNav';
import MealCard from '../components/MealCard';
import BodyWeightModal from '../components/BodyWeightModal';

const WATER_GOAL_OZ  = 100;
const WATER_STEP_OZ  = 8;

const MACRO_COLORS = {
  cal:     '#fb923c',
  protein: '#c084fc',
  carbs:   '#fbbf24',
  fat:     '#f87171',
  fiber:   '#2dd4bf',
};

export default function MealScreen() {
  const today = new Date().getDay(); // 0=Sun
  const dayMap = [6, 0, 1, 2, 3, 4, 5];
  const [activeDay, setActiveDay]     = useState(dayMap[today]);
  const todayIndex                    = dayMap[today];
  const todayStr                      = new Date().toISOString().split('T')[0];

  const [checked, setChecked]         = useStorage('mealChecked', {});
  const [waterLog, setWaterLog]       = useStorage('waterLog', {});
  const [resetVisible, setResetVisible]   = useState(false);
  const [weightVisible, setWeightVisible] = useState(false);

  const waterOz = waterLog[todayStr] ?? 0;
  const waterPct = Math.min(Math.round((waterOz / WATER_GOAL_OZ) * 100), 100);

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
  const confirmReset = () => {
    setChecked({});
    setResetVisible(false);
  };

  const day    = DAYS[activeDay];
  const dayDone = day.meals.filter((_, i) => checked[`${activeDay}-${i}`]).length;
  const dayPct  = Math.round((dayDone / day.meals.length) * 100);

  const macros = [
    { val: String(day.cal),      lbl: 'Calories', color: MACRO_COLORS.cal     },
    { val: `${day.protein}g`,    lbl: 'Protein',  color: MACRO_COLORS.protein },
    { val: `${day.carbs}g`,      lbl: 'Carbs',    color: MACRO_COLORS.carbs   },
    { val: `${day.fat}g`,        lbl: 'Fat',      color: MACRO_COLORS.fat     },
    { val: `${day.fiber}g`,      lbl: 'Fiber',    color: MACRO_COLORS.fiber   },
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

            {/* Water tracker */}
            <View style={s.waterRow}>
              <View style={s.waterLeft}>
                <Text style={s.waterLabel}>WATER</Text>
                <View style={s.waterBar}>
                  <View style={[s.waterFill, { width: `${waterPct}%` }]} />
                </View>
              </View>
              <Text style={s.waterCount}>{waterOz} / {WATER_GOAL_OZ} oz</Text>
              <TouchableOpacity style={s.waterMinus} onPress={removeWater} activeOpacity={0.6}>
                <Text style={s.waterBtnText}>−</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.waterPlus} onPress={addWater} activeOpacity={0.6}>
                <Text style={s.waterBtnText}>+8oz</Text>
              </TouchableOpacity>
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
              <View
                key={lbl}
                style={[s.macroBox, { borderColor: color + '50', backgroundColor: color + '12' }]}
              >
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
                <MealCard
                  key={i}
                  meal={meal}
                  checked={false}
                  onToggle={() => toggleMeal(activeDay, i)}
                />
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
              <Text style={s.bold}>{dayDone}</Text>
              {' of '}
              <Text style={s.bold}>{day.meals.length}</Text>
              {' meals eaten'}
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
  headerBtnLog: {
    borderColor: '#60a5fa55',
    backgroundColor: '#0e1e3a',
  },
  headerBtnLogText: {
    color: '#60a5fa',
  },
  headerBtnReset: {
    borderColor: '#f8717155',
    backgroundColor: '#1a0e0e',
  },
  headerBtnResetText: {
    color: '#f87171',
  },

  // Water tracker
  waterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  waterLeft: { flex: 1, gap: 5 },
  waterLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#536080',
    letterSpacing: 1,
  },
  waterBar: {
    height: 4,
    backgroundColor: '#1c2640',
    borderRadius: 2,
    overflow: 'hidden',
  },
  waterFill: {
    height: '100%',
    backgroundColor: '#60a5fa',
    borderRadius: 2,
  },
  waterCount: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#536080',
  },
  waterMinus: {
    borderWidth: 1,
    borderColor: '#253048',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  waterPlus: {
    borderWidth: 1,
    borderColor: '#60a5fa50',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#0e1e3a',
  },
  waterBtnText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#60a5fa',
  },

  // Day section
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dayName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e8edf5',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  badgeTrain: { backgroundColor: '#ffffff' },
  badgeTrainText: { color: '#000000' },
  badgeRest: { backgroundColor: '#1b2438', borderWidth: 1, borderColor: '#253048' },
  badgeRestText: { color: '#536080' },

  // Macros
  macroStrip: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
  },
  macroBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  macroVal: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '600',
  },
  macroLbl: {
    fontSize: 8,
    color: '#536080',
    marginTop: 2,
    letterSpacing: 0.3,
  },

  // Meals
  mealsList: {
    gap: 8,
    marginBottom: 16,
  },

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
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#536080',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  summaryBar: {
    height: 4,
    backgroundColor: '#1c2640',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  summaryFill: {
    height: '100%',
    backgroundColor: '#4ade80',
    borderRadius: 2,
  },
  summaryCount: {
    fontSize: 12,
    color: '#536080',
  },
  bold: { color: '#e8edf5', fontWeight: '500' },

  // Note
  noteBox: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#131929',
    borderLeftWidth: 2,
    borderLeftColor: '#4ade80',
    borderRadius: 8,
  },
  noteText: {
    fontSize: 12,
    color: '#8b9cbf',
    lineHeight: 20,
  },

  // Reset modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    width: 280,
    backgroundColor: '#131929',
    borderWidth: 1,
    borderColor: '#253048',
    borderRadius: 12,
    padding: 24,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e8edf5',
    marginBottom: 24,
  },
  dialogBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  dialogCancel: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#253048',
    borderRadius: 6,
    alignItems: 'center',
  },
  dialogCancelText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#536080',
  },
  dialogReset: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    alignItems: 'center',
  },
  dialogResetText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#000000',
    fontWeight: '600',
  },
});

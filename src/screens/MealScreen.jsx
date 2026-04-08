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
                <TouchableOpacity style={s.headerBtn} onPress={() => setWeightVisible(true)} activeOpacity={0.6}>
                  <Text style={s.headerBtnText}>Log Weight</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.headerBtn} onPress={resetAll} activeOpacity={0.6}>
                  <Text style={s.headerBtnText}>Reset week</Text>
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
            {[
              { val: String(day.cal),      lbl: 'Calories' },
              { val: `${day.protein}g`,    lbl: 'Protein'  },
              { val: `${day.carbs}g`,      lbl: 'Carbs'    },
              { val: `${day.fat}g`,        lbl: 'Fat'      },
              { val: `${day.fiber}g`,      lbl: 'Fiber'    },
            ].map(({ val, lbl }) => (
              <View key={lbl} style={s.macroBox}>
                <Text style={s.macroVal}>{val}</Text>
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
  root: { flex: 1, backgroundColor: '#000000' },
  safe: { flex: 1, backgroundColor: '#000000' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 60 },

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
    marginBottom: 16,
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
    lineHeight: 28,
  },
  headerBtns: { gap: 6, alignItems: 'flex-end' },
  headerBtn: {
    borderWidth: 1,
    borderColor: '#242424',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  headerBtnText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#666666',
    letterSpacing: 0.5,
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
    color: '#555555',
    letterSpacing: 1,
  },
  waterBar: {
    height: 3,
    backgroundColor: '#242424',
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
    color: '#555555',
  },
  waterMinus: {
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  waterPlus: {
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#0a1628',
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
    color: '#ffffff',
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
  badgeRest: { backgroundColor: '#181818', borderWidth: 1, borderColor: '#333333' },
  badgeRestText: { color: '#666666' },

  // Macros
  macroStrip: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  macroBox: {
    flex: 1,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  macroVal: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  macroLbl: {
    fontSize: 9,
    color: '#666666',
    marginTop: 2,
    letterSpacing: 0.4,
  },

  // Meals
  mealsList: {
    gap: 8,
    marginBottom: 16,
  },

  // Summary
  daySummary: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  summaryLabel: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#666666',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  summaryBar: {
    height: 4,
    backgroundColor: '#242424',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  summaryFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  summaryCount: {
    fontSize: 12,
    color: '#666666',
  },
  bold: { color: '#ffffff', fontWeight: '500' },

  // Note
  noteBox: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#181818',
    borderLeftWidth: 2,
    borderLeftColor: '#3a3a3a',
    borderRadius: 8,
  },
  noteText: {
    fontSize: 12,
    color: '#666666',
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
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 12,
    padding: 24,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
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
    borderColor: '#242424',
    borderRadius: 6,
    alignItems: 'center',
  },
  dialogCancelText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#666666',
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

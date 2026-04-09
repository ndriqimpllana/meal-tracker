import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Modal, ScrollView, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

const EXERCISEDB_KEY  = Constants.expoConfig?.extra?.exerciseDbKey ?? '';
const EXERCISEDB_HOST = 'exercisedb.p.rapidapi.com';
const ACCENT          = '#30d158';

const DIFF_COLORS = {
  beginner:     { bg: '#f0fdf4', border: '#86efac', text: '#16a34a' },
  intermediate: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e' },
  advanced:     { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626' },
};

export default function LogSetModal({ visible, exercise, sets, onAdd, onRemove, onClose, previousSessions }) {
  const [weight, setWeight]   = useState('');
  const [reps,   setReps]     = useState('');
  const [timer,  setTimer]    = useState(null);
  const [tab,    setTab]      = useState('overview');

  // ExerciseDB
  const [exData,      setExData]      = useState(null);   // full found object
  const [gifLoading,  setGifLoading]  = useState(false);

  // Prefill from last set
  useEffect(() => {
    if (sets.length > 0) {
      const last = sets[sets.length - 1];
      setWeight(String(last.weight));
      setReps(String(last.reps));
    }
  }, [sets.length]);

  // Rest timer
  useEffect(() => {
    if (!timer || timer <= 0) { if (timer === 0) setTimer(null); return; }
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  // Fetch on open
  useEffect(() => {
    if (!visible || !exercise?.id) return;
    setExData(null); setGifLoading(false); setTab('overview');

    const isCustom = String(exercise.id).startsWith('custom_');

    // ExerciseDB only
    if (!isCustom && EXERCISEDB_KEY) {
      const STOPS = new Set(['on','with','using','the','a','an','and','or','in','at','to','of','for','by','as']);
      const words = exercise.name
        .toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
        .split(' ').filter(w => w.length > 1 && !STOPS.has(w));

      const score   = exName => words.reduce((n, w) => n + (exName.toLowerCase().includes(w) ? 1 : 0), 0);
      const pickBest = list  => list.reduce((best, cur) => score(cur.name) >= score(best.name) ? cur : best);

      const terms = [
        words.join(' '),
        words.slice(0, 3).join(' '),
        words.slice(0, 2).join(' '),
        words[0],
      ].filter((v, i, a) => v && a.indexOf(v) === i);

      const hdrs = { 'X-RapidAPI-Key': EXERCISEDB_KEY, 'X-RapidAPI-Host': EXERCISEDB_HOST };

      setGifLoading(true);
      (async () => {
        let found = null;
        for (const term of terms) {
          try {
            const r    = await fetch(
              `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(term)}?limit=10`,
              { headers: hdrs }
            );
            const data = await r.json();
            if (Array.isArray(data) && data.length > 0) { found = pickBest(data); break; }
          } catch { /* try next */ }
        }
        setExData(found ?? null);
        setGifLoading(false);
      })();
    }
  }, [visible, exercise?.id]);

  const handleAdd = () => {
    if (!weight.trim() || !reps.trim()) return;
    onAdd({ weight: parseFloat(weight), reps: parseInt(reps, 10) });
    setTimer(90);
  };

  const fmtTimer = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const cap      = str => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  const isCustom   = String(exercise?.id ?? '').startsWith('custom_');
  const diffStyle  = DIFF_COLORS[exData?.difficulty?.toLowerCase()] ?? DIFF_COLORS.beginner;
  const instructions = exData?.instructions ?? [];

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={s.root}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* ── Header ──────────────────────────────────────────────────────── */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <Text style={s.exName} numberOfLines={2}>{exercise?.name}</Text>
              <Text style={s.exMeta}>
                {exercise?.category}
                {exercise?.equipment && exercise.equipment !== 'None' ? ` · ${exercise.equipment}` : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={s.closeBtn} activeOpacity={0.75}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* ── Info card ───────────────────────────────────────────────────── */}
          <View style={s.infoCard}>

            {/* Tab bar */}
            <View style={s.tabs}>
              {['overview', 'muscles', 'how-to', 'demo'].map(t => (
                <TouchableOpacity
                  key={t}
                  style={[s.tab, tab === t && s.tabActive]}
                  onPress={() => setTab(t)}
                  activeOpacity={0.75}
                >
                  <Text style={[s.tabTxt, tab === t && s.tabTxtActive]}>
                    {t === 'demo' ? '▶ Demo' : cap(t)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── OVERVIEW tab ──────────────────────────────────────────────── */}
            {tab === 'overview' && (
              <View style={s.pane}>
                {/* GIF preview at top */}
                {gifLoading ? (
                  <View style={s.gifThumb}>
                    <ActivityIndicator color={ACCENT} />
                  </View>
                ) : exData?.gifUrl ? (
                  <Image source={{ uri: exData.gifUrl }} style={s.gifThumb} resizeMode="cover" />
                ) : null}

                {/* Stat pills */}
                <View style={s.statRow}>
                  {exData?.bodyPart && (
                    <View style={s.statPill}>
                      <Text style={s.statPillLabel}>BODY PART</Text>
                      <Text style={s.statPillVal}>{cap(exData.bodyPart)}</Text>
                    </View>
                  )}
                  {exData?.equipment && (
                    <View style={s.statPill}>
                      <Text style={s.statPillLabel}>EQUIPMENT</Text>
                      <Text style={s.statPillVal}>{cap(exData.equipment)}</Text>
                    </View>
                  )}
                  {exData?.category && (
                    <View style={s.statPill}>
                      <Text style={s.statPillLabel}>TYPE</Text>
                      <Text style={s.statPillVal}>{cap(exData.category)}</Text>
                    </View>
                  )}
                  {exData?.difficulty && (
                    <View style={[s.statPill, { backgroundColor: diffStyle.bg, borderColor: diffStyle.border }]}>
                      <Text style={s.statPillLabel}>LEVEL</Text>
                      <Text style={[s.statPillVal, { color: diffStyle.text }]}>{cap(exData.difficulty)}</Text>
                    </View>
                  )}
                </View>

                {/* Description */}
                {exData?.description ? (
                  <View style={s.descBox}>
                    <Text style={s.descText}>{exData.description}</Text>
                  </View>
                ) : !gifLoading && (
                  <View style={s.descBox}>
                    <Text style={s.descText}>
                      {exercise?.category ? `${exercise.category} exercise` : 'Tap How-To for instructions.'}
                    </Text>
                  </View>
                )}

                {gifLoading && !exData && (
                  <View style={s.loadingRow}>
                    <ActivityIndicator size="small" color={ACCENT} />
                    <Text style={s.loadingTxt}>Loading exercise data...</Text>
                  </View>
                )}
              </View>
            )}

            {/* ── MUSCLES tab ───────────────────────────────────────────────── */}
            {tab === 'muscles' && (
              <View style={s.pane}>
                {/* Primary target hero */}
                {(exData?.target || exercise?.category) && (
                  <View style={s.muscleHero}>
                    <View style={s.muscleHeroLeft}>
                      <View style={s.targetDot} />
                      <View>
                        <Text style={s.muscleHeroLabel}>PRIMARY TARGET</Text>
                        <Text style={s.muscleHeroName}>{cap(exData?.target ?? exercise?.category)}</Text>
                      </View>
                    </View>
                    <View style={[s.primBadge, { backgroundColor: '#fee2e2', borderColor: '#fca5a5' }]}>
                      <Text style={[s.primBadgeTxt, { color: '#dc2626' }]}>Primary</Text>
                    </View>
                  </View>
                )}

                {/* Secondary muscles list */}
                {exData?.secondaryMuscles?.length > 0 && (
                  <>
                    <View style={s.divider} />
                    <Text style={s.sectionLabel}>SECONDARY MUSCLES</Text>
                    {exData.secondaryMuscles.map((m, i) => (
                      <View key={i} style={s.muscleRow}>
                        <View style={s.secDot} />
                        <Text style={s.muscleRowTxt}>{cap(m)}</Text>
                        <View style={[s.primBadge, { backgroundColor: '#fffbeb', borderColor: '#fcd34d' }]}>
                          <Text style={[s.primBadgeTxt, { color: '#92400e' }]}>Secondary</Text>
                        </View>
                      </View>
                    ))}
                  </>
                )}

                {/* Body part / equipment info */}
                {exData && (
                  <>
                    <View style={s.divider} />
                    <View style={s.infoGrid}>
                      {exData.bodyPart && (
                        <View style={s.infoGridCell}>
                          <Text style={s.infoGridLabel}>BODY PART</Text>
                          <Text style={s.infoGridVal}>{cap(exData.bodyPart)}</Text>
                        </View>
                      )}
                      {exData.equipment && (
                        <View style={s.infoGridCell}>
                          <Text style={s.infoGridLabel}>EQUIPMENT</Text>
                          <Text style={s.infoGridVal}>{cap(exData.equipment)}</Text>
                        </View>
                      )}
                      {exData.difficulty && (
                        <View style={s.infoGridCell}>
                          <Text style={s.infoGridLabel}>DIFFICULTY</Text>
                          <Text style={[s.infoGridVal, { color: diffStyle.text }]}>{cap(exData.difficulty)}</Text>
                        </View>
                      )}
                    </View>
                  </>
                )}

                {gifLoading && !exData && (
                  <View style={s.loadingRow}>
                    <ActivityIndicator size="small" color={ACCENT} />
                    <Text style={s.loadingTxt}>Loading muscle data...</Text>
                  </View>
                )}
              </View>
            )}

            {/* ── HOW-TO tab ────────────────────────────────────────────────── */}
            {tab === 'how-to' && (
              <View style={s.pane}>
                {instructions.length > 0 ? (
                  instructions.map((step, i) => (
                    <View key={i} style={s.step}>
                      <View style={s.stepBadge}>
                        <Text style={s.stepBadgeTxt}>{i + 1}</Text>
                      </View>
                      <Text style={s.stepTxt}>{step}</Text>
                    </View>
                  ))
                ) : gifLoading ? (
                  <View style={s.loadingRow}>
                    <ActivityIndicator size="small" color={ACCENT} />
                    <Text style={s.loadingTxt}>Loading instructions...</Text>
                  </View>
                ) : (
                  <Text style={s.noDataTxt}>No instructions available</Text>
                )}
              </View>
            )}

            {/* ── DEMO tab ──────────────────────────────────────────────────── */}
            {tab === 'demo' && (
              <View style={s.pane}>
                {gifLoading ? (
                  <View style={s.gifFull}>
                    <ActivityIndicator color={ACCENT} size="large" />
                    <Text style={s.loadingTxt}>Loading demo GIF...</Text>
                  </View>
                ) : exData?.gifUrl ? (
                  <View>
                    <Image
                      source={{ uri: exData.gifUrl }}
                      style={s.gifFull}
                      resizeMode="contain"
                    />
                    <View style={s.gifMeta}>
                      <Text style={s.gifMetaName}>{cap(exData.name ?? exercise?.name)}</Text>
                      {exData.difficulty && (
                        <View style={[s.diffBadge, { backgroundColor: diffStyle.bg, borderColor: diffStyle.border }]}>
                          <Text style={[s.diffBadgeTxt, { color: diffStyle.text }]}>{cap(exData.difficulty)}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={s.gifCaption}>Animated demo · ExerciseDB</Text>
                  </View>
                ) : isCustom ? (
                  <View style={s.gifFull}>
                    <Text style={s.noDataTxt}>No demo for custom exercises</Text>
                  </View>
                ) : (
                  <View style={s.gifFull}>
                    <Text style={s.noDataTxt}>No demo found — try renaming the exercise to match ExerciseDB</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* ── Rest timer ──────────────────────────────────────────────────── */}
          {timer !== null && (
            <View style={s.timerBox}>
              <View style={s.timerLeft}>
                <Text style={s.timerLabel}>REST TIMER</Text>
                <Text style={[s.timerCount, timer <= 10 && s.timerUrgent]}>{fmtTimer(timer)}</Text>
              </View>
              <View style={s.timerBtns}>
                <TouchableOpacity style={s.timerAdd} onPress={() => setTimer(t => t + 30)} activeOpacity={0.75}>
                  <Text style={s.timerAddText}>+30s</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.timerSkip} onPress={() => setTimer(null)} activeOpacity={0.75}>
                  <Text style={s.timerSkipText}>Skip</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── Log a set ───────────────────────────────────────────────────── */}
          <View style={s.logRow}>
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>LBS</Text>
              <TextInput
                style={s.input} placeholder="0" placeholderTextColor="#d1d5db"
                value={weight} onChangeText={setWeight} keyboardType="decimal-pad"
              />
            </View>
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>REPS</Text>
              <TextInput
                style={s.input} placeholder="0" placeholderTextColor="#d1d5db"
                value={reps} onChangeText={setReps} keyboardType="number-pad"
              />
            </View>
            <TouchableOpacity style={s.addSetBtn} onPress={handleAdd} activeOpacity={0.8}>
              <Text style={s.addSetBtnText}>Add Set</Text>
            </TouchableOpacity>
          </View>

          {/* ── Today's sets ────────────────────────────────────────────────── */}
          {sets.length === 0 ? (
            <View style={s.noSets}>
              <Text style={s.noSetsText}>No sets logged yet — add one above</Text>
            </View>
          ) : (
            <View style={s.setsTable}>
              <View style={s.setsHead}>
                {['SET', 'LBS', 'REPS', ' '].map(h => (
                  <Text key={h} style={s.setsHeadText}>{h}</Text>
                ))}
              </View>
              {sets.map((item, i) => (
                <View key={i} style={s.setRow}>
                  <Text style={s.setNum}>{i + 1}</Text>
                  <Text style={s.setVal}>{item.weight} lbs</Text>
                  <Text style={s.setVal}>{item.reps}</Text>
                  <TouchableOpacity onPress={() => onRemove(i)} activeOpacity={0.75}>
                    <Text style={s.setRemove}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* ── Progress chart ──────────────────────────────────────────────── */}
          {previousSessions?.length > 1 && (() => {
            const data = [...previousSessions].reverse().slice(-8);
            const maxW = Math.max(...data.map(ss => ss.maxWeight), 1);
            return (
              <View style={s.chart}>
                <Text style={s.chartLabel}>MAX WEIGHT TREND</Text>
                <View style={s.chartBars}>
                  {data.map((sess, i) => (
                    <View key={i} style={s.chartBarCol}>
                      <Text style={s.chartBarVal}>{sess.maxWeight}</Text>
                      <View style={s.chartBarTrack}>
                        <View style={[s.chartBar, { height: Math.max((sess.maxWeight / maxW) * 60, 4) }]} />
                      </View>
                      <Text style={s.chartBarDate}>{sess.date.slice(5)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })()}

          {/* ── Previous sessions ───────────────────────────────────────────── */}
          {previousSessions?.length > 0 && (
            <View style={s.history}>
              <Text style={s.historyLabel}>PREVIOUS SESSIONS</Text>
              {previousSessions.map((sess, i) => (
                <View key={i} style={s.historyRow}>
                  <Text style={s.historyDate}>{sess.date}</Text>
                  <Text style={s.historyData}>
                    {sess.sets} sets · {sess.maxWeight} lbs max
                    {i === 0 && previousSessions.length > 1 && sess.maxWeight > previousSessions[1].maxWeight
                      ? <Text style={s.pr}> ↑ PR</Text> : null}
                  </Text>
                </View>
              ))}
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f2f2f7' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#f2f2f7',
  },
  headerLeft:   { flex: 1, gap: 4, paddingRight: 12 },
  exName:       { fontSize: 20, fontWeight: '800', color: '#1a1a1e', lineHeight: 26 },
  exMeta:       { fontSize: 11, fontWeight: '500', color: '#9ca3af' },
  closeBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a1e', alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 },
  closeBtnText: { fontSize: 14, fontWeight: '800', color: '#ffffff' },

  // Card + tabs
  infoCard: {
    backgroundColor: '#ffffff', margin: 16, borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 14, elevation: 2,
  },
  tabs:       { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  tab:        { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive:  { borderBottomWidth: 2.5, borderBottomColor: ACCENT },
  tabTxt:     { fontSize: 11, fontWeight: '700', color: '#9ca3af' },
  tabTxtActive:{ fontSize: 11, fontWeight: '800', color: '#1a1a1e' },

  pane: { padding: 16, gap: 12 },

  // Overview
  gifThumb: {
    width: '100%', height: 200, borderRadius: 14,
    backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center',
  },
  statRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statPill:      { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb', gap: 2 },
  statPillLabel: { fontSize: 8, fontWeight: '800', color: '#9ca3af', letterSpacing: 1 },
  statPillVal:   { fontSize: 13, fontWeight: '800', color: '#1a1a1e' },
  descBox:       { backgroundColor: '#f9fafb', borderRadius: 14, padding: 14 },
  descText:      { fontSize: 13, color: '#374151', lineHeight: 20 },
  loadingRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingTxt:    { fontSize: 12, fontWeight: '500', color: '#9ca3af' },

  // Muscles
  muscleHero: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#f9fafb', borderRadius: 14, padding: 14,
  },
  muscleHeroLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  targetDot:      { width: 14, height: 14, borderRadius: 7, backgroundColor: '#ef4444' },
  muscleHeroLabel:{ fontSize: 9, fontWeight: '800', color: '#9ca3af', letterSpacing: 1.5 },
  muscleHeroName: { fontSize: 18, fontWeight: '800', color: '#1a1a1e' },
  primBadge:      { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1.5 },
  primBadgeTxt:   { fontSize: 11, fontWeight: '700' },
  divider:        { height: 1, backgroundColor: '#f3f4f6' },
  sectionLabel:   { fontSize: 9, fontWeight: '800', color: '#9ca3af', letterSpacing: 1.5 },
  muscleRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  secDot:         { width: 10, height: 10, borderRadius: 5, backgroundColor: '#f59e0b' },
  muscleRowTxt:   { flex: 1, fontSize: 15, fontWeight: '700', color: '#1a1a1e' },
  infoGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  infoGridCell:   { flex: 1, minWidth: '28%', backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, gap: 4 },
  infoGridLabel:  { fontSize: 8, fontWeight: '800', color: '#9ca3af', letterSpacing: 1 },
  infoGridVal:    { fontSize: 14, fontWeight: '800', color: '#1a1a1e' },

  // How-to
  step:        { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  stepBadge:   { width: 26, height: 26, borderRadius: 13, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  stepBadgeTxt:{ fontSize: 11, fontWeight: '800', color: '#ffffff' },
  stepTxt:     { flex: 1, fontSize: 13, color: '#374151', lineHeight: 20 },
  noDataTxt:   { fontSize: 12, fontWeight: '500', color: '#d1d5db', textAlign: 'center', paddingVertical: 20 },

  // Demo
  gifFull:     { width: '100%', height: 260, borderRadius: 14, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  gifMeta:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  gifMetaName: { fontSize: 14, fontWeight: '800', color: '#1a1a1e', flex: 1 },
  diffBadge:   { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1.5, marginLeft: 8 },
  diffBadgeTxt:{ fontSize: 11, fontWeight: '700' },
  gifCaption:  { fontSize: 9, fontWeight: '600', color: '#d1d5db', marginTop: 6, letterSpacing: 0.5 },

  // Rest timer
  timerBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    margin: 16, marginBottom: 0, padding: 14,
    backgroundColor: '#f0fdf4', borderRadius: 16, borderWidth: 1.5, borderColor: '#86efac',
  },
  timerLeft:     { gap: 2 },
  timerLabel:    { fontSize: 9, fontWeight: '800', color: ACCENT, letterSpacing: 1 },
  timerCount:    { fontSize: 32, fontWeight: '800', color: ACCENT },
  timerUrgent:   { color: '#ef4444' },
  timerBtns:     { flexDirection: 'row', gap: 8 },
  timerAdd:      { borderWidth: 1.5, borderColor: '#86efac', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#dcfce7' },
  timerAddText:  { fontSize: 12, fontWeight: '800', color: '#16a34a' },
  timerSkip:     { borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#f9fafb' },
  timerSkipText: { fontSize: 12, fontWeight: '700', color: '#6b7280' },

  // Log set
  logRow:     { flexDirection: 'row', gap: 8, padding: 16, alignItems: 'flex-end' },
  inputGroup: { flex: 1, gap: 6 },
  inputLabel: { fontSize: 9, fontWeight: '800', color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase' },
  input: {
    backgroundColor: '#ffffff', borderWidth: 1.5, borderColor: '#e5e7eb',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12,
    color: '#1a1a1e', fontSize: 20, textAlign: 'center', fontWeight: '800',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6,
  },
  addSetBtn: {
    flex: 1, backgroundColor: '#1a1a1e', borderRadius: 12, paddingVertical: 13,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#1a1a1e', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5,
  },
  addSetBtnText: { fontSize: 13, fontWeight: '800', color: '#ffffff' },

  // Sets table
  noSets:       { marginHorizontal: 16, padding: 20, alignItems: 'center' },
  noSetsText:   { fontSize: 12, fontWeight: '500', color: '#d1d5db' },
  setsTable:    { marginHorizontal: 16, backgroundColor: '#ffffff', borderRadius: 14, overflow: 'hidden', marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
  setsHead:     { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  setsHeadText: { flex: 1, fontSize: 9, fontWeight: '800', color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase' },
  setRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  setNum:       { flex: 1, fontSize: 13, fontWeight: '800', color: '#9ca3af' },
  setVal:       { flex: 1, fontSize: 14, fontWeight: '700', color: '#1a1a1e' },
  setRemove:    { fontSize: 13, color: '#fca5a5', paddingLeft: 8 },

  // Chart
  chart:        { marginHorizontal: 16, marginTop: 16, backgroundColor: '#ffffff', borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
  chartLabel:   { fontSize: 9, fontWeight: '800', color: '#9ca3af', letterSpacing: 1.5, marginBottom: 12, textTransform: 'uppercase' },
  chartBars:    { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 90 },
  chartBarCol:  { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  chartBarVal:  { fontSize: 8, fontWeight: '800', color: ACCENT },
  chartBarTrack:{ width: '100%', height: 60, justifyContent: 'flex-end' },
  chartBar:     { width: '100%', backgroundColor: ACCENT + '44', borderRadius: 4, minHeight: 4 },
  chartBarDate: { fontSize: 7, fontWeight: '600', color: '#d1d5db' },

  // History
  history:      { marginHorizontal: 16, marginTop: 16, marginBottom: 30 },
  historyLabel: { fontSize: 9, fontWeight: '800', color: '#d1d5db', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 },
  historyRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  historyDate:  { fontSize: 11, fontWeight: '600', color: '#9ca3af' },
  historyData:  { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  pr:           { color: ACCENT, fontWeight: '800' },
});

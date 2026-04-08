import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Modal, ScrollView, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Ellipse, Circle, Rect, G, Text as SvgText } from 'react-native-svg';
import Constants from 'expo-constants';

// ─── ExerciseDB API key — loaded from .env, never hardcoded ──────────────────
const EXERCISEDB_KEY  = Constants.expoConfig?.extra?.exerciseDbKey ?? '';
const EXERCISEDB_HOST = 'exercisedb.p.rapidapi.com';

const ACCENT         = '#30d158';
const PRIMARY_COLOR  = '#ef4444';   // red   — primary muscles
const SECOND_COLOR   = '#f59e0b';   // amber — secondary muscles
const BODY_COLOR     = '#d1d5db';   // gray  — body silhouette
const ZONE_INACTIVE  = '#e5e7eb';   // light — inactive zone tint

// ─── SVG zone definitions (90×220 viewBox, front view) ───────────────────────
const FRONT_ZONES = {
  deltoidL: { cx: 19, cy: 54, rx: 11, ry: 9  },
  deltoidR: { cx: 71, cy: 54, rx: 11, ry: 9  },
  chest:    { cx: 45, cy: 63, rx: 20, ry: 15 },
  bicepL:   { cx: 15, cy: 80, rx:  7, ry: 19 },
  bicepR:   { cx: 75, cy: 80, rx:  7, ry: 19 },
  forearmL: { cx: 11, cy:113, rx:  6, ry: 14 },
  forearmR: { cx: 79, cy:113, rx:  6, ry: 14 },
  abs:      { cx: 45, cy:100, rx: 13, ry: 20 },
  oblL:     { cx: 27, cy:104, rx:  7, ry: 17 },
  oblR:     { cx: 63, cy:104, rx:  7, ry: 17 },
  quadL:    { cx: 35, cy:160, rx: 12, ry: 25 },
  quadR:    { cx: 55, cy:160, rx: 12, ry: 25 },
  calfL:    { cx: 35, cy:202, rx:  8, ry: 16 },
  calfR:    { cx: 55, cy:202, rx:  8, ry: 16 },
};

// ─── SVG zone definitions (back view) ────────────────────────────────────────
const BACK_ZONES = {
  trapsL:    { cx: 35, cy: 52, rx: 10, ry: 13 },
  trapsR:    { cx: 55, cy: 52, rx: 10, ry: 13 },
  latL:      { cx: 27, cy: 85, rx: 13, ry: 25 },
  latR:      { cx: 63, cy: 85, rx: 13, ry: 25 },
  midBackL:  { cx: 38, cy: 97, rx:  8, ry: 10 },
  midBackR:  { cx: 52, cy: 97, rx:  8, ry: 10 },
  lowerBack: { cx: 45, cy:115, rx: 12, ry: 10 },
  gluteL:    { cx: 37, cy:134, rx: 13, ry: 14 },
  gluteR:    { cx: 53, cy:134, rx: 13, ry: 14 },
  tricepL:   { cx: 15, cy: 82, rx:  7, ry: 19 },
  tricepR:   { cx: 75, cy: 82, rx:  7, ry: 19 },
  hamL:      { cx: 35, cy:162, rx: 12, ry: 25 },
  hamR:      { cx: 55, cy:162, rx: 12, ry: 25 },
  calfBL:    { cx: 35, cy:204, rx:  8, ry: 16 },
  calfBR:    { cx: 55, cy:204, rx:  8, ry: 16 },
};

// ─── wger.de muscle name → zones ─────────────────────────────────────────────
const WGER_ZONES = {
  'anterior deltoid':                  { f: ['deltoidL','deltoidR'] },
  'deltoid':                           { f: ['deltoidL','deltoidR'] },
  'biceps brachii':                    { f: ['bicepL','bicepR'] },
  'brachialis':                        { f: ['bicepL','bicepR'] },
  'brachioradialis':                   { f: ['forearmL','forearmR'] },
  'pronator teres':                    { f: ['forearmL','forearmR'] },
  'triceps brachii':                   { b: ['tricepL','tricepR'] },
  'biceps femoris':                    { b: ['hamL','hamR'] },
  'semimembranosus':                   { b: ['hamL','hamR'] },
  'semitendinosus':                    { b: ['hamL','hamR'] },
  'soleus':                            { b: ['calfBL','calfBR'] },
  'gastrocnemius':                     { f: ['calfL','calfR'], b: ['calfBL','calfBR'] },
  'tibialis anterior':                 { f: ['calfL','calfR'] },
  'rectus abdominis':                  { f: ['abs'] },
  'latissimus dorsi':                  { b: ['latL','latR'] },
  'gluteus maximus':                   { b: ['gluteL','gluteR'] },
  'gluteus medius':                    { b: ['gluteL','gluteR'] },
  'pectoralis major':                  { f: ['chest'] },
  'pectoralis major, clavicular part': { f: ['chest'] },
  'pectoralis major, sternal part':    { f: ['chest'] },
  'serratus anterior':                 { f: ['oblL','oblR'] },
  'trapezius':                         { b: ['trapsL','trapsR'] },
  'trapezius, middle fiber':           { b: ['trapsL','trapsR'] },
  'quadriceps femoris':                { f: ['quadL','quadR'] },
  'obliquus internus abdominis':       { f: ['oblL','oblR'] },
  'obliquus externus abdominis':       { f: ['oblL','oblR'] },
  'supraspinatus':                     { b: ['trapsL','trapsR'] },
  'infraspinatus':                     { b: ['trapsL','trapsR'] },
  'teres minor':                       { b: ['trapsL','trapsR'] },
  'teres major':                       { b: ['latL','latR'] },
  'rhomboids':                         { b: ['midBackL','midBackR'] },
  'iliopsoas':                         { f: ['quadL','quadR'] },
  'erector spinae':                    { b: ['lowerBack','midBackL','midBackR'] },
};

// ─── ExerciseDB muscle name → zones ──────────────────────────────────────────
const EXDB_ZONES = {
  'chest':             { f: ['chest'] },
  'pectorals':         { f: ['chest'] },
  'biceps':            { f: ['bicepL','bicepR'] },
  'triceps':           { b: ['tricepL','tricepR'] },
  'lats':              { b: ['latL','latR'] },
  'upper back':        { b: ['trapsL','trapsR','midBackL','midBackR'] },
  'middle back':       { b: ['midBackL','midBackR'] },
  'lower back':        { b: ['lowerBack'] },
  'traps':             { b: ['trapsL','trapsR'] },
  'spine':             { b: ['lowerBack'] },
  'shoulders':         { f: ['deltoidL','deltoidR'] },
  'delts':             { f: ['deltoidL','deltoidR'] },
  'abs':               { f: ['abs'] },
  'abdominals':        { f: ['abs'] },
  'obliques':          { f: ['oblL','oblR'] },
  'serratus anterior': { f: ['oblL','oblR'] },
  'glutes':            { b: ['gluteL','gluteR'] },
  'quads':             { f: ['quadL','quadR'] },
  'quadriceps':        { f: ['quadL','quadR'] },
  'hamstrings':        { b: ['hamL','hamR'] },
  'calves':            { f: ['calfL','calfR'], b: ['calfBL','calfBR'] },
  'forearms':          { f: ['forearmL','forearmR'] },
  'adductors':         { f: ['quadL','quadR'] },
  'abductors':         { f: ['quadL','quadR'] },
};

// ─── Category fallback ────────────────────────────────────────────────────────
const CAT_ZONES = {
  'Arms':      { f: ['bicepL','bicepR','forearmL','forearmR'], b: ['tricepL','tricepR'] },
  'Chest':     { f: ['chest','deltoidL','deltoidR'] },
  'Back':      { b: ['latL','latR','trapsL','trapsR','midBackL','midBackR'] },
  'Shoulders': { f: ['deltoidL','deltoidR'], b: ['trapsL','trapsR'] },
  'Legs':      { f: ['quadL','quadR'], b: ['hamL','hamR','gluteL','gluteR'] },
  'Abs':       { f: ['abs','oblL','oblR'] },
  'Calves':    { f: ['calfL','calfR'], b: ['calfBL','calfBR'] },
};

function buildZones(wgerMuscles, wgerSecondary, exdbTarget, exdbSecondary, category) {
  const active = new Set();
  const sec    = new Set();

  const addZone = (zoneName, target) => {
    if (!zoneName) return;
    const z = EXDB_ZONES[zoneName.toLowerCase()] ?? WGER_ZONES[zoneName.toLowerCase()];
    if (z) {
      (z.f ?? []).forEach(k => target.add('f_' + k));
      (z.b ?? []).forEach(k => target.add('b_' + k));
    }
  };

  // ExerciseDB data
  if (exdbTarget)   addZone(exdbTarget, active);
  if (exdbSecondary?.length) exdbSecondary.forEach(m => addZone(m, sec));

  // wger.de supplements ExerciseDB
  (wgerMuscles   ?? []).forEach(m => addZone(m.name_en, active));
  (wgerSecondary ?? []).forEach(m => addZone(m.name_en, sec));

  // Category fallback
  if (!active.size && !sec.size) {
    const cat = CAT_ZONES[category] ?? {};
    (cat.f ?? []).forEach(k => active.add('f_' + k));
    (cat.b ?? []).forEach(k => active.add('b_' + k));
  }

  return { active, sec };
}

// ─── SVG body side ────────────────────────────────────────────────────────────
function BodySide({ zones, prefix, active, sec, offset }) {
  const zFill = (key) => {
    if (active.has(prefix + key)) return PRIMARY_COLOR;
    if (sec.has(prefix + key))    return SECOND_COLOR;
    return ZONE_INACTIVE;
  };
  const zOpacity = (key) => {
    if (active.has(prefix + key)) return 0.88;
    if (sec.has(prefix + key))    return 0.58;
    return 0.28;
  };

  return (
    <G transform={`translate(${offset}, 0)`}>
      {/* Body silhouette */}
      <Circle  cx={45}  cy={14}  r={13}  fill={BODY_COLOR} />
      <Rect    x={41}   y={25}   width={8}  height={8}   rx={3}  fill={BODY_COLOR} />
      <Ellipse cx={45}  cy={68}  rx={24}  ry={30}  fill={BODY_COLOR} />
      <Ellipse cx={45}  cy={104} rx={18}  ry={18}  fill={BODY_COLOR} />
      <Ellipse cx={45}  cy={124} rx={21}  ry={10}  fill={BODY_COLOR} />
      <Ellipse cx={16}  cy={80}  rx={9}   ry={22}  fill={BODY_COLOR} />
      <Ellipse cx={74}  cy={80}  rx={9}   ry={22}  fill={BODY_COLOR} />
      <Ellipse cx={12}  cy={114} rx={7}   ry={18}  fill={BODY_COLOR} />
      <Ellipse cx={78}  cy={114} rx={7}   ry={18}  fill={BODY_COLOR} />
      <Ellipse cx={35}  cy={158} rx={13}  ry={28}  fill={BODY_COLOR} />
      <Ellipse cx={55}  cy={158} rx={13}  ry={28}  fill={BODY_COLOR} />
      <Ellipse cx={35}  cy={202} rx={9}   ry={18}  fill={BODY_COLOR} />
      <Ellipse cx={55}  cy={202} rx={9}   ry={18}  fill={BODY_COLOR} />
      {/* Muscle zones */}
      {Object.entries(zones).map(([key, { cx, cy, rx, ry }]) => (
        <Ellipse
          key={key}
          cx={cx} cy={cy} rx={rx} ry={ry}
          fill={zFill(key)}
          opacity={zOpacity(key)}
        />
      ))}
    </G>
  );
}

// ─── Muscle diagram component ─────────────────────────────────────────────────
function MuscleDiagram({ wgerMuscles, wgerSecondary, exdbTarget, exdbSecondary, category }) {
  const { active, sec } = buildZones(wgerMuscles, wgerSecondary, exdbTarget, exdbSecondary, category);

  return (
    <View style={dg.wrap}>
      <Svg width="100%" height={232} viewBox="0 0 210 232" preserveAspectRatio="xMidYMid meet">
        {/* Front */}
        <BodySide zones={FRONT_ZONES} prefix="f_" active={active} sec={sec} offset={0} />
        {/* Back */}
        <BodySide zones={BACK_ZONES}  prefix="b_" active={active} sec={sec} offset={110} />
        {/* Divider */}
        <Rect x={102} y={8} width={1} height={208} fill="#e5e7eb" />
        {/* Labels */}
        <SvgText x={45}  y={228} textAnchor="middle" fill="#9ca3af" fontSize="8" fontWeight="bold">FRONT</SvgText>
        <SvgText x={155} y={228} textAnchor="middle" fill="#9ca3af" fontSize="8" fontWeight="bold">BACK</SvgText>
      </Svg>
      {/* Legend */}
      {(active.size > 0 || sec.size > 0) && (
        <View style={dg.legend}>
          {active.size > 0 && (
            <View style={dg.legendRow}>
              <View style={[dg.dot, { backgroundColor: PRIMARY_COLOR }]} />
              <Text style={dg.lgTxt}>Primary</Text>
            </View>
          )}
          {sec.size > 0 && (
            <View style={dg.legendRow}>
              <View style={[dg.dot, { backgroundColor: SECOND_COLOR }]} />
              <Text style={dg.lgTxt}>Secondary</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const dg = StyleSheet.create({
  wrap:      { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  legend:    { flexDirection: 'row', gap: 16, paddingTop: 6, paddingHorizontal: 4 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot:       { width: 8, height: 8, borderRadius: 4 },
  lgTxt:     { fontSize: 11, fontWeight: '600', color: '#6b7280' },
});

// ─────────────────────────────────────────────────────────────────────────────
export default function LogSetModal({ visible, exercise, sets, onAdd, onRemove, onClose, previousSessions }) {
  const [weight, setWeight]         = useState('');
  const [reps, setReps]             = useState('');
  const [timer, setTimer]           = useState(null);
  const [mediaTab, setMediaTab]     = useState('muscles');

  // wger.de data
  const [wgerMuscles,   setWgerMuscles]   = useState([]);
  const [wgerSecondary, setWgerSecondary] = useState([]);
  const [wgerInstr,     setWgerInstr]     = useState(null);

  // ExerciseDB data
  const [exdbTarget,      setExdbTarget]      = useState(null);
  const [exdbSecondary,   setExdbSecondary]   = useState([]);
  const [exdbInstr,       setExdbInstr]       = useState([]);
  const [gifUrl,          setGifUrl]          = useState(null);
  const [gifLoading,      setGifLoading]      = useState(false);

  // Prefill weight/reps from last set
  useEffect(() => {
    if (sets.length > 0) {
      const last = sets[sets.length - 1];
      setWeight(String(last.weight));
      setReps(String(last.reps));
    }
  }, [sets.length]);

  // Rest timer countdown
  useEffect(() => {
    if (!timer || timer <= 0) { if (timer === 0) setTimer(null); return; }
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  // Reset + fetch on open
  useEffect(() => {
    if (!visible || !exercise?.id) return;
    setWgerMuscles([]); setWgerSecondary([]); setWgerInstr(null);
    setExdbTarget(null); setExdbSecondary([]); setExdbInstr([]);
    setGifUrl(null); setGifLoading(false); setMediaTab('muscles');

    // ── wger.de: muscles + instructions (skip custom exercises)
    if (!String(exercise.id).startsWith('custom_')) {
      fetch(`https://wger.de/api/v2/exerciseinfo/${exercise.id}/?format=json`)
        .then(r => r.json())
        .then(data => {
          setWgerMuscles(data.muscles ?? []);
          setWgerSecondary(data.muscles_secondary ?? []);
          const en  = data.translations?.find(t => t.language === 2);
          const raw = en?.description ?? '';
          const clean = raw.replace(/<[^>]*>/g, '').trim();
          if (clean) setWgerInstr(clean);
        })
        .catch(() => {});
    }

    // ── ExerciseDB: GIF + target muscles + instructions
    const name = exercise.name.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
    setGifLoading(true);
    fetch(`https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(name)}?limit=3`, {
      headers: {
        'X-RapidAPI-Key':  EXERCISEDB_KEY,
        'X-RapidAPI-Host': EXERCISEDB_HOST,
      },
    })
      .then(r => r.json())
      .then(data => {
        const ex = Array.isArray(data) ? data[0] : null;
        if (!ex) return;
        if (ex.gifUrl)            setGifUrl(ex.gifUrl);
        if (ex.target)            setExdbTarget(ex.target);
        if (ex.secondaryMuscles)  setExdbSecondary(ex.secondaryMuscles ?? []);
        if (ex.instructions?.length) setExdbInstr(ex.instructions);
      })
      .catch(() => {})
      .finally(() => setGifLoading(false));
  }, [visible, exercise?.id]);

  const handleAdd = () => {
    if (!weight.trim() || !reps.trim()) return;
    onAdd({ weight: parseFloat(weight), reps: parseInt(reps, 10) });
    setTimer(90);
  };

  const fmtTimer = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // Resolved instructions — prefer ExerciseDB array, fall back to wger.de text
  const hasInstr  = exdbInstr.length > 0 || !!wgerInstr;
  const hasDemo   = !!gifUrl;

  // Muscle name chips data
  const primaryChips   = exdbTarget ? [exdbTarget, ...wgerMuscles.map(m => m.name_en)]
    .filter((v, i, a) => a.indexOf(v) === i) : wgerMuscles.map(m => m.name_en);
  const secondaryChips = exdbSecondary.length
    ? [...exdbSecondary, ...wgerSecondary.map(m => m.name_en)].filter((v, i, a) => a.indexOf(v) === i)
    : wgerSecondary.map(m => m.name_en);

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={s.root}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* ── Header ────────────────────────────────────────────────────── */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <Text style={s.exName}>{exercise?.name}</Text>
              <Text style={s.exMeta}>
                {exercise?.category}
                {exercise?.equipment && exercise.equipment !== 'None' ? ` · ${exercise.equipment}` : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={s.closeBtn} activeOpacity={0.75}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* ── Media card ────────────────────────────────────────────────── */}
          <View style={s.mediaCard}>

            {/* Tabs */}
            <View style={s.tabs}>
              <TouchableOpacity
                style={[s.tab, mediaTab === 'muscles' && s.tabActive]}
                onPress={() => setMediaTab('muscles')} activeOpacity={0.75}
              >
                <Text style={[s.tabText, mediaTab === 'muscles' && s.tabTextActive]}>Muscles</Text>
              </TouchableOpacity>

              {hasInstr && (
                <TouchableOpacity
                  style={[s.tab, mediaTab === 'howto' && s.tabActive]}
                  onPress={() => setMediaTab('howto')} activeOpacity={0.75}
                >
                  <Text style={[s.tabText, mediaTab === 'howto' && s.tabTextActive]}>How-To</Text>
                </TouchableOpacity>
              )}

              {(hasDemo || gifLoading) && (
                <TouchableOpacity
                  style={[s.tab, mediaTab === 'demo' && s.tabActive]}
                  onPress={() => setMediaTab('demo')} activeOpacity={0.75}
                >
                  <Text style={[s.tabText, mediaTab === 'demo' && s.tabTextActive]}>▶ Demo</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ── Muscles tab ───────────────────────────────────────────── */}
            {mediaTab === 'muscles' && (
              <>
                <MuscleDiagram
                  wgerMuscles={wgerMuscles}
                  wgerSecondary={wgerSecondary}
                  exdbTarget={exdbTarget}
                  exdbSecondary={exdbSecondary}
                  category={exercise?.category}
                />
                {(primaryChips.length > 0 || secondaryChips.length > 0) && (
                  <View style={s.chipsWrap}>
                    {primaryChips.map((name, i) => (
                      <View key={i} style={[s.chip, s.chipPri]}>
                        <Text style={[s.chipTxt, s.chipTxtPri]}>{name}</Text>
                      </View>
                    ))}
                    {secondaryChips.map((name, i) => (
                      <View key={i} style={[s.chip, s.chipSec]}>
                        <Text style={[s.chipTxt, s.chipTxtSec]}>{name}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}

            {/* ── How-To tab ────────────────────────────────────────────── */}
            {mediaTab === 'howto' && (
              <View style={s.howtoPane}>
                {exdbInstr.length > 0 ? (
                  exdbInstr.map((step, i) => (
                    <View key={i} style={s.step}>
                      <View style={s.stepBadge}>
                        <Text style={s.stepBadgeTxt}>{i + 1}</Text>
                      </View>
                      <Text style={s.stepTxt}>{step}</Text>
                    </View>
                  ))
                ) : wgerInstr ? (
                  <Text style={s.wgerInstr}>{wgerInstr}</Text>
                ) : null}
              </View>
            )}

            {/* ── Demo tab ──────────────────────────────────────────────── */}
            {mediaTab === 'demo' && (
              <View style={s.demoPane}>
                {gifLoading ? (
                  <View style={s.gifPlaceholder}>
                    <ActivityIndicator color={ACCENT} size="large" />
                    <Text style={s.gifLoadingTxt}>Loading demo...</Text>
                  </View>
                ) : gifUrl ? (
                  <>
                    <Image
                      source={{ uri: gifUrl }}
                      style={s.gif}
                      resizeMode="contain"
                    />
                    <Text style={s.demoCaption}>Animated demo · ExerciseDB</Text>
                  </>
                ) : (
                  <View style={s.gifPlaceholder}>
                    <Text style={s.gifMissingTxt}>No demo available for this exercise</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* ── Rest timer ────────────────────────────────────────────────── */}
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

          {/* ── Log a set ────────────────────────────────────────────────── */}
          <View style={s.logRow}>
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>LBS</Text>
              <TextInput
                style={s.input}
                placeholder="0"
                placeholderTextColor="#d1d5db"
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>REPS</Text>
              <TextInput
                style={s.input}
                placeholder="0"
                placeholderTextColor="#d1d5db"
                value={reps}
                onChangeText={setReps}
                keyboardType="number-pad"
              />
            </View>
            <TouchableOpacity style={s.addSetBtn} onPress={handleAdd} activeOpacity={0.8}>
              <Text style={s.addSetBtnText}>Add Set</Text>
            </TouchableOpacity>
          </View>

          {/* ── Today's sets ──────────────────────────────────────────────── */}
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

          {/* ── Progress chart ────────────────────────────────────────────── */}
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

          {/* ── Previous sessions ─────────────────────────────────────────── */}
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
  headerLeft:   { flex: 1, gap: 4 },
  exName:       { fontSize: 20, fontWeight: '800', color: '#1a1a1e' },
  exMeta:       { fontSize: 11, fontWeight: '500', color: '#9ca3af' },
  closeBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a1e', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  closeBtnText: { fontSize: 14, fontWeight: '800', color: '#ffffff' },

  // Media card
  mediaCard: {
    backgroundColor: '#ffffff', margin: 16, borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 14, elevation: 2,
  },
  tabs:         { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  tab:          { flex: 1, paddingVertical: 13, alignItems: 'center' },
  tabActive:    { borderBottomWidth: 2.5, borderBottomColor: ACCENT },
  tabText:      { fontSize: 12, fontWeight: '700', color: '#9ca3af' },
  tabTextActive:{ color: '#1a1a1e' },

  // Muscle chips
  chipsWrap:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 16, paddingBottom: 16 },
  chip:        { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1.5 },
  chipPri:     { backgroundColor: '#fee2e2', borderColor: '#fca5a5' },
  chipSec:     { backgroundColor: '#fffbeb', borderColor: '#fcd34d' },
  chipTxt:     { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  chipTxtPri:  { color: '#ef4444' },
  chipTxtSec:  { color: '#92400e' },

  // How-To pane
  howtoPane: { padding: 16, gap: 12 },
  step:      { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  stepBadge: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center',
    marginTop: 1, flexShrink: 0,
  },
  stepBadgeTxt: { fontSize: 11, fontWeight: '800', color: '#ffffff' },
  stepTxt:      { flex: 1, fontSize: 13, color: '#374151', lineHeight: 20 },
  wgerInstr:    { fontSize: 13, color: '#374151', lineHeight: 20, padding: 16 },

  // Demo pane
  demoPane:       { padding: 16 },
  gif:            { width: '100%', height: 240, borderRadius: 14, backgroundColor: '#f9fafb' },
  gifPlaceholder: { height: 200, alignItems: 'center', justifyContent: 'center', gap: 10 },
  gifLoadingTxt:  { fontSize: 12, fontWeight: '600', color: '#9ca3af' },
  gifMissingTxt:  { fontSize: 12, fontWeight: '500', color: '#d1d5db' },
  demoCaption:    { fontSize: 9, fontWeight: '600', color: '#d1d5db', textAlign: 'center', marginTop: 8, letterSpacing: 0.5 },

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

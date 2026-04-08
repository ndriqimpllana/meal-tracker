import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Modal, ScrollView, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';

const ACCENT = '#30d158';

// Muscle group metadata
const MUSCLE_META = {
  'Arms':      { emoji: '💪', color: '#ff6b35', bg: '#fff7ed', muscles: 'Biceps · Triceps · Forearms',   front: ['upperArmL','upperArmR','lowerArmL','lowerArmR'] },
  'Chest':     { emoji: '🔴', color: '#ef4444', bg: '#fef2f2', muscles: 'Pec Major · Pec Minor',         front: ['chest'] },
  'Back':      { emoji: '🟣', color: '#7c3aed', bg: '#f5f3ff', muscles: 'Lats · Rhomboids · Traps',      front: ['back'] },
  'Legs':      { emoji: '🦵', color: '#0a84ff', bg: '#eff6ff', muscles: 'Quads · Hamstrings · Glutes',   front: ['upperLegL','upperLegR'] },
  'Shoulders': { emoji: '⚡', color: '#f59e0b', bg: '#fffbeb', muscles: 'Front · Side · Rear Delts',     front: ['shoulderL','shoulderR'] },
  'Abs':       { emoji: '🎯', color: '#30d158', bg: '#f0fdf4', muscles: 'Rectus Abdominis · Obliques',   front: ['abs'] },
  'Calves':    { emoji: '🦶', color: '#14b8a6', bg: '#f0fdfa', muscles: 'Gastrocnemius · Soleus',        front: ['lowerLegL','lowerLegR'] },
};

// Simplified front-view body silhouette diagram
function MuscleDiagram({ category }) {
  const info    = MUSCLE_META[category];
  const active  = new Set(info?.front ?? []);
  const color   = info?.color ?? '#30d158';
  const inactive = '#e5e7eb';
  const c = (key) => active.has(key) ? color : inactive;

  return (
    <View style={d.wrap}>
      {/* Head */}
      <View style={[d.head, { backgroundColor: inactive }]} />
      {/* Neck */}
      <View style={[d.neck, { backgroundColor: inactive }]} />
      {/* Shoulder L */}
      <View style={[d.shoulderL, { backgroundColor: c('shoulderL') }]} />
      {/* Shoulder R */}
      <View style={[d.shoulderR, { backgroundColor: c('shoulderR') }]} />
      {/* Chest / upper torso */}
      <View style={[d.chest, { backgroundColor: c('chest') }]} />
      {/* Abs / lower torso */}
      <View style={[d.abs, { backgroundColor: c('abs') }]} />
      {/* Back (overlay on torso when back is active) */}
      {active.has('back') && <View style={[d.backOverlay, { backgroundColor: color }]} />}
      {/* Upper arm L */}
      <View style={[d.upperArmL, { backgroundColor: c('upperArmL') }]} />
      {/* Upper arm R */}
      <View style={[d.upperArmR, { backgroundColor: c('upperArmR') }]} />
      {/* Lower arm L */}
      <View style={[d.lowerArmL, { backgroundColor: c('lowerArmL') }]} />
      {/* Lower arm R */}
      <View style={[d.lowerArmR, { backgroundColor: c('lowerArmR') }]} />
      {/* Hip */}
      <View style={[d.hip, { backgroundColor: inactive }]} />
      {/* Upper leg L */}
      <View style={[d.upperLegL, { backgroundColor: c('upperLegL') }]} />
      {/* Upper leg R */}
      <View style={[d.upperLegR, { backgroundColor: c('upperLegR') }]} />
      {/* Lower leg L */}
      <View style={[d.lowerLegL, { backgroundColor: c('lowerLegL') }]} />
      {/* Lower leg R */}
      <View style={[d.lowerLegR, { backgroundColor: c('lowerLegR') }]} />
    </View>
  );
}

const SCALE = 1.4;
const d = StyleSheet.create({
  wrap:       { width: 90*SCALE, height: 200*SCALE, position: 'relative' },
  // Head: circle centered at top
  head:       { position:'absolute', width:28*SCALE, height:28*SCALE, borderRadius:14*SCALE, top:0, left:31*SCALE },
  // Neck
  neck:       { position:'absolute', width:14*SCALE, height:14*SCALE, top:28*SCALE, left:38*SCALE, borderRadius:3*SCALE },
  // Shoulders
  shoulderL:  { position:'absolute', width:22*SCALE, height:12*SCALE, top:40*SCALE, left:4*SCALE,  borderRadius:6*SCALE },
  shoulderR:  { position:'absolute', width:22*SCALE, height:12*SCALE, top:40*SCALE, left:64*SCALE, borderRadius:6*SCALE },
  // Torso: chest
  chest:      { position:'absolute', width:52*SCALE, height:30*SCALE, top:40*SCALE, left:19*SCALE, borderRadius:4*SCALE },
  // Abs
  abs:        { position:'absolute', width:46*SCALE, height:26*SCALE, top:70*SCALE, left:22*SCALE, borderRadius:4*SCALE },
  // Back overlay (sits on top of chest+abs)
  backOverlay:{ position:'absolute', width:52*SCALE, height:58*SCALE, top:40*SCALE, left:19*SCALE, borderRadius:4*SCALE, opacity:0.7 },
  // Arms
  upperArmL:  { position:'absolute', width:14*SCALE, height:28*SCALE, top:44*SCALE, left:5*SCALE,  borderRadius:6*SCALE },
  upperArmR:  { position:'absolute', width:14*SCALE, height:28*SCALE, top:44*SCALE, left:71*SCALE, borderRadius:6*SCALE },
  lowerArmL:  { position:'absolute', width:11*SCALE, height:24*SCALE, top:72*SCALE, left:6*SCALE,  borderRadius:5*SCALE },
  lowerArmR:  { position:'absolute', width:11*SCALE, height:24*SCALE, top:72*SCALE, left:73*SCALE, borderRadius:5*SCALE },
  // Hip
  hip:        { position:'absolute', width:50*SCALE, height:16*SCALE, top:96*SCALE, left:20*SCALE, borderRadius:4*SCALE },
  // Upper legs
  upperLegL:  { position:'absolute', width:22*SCALE, height:38*SCALE, top:112*SCALE,left:22*SCALE, borderRadius:8*SCALE },
  upperLegR:  { position:'absolute', width:22*SCALE, height:38*SCALE, top:112*SCALE,left:46*SCALE, borderRadius:8*SCALE },
  // Lower legs
  lowerLegL:  { position:'absolute', width:18*SCALE, height:34*SCALE, top:152*SCALE,left:23*SCALE, borderRadius:7*SCALE },
  lowerLegR:  { position:'absolute', width:18*SCALE, height:34*SCALE, top:152*SCALE,left:49*SCALE, borderRadius:7*SCALE },
});

export default function LogSetModal({ visible, exercise, sets, onAdd, onRemove, onClose, previousSessions }) {
  const [weight, setWeight]             = useState('');
  const [reps, setReps]                 = useState('');
  const [timer, setTimer]               = useState(null);
  const [instructions, setInstructions] = useState(null);
  const [showInstr, setShowInstr]       = useState(false);
  const [exImage, setExImage]           = useState(null);
  const [exVideo, setExVideo]           = useState(null);
  const [mediaTab, setMediaTab]         = useState('diagram');  // 'diagram' | 'image' | 'video'

  // Prefill with last set values
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

  // Fetch wger.de media when exercise changes
  useEffect(() => {
    if (!visible || !exercise?.id) return;
    setInstructions(null); setShowInstr(false);
    setExImage(null); setExVideo(null); setMediaTab('diagram');

    const id = exercise.id;

    // Fetch instructions
    fetch(`https://wger.de/api/v2/exerciseinfo/${id}/?format=json`)
      .then(r => r.json())
      .then(data => {
        const en  = data.translations?.find(t => t.language === 2);
        const raw = en?.description ?? '';
        const clean = raw.replace(/<[^>]*>/g, '').trim();
        if (clean) setInstructions(clean);
      }).catch(() => {});

    // Fetch exercise image
    fetch(`https://wger.de/api/v2/exerciseimage/?format=json&exercise_base=${id}&is_main=1&limit=1`)
      .then(r => r.json())
      .then(data => {
        const img = data.results?.[0]?.image;
        if (img) { setExImage(img); setMediaTab('image'); }
      }).catch(() => {});

    // Fetch exercise video
    fetch(`https://wger.de/api/v2/video/?format=json&exercise_base=${id}&limit=1`)
      .then(r => r.json())
      .then(data => {
        const vid = data.results?.[0]?.video;
        if (vid) { setExVideo(vid); setMediaTab('video'); }
      }).catch(() => {});
  }, [visible, exercise?.id]);

  const handleAdd = () => {
    if (!weight.trim() || !reps.trim()) return;
    onAdd({ weight: parseFloat(weight), reps: parseInt(reps) });
    setTimer(90);
  };

  const fmtTimer = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  const muscleInfo = exercise?.category ? MUSCLE_META[exercise.category] : null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={s.root}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* ── Header ────────────────────────────────────────────────────── */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <Text style={s.exName}>{exercise?.name}</Text>
              <Text style={s.exMeta}>{exercise?.category} · {exercise?.equipment}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={s.closeBtn} activeOpacity={0.75}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* ── Media section ─────────────────────────────────────────────── */}
          <View style={s.mediaSection}>
            {/* Tabs */}
            <View style={s.mediaTabs}>
              <TouchableOpacity style={[s.mediaTab, mediaTab==='diagram'&&s.mediaTabActive]} onPress={() => setMediaTab('diagram')} activeOpacity={0.75}>
                <Text style={[s.mediaTabText, mediaTab==='diagram'&&s.mediaTabTextActive]}>Muscles</Text>
              </TouchableOpacity>
              {exImage && (
                <TouchableOpacity style={[s.mediaTab, mediaTab==='image'&&s.mediaTabActive]} onPress={() => setMediaTab('image')} activeOpacity={0.75}>
                  <Text style={[s.mediaTabText, mediaTab==='image'&&s.mediaTabTextActive]}>Form</Text>
                </TouchableOpacity>
              )}
              {exVideo && (
                <TouchableOpacity style={[s.mediaTab, mediaTab==='video'&&s.mediaTabActive]} onPress={() => setMediaTab('video')} activeOpacity={0.75}>
                  <Text style={[s.mediaTabText, mediaTab==='video'&&s.mediaTabTextActive]}>▶ Video</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Muscle diagram */}
            {mediaTab === 'diagram' && (
              <View style={s.diagramPane}>
                <MuscleDiagram category={exercise?.category} />
                {muscleInfo && (
                  <View style={[s.muscleInfo, { backgroundColor: muscleInfo.bg }]}>
                    <Text style={s.muscleEmoji}>{muscleInfo.emoji}</Text>
                    <View style={s.muscleTextBlock}>
                      <Text style={[s.muscleName, { color: muscleInfo.color }]}>{exercise.category}</Text>
                      <Text style={s.muscleMuscles}>{muscleInfo.muscles}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Exercise image from wger.de */}
            {mediaTab === 'image' && exImage && (
              <View style={s.imagePane}>
                <Image
                  source={{ uri: exImage }}
                  style={s.exImage}
                  resizeMode="contain"
                />
                <Text style={s.imageCaption}>Exercise demonstration • wger.de</Text>
              </View>
            )}

            {/* Exercise video from wger.de via expo-av */}
            {mediaTab === 'video' && exVideo && (
              <View style={s.videoPane}>
                <Video
                  source={{ uri: exVideo }}
                  style={s.exVideo}
                  resizeMode={ResizeMode.CONTAIN}
                  useNativeControls
                  isLooping
                  shouldPlay
                />
                <Text style={s.imageCaption}>Exercise video • wger.de</Text>
              </View>
            )}
          </View>

          {/* ── Instructions toggle ───────────────────────────────────────── */}
          {instructions && (
            <>
              <TouchableOpacity style={s.instrToggle} onPress={() => setShowInstr(v => !v)} activeOpacity={0.75}>
                <Text style={s.instrToggleText}>{showInstr ? '↑  Hide Instructions' : '↓  Show Instructions'}</Text>
              </TouchableOpacity>
              {showInstr && (
                <View style={s.instrBox}>
                  <Text style={s.instrText}>{instructions}</Text>
                </View>
              )}
            </>
          )}

          {/* ── Rest timer ────────────────────────────────────────────────── */}
          {timer !== null && (
            <View style={s.timerBox}>
              <View style={s.timerLeft}>
                <Text style={s.timerLabel}>REST TIMER</Text>
                <Text style={[s.timerCount, timer <= 10 && s.timerUrgent]}>{fmtTimer(timer)}</Text>
              </View>
              <View style={s.timerBtns}>
                <TouchableOpacity style={s.timerAdd} onPress={() => setTimer(t => t+30)} activeOpacity={0.75}>
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
              <TextInput style={s.input} placeholder="0" placeholderTextColor="#d1d5db"
                value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />
            </View>
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>REPS</Text>
              <TextInput style={s.input} placeholder="0" placeholderTextColor="#d1d5db"
                value={reps} onChangeText={setReps} keyboardType="number-pad" />
            </View>
            <TouchableOpacity style={s.addSetBtn} onPress={handleAdd} activeOpacity={0.8}>
              <Text style={s.addSetBtnText}>Add Set</Text>
            </TouchableOpacity>
          </View>

          {/* ── Today's sets ──────────────────────────────────────────────── */}
          {sets.length === 0 ? (
            <View style={s.noSets}><Text style={s.noSetsText}>No sets logged yet — add one above</Text></View>
          ) : (
            <View style={s.setsTable}>
              <View style={s.setsHead}>
                {['SET','LBS','REPS',' '].map(h => <Text key={h} style={s.setsHeadText}>{h}</Text>)}
              </View>
              {sets.map((item, i) => (
                <View key={i} style={s.setRow}>
                  <Text style={s.setNum}>{i+1}</Text>
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
            const maxW = Math.max(...data.map(s => s.maxWeight), 1);
            return (
              <View style={s.chart}>
                <Text style={s.chartLabel}>MAX WEIGHT TREND</Text>
                <View style={s.chartBars}>
                  {data.map((sess, i) => (
                    <View key={i} style={s.chartBarCol}>
                      <Text style={s.chartBarVal}>{sess.maxWeight}</Text>
                      <View style={s.chartBarTrack}>
                        <View style={[s.chartBar, { height: Math.max((sess.maxWeight/maxW)*60, 4) }]} />
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
                    {i===0 && previousSessions.length>1 && sess.maxWeight>previousSessions[1].maxWeight
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
  root: { flex:1, backgroundColor:'#f2f2f7' },

  header: {
    flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start',
    paddingHorizontal:20, paddingTop:16, paddingBottom:16,
    borderBottomWidth:1, borderBottomColor:'#e5e7eb', backgroundColor:'#f2f2f7',
  },
  headerLeft: { flex:1, gap:4 },
  exName:     { fontSize:20, fontWeight:'800', color:'#1a1a1e' },
  exMeta:     { fontSize:11, fontWeight:'500', color:'#9ca3af' },
  closeBtn:   {
    width:36, height:36, borderRadius:18, backgroundColor:'#1a1a1e',
    alignItems:'center', justifyContent:'center', marginTop:2,
  },
  closeBtnText: { fontSize:14, fontWeight:'800', color:'#ffffff' },

  // Media section
  mediaSection: { backgroundColor:'#ffffff', margin:16, borderRadius:20, overflow:'hidden', shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.07, shadowRadius:14, elevation:2 },
  mediaTabs:    { flexDirection:'row', borderBottomWidth:1, borderBottomColor:'#f3f4f6' },
  mediaTab:     { flex:1, paddingVertical:12, alignItems:'center' },
  mediaTabActive:    { borderBottomWidth:2, borderBottomColor:'#30d158' },
  mediaTabText:      { fontSize:12, fontWeight:'700', color:'#9ca3af' },
  mediaTabTextActive:{ color:'#1a1a1e' },

  diagramPane: { flexDirection:'row', alignItems:'center', gap:16, padding:16 },
  muscleInfo:  { flex:1, borderRadius:14, padding:14, gap:6 },
  muscleEmoji: { fontSize:32 },
  muscleTextBlock: { gap:3 },
  muscleName:  { fontSize:15, fontWeight:'800' },
  muscleMuscles: { fontSize:11, fontWeight:'500', color:'#9ca3af' },

  imagePane:   { padding:16 },
  exImage:     { width:'100%', height:200, borderRadius:12, backgroundColor:'#f9fafb' },
  imageCaption:{ fontSize:9, fontWeight:'600', color:'#d1d5db', textAlign:'center', marginTop:6, letterSpacing:0.5 },

  videoPane: { padding:16 },
  exVideo:   { width:'100%', height:220, borderRadius:12, backgroundColor:'#1a1a1e' },

  instrToggle: {
    marginHorizontal:16, marginBottom:4, paddingHorizontal:14, paddingVertical:10,
    borderRadius:10, backgroundColor:'#f0fdf4', borderWidth:1, borderColor:'#86efac',
    alignSelf:'flex-start',
  },
  instrToggleText: { fontSize:12, fontWeight:'700', color:'#16a34a' },
  instrBox: { marginHorizontal:16, marginBottom:12, padding:14, backgroundColor:'#ffffff', borderRadius:12 },
  instrText: { fontSize:12, color:'#6b7280', lineHeight:20 },

  // Timer
  timerBox: {
    flexDirection:'row', alignItems:'center', justifyContent:'space-between',
    margin:16, marginBottom:0, padding:14,
    backgroundColor:'#f0fdf4', borderRadius:16, borderWidth:1.5, borderColor:'#86efac',
  },
  timerLeft:  { gap:2 },
  timerLabel: { fontSize:9, fontWeight:'800', color:ACCENT, letterSpacing:1 },
  timerCount: { fontSize:32, fontWeight:'800', color:ACCENT },
  timerUrgent:{ color:'#ef4444' },
  timerBtns:  { flexDirection:'row', gap:8 },
  timerAdd: {
    borderWidth:1.5, borderColor:'#86efac', borderRadius:10,
    paddingHorizontal:12, paddingVertical:8, backgroundColor:'#dcfce7',
  },
  timerAddText:  { fontSize:12, fontWeight:'800', color:'#16a34a' },
  timerSkip: {
    borderWidth:1.5, borderColor:'#e5e7eb', borderRadius:10,
    paddingHorizontal:12, paddingVertical:8, backgroundColor:'#f9fafb',
  },
  timerSkipText: { fontSize:12, fontWeight:'700', color:'#6b7280' },

  // Log set
  logRow:     { flexDirection:'row', gap:8, padding:16, alignItems:'flex-end' },
  inputGroup: { flex:1, gap:6 },
  inputLabel: { fontSize:9, fontWeight:'800', color:'#9ca3af', letterSpacing:1, textTransform:'uppercase' },
  input: {
    backgroundColor:'#ffffff', borderWidth:1.5, borderColor:'#e5e7eb',
    borderRadius:12, paddingHorizontal:12, paddingVertical:12,
    color:'#1a1a1e', fontSize:20, textAlign:'center', fontWeight:'800',
    shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.05, shadowRadius:6,
  },
  addSetBtn: {
    flex:1, backgroundColor:'#1a1a1e', borderRadius:12, paddingVertical:13,
    alignItems:'center', justifyContent:'center',
    shadowColor:'#1a1a1e', shadowOffset:{width:0,height:3}, shadowOpacity:0.25, shadowRadius:10, elevation:5,
  },
  addSetBtnText: { fontSize:13, fontWeight:'800', color:'#ffffff' },

  // Sets table
  noSets:     { marginHorizontal:16, padding:20, alignItems:'center' },
  noSetsText: { fontSize:12, fontWeight:'500', color:'#d1d5db' },
  setsTable:  { marginHorizontal:16, backgroundColor:'#ffffff', borderRadius:14, overflow:'hidden', marginBottom:8, shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.05, shadowRadius:8, elevation:1 },
  setsHead:   { flexDirection:'row', paddingHorizontal:14, paddingVertical:10, backgroundColor:'#f9fafb', borderBottomWidth:1, borderBottomColor:'#f3f4f6' },
  setsHeadText:{ flex:1, fontSize:9, fontWeight:'800', color:'#9ca3af', letterSpacing:1, textTransform:'uppercase' },
  setRow:     { flexDirection:'row', alignItems:'center', paddingHorizontal:14, paddingVertical:12, borderBottomWidth:1, borderBottomColor:'#f9fafb' },
  setNum:     { flex:1, fontSize:13, fontWeight:'800', color:'#9ca3af' },
  setVal:     { flex:1, fontSize:14, fontWeight:'700', color:'#1a1a1e' },
  setRemove:  { fontSize:13, color:'#fca5a5', paddingLeft:8 },

  // Chart
  chart: { marginHorizontal:16, marginTop:16, backgroundColor:'#ffffff', borderRadius:14, padding:16, shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.05, shadowRadius:8, elevation:1 },
  chartLabel: { fontSize:9, fontWeight:'800', color:'#9ca3af', letterSpacing:1.5, marginBottom:12, textTransform:'uppercase' },
  chartBars:  { flexDirection:'row', alignItems:'flex-end', gap:6, height:90 },
  chartBarCol:{ flex:1, alignItems:'center', justifyContent:'flex-end', gap:4 },
  chartBarVal:{ fontSize:8, fontWeight:'800', color:ACCENT },
  chartBarTrack:{ width:'100%', height:60, justifyContent:'flex-end' },
  chartBar:   { width:'100%', backgroundColor:ACCENT+'44', borderRadius:4, minHeight:4 },
  chartBarDate:{ fontSize:7, fontWeight:'600', color:'#d1d5db' },

  // History
  history: { marginHorizontal:16, marginTop:16, marginBottom:30 },
  historyLabel: { fontSize:9, fontWeight:'800', color:'#d1d5db', letterSpacing:1.5, textTransform:'uppercase', marginBottom:10 },
  historyRow:   { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:10, borderBottomWidth:1, borderBottomColor:'#f9fafb' },
  historyDate:  { fontSize:11, fontWeight:'600', color:'#9ca3af' },
  historyData:  { fontSize:12, fontWeight:'600', color:'#6b7280' },
  pr:           { color:ACCENT, fontWeight:'800' },
});

import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Modal, ScrollView,
} from 'react-native';

const ACCENT = '#16a34a';

export default function LogSetModal({ visible, exercise, sets, onAdd, onRemove, onClose, previousSessions }) {
  const [weight, setWeight]             = useState('');
  const [reps, setReps]                 = useState('');
  const [timer, setTimer]               = useState(null);
  const [instructions, setInstructions] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (sets.length > 0) {
      const last = sets[sets.length - 1];
      setWeight(String(last.weight));
      setReps(String(last.reps));
    }
  }, [sets.length]);

  useEffect(() => {
    if (!timer || timer <= 0) { if (timer === 0) setTimer(null); return; }
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  useEffect(() => {
    if (!visible || !exercise?.id) return;
    setInstructions(null); setShowInstructions(false);
    fetch(`https://wger.de/api/v2/exerciseinfo/${exercise.id}/?format=json`)
      .then(r => r.json())
      .then(data => {
        const en  = data.translations?.find(t => t.language === 2);
        const raw = en?.description ?? '';
        const clean = raw.replace(/<[^>]*>/g, '').trim();
        if (clean) setInstructions(clean);
      })
      .catch(() => {});
  }, [visible, exercise?.id]);

  const handleAdd = () => {
    if (!weight.trim() || !reps.trim()) return;
    onAdd({ weight: parseFloat(weight), reps: parseInt(reps) });
    setTimer(90);
  };

  const formatTimer = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Header */}
            <View style={s.sheetHeader}>
              <View style={s.titleBlock}>
                <Text style={s.sheetTitle}>{exercise?.name}</Text>
                <Text style={s.sheetMeta}>{exercise?.category} · {exercise?.equipment}</Text>
              </View>
              <TouchableOpacity onPress={onClose} activeOpacity={0.75} style={s.closeBtnWrap}>
                <Text style={s.closeBtn}>✕ Close</Text>
              </TouchableOpacity>
            </View>

            {/* Instructions toggle */}
            {instructions && (
              <TouchableOpacity style={s.instructionsToggle} onPress={() => setShowInstructions(v => !v)} activeOpacity={0.75}>
                <Text style={s.instructionsToggleText}>
                  {showInstructions ? 'Hide instructions ↑' : 'Show instructions ↓'}
                </Text>
              </TouchableOpacity>
            )}
            {showInstructions && instructions && (
              <View style={s.instructionsBox}>
                <Text style={s.instructionsText}>{instructions}</Text>
              </View>
            )}

            {/* Rest timer */}
            {timer !== null && (
              <View style={s.timerBox}>
                <View style={s.timerLeft}>
                  <Text style={s.timerLabel}>REST</Text>
                  <Text style={[s.timerCount, timer <= 10 && s.timerCountUrgent]}>{formatTimer(timer)}</Text>
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

            {/* Input row */}
            <View style={s.inputRow}>
              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>LBS</Text>
                <TextInput
                  style={s.input} placeholder="0" placeholderTextColor="#d4b8b0"
                  value={weight} onChangeText={setWeight} keyboardType="decimal-pad"
                />
              </View>
              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>REPS</Text>
                <TextInput
                  style={s.input} placeholder="0" placeholderTextColor="#d4b8b0"
                  value={reps} onChangeText={setReps} keyboardType="number-pad"
                />
              </View>
              <TouchableOpacity style={s.addBtn} onPress={handleAdd} activeOpacity={0.75}>
                <Text style={s.addBtnText}>Add Set</Text>
              </TouchableOpacity>
            </View>

            {/* Today's sets */}
            {sets.length === 0 ? (
              <View style={s.empty}><Text style={s.emptyText}>No sets logged yet</Text></View>
            ) : (
              <>
                <View style={s.setsHeader}>
                  {['SET','LBS','REPS',' '].map(h => <Text key={h} style={s.setsHeaderText}>{h}</Text>)}
                </View>
                {sets.map((item, index) => (
                  <View key={index} style={s.setRow}>
                    <Text style={s.setNum}>{index + 1}</Text>
                    <Text style={s.setValue}>{item.weight} lbs</Text>
                    <Text style={s.setValue}>{item.reps}</Text>
                    <TouchableOpacity onPress={() => onRemove(index)} activeOpacity={0.75}>
                      <Text style={s.removeBtn}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}

            {/* Progress chart */}
            {previousSessions?.length > 1 && (() => {
              const chartData = [...previousSessions].reverse().slice(-8);
              const maxW = Math.max(...chartData.map(s => s.maxWeight), 1);
              return (
                <View style={s.chart}>
                  <Text style={s.chartLabel}>MAX WEIGHT TREND</Text>
                  <View style={s.chartBars}>
                    {chartData.map((sess, i) => (
                      <View key={i} style={s.chartBarWrap}>
                        <Text style={s.chartBarVal}>{sess.maxWeight}</Text>
                        <View style={s.chartBarTrack}>
                          <View style={[s.chartBar, { height: Math.max((sess.maxWeight / maxW) * 56, 4) }]} />
                        </View>
                        <Text style={s.chartBarDate}>{sess.date.slice(5)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })()}

            {/* Previous sessions */}
            {previousSessions?.length > 0 && (
              <View style={s.historySection}>
                <Text style={s.historyLabel}>PREVIOUS SESSIONS</Text>
                {previousSessions.map((session, i) => (
                  <View key={i} style={s.historyRow}>
                    <Text style={s.historyDate}>{session.date}</Text>
                    <Text style={s.historyData}>
                      {session.sets} sets · {session.maxWeight} lbs max
                      {i === 0 && previousSessions.length > 1 && session.maxWeight > previousSessions[1].maxWeight
                        ? <Text style={s.historyPR}> ↑ PR</Text> : null}
                    </Text>
                  </View>
                ))}
              </View>
            )}

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(44,24,16,0.5)' },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1.5,
    borderColor: '#f5ddd4',
    padding: 16,
    maxHeight: '85%',
    shadowColor: '#2c1810',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  titleBlock:  { gap: 3, flex: 1 },
  sheetTitle:  { fontSize: 17, fontWeight: '700', color: '#2c1810' },
  sheetMeta:   { fontFamily: 'monospace', fontSize: 10, color: '#c8a89c' },
  closeBtnWrap: {
    paddingVertical: 7, paddingHorizontal: 13, borderRadius: 8,
    borderWidth: 1.5, borderColor: '#fca5a5', backgroundColor: '#fff5f5',
  },
  closeBtn: { fontFamily: 'monospace', fontSize: 12, fontWeight: '700', color: '#ef4444' },

  instructionsToggle: {
    alignSelf: 'flex-start', marginBottom: 12, paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 8, borderWidth: 1.5, borderColor: ACCENT + '55', backgroundColor: '#f0fdf4',
  },
  instructionsToggleText: { fontFamily: 'monospace', fontSize: 11, color: ACCENT, fontWeight: '700' },
  instructionsBox: {
    backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#f0d0c4',
    borderRadius: 10, padding: 12, marginBottom: 14,
  },
  instructionsText: { fontSize: 12, color: '#9b7060', lineHeight: 19 },

  timerBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#f0fdf4', borderWidth: 1.5, borderColor: ACCENT + '55',
    borderRadius: 12, padding: 12, marginBottom: 14,
  },
  timerLeft:       { gap: 2 },
  timerLabel:      { fontFamily: 'monospace', fontSize: 9, color: ACCENT, letterSpacing: 1, fontWeight: '700' },
  timerCount:      { fontFamily: 'monospace', fontSize: 28, fontWeight: '700', color: ACCENT },
  timerCountUrgent:{ color: '#ef4444' },
  timerBtns:       { flexDirection: 'row', gap: 8 },
  timerAdd: {
    borderWidth: 1.5, borderColor: ACCENT + '66', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#dcfce7',
  },
  timerAddText:  { fontFamily: 'monospace', fontSize: 12, color: ACCENT, fontWeight: '700' },
  timerSkip: {
    borderWidth: 1.5, borderColor: '#f0d0c4', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#fff8f4',
  },
  timerSkipText: { fontFamily: 'monospace', fontSize: 12, color: '#c8a89c', fontWeight: '600' },

  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 16, alignItems: 'flex-end' },
  inputGroup: { flex: 1, gap: 6 },
  inputLabel: { fontFamily: 'monospace', fontSize: 9, color: '#c8a89c', letterSpacing: 0.8, fontWeight: '700' },
  input: {
    backgroundColor: '#fff8f4', borderWidth: 1.5, borderColor: '#f0d0c4',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11,
    color: '#2c1810', fontFamily: 'monospace', fontSize: 18, textAlign: 'center', fontWeight: '700',
  },
  addBtn: {
    flex: 1, backgroundColor: '#2c1810', borderRadius: 10, paddingVertical: 11,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#2c1810', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6,
  },
  addBtnText: { fontFamily: 'monospace', fontSize: 12, fontWeight: '700', color: '#ffffff' },

  empty:     { paddingVertical: 24, alignItems: 'center' },
  emptyText: { fontFamily: 'monospace', fontSize: 11, color: '#d4b8b0' },

  setsHeader: { flexDirection: 'row', marginBottom: 6, paddingHorizontal: 4 },
  setsHeaderText: { flex: 1, fontFamily: 'monospace', fontSize: 9, color: '#d4b8b0', letterSpacing: 0.8, fontWeight: '700' },
  setRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: '#fdf0ea',
  },
  setNum:    { flex: 1, fontFamily: 'monospace', fontSize: 12, color: '#c8a89c', fontWeight: '600' },
  setValue:  { flex: 1, fontFamily: 'monospace', fontSize: 13, color: '#2c1810', fontWeight: '600' },
  removeBtn: { fontFamily: 'monospace', fontSize: 12, color: '#f0d0c4', paddingLeft: 8 },

  chart: { marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#fdf0ea', marginBottom: 4 },
  chartLabel: { fontFamily: 'monospace', fontSize: 9, color: '#d4b8b0', letterSpacing: 1, marginBottom: 12, fontWeight: '700' },
  chartBars:  { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 80 },
  chartBarWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  chartBarVal:  { fontFamily: 'monospace', fontSize: 8, color: ACCENT, fontWeight: '700' },
  chartBarTrack:{ width: '100%', height: 56, justifyContent: 'flex-end' },
  chartBar:     { width: '100%', backgroundColor: ACCENT + '55', borderRadius: 3, minHeight: 4 },
  chartBarDate: { fontFamily: 'monospace', fontSize: 7, color: '#d4b8b0' },

  historySection: { marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#fdf0ea' },
  historyLabel: { fontFamily: 'monospace', fontSize: 9, color: '#d4b8b0', letterSpacing: 1, marginBottom: 10, fontWeight: '700' },
  historyRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#fdf0ea',
  },
  historyDate: { fontFamily: 'monospace', fontSize: 10, color: '#c8a89c' },
  historyData: { fontFamily: 'monospace', fontSize: 11, color: '#9b7060' },
  historyPR:   { color: ACCENT, fontWeight: '700' },
});

import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Modal, ScrollView,
} from 'react-native';

const ACCENT = '#4ade80';

export default function LogSetModal({ visible, exercise, sets, onAdd, onRemove, onClose, previousSessions }) {
  const [weight, setWeight]               = useState('');
  const [reps, setReps]                   = useState('');
  const [timer, setTimer]                 = useState(null);
  const [instructions, setInstructions]   = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  // Rest timer countdown
  useEffect(() => {
    if (!timer || timer <= 0) {
      if (timer === 0) setTimer(null);
      return;
    }
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  // Fetch exercise instructions from wger
  useEffect(() => {
    if (!visible || !exercise?.id) return;
    setInstructions(null);
    setShowInstructions(false);
    fetch(`https://wger.de/api/v2/exerciseinfo/${exercise.id}/?format=json`)
      .then(r => r.json())
      .then(data => {
        const en = data.translations?.find(t => t.language === 2);
        const raw = en?.description ?? '';
        const clean = raw.replace(/<[^>]*>/g, '').trim();
        if (clean) setInstructions(clean);
      })
      .catch(() => {});
  }, [visible, exercise?.id]);

  const handleAdd = () => {
    if (!weight.trim() || !reps.trim()) return;
    onAdd({ weight: parseFloat(weight), reps: parseInt(reps) });
    setWeight('');
    setReps('');
    setTimer(90);
  };

  const formatTimer = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={s.sheetHeader}>
              <View style={s.titleBlock}>
                <Text style={s.sheetTitle}>{exercise?.name}</Text>
                <Text style={s.sheetMeta}>{exercise?.category} · {exercise?.equipment}</Text>
              </View>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <Text style={s.closeBtn}>Close</Text>
              </TouchableOpacity>
            </View>

            {/* Instructions toggle */}
            {instructions && (
              <TouchableOpacity
                style={s.instructionsToggle}
                onPress={() => setShowInstructions(v => !v)}
                activeOpacity={0.7}
              >
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
                  <Text style={[s.timerCount, timer <= 10 && s.timerCountUrgent]}>
                    {formatTimer(timer)}
                  </Text>
                </View>
                <View style={s.timerBtns}>
                  <TouchableOpacity style={s.timerAdd} onPress={() => setTimer(t => t + 30)} activeOpacity={0.7}>
                    <Text style={s.timerAddText}>+30s</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.timerSkip} onPress={() => setTimer(null)} activeOpacity={0.7}>
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
                  style={s.input}
                  placeholder="0"
                  placeholderTextColor="#555555"
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
                  placeholderTextColor="#555555"
                  value={reps}
                  onChangeText={setReps}
                  keyboardType="number-pad"
                />
              </View>
              <TouchableOpacity style={s.addBtn} onPress={handleAdd} activeOpacity={0.7}>
                <Text style={s.addBtnText}>Add Set</Text>
              </TouchableOpacity>
            </View>

            {/* Today's sets */}
            {sets.length === 0 ? (
              <View style={s.empty}>
                <Text style={s.emptyText}>No sets logged yet</Text>
              </View>
            ) : (
              <>
                <View style={s.setsHeader}>
                  <Text style={s.setsHeaderText}>SET</Text>
                  <Text style={s.setsHeaderText}>LBS</Text>
                  <Text style={s.setsHeaderText}>REPS</Text>
                  <Text style={s.setsHeaderText}> </Text>
                </View>
                {sets.map((item, index) => (
                  <View key={index} style={s.setRow}>
                    <Text style={s.setNum}>{index + 1}</Text>
                    <Text style={s.setValue}>{item.weight} lbs</Text>
                    <Text style={s.setValue}>{item.reps}</Text>
                    <TouchableOpacity onPress={() => onRemove(index)} activeOpacity={0.7}>
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
                        ? <Text style={s.historyPR}> ↑ PR</Text>
                        : null
                      }
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
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: '#111111',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: '#242424',
    padding: 16,
    maxHeight: '85%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleBlock: { gap: 3, flex: 1 },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  sheetMeta: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#666666',
  },
  closeBtn: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#666666',
    marginLeft: 12,
  },

  instructionsToggle: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: ACCENT + '55',
    backgroundColor: ACCENT + '18',
  },
  instructionsToggleText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: ACCENT,
    letterSpacing: 0.3,
    fontWeight: '600',
  },
  instructionsBox: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#1e1e1e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  instructionsText: {
    fontSize: 12,
    color: '#888888',
    lineHeight: 19,
  },

  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0d1a0d',
    borderWidth: 1,
    borderColor: ACCENT + '44',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  timerLeft: { gap: 2 },
  timerLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: ACCENT,
    letterSpacing: 1,
  },
  timerCount: {
    fontFamily: 'monospace',
    fontSize: 28,
    fontWeight: '600',
    color: ACCENT,
  },
  timerCountUrgent: { color: '#f87171' },
  timerBtns: { flexDirection: 'row', gap: 8 },
  timerAdd: {
    borderWidth: 1,
    borderColor: ACCENT + '66',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  timerAddText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: ACCENT,
  },
  timerSkip: {
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  timerSkipText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#666666',
  },

  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  inputGroup: { flex: 1, gap: 6 },
  inputLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#666666',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontFamily: 'monospace',
    fontSize: 18,
    textAlign: 'center',
  },
  addBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '600',
    color: '#000000',
  },

  empty: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#444444',
  },

  setsHeader: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  setsHeaderText: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#444444',
    letterSpacing: 0.8,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  setNum: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#666666',
  },
  setValue: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#ffffff',
  },
  removeBtn: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#444444',
    paddingLeft: 8,
  },

  chart: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e1e1e',
    marginBottom: 4,
  },
  chartLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#444444',
    letterSpacing: 1,
    marginBottom: 12,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 80,
  },
  chartBarWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  chartBarVal: {
    fontFamily: 'monospace',
    fontSize: 8,
    color: ACCENT,
  },
  chartBarTrack: {
    width: '100%',
    height: 56,
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '100%',
    backgroundColor: ACCENT + '66',
    borderRadius: 3,
    minHeight: 4,
  },
  chartBarDate: {
    fontFamily: 'monospace',
    fontSize: 7,
    color: '#444444',
  },

  historySection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e1e1e',
  },
  historyLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#444444',
    letterSpacing: 1,
    marginBottom: 10,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  historyDate: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#555555',
  },
  historyData: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#888888',
  },
  historyPR: {
    color: ACCENT,
    fontWeight: '600',
  },
});

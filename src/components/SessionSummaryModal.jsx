import {
  View, Text, TouchableOpacity,
  StyleSheet, Modal, ScrollView,
} from 'react-native';

const ACCENT = '#16a34a';

function fmtDuration(secs) {
  if (!secs) return '--';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
  return `${s}s`;
}

export default function SessionSummaryModal({ visible, onClose, exercises, logs, date, duration }) {
  const todayLogs = logs[date] ?? {};

  const exerciseStats = exercises
    .map(ex => {
      const sets = todayLogs[ex.id] ?? [];
      if (sets.length === 0) return null;
      const volume    = sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
      const maxWeight = Math.max(...sets.map(s => s.weight));
      const totalReps = sets.reduce((sum, s) => sum + s.reps, 0);
      return { ...ex, sets: sets.length, volume, maxWeight, totalReps };
    })
    .filter(Boolean);

  const totalVolume = exerciseStats.reduce((sum, e) => sum + e.volume, 0);
  const totalSets   = exerciseStats.reduce((sum, e) => sum + e.sets, 0);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.sheet}>

          <View style={s.header}>
            <View>
              <Text style={s.label}>WORKOUT COMPLETE</Text>
              <Text style={s.title}>Session Summary</Text>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.75} style={s.closeBtnWrap}>
              <Text style={s.closeBtn}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          <View style={s.totalsRow}>
            <View style={s.totalBox}>
              <Text style={[s.totalVal, s.accentText]}>{fmtDuration(duration)}</Text>
              <Text style={s.totalLbl}>Duration</Text>
            </View>
            <View style={s.totalBox}>
              <Text style={s.totalVal}>{totalSets}</Text>
              <Text style={s.totalLbl}>Sets</Text>
            </View>
            <View style={s.totalBox}>
              <Text style={s.totalVal}>{exerciseStats.length}</Text>
              <Text style={s.totalLbl}>Exercises</Text>
            </View>
            <View style={s.totalBox}>
              <Text style={[s.totalVal, s.accentText]}>{totalVolume.toLocaleString()}</Text>
              <Text style={s.totalLbl}>Total lbs</Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={s.sectionLabel}>BREAKDOWN</Text>
            {exerciseStats.length === 0 ? (
              <Text style={s.noSets}>No sets logged today</Text>
            ) : (
              exerciseStats.map((ex, i) => (
                <View key={i} style={s.exRow}>
                  <View style={s.exLeft}>
                    <Text style={s.exName}>{ex.name}</Text>
                    <Text style={s.exMeta}>{ex.sets} sets · {ex.totalReps} reps · {ex.maxWeight} lbs max</Text>
                  </View>
                  <View style={s.exVolume}>
                    <Text style={s.exVolumeVal}>{ex.volume.toLocaleString()}</Text>
                    <Text style={s.exVolumeLbl}>lbs</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <TouchableOpacity style={s.doneBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={s.doneBtnText}>Done</Text>
          </TouchableOpacity>

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
    maxHeight: '80%',
    shadowColor: '#2c1810',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  label: { fontFamily: 'monospace', fontSize: 9, color: ACCENT, letterSpacing: 1.5, marginBottom: 4, fontWeight: '700' },
  title: { fontSize: 20, fontWeight: '700', color: '#2c1810' },
  closeBtnWrap: {
    paddingVertical: 7, paddingHorizontal: 13, borderRadius: 8,
    borderWidth: 1.5, borderColor: '#fca5a5', backgroundColor: '#fff5f5',
  },
  closeBtn: { fontFamily: 'monospace', fontSize: 12, fontWeight: '700', color: '#ef4444' },

  totalsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  totalBox: {
    flex: 1, backgroundColor: '#fff8f4', borderWidth: 1.5, borderColor: '#f5ddd4',
    borderRadius: 12, padding: 12, alignItems: 'center', gap: 3,
    shadowColor: '#c4906c', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  totalVal:   { fontFamily: 'monospace', fontSize: 15, fontWeight: '700', color: '#2c1810' },
  accentText: { color: ACCENT },
  totalLbl:   { fontFamily: 'monospace', fontSize: 9, color: '#c8a89c', letterSpacing: 0.5, fontWeight: '600' },

  sectionLabel: { fontFamily: 'monospace', fontSize: 9, color: '#d4b8b0', letterSpacing: 1, marginBottom: 10, fontWeight: '700' },
  noSets: { fontFamily: 'monospace', fontSize: 11, color: '#d4b8b0', textAlign: 'center', paddingVertical: 20 },
  exRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#fdf0ea',
  },
  exLeft:      { flex: 1, gap: 3 },
  exName:      { fontSize: 13, fontWeight: '700', color: '#2c1810' },
  exMeta:      { fontFamily: 'monospace', fontSize: 10, color: '#c8a89c' },
  exVolume:    { alignItems: 'flex-end' },
  exVolumeVal: { fontFamily: 'monospace', fontSize: 15, fontWeight: '700', color: ACCENT },
  exVolumeLbl: { fontFamily: 'monospace', fontSize: 9, color: ACCENT, opacity: 0.6 },

  doneBtn: {
    marginTop: 16, backgroundColor: '#2c1810', borderRadius: 12, paddingVertical: 15, alignItems: 'center',
    shadowColor: '#2c1810', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 8,
  },
  doneBtnText: { fontFamily: 'monospace', fontSize: 13, fontWeight: '700', color: '#ffffff' },
});

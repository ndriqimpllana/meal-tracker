import {
  View, Text, TouchableOpacity,
  StyleSheet, Modal, ScrollView,
} from 'react-native';

const ACCENT = '#4ade80';

export default function SessionSummaryModal({ visible, onClose, exercises, logs, date }) {
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
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={s.closeBtn}>Close</Text>
            </TouchableOpacity>
          </View>

          {/* Totals */}
          <View style={s.totalsRow}>
            <View style={s.totalBox}>
              <Text style={s.totalVal}>{totalSets}</Text>
              <Text style={s.totalLbl}>Total Sets</Text>
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

          {/* Per exercise breakdown */}
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
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  label: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: ACCENT,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeBtn: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#666666',
  },

  totalsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  totalBox: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    gap: 3,
  },
  totalVal: {
    fontFamily: 'monospace',
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  accentText: { color: ACCENT },
  totalLbl: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#555555',
    letterSpacing: 0.5,
  },

  sectionLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#444444',
    letterSpacing: 1,
    marginBottom: 10,
  },
  noSets: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#444444',
    textAlign: 'center',
    paddingVertical: 20,
  },
  exRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  exLeft: { flex: 1, gap: 3 },
  exName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  exMeta: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#555555',
  },
  exVolume: { alignItems: 'flex-end' },
  exVolumeVal: {
    fontFamily: 'monospace',
    fontSize: 15,
    fontWeight: '600',
    color: ACCENT,
  },
  exVolumeLbl: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: ACCENT,
    opacity: 0.6,
  },

  doneBtn: {
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
});

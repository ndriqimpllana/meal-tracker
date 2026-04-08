import { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Modal, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ACCENT = '#4ade80';

function fmtDuration(secs) {
  if (!secs) return null;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
  return `${s}s`;
}

export default function WorkoutHistoryModal({ visible, onClose, completedWorkouts, onDelete }) {
  const [confirmDate, setConfirmDate] = useState(null);

  const sessions = Object.values(completedWorkouts)
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleDelete = (date) => {
    onDelete(date);
    setConfirmDate(null);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={s.root}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.label}>HISTORY</Text>
            <Text style={s.title}>Past Workouts</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={s.closeBtnWrap} activeOpacity={0.7}>
            <Text style={s.closeBtn}>✕ Close</Text>
          </TouchableOpacity>
        </View>

        {/* Session count strip */}
        {sessions.length > 0 && (
          <View style={s.countStrip}>
            <Text style={s.countText}>
              <Text style={s.countNum}>{sessions.length}</Text>
              {' workout'}
              {sessions.length !== 1 ? 's' : ''} logged
            </Text>
          </View>
        )}

        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
        >
          {sessions.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>🏋️</Text>
              <Text style={s.emptyText}>No workout history yet</Text>
              <Text style={s.emptySub}>Finish a workout to see it here</Text>
            </View>
          ) : (
            sessions.map((session) => {
              const totalSets = session.exercises.reduce((sum, e) => sum + e.sets.length, 0);
              const totalVol  = session.exercises.reduce((sum, e) =>
                sum + e.sets.reduce((s2, set) => s2 + set.weight * set.reps, 0), 0);
              const isConfirming = confirmDate === session.date;

              return (
                <View key={session.date} style={s.card}>

                  {/* Card header row */}
                  <View style={s.cardHeader}>
                    <View style={s.cardDateWrap}>
                      <Text style={s.cardDate}>{session.date}</Text>
                      {fmtDuration(session.duration) && (
                        <View style={s.durationBadge}>
                          <Text style={s.durationText}>⏱ {fmtDuration(session.duration)}</Text>
                        </View>
                      )}
                    </View>
                    {isConfirming ? (
                      <View style={s.confirmRow}>
                        <Text style={s.confirmLabel}>Delete?</Text>
                        <TouchableOpacity
                          style={s.confirmYes}
                          onPress={() => handleDelete(session.date)}
                          activeOpacity={0.7}
                        >
                          <Text style={s.confirmYesText}>Yes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={s.confirmNo}
                          onPress={() => setConfirmDate(null)}
                          activeOpacity={0.7}
                        >
                          <Text style={s.confirmNoText}>No</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={s.deleteBtn}
                        onPress={() => setConfirmDate(session.date)}
                        activeOpacity={0.7}
                      >
                        <Text style={s.deleteBtnText}>Delete</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Stats row */}
                  <View style={s.statsRow}>
                    <View style={s.statBox}>
                      <Text style={s.statVal}>{session.exercises.length}</Text>
                      <Text style={s.statLbl}>Exercises</Text>
                    </View>
                    <View style={s.statDivider} />
                    <View style={s.statBox}>
                      <Text style={s.statVal}>{totalSets}</Text>
                      <Text style={s.statLbl}>Sets</Text>
                    </View>
                    <View style={s.statDivider} />
                    <View style={s.statBox}>
                      <Text style={[s.statVal, s.statGreen]}>{totalVol.toLocaleString()}</Text>
                      <Text style={s.statLbl}>Total lbs</Text>
                    </View>
                  </View>

                  {/* Exercise rows */}
                  {session.exercises.map((ex, j) => {
                    const maxW = Math.max(...ex.sets.map(st => st.weight));
                    return (
                      <View key={j} style={s.exRow}>
                        <Text style={s.exName}>{ex.name}</Text>
                        <Text style={s.exMeta}>{ex.sets.length} sets · {maxW} lbs max</Text>
                      </View>
                    );
                  })}

                </View>
              );
            })
          )}
        </ScrollView>

      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  label: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: ACCENT,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0a0a0a',
  },
  closeBtnWrap: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#f8717155',
    backgroundColor: '#fff5f5',
    marginTop: 4,
  },
  closeBtn: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '700',
    color: '#f87171',
  },

  countStrip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f7f7f7',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  countText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#888888',
  },
  countNum: {
    fontWeight: '700',
    color: '#0a0a0a',
  },

  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },

  empty: {
    flex: 1,
    paddingVertical: 80,
    alignItems: 'center',
    gap: 10,
  },
  emptyIcon: { fontSize: 40 },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0a0a0a',
  },
  emptySub: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#aaaaaa',
  },

  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  cardDateWrap: { gap: 6 },
  cardDate: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '700',
    color: '#0a0a0a',
    letterSpacing: 0.5,
  },
  durationBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: ACCENT + '66',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  durationText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#16a34a',
    fontWeight: '600',
  },

  deleteBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fca5a5',
    backgroundColor: '#fff5f5',
  },
  deleteBtnText: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
    color: '#ef4444',
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  confirmLabel: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '600',
  },
  confirmYes: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#ef4444',
  },
  confirmYesText: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  confirmNo: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dddddd',
    backgroundColor: '#f9f9f9',
  },
  confirmNoText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#555555',
    fontWeight: '600',
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f9ff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#e0e0e0',
  },
  statVal: {
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: '700',
    color: '#0a0a0a',
  },
  statGreen: { color: '#16a34a' },
  statLbl: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#aaaaaa',
    letterSpacing: 0.5,
  },

  exRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  exName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  exMeta: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#888888',
  },
});

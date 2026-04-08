import {
  View, Text, TouchableOpacity,
  StyleSheet, Modal, ScrollView,
} from 'react-native';

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

export default function WorkoutHistoryModal({ visible, onClose, completedWorkouts }) {
  const sessions = Object.values(completedWorkouts)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.sheet}>

          <View style={s.header}>
            <View>
              <Text style={s.label}>HISTORY</Text>
              <Text style={s.title}>Past Workouts</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={s.closeBtnWrap} activeOpacity={0.7}>
              <Text style={s.closeBtn}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {sessions.length === 0 ? (
              <View style={s.empty}>
                <Text style={s.emptyText}>No workout history yet</Text>
                <Text style={s.emptySub}>Finish a workout to see it here</Text>
              </View>
            ) : (
              sessions.map((session, i) => {
                const totalSets = session.exercises.reduce((sum, e) => sum + e.sets.length, 0);
                const totalVol  = session.exercises.reduce((sum, e) =>
                  sum + e.sets.reduce((s2, set) => s2 + set.weight * set.reps, 0), 0);
                return (
                  <View key={i} style={s.card}>
                    <View style={s.cardTop}>
                      <Text style={s.cardDate}>{session.date}</Text>
                      <View style={s.cardBadges}>
                        {session.duration > 0 && (
                          <View style={s.badge}>
                            <Text style={s.badgeText}>{fmtDuration(session.duration)}</Text>
                          </View>
                        )}
                        <View style={s.badge}>
                          <Text style={s.badgeText}>{totalSets} sets</Text>
                        </View>
                        <View style={[s.badge, s.badgeAccent]}>
                          <Text style={[s.badgeText, s.accentText]}>{totalVol.toLocaleString()} lbs</Text>
                        </View>
                      </View>
                    </View>
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
    backgroundColor: '#131929',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: '#253048',
    padding: 16,
    maxHeight: '88%',
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
    color: '#e8edf5',
  },
  closeBtnWrap: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f8717155',
    backgroundColor: '#1a0e0e',
  },
  closeBtn: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '600',
    color: '#f87171',
  },
  empty: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 6,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e8edf5',
  },
  emptySub: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#3d4f6b',
  },
  card: {
    backgroundColor: '#1b2438',
    borderWidth: 1,
    borderColor: '#253048',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  cardTop: {
    marginBottom: 12,
    gap: 8,
  },
  cardDate: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#8b9cbf',
    letterSpacing: 0.5,
  },
  cardBadges: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#253048',
    backgroundColor: '#131929',
  },
  badgeAccent: {
    borderColor: ACCENT + '44',
    backgroundColor: ACCENT + '11',
  },
  badgeText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#536080',
  },
  accentText: { color: ACCENT },
  exRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#1c2640',
  },
  exName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e8edf5',
    flex: 1,
  },
  exMeta: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#536080',
  },
});

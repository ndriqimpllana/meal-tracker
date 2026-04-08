import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Modal, ScrollView,
} from 'react-native';
import { useBodyWeight } from '../hooks/useBodyWeight';

const ACCENT = '#4ade80';

export default function BodyWeightModal({ visible, onClose }) {
  const [entries, setEntries] = useBodyWeight();
  const [input, setInput]     = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = entries.find(e => e.date === today);

  const logWeight = () => {
    const val = parseFloat(input);
    if (!input.trim() || isNaN(val) || val <= 0) return;
    setEntries(prev => {
      const filtered = prev.filter(e => e.date !== today);
      return [{ date: today, weight: val }, ...filtered].slice(0, 60);
    });
    setInput('');
  };

  const getTrend = (current, previous) => {
    if (!previous) return null;
    const diff = (current - previous).toFixed(1);
    if (diff > 0) return { symbol: '↑', color: '#f87171', text: `+${diff} lbs` };
    if (diff < 0) return { symbol: '↓', color: ACCENT,    text: `${diff} lbs` };
    return { symbol: '–', color: '#536080', text: 'no change' };
  };

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.sheet}>

          <View style={s.header}>
            <Text style={s.title}>Body Weight</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={s.closeBtnWrap}>
              <Text style={s.closeBtn}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          {/* Log input */}
          <View style={s.inputRow}>
            <View style={s.inputWrap}>
              <Text style={s.inputLabel}>TODAY — {today}</Text>
              <TextInput
                style={s.input}
                placeholder={todayEntry ? String(todayEntry.weight) : '0'}
                placeholderTextColor="#3d4f6b"
                value={input}
                onChangeText={setInput}
                keyboardType="decimal-pad"
                returnKeyType="done"
                onSubmitEditing={logWeight}
              />
            </View>
            <TouchableOpacity style={s.logBtn} onPress={logWeight} activeOpacity={0.7}>
              <Text style={s.logBtnText}>{todayEntry ? 'Update' : 'Log'}</Text>
            </TouchableOpacity>
          </View>

          {/* History */}
          {sorted.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyText}>No entries yet</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} style={s.list}>
              <Text style={s.sectionLabel}>HISTORY</Text>
              {sorted.map((entry, i) => {
                const prev  = sorted[i + 1];
                const trend = getTrend(entry.weight, prev?.weight);
                return (
                  <View key={entry.date} style={s.row}>
                    <Text style={s.rowDate}>{entry.date}</Text>
                    <View style={s.rowRight}>
                      {trend && (
                        <Text style={[s.rowTrend, { color: trend.color }]}>{trend.text}</Text>
                      )}
                      <Text style={s.rowWeight}>{entry.weight} lbs</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}

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
    maxHeight: '75%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
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

  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  inputWrap: { flex: 1, gap: 6 },
  inputLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#536080',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: '#0b0f1a',
    borderWidth: 1,
    borderColor: '#253048',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#e8edf5',
    fontFamily: 'monospace',
    fontSize: 20,
    textAlign: 'center',
  },
  logBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  logBtnText: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },

  empty: { paddingVertical: 30, alignItems: 'center' },
  emptyText: { fontFamily: 'monospace', fontSize: 11, color: '#3d4f6b' },

  list: { flex: 1 },
  sectionLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#3d4f6b',
    letterSpacing: 1,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1c2640',
  },
  rowDate: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#536080',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowTrend: {
    fontFamily: 'monospace',
    fontSize: 10,
  },
  rowWeight: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '600',
    color: '#e8edf5',
  },
});

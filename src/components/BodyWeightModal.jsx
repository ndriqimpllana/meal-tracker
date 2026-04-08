import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Modal, ScrollView,
} from 'react-native';
import { useBodyWeight } from '../hooks/useBodyWeight';

const ACCENT = '#16a34a';

export default function BodyWeightModal({ visible, onClose }) {
  const [entries, setEntries] = useBodyWeight();
  const [input, setInput]     = useState('');

  const today      = new Date().toISOString().split('T')[0];
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
    if (diff > 0) return { color: '#ef4444', text: `+${diff} lbs` };
    if (diff < 0) return { color: ACCENT,    text: `${diff} lbs` };
    return { color: '#9b7060', text: 'no change' };
  };

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.sheet}>

          <View style={s.header}>
            <Text style={s.title}>Body Weight</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.75} style={s.closeBtnWrap}>
              <Text style={s.closeBtn}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          <View style={s.inputRow}>
            <View style={s.inputWrap}>
              <Text style={s.inputLabel}>TODAY — {today}</Text>
              <TextInput
                style={s.input}
                placeholder={todayEntry ? String(todayEntry.weight) : '0'}
                placeholderTextColor="#d4b8b0"
                value={input}
                onChangeText={setInput}
                keyboardType="decimal-pad"
                returnKeyType="done"
                onSubmitEditing={logWeight}
              />
            </View>
            <TouchableOpacity style={s.logBtn} onPress={logWeight} activeOpacity={0.75}>
              <Text style={s.logBtnText}>{todayEntry ? 'Update' : 'Log'}</Text>
            </TouchableOpacity>
          </View>

          {sorted.length === 0 ? (
            <View style={s.empty}><Text style={s.emptyText}>No entries yet</Text></View>
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
                      {trend && <Text style={[s.rowTrend, { color: trend.color }]}>{trend.text}</Text>}
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
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(44,24,16,0.5)' },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1.5,
    borderColor: '#f5ddd4',
    padding: 16,
    maxHeight: '75%',
    shadowColor: '#2c1810',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '700', color: '#2c1810' },
  closeBtnWrap: {
    paddingVertical: 7, paddingHorizontal: 13, borderRadius: 8,
    borderWidth: 1.5, borderColor: '#fca5a5', backgroundColor: '#fff5f5',
  },
  closeBtn: { fontFamily: 'monospace', fontSize: 12, fontWeight: '700', color: '#ef4444' },

  inputRow:  { flexDirection: 'row', gap: 10, marginBottom: 20, alignItems: 'flex-end' },
  inputWrap: { flex: 1, gap: 6 },
  inputLabel:{ fontFamily: 'monospace', fontSize: 9, color: '#c8a89c', letterSpacing: 0.8, fontWeight: '700' },
  input: {
    backgroundColor: '#fff8f4', borderWidth: 1.5, borderColor: '#f0d0c4',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11,
    color: '#2c1810', fontFamily: 'monospace', fontSize: 22, textAlign: 'center', fontWeight: '700',
  },
  logBtn: {
    backgroundColor: '#2c1810', borderRadius: 10, paddingHorizontal: 22, paddingVertical: 11, justifyContent: 'center',
    shadowColor: '#2c1810', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6,
  },
  logBtnText: { fontFamily: 'monospace', fontSize: 13, fontWeight: '700', color: '#ffffff' },

  empty:     { paddingVertical: 30, alignItems: 'center' },
  emptyText: { fontFamily: 'monospace', fontSize: 11, color: '#d4b8b0' },

  list:         { flex: 1 },
  sectionLabel: { fontFamily: 'monospace', fontSize: 9, color: '#d4b8b0', letterSpacing: 1, marginBottom: 10, fontWeight: '700' },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#fdf0ea',
  },
  rowDate:   { fontFamily: 'monospace', fontSize: 11, color: '#c8a89c' },
  rowRight:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowTrend:  { fontFamily: 'monospace', fontSize: 10, fontWeight: '600' },
  rowWeight: { fontFamily: 'monospace', fontSize: 14, fontWeight: '700', color: '#2c1810' },
});

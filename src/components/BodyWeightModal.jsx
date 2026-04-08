import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { useBodyWeight } from '../hooks/useBodyWeight';

function localDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export default function BodyWeightModal({ visible, onClose }) {
  const [entries, setEntries] = useBodyWeight();
  const [input, setInput]     = useState('');

  const today      = localDateStr();
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

  const getTrend = (curr, prev) => {
    if (!prev) return null;
    const diff = (curr - prev).toFixed(1);
    if (diff > 0) return { color: '#ef4444', text: `+${diff} lbs` };
    if (diff < 0) return { color: '#30d158', text: `${diff} lbs` };
    return { color: '#9ca3af', text: 'no change' };
  };

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.sheet}>

          <View style={s.header}>
            <Text style={s.title}>Body Weight</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn} activeOpacity={0.75}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={s.inputRow}>
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>TODAY — {today}</Text>
              <TextInput
                style={s.input}
                placeholder={todayEntry ? String(todayEntry.weight) : '0'}
                placeholderTextColor="#d1d5db"
                value={input}
                onChangeText={setInput}
                keyboardType="decimal-pad"
                returnKeyType="done"
                onSubmitEditing={logWeight}
              />
            </View>
            <TouchableOpacity style={s.logBtn} onPress={logWeight} activeOpacity={0.8}>
              <Text style={s.logBtnText}>{todayEntry ? 'Update' : 'Log'}</Text>
            </TouchableOpacity>
          </View>

          {sorted.length === 0 ? (
            <View style={s.empty}><Text style={s.emptyText}>No entries yet</Text></View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} style={s.list}>
              <Text style={s.sectionLabel}>HISTORY</Text>
              {sorted.map((entry, i) => {
                const trend = getTrend(entry.weight, sorted[i+1]?.weight);
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
  overlay: { flex:1, justifyContent:'flex-end', backgroundColor:'rgba(0,0,0,0.45)' },
  sheet: {
    backgroundColor:'#ffffff', borderTopLeftRadius:28, borderTopRightRadius:28,
    padding:20, maxHeight:'75%',
    shadowColor:'#000', shadowOffset:{width:0,height:-4}, shadowOpacity:0.12, shadowRadius:20,
  },
  header: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:20 },
  title:  { fontSize:20, fontWeight:'800', color:'#1a1a1e' },
  closeBtn:    { width:34, height:34, borderRadius:17, backgroundColor:'#f3f4f6', alignItems:'center', justifyContent:'center' },
  closeBtnText:{ fontSize:14, fontWeight:'800', color:'#6b7280' },

  inputRow:   { flexDirection:'row', gap:10, marginBottom:24, alignItems:'flex-end' },
  inputGroup: { flex:1, gap:6 },
  inputLabel: { fontSize:9, fontWeight:'800', color:'#9ca3af', letterSpacing:1, textTransform:'uppercase' },
  input: {
    backgroundColor:'#f9fafb', borderWidth:1.5, borderColor:'#e5e7eb',
    borderRadius:14, paddingHorizontal:14, paddingVertical:12,
    color:'#1a1a1e', fontSize:28, textAlign:'center', fontWeight:'800',
    shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.04, shadowRadius:6,
  },
  logBtn: {
    backgroundColor:'#1a1a1e', borderRadius:14, paddingHorizontal:24, paddingVertical:12, justifyContent:'center',
    shadowColor:'#1a1a1e', shadowOffset:{width:0,height:3}, shadowOpacity:0.2, shadowRadius:10, elevation:5,
  },
  logBtnText: { fontSize:14, fontWeight:'800', color:'#ffffff' },

  empty:     { paddingVertical:30, alignItems:'center' },
  emptyText: { fontSize:12, fontWeight:'500', color:'#d1d5db' },

  list:         { flex:1 },
  sectionLabel: { fontSize:9, fontWeight:'800', color:'#d1d5db', letterSpacing:1.5, textTransform:'uppercase', marginBottom:12 },
  row: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:13, borderBottomWidth:1, borderBottomColor:'#f9fafb' },
  rowDate:   { fontSize:12, fontWeight:'600', color:'#9ca3af' },
  rowRight:  { flexDirection:'row', alignItems:'center', gap:12 },
  rowTrend:  { fontSize:11, fontWeight:'700' },
  rowWeight: { fontSize:15, fontWeight:'800', color:'#1a1a1e' },
});

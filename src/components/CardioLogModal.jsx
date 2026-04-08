import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Modal, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ACTIVITY_TYPES = [
  { id: 'run',   label: 'Run',   emoji: '🏃', color: '#ef4444', hasDistance: true,  unit: 'mi' },
  { id: 'walk',  label: 'Walk',  emoji: '🚶', color: '#0a84ff', hasDistance: true,  unit: 'mi' },
  { id: 'cycle', label: 'Cycle', emoji: '🚴', color: '#f59e0b', hasDistance: true,  unit: 'mi' },
  { id: 'swim',  label: 'Swim',  emoji: '🏊', color: '#06b6d4', hasDistance: true,  unit: 'yd' },
  { id: 'hiit',  label: 'HIIT',  emoji: '⚡', color: '#ff6b35', hasDistance: false, unit: null },
  { id: 'yoga',  label: 'Yoga',  emoji: '🧘', color: '#30d158', hasDistance: false, unit: null },
  { id: 'rest',  label: 'Rest',  emoji: '😴', color: '#af52de', hasDistance: false, unit: null },
  { id: 'other', label: 'Other', emoji: '🏅', color: '#9ca3af', hasDistance: false, unit: null },
];

function localDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export default function CardioLogModal({ visible, onClose, onSave }) {
  const [type,     setType]     = useState('run');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [calories, setCalories] = useState('');
  const [notes,    setNotes]    = useState('');

  const activeType  = ACTIVITY_TYPES.find(t => t.id === type);
  const accentColor = activeType?.color ?? '#30d158';
  const canSave     = type === 'rest' || duration.trim().length > 0;

  const reset = () => { setType('run'); setDuration(''); setDistance(''); setCalories(''); setNotes(''); };

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id:       `cardio_${Date.now()}`,
      type,
      duration: parseFloat(duration) || 0,
      distance: parseFloat(distance) || 0,
      calories: parseFloat(calories) || 0,
      notes:    notes.trim(),
      date:     localDateStr(),
    });
    reset(); onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={s.root}>

        <View style={s.header}>
          <View>
            <Text style={s.badge}>LOG ACTIVITY</Text>
            <Text style={s.title}>Track Your Move</Text>
          </View>
          <TouchableOpacity onPress={() => { reset(); onClose(); }} style={s.closeBtn} activeOpacity={0.75}>
            <Text style={s.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

          <Text style={s.sectionLabel}>ACTIVITY TYPE</Text>
          <View style={s.typeGrid}>
            {ACTIVITY_TYPES.map(t => {
              const active = type === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[s.typeBtn, active && { backgroundColor: t.color + '18', borderColor: t.color, borderWidth: 2 }]}
                  onPress={() => setType(t.id)}
                  activeOpacity={0.75}
                >
                  <Text style={s.typeEmoji}>{t.emoji}</Text>
                  <Text style={[s.typeLabel, active && { color: t.color, fontWeight: '800' }]}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {type !== 'rest' && (
            <>
              <View style={s.field}>
                <Text style={s.fieldLabel}>DURATION (MINUTES) *</Text>
                <TextInput style={[s.input, { borderColor: accentColor + '66' }]}
                  placeholder="e.g. 30" placeholderTextColor="#d1d5db"
                  value={duration} onChangeText={setDuration} keyboardType="decimal-pad" returnKeyType="done"
                />
              </View>
              {activeType?.hasDistance && (
                <View style={s.field}>
                  <Text style={s.fieldLabel}>DISTANCE ({activeType.unit?.toUpperCase()}) — optional</Text>
                  <TextInput style={[s.input, { borderColor: accentColor + '66' }]}
                    placeholder="e.g. 3.1" placeholderTextColor="#d1d5db"
                    value={distance} onChangeText={setDistance} keyboardType="decimal-pad" returnKeyType="done"
                  />
                </View>
              )}
              <View style={s.field}>
                <Text style={s.fieldLabel}>CALORIES BURNED — optional</Text>
                <TextInput style={[s.input, { borderColor: accentColor + '66' }]}
                  placeholder="e.g. 280" placeholderTextColor="#d1d5db"
                  value={calories} onChangeText={setCalories} keyboardType="number-pad" returnKeyType="done"
                />
              </View>
            </>
          )}

          <View style={s.field}>
            <Text style={s.fieldLabel}>NOTES — optional</Text>
            <TextInput style={[s.input, s.inputMulti]}
              placeholder={type === 'rest' ? 'Recovery notes...' : 'How did it feel?'}
              placeholderTextColor="#d1d5db"
              value={notes} onChangeText={setNotes}
              multiline numberOfLines={3} textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[s.saveBtn, { backgroundColor: canSave ? accentColor : '#e5e7eb' }]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={!canSave}
          >
            <Text style={[s.saveBtnText, !canSave && { color: '#9ca3af' }]}>
              {activeType?.emoji}  {type === 'rest' ? 'Log Rest Day' : `Log ${activeType?.label}`}
            </Text>
          </TouchableOpacity>

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
    borderBottomWidth:1, borderBottomColor:'#e5e7eb',
  },
  badge: { fontSize:10, fontWeight:'800', color:'#30d158', letterSpacing:2, marginBottom:4 },
  title: { fontSize:26, fontWeight:'800', color:'#1a1a1e' },
  closeBtn:    { width:36, height:36, borderRadius:18, backgroundColor:'#1a1a1e', alignItems:'center', justifyContent:'center', marginTop:4 },
  closeBtnText:{ fontSize:14, fontWeight:'800', color:'#ffffff' },

  scroll:  { flex:1 },
  content: { padding:20, paddingBottom:40 },

  sectionLabel: { fontSize:10, fontWeight:'800', color:'#9ca3af', letterSpacing:1.5, textTransform:'uppercase', marginBottom:12 },

  typeGrid: { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:8 },
  typeBtn: {
    width:'23%', alignItems:'center', paddingVertical:14,
    borderRadius:16, borderWidth:1.5, borderColor:'#e5e7eb',
    backgroundColor:'#ffffff', gap:6,
    shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.05, shadowRadius:6, elevation:1,
  },
  typeEmoji: { fontSize:24 },
  typeLabel: { fontSize:10, fontWeight:'600', color:'#9ca3af' },

  field:      { marginTop:20 },
  fieldLabel: { fontSize:10, fontWeight:'800', color:'#9ca3af', letterSpacing:1, textTransform:'uppercase', marginBottom:8 },
  input: {
    backgroundColor:'#ffffff', borderWidth:1.5, borderRadius:14,
    paddingHorizontal:16, paddingVertical:14,
    color:'#1a1a1e', fontSize:16, fontWeight:'600',
    shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.04, shadowRadius:6,
  },
  inputMulti: { height:90, paddingTop:14, fontSize:14, fontWeight:'400' },

  saveBtn: {
    marginTop:28, borderRadius:16, paddingVertical:18, alignItems:'center',
    shadowOffset:{width:0,height:4}, shadowOpacity:0.25, shadowRadius:12, elevation:6,
  },
  saveBtnText: { fontSize:15, fontWeight:'800', color:'#ffffff', letterSpacing:0.3 },
});

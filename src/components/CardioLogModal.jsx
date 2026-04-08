import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Modal, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ACTIVITY_TYPES = [
  { id: 'run',   label: 'Run',   emoji: '🏃', color: '#ef4444', hasDistance: true,  unit: 'mi' },
  { id: 'walk',  label: 'Walk',  emoji: '🚶', color: '#3b82f6', hasDistance: true,  unit: 'mi' },
  { id: 'cycle', label: 'Cycle', emoji: '🚴', color: '#f59e0b', hasDistance: true,  unit: 'mi' },
  { id: 'swim',  label: 'Swim',  emoji: '🏊', color: '#06b6d4', hasDistance: true,  unit: 'yd' },
  { id: 'hiit',  label: 'HIIT',  emoji: '⚡', color: '#f97316', hasDistance: false, unit: null },
  { id: 'yoga',  label: 'Yoga',  emoji: '🧘', color: '#10b981', hasDistance: false, unit: null },
  { id: 'rest',  label: 'Rest',  emoji: '😴', color: '#8b5cf6', hasDistance: false, unit: null },
  { id: 'other', label: 'Other', emoji: '🏅', color: '#6b7280', hasDistance: false, unit: null },
];

function localDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function CardioLogModal({ visible, onClose, onSave, initialEntry }) {
  const [type,     setType]     = useState(initialEntry?.type     ?? 'run');
  const [duration, setDuration] = useState(initialEntry?.duration ? String(initialEntry.duration) : '');
  const [distance, setDistance] = useState(initialEntry?.distance ? String(initialEntry.distance) : '');
  const [calories, setCalories] = useState(initialEntry?.calories ? String(initialEntry.calories) : '');
  const [notes,    setNotes]    = useState(initialEntry?.notes    ?? '');

  const activeType = ACTIVITY_TYPES.find(t => t.id === type);
  const canSave    = type === 'rest' || duration.trim().length > 0;
  const accentColor = activeType?.color ?? '#f97316';

  const reset = () => {
    setType('run'); setDuration(''); setDistance(''); setCalories(''); setNotes('');
  };

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id:       initialEntry?.id ?? `cardio_${Date.now()}`,
      type,
      duration: parseFloat(duration) || 0,
      distance: parseFloat(distance) || 0,
      calories: parseFloat(calories) || 0,
      notes:    notes.trim(),
      date:     localDateStr(),
    });
    reset();
    onClose();
  };

  const handleClose = () => { reset(); onClose(); };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={s.root}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.headerLabel}>LOG ACTIVITY</Text>
            <Text style={s.headerTitle}>Track Your Move</Text>
          </View>
          <TouchableOpacity onPress={handleClose} activeOpacity={0.75} style={s.closeBtnWrap}>
            <Text style={s.closeBtn}>✕ Close</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

          {/* Activity type — row 1 */}
          <Text style={s.sectionLabel}>ACTIVITY TYPE</Text>
          <View style={s.typeRow}>
            {ACTIVITY_TYPES.slice(0, 4).map(t => (
              <TouchableOpacity
                key={t.id}
                style={[s.typeBtn, type === t.id && { backgroundColor: t.color + '1a', borderColor: t.color }]}
                onPress={() => setType(t.id)}
                activeOpacity={0.75}
              >
                <Text style={s.typeEmoji}>{t.emoji}</Text>
                <Text style={[s.typeLabel, type === t.id && { color: t.color, fontWeight: '700' }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Activity type — row 2 */}
          <View style={[s.typeRow, { marginTop: 8 }]}>
            {ACTIVITY_TYPES.slice(4).map(t => (
              <TouchableOpacity
                key={t.id}
                style={[s.typeBtn, type === t.id && { backgroundColor: t.color + '1a', borderColor: t.color }]}
                onPress={() => setType(t.id)}
                activeOpacity={0.75}
              >
                <Text style={s.typeEmoji}>{t.emoji}</Text>
                <Text style={[s.typeLabel, type === t.id && { color: t.color, fontWeight: '700' }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {type !== 'rest' && (
            <>
              <View style={s.field}>
                <Text style={s.fieldLabel}>DURATION (MINUTES) *</Text>
                <TextInput
                  style={[s.input, { borderColor: accentColor + '55' }]}
                  placeholder="e.g. 30"
                  placeholderTextColor="#d4b8b0"
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                />
              </View>

              {activeType?.hasDistance && (
                <View style={s.field}>
                  <Text style={s.fieldLabel}>DISTANCE ({activeType.unit.toUpperCase()}) — optional</Text>
                  <TextInput
                    style={[s.input, { borderColor: accentColor + '55' }]}
                    placeholder="e.g. 3.1"
                    placeholderTextColor="#d4b8b0"
                    value={distance}
                    onChangeText={setDistance}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                  />
                </View>
              )}

              <View style={s.field}>
                <Text style={s.fieldLabel}>CALORIES BURNED — optional</Text>
                <TextInput
                  style={[s.input, { borderColor: accentColor + '55' }]}
                  placeholder="e.g. 280"
                  placeholderTextColor="#d4b8b0"
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="number-pad"
                  returnKeyType="done"
                />
              </View>
            </>
          )}

          <View style={s.field}>
            <Text style={s.fieldLabel}>NOTES — optional</Text>
            <TextInput
              style={[s.input, s.inputMulti]}
              placeholder={type === 'rest' ? 'Recovery notes...' : 'How did it feel?'}
              placeholderTextColor="#d4b8b0"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[s.saveBtn, { backgroundColor: canSave ? accentColor : '#f0d0c4' }]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={!canSave}
          >
            <Text style={[s.saveBtnText, !canSave && s.saveBtnTextDisabled]}>
              {activeType?.emoji}  {type === 'rest' ? 'Log Rest Day' : `Log ${activeType?.label}`}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fef3ee' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
    borderBottomWidth: 1.5, borderBottomColor: '#f5ddd4',
  },
  headerLabel: { fontFamily: 'monospace', fontSize: 10, color: '#f97316', letterSpacing: 2, fontWeight: '700', marginBottom: 4 },
  headerTitle: { fontSize: 26, fontWeight: '700', color: '#2c1810' },
  closeBtnWrap: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8,
    borderWidth: 1.5, borderColor: '#fca5a5', backgroundColor: '#fff5f5', marginTop: 4,
  },
  closeBtn: { fontFamily: 'monospace', fontSize: 13, fontWeight: '700', color: '#ef4444' },

  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },

  sectionLabel: { fontFamily: 'monospace', fontSize: 10, color: '#c8a89c', letterSpacing: 1.5, fontWeight: '700', marginBottom: 12 },

  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 13,
    borderRadius: 14, borderWidth: 1.5, borderColor: '#f0d0c4',
    backgroundColor: '#fff8f4', gap: 5,
    shadowColor: '#c4906c', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  typeEmoji: { fontSize: 22 },
  typeLabel: { fontFamily: 'monospace', fontSize: 10, fontWeight: '600', color: '#c8a89c' },

  field: { marginTop: 20 },
  fieldLabel: { fontFamily: 'monospace', fontSize: 10, color: '#c8a89c', letterSpacing: 1, fontWeight: '700', marginBottom: 8 },
  input: {
    backgroundColor: '#ffffff', borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 14,
    color: '#2c1810', fontSize: 16, fontWeight: '600',
    shadowColor: '#c4906c', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4,
  },
  inputMulti: { height: 90, paddingTop: 14, fontSize: 14, fontWeight: '400' },

  saveBtn: {
    marginTop: 28, borderRadius: 14, paddingVertical: 17, alignItems: 'center',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  saveBtnText:         { fontFamily: 'monospace', fontSize: 14, fontWeight: '700', color: '#ffffff', letterSpacing: 0.3 },
  saveBtnTextDisabled: { color: '#c8a89c' },
});

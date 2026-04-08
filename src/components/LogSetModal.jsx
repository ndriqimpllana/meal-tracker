import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, Modal,
} from 'react-native';

export default function LogSetModal({ visible, exercise, date, sets, onAdd, onRemove, onClose }) {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  const handleAdd = () => {
    if (!weight.trim() || !reps.trim()) return;
    onAdd({ weight: parseFloat(weight), reps: parseInt(reps) });
    setWeight('');
    setReps('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.sheet}>

          <View style={s.sheetHeader}>
            <View style={s.titleBlock}>
              <Text style={s.sheetTitle}>{exercise?.name}</Text>
              <Text style={s.sheetMeta}>{exercise?.category} · {exercise?.equipment}</Text>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={s.closeBtn}>Close</Text>
            </TouchableOpacity>
          </View>

          {/* Set input */}
          <View style={s.inputRow}>
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>KG</Text>
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

          {/* Logged sets */}
          {sets.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyText}>No sets logged yet</Text>
            </View>
          ) : (
            <>
              <View style={s.setsHeader}>
                <Text style={s.setsHeaderText}>SET</Text>
                <Text style={s.setsHeaderText}>KG</Text>
                <Text style={s.setsHeaderText}>REPS</Text>
                <Text style={s.setsHeaderText}></Text>
              </View>
              <FlatList
                data={sets}
                keyExtractor={(_, i) => String(i)}
                renderItem={({ item, index }) => (
                  <View style={s.setRow}>
                    <Text style={s.setNum}>{index + 1}</Text>
                    <Text style={s.setValue}>{item.weight} kg</Text>
                    <Text style={s.setValue}>{item.reps}</Text>
                    <TouchableOpacity onPress={() => onRemove(index)} activeOpacity={0.7}>
                      <Text style={s.removeBtn}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
                ItemSeparatorComponent={() => <View style={s.separator} />}
              />
            </>
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
    backgroundColor: '#111111',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: '#242424',
    padding: 16,
    maxHeight: '80%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleBlock: { gap: 3 },
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
  },

  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
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
    fontSize: 16,
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
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#666666',
  },

  setsHeader: {
    flexDirection: 'row',
    marginBottom: 8,
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
    paddingVertical: 10,
    paddingHorizontal: 4,
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
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#444444',
    textAlign: 'right',
  },
  separator: {
    height: 1,
    backgroundColor: '#1a1a1a',
  },
});

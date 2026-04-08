import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, Modal, ActivityIndicator,
} from 'react-native';

export default function ExerciseSearchModal({ visible, onClose, onAdd }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(query)}&language=english&format=json`
      );
      const data = await res.json();
      setResults(data.suggestions ?? []);
    } catch (e) {
      setError('Could not connect. Check your internet.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (item) => {
    onAdd({
      id: item.data.base_id,
      name: item.value,
      category: item.data.category,
      equipment: item.data.equipment?.join(', ') || 'None',
    });
    onClose();
    setQuery('');
    setResults([]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.sheet}>

          <View style={s.sheetHeader}>
            <Text style={s.sheetTitle}>Add Exercise</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={s.closeBtn}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={s.searchRow}>
            <TextInput
              style={s.input}
              placeholder="Search exercises..."
              placeholderTextColor="#555555"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={search}
              returnKeyType="search"
              autoFocus
            />
            <TouchableOpacity style={s.searchBtn} onPress={search} activeOpacity={0.7}>
              <Text style={s.searchBtnText}>Search</Text>
            </TouchableOpacity>
          </View>

          {loading && <ActivityIndicator color="#ffffff" style={s.loader} />}
          {error && <Text style={s.error}>{error}</Text>}

          <FlatList
            data={results}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <TouchableOpacity style={s.result} onPress={() => handleAdd(item)} activeOpacity={0.7}>
                <Text style={s.resultName}>{item.value}</Text>
                <Text style={s.resultMeta}>
                  {item.data.category} · {item.data.equipment?.join(', ') || 'No equipment'}
                </Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={s.separator} />}
            ListEmptyComponent={
              !loading && query.length > 0 ? (
                <Text style={s.noResults}>No results — try a different term</Text>
              ) : null
            }
          />

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
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeBtn: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#666666',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  searchBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  searchBtnText: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '600',
    color: '#000000',
  },
  loader: { marginVertical: 20 },
  error: {
    color: '#ff4444',
    fontFamily: 'monospace',
    fontSize: 11,
    marginBottom: 12,
  },
  result: {
    paddingVertical: 12,
    gap: 3,
  },
  resultName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  resultMeta: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#666666',
  },
  separator: {
    height: 1,
    backgroundColor: '#1e1e1e',
  },
  noResults: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

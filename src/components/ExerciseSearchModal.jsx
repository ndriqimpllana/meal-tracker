import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, Modal, ActivityIndicator, ScrollView,
} from 'react-native';

const ACCENT = '#4ade80';

const CATEGORIES = [
  { label: 'Arms',      id: 8  },
  { label: 'Chest',     id: 11 },
  { label: 'Back',      id: 12 },
  { label: 'Legs',      id: 9  },
  { label: 'Shoulders', id: 13 },
  { label: 'Abs',       id: 10 },
  { label: 'Calves',    id: 14 },
];

export default function ExerciseSearchModal({ visible, onClose, onAdd }) {
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  const reset = () => {
    setQuery('');
    setResults([]);
    setError(null);
    setActiveCategory(null);
  };

  const searchByText = async (term) => {
    if (!term.trim()) return;
    setLoading(true);
    setError(null);
    setActiveCategory(null);
    try {
      const res  = await fetch(
        `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(term)}&language=english&format=json`
      );
      const data = await res.json();
      setResults((data.suggestions ?? []).map(item => ({
        id:        item.data.base_id,
        name:      item.value,
        category:  item.data.category,
        equipment: item.data.equipment?.join(', ') || 'None',
      })));
    } catch {
      setError('Could not connect. Check your internet.');
    } finally {
      setLoading(false);
    }
  };

  const searchByCategory = async (cat) => {
    setActiveCategory(cat.id);
    setQuery('');
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(
        `https://wger.de/api/v2/exerciseinfo/?format=json&language=2&category=${cat.id}&limit=30`
      );
      const data = await res.json();
      const exercises = (data.results ?? []).map(item => {
        const en = item.translations?.find(t => t.language === 2);
        if (!en?.name) return null;
        return {
          id:        item.id,
          name:      en.name,
          category:  item.category?.name ?? cat.label,
          equipment: item.equipment?.map(e => e.name).join(', ') || 'None',
        };
      }).filter(Boolean);
      setResults(exercises);
    } catch {
      setError('Could not connect. Check your internet.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (item) => {
    onAdd(item);
    onClose();
    reset();
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.sheet}>

          {/* Header */}
          <View style={s.sheetHeader}>
            <Text style={s.sheetTitle}>Add Exercise</Text>
            <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
              <Text style={s.closeBtn}>Close</Text>
            </TouchableOpacity>
          </View>

          {/* Text search */}
          <View style={s.searchRow}>
            <TextInput
              style={s.input}
              placeholder="Search by name..."
              placeholderTextColor="#555555"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => searchByText(query)}
              returnKeyType="search"
              autoFocus
            />
            <TouchableOpacity style={s.searchBtn} onPress={() => searchByText(query)} activeOpacity={0.7}>
              <Text style={s.searchBtnText}>Search</Text>
            </TouchableOpacity>
          </View>

          {/* Muscle group chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.chips}
            style={s.chipsScroll}
          >
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[s.chip, activeCategory === cat.id && s.chipActive]}
                onPress={() => activeCategory === cat.id ? (setActiveCategory(null), setResults([])) : searchByCategory(cat)}
                activeOpacity={0.7}
              >
                <Text style={[s.chipText, activeCategory === cat.id && s.chipTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loading && <ActivityIndicator color={ACCENT} style={s.loader} />}
          {error   && <Text style={s.error}>{error}</Text>}

          <FlatList
            data={results}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <TouchableOpacity style={s.result} onPress={() => handleAdd(item)} activeOpacity={0.7}>
                <Text style={s.resultName}>{item.name}</Text>
                <Text style={s.resultMeta}>{item.category} · {item.equipment}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={s.separator} />}
            ListEmptyComponent={
              !loading && (query.length > 0 || activeCategory) ? (
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
    maxHeight: '85%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
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
    marginBottom: 12,
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

  chipsScroll: { marginBottom: 14, paddingBottom: 6 },
  chips: { gap: 6, paddingRight: 4, paddingTop: 4, paddingBottom: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#242424',
    backgroundColor: '#000000',
  },
  chipActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  chipText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#666666',
    letterSpacing: 0.3,
  },
  chipTextActive: {
    color: '#000000',
    fontWeight: '600',
  },

  loader: { marginVertical: 20 },
  error: {
    color: '#f87171',
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

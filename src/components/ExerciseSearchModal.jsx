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
  const [query, setQuery]                   = useState('');
  const [results, setResults]               = useState([]);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [mode, setMode]                     = useState('search'); // 'search' | 'custom'

  // Custom exercise fields
  const [customName, setCustomName]         = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [customEquipment, setCustomEquipment] = useState('');

  const reset = () => {
    setQuery('');
    setResults([]);
    setError(null);
    setActiveCategory(null);
    setMode('search');
    setCustomName('');
    setCustomCategory('');
    setCustomEquipment('');
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

  const handleAddCustom = () => {
    if (!customName.trim()) return;
    onAdd({
      id:        `custom_${Date.now()}`,
      name:      customName.trim(),
      category:  customCategory.trim() || 'Custom',
      equipment: customEquipment.trim() || 'None',
    });
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
            <TouchableOpacity onPress={handleClose} activeOpacity={0.7} style={s.closeBtnWrap}>
              <Text style={s.closeBtn}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          {/* Mode toggle */}
          <View style={s.modeRow}>
            <TouchableOpacity
              style={[s.modeBtn, mode === 'search' && s.modeBtnActive]}
              onPress={() => setMode('search')}
              activeOpacity={0.7}
            >
              <Text style={[s.modeBtnText, mode === 'search' && s.modeBtnTextActive]}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.modeBtn, mode === 'custom' && s.modeBtnActive]}
              onPress={() => setMode('custom')}
              activeOpacity={0.7}
            >
              <Text style={[s.modeBtnText, mode === 'custom' && s.modeBtnTextActive]}>Custom</Text>
            </TouchableOpacity>
          </View>

          {mode === 'search' ? (
            <>
              {/* Text search */}
              <View style={s.searchRow}>
                <TextInput
                  style={s.input}
                  placeholder="Search by name..."
                  placeholderTextColor="#3d4f6b"
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
            </>
          ) : (
            /* Custom exercise form */
            <View style={s.customForm}>
              <Text style={s.customHint}>Can't find it? Create your own exercise.</Text>

              <View style={s.customField}>
                <Text style={s.customLabel}>EXERCISE NAME *</Text>
                <TextInput
                  style={s.customInput}
                  placeholder="e.g. Cable Face Pull"
                  placeholderTextColor="#3d4f6b"
                  value={customName}
                  onChangeText={setCustomName}
                  autoFocus
                />
              </View>

              <View style={s.customField}>
                <Text style={s.customLabel}>MUSCLE GROUP</Text>
                <TextInput
                  style={s.customInput}
                  placeholder="e.g. Shoulders"
                  placeholderTextColor="#3d4f6b"
                  value={customCategory}
                  onChangeText={setCustomCategory}
                />
              </View>

              <View style={s.customField}>
                <Text style={s.customLabel}>EQUIPMENT</Text>
                <TextInput
                  style={s.customInput}
                  placeholder="e.g. Cable Machine"
                  placeholderTextColor="#3d4f6b"
                  value={customEquipment}
                  onChangeText={setCustomEquipment}
                />
              </View>

              <TouchableOpacity
                style={[s.customAddBtn, !customName.trim() && s.customAddBtnDisabled]}
                onPress={handleAddCustom}
                activeOpacity={0.7}
              >
                <Text style={s.customAddBtnText}>Add Custom Exercise</Text>
              </TouchableOpacity>
            </View>
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

  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#253048',
    alignItems: 'center',
    backgroundColor: '#0b0f1a',
  },
  modeBtnActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  modeBtnText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#536080',
  },
  modeBtnTextActive: {
    color: '#000000',
    fontWeight: '600',
  },

  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#0b0f1a',
    borderWidth: 1,
    borderColor: '#253048',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#e8edf5',
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

  chipsScroll: { marginBottom: 14, height: 44 },
  chips: { gap: 6, paddingRight: 4, alignItems: 'center' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#253048',
    backgroundColor: '#0b0f1a',
  },
  chipActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  chipText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#536080',
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
    color: '#e8edf5',
  },
  resultMeta: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#536080',
  },
  separator: {
    height: 1,
    backgroundColor: '#1c2640',
  },
  noResults: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#536080',
    textAlign: 'center',
    paddingVertical: 20,
  },

  // Custom form
  customForm: { gap: 16 },
  customHint: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#536080',
    marginBottom: 4,
  },
  customField: { gap: 6 },
  customLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#536080',
    letterSpacing: 0.8,
  },
  customInput: {
    backgroundColor: '#0b0f1a',
    borderWidth: 1,
    borderColor: '#253048',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: '#e8edf5',
    fontFamily: 'monospace',
    fontSize: 13,
  },
  customAddBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  customAddBtnDisabled: {
    backgroundColor: '#253048',
  },
  customAddBtnText: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
});

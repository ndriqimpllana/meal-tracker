import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, Modal, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ACCENT = '#16a34a';

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
  const [query, setQuery]                     = useState('');
  const [results, setResults]                 = useState([]);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState(null);
  const [activeCategory, setActiveCategory]   = useState(null);
  const [mode, setMode]                       = useState('search');
  const [customName, setCustomName]           = useState('');
  const [customCategory, setCustomCategory]   = useState('');
  const [customEquipment, setCustomEquipment] = useState('');

  const reset = () => {
    setQuery(''); setResults([]); setError(null); setActiveCategory(null);
    setMode('search'); setCustomName(''); setCustomCategory(''); setCustomEquipment('');
  };

  const searchByText = async (term) => {
    if (!term.trim()) return;
    setLoading(true); setError(null); setActiveCategory(null);
    try {
      const res  = await fetch(`https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(term)}&language=english&format=json`);
      const data = await res.json();
      setResults((data.suggestions ?? []).map(item => ({
        id: item.data.base_id, name: item.value,
        category: item.data.category,
        equipment: item.data.equipment?.join(', ') || 'None',
      })));
    } catch { setError('Could not connect. Check your internet.'); }
    finally { setLoading(false); }
  };

  const searchByCategory = async (cat) => {
    setActiveCategory(cat.id); setQuery(''); setLoading(true); setError(null);
    try {
      const res  = await fetch(`https://wger.de/api/v2/exerciseinfo/?format=json&language=2&category=${cat.id}&limit=30`);
      const data = await res.json();
      setResults((data.results ?? []).map(item => {
        const en = item.translations?.find(t => t.language === 2);
        if (!en?.name) return null;
        return { id: item.id, name: en.name, category: item.category?.name ?? cat.label, equipment: item.equipment?.map(e => e.name).join(', ') || 'None' };
      }).filter(Boolean));
    } catch { setError('Could not connect. Check your internet.'); }
    finally { setLoading(false); }
  };

  const handleAdd      = (item) => { onAdd(item); onClose(); reset(); };
  const handleAddCustom = () => {
    if (!customName.trim()) return;
    onAdd({ id: `custom_${Date.now()}`, name: customName.trim(), category: customCategory.trim() || 'Custom', equipment: customEquipment.trim() || 'None' });
    onClose(); reset();
  };
  const handleClose = () => { onClose(); reset(); };

  // Rendered above FlatList results — stays anchored right under search bar
  const SearchHeader = (
    <View>
      {/* Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips} style={s.chipsScroll}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[s.chip, activeCategory === cat.id && s.chipActive]}
            onPress={() => activeCategory === cat.id ? (setActiveCategory(null), setResults([])) : searchByCategory(cat)}
            activeOpacity={0.75}
          >
            <Text style={[s.chipText, activeCategory === cat.id && s.chipTextActive]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && <ActivityIndicator color={ACCENT} style={s.loader} />}
      {error   && <Text style={s.error}>{error}</Text>}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={s.root}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.headerLabel}>EXERCISES</Text>
            <Text style={s.headerTitle}>Add Exercise</Text>
          </View>
          <TouchableOpacity onPress={handleClose} activeOpacity={0.75} style={s.closeBtnWrap}>
            <Text style={s.closeBtn}>✕ Close</Text>
          </TouchableOpacity>
        </View>

        {/* Mode toggle */}
        <View style={s.modeRow}>
          <TouchableOpacity style={[s.modeBtn, mode === 'search' && s.modeBtnActive]} onPress={() => setMode('search')} activeOpacity={0.75}>
            <Text style={[s.modeBtnText, mode === 'search' && s.modeBtnTextActive]}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.modeBtn, mode === 'custom' && s.modeBtnActive]} onPress={() => setMode('custom')} activeOpacity={0.75}>
            <Text style={[s.modeBtnText, mode === 'custom' && s.modeBtnTextActive]}>Custom</Text>
          </TouchableOpacity>
        </View>

        {mode === 'search' ? (
          <View style={s.searchPane}>
            {/* Search input */}
            <View style={s.searchRow}>
              <TextInput
                style={s.input}
                placeholder="Search by name..."
                placeholderTextColor="#d4b8b0"
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={() => searchByText(query)}
                returnKeyType="search"
                autoFocus
              />
              <TouchableOpacity style={s.searchBtn} onPress={() => searchByText(query)} activeOpacity={0.75}>
                <Text style={s.searchBtnText}>Search</Text>
              </TouchableOpacity>
            </View>

            {/* FlatList with chips as header — chips always right below search */}
            <FlatList
              data={results}
              keyExtractor={(_, i) => String(i)}
              ListHeaderComponent={SearchHeader}
              renderItem={({ item }) => (
                <TouchableOpacity style={s.result} onPress={() => handleAdd(item)} activeOpacity={0.75}>
                  <View style={s.resultInner}>
                    <View style={s.resultLeft}>
                      <Text style={s.resultName}>{item.name}</Text>
                      <Text style={s.resultMeta}>{item.category} · {item.equipment}</Text>
                    </View>
                    <Text style={s.resultAdd}>+ Add</Text>
                  </View>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={s.separator} />}
              ListEmptyComponent={
                !loading && (query.length > 0 || activeCategory) ? (
                  <Text style={s.noResults}>No results — try a different term</Text>
                ) : null
              }
              keyboardShouldPersistTaps="handled"
            />
          </View>
        ) : (
          <ScrollView style={s.customScroll} contentContainerStyle={s.customForm} keyboardShouldPersistTaps="handled">
            <Text style={s.customHint}>Can't find it? Create your own exercise.</Text>

            {[
              { label: 'EXERCISE NAME *', placeholder: 'e.g. Cable Face Pull', val: customName, set: setCustomName, focus: true },
              { label: 'MUSCLE GROUP',   placeholder: 'e.g. Shoulders',       val: customCategory, set: setCustomCategory },
              { label: 'EQUIPMENT',      placeholder: 'e.g. Cable Machine',   val: customEquipment, set: setCustomEquipment },
            ].map(({ label, placeholder, val, set, focus }) => (
              <View key={label} style={s.customField}>
                <Text style={s.customLabel}>{label}</Text>
                <TextInput
                  style={s.customInput}
                  placeholder={placeholder}
                  placeholderTextColor="#d4b8b0"
                  value={val}
                  onChangeText={set}
                  autoFocus={!!focus}
                />
              </View>
            ))}

            <TouchableOpacity
              style={[s.customAddBtn, !customName.trim() && s.customAddBtnDisabled]}
              onPress={handleAddCustom}
              activeOpacity={0.75}
            >
              <Text style={[s.customAddBtnText, !customName.trim() && s.customAddBtnTextDisabled]}>
                Add Custom Exercise
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}

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

  modeRow: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#f5ddd4',
  },
  modeBtn: {
    flex: 1, paddingVertical: 11, borderRadius: 12, borderWidth: 1.5,
    borderColor: '#f0d0c4', alignItems: 'center', backgroundColor: '#fff8f4',
  },
  modeBtnActive:     { backgroundColor: '#2c1810', borderColor: '#2c1810' },
  modeBtnText:       { fontFamily: 'monospace', fontSize: 13, fontWeight: '600', color: '#c8a89c' },
  modeBtnTextActive: { color: '#ffffff', fontWeight: '700' },

  searchPane: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  searchRow:  { flexDirection: 'row', gap: 10, marginBottom: 14 },
  input: {
    flex: 1, backgroundColor: '#ffffff', borderWidth: 1.5, borderColor: '#f0d0c4',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    color: '#2c1810', fontSize: 14,
    shadowColor: '#c4906c', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4,
  },
  searchBtn: {
    backgroundColor: '#2c1810', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center',
    shadowColor: '#2c1810', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6,
  },
  searchBtnText: { fontFamily: 'monospace', fontSize: 13, fontWeight: '700', color: '#ffffff' },

  chipsScroll: { marginBottom: 12, height: 40 },
  chips: { gap: 6, paddingRight: 4, alignItems: 'center' },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#16a34a55', backgroundColor: '#f0fdf4',
  },
  chipActive:     { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  chipText:       { fontFamily: 'monospace', fontSize: 11, fontWeight: '700', color: '#16a34a' },
  chipTextActive: { color: '#ffffff' },

  loader: { marginVertical: 20 },
  error:  { color: '#ef4444', fontFamily: 'monospace', fontSize: 12, marginBottom: 12 },

  result: { paddingVertical: 2 },
  resultInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13 },
  resultLeft:  { flex: 1, gap: 3 },
  resultName:  { fontSize: 15, fontWeight: '700', color: '#2c1810' },
  resultMeta:  { fontFamily: 'monospace', fontSize: 11, color: '#c8a89c' },
  resultAdd:   { fontFamily: 'monospace', fontSize: 12, fontWeight: '700', color: '#16a34a', paddingLeft: 12 },
  separator:   { height: 1, backgroundColor: '#fdf0ea' },
  noResults:   { fontFamily: 'monospace', fontSize: 12, color: '#d4b8b0', textAlign: 'center', paddingVertical: 24 },

  customScroll: { flex: 1 },
  customForm:   { gap: 20, padding: 20 },
  customHint:   { fontSize: 13, color: '#9b7060', marginBottom: 4 },
  customField:  { gap: 8 },
  customLabel:  { fontFamily: 'monospace', fontSize: 10, color: '#c8a89c', letterSpacing: 1, fontWeight: '700' },
  customInput: {
    backgroundColor: '#ffffff', borderWidth: 1.5, borderColor: '#f0d0c4',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, color: '#2c1810', fontSize: 14,
  },
  customAddBtn: {
    backgroundColor: '#2c1810', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8,
    shadowColor: '#2c1810', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 8,
  },
  customAddBtnDisabled:    { backgroundColor: '#f0d0c4' },
  customAddBtnText:        { fontFamily: 'monospace', fontSize: 14, fontWeight: '700', color: '#ffffff' },
  customAddBtnTextDisabled:{ color: '#c8a89c' },
});

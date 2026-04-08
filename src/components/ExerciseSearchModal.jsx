import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, Modal, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORIES = [
  { label: 'Arms',      id: 8  },
  { label: 'Chest',     id: 11 },
  { label: 'Back',      id: 12 },
  { label: 'Legs',      id: 9  },
  { label: 'Shoulders', id: 13 },
  { label: 'Abs',       id: 10 },
  { label: 'Calves',    id: 14 },
];

const CAT_COLORS = {
  Arms: '#ff6b35', Chest: '#ef4444', Back: '#7c3aed',
  Legs: '#0a84ff', Shoulders: '#f59e0b', Abs: '#30d158', Calves: '#14b8a6',
};

export default function ExerciseSearchModal({ visible, onClose, onAdd }) {
  const [query, setQuery]               = useState('');
  const [results, setResults]           = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [mode, setMode]                 = useState('search');
  const [customName, setCustomName]     = useState('');
  const [customCat, setCustomCat]       = useState('');
  const [customEquip, setCustomEquip]   = useState('');

  const reset = () => {
    setQuery(''); setResults([]); setError(null); setActiveCategory(null);
    setMode('search'); setCustomName(''); setCustomCat(''); setCustomEquip('');
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
    } catch { setError('Connection error. Check your internet.'); }
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
    } catch { setError('Connection error. Check your internet.'); }
    finally { setLoading(false); }
  };

  const handleAdd       = (item) => { onAdd(item); onClose(); reset(); };
  const handleAddCustom = () => {
    if (!customName.trim()) return;
    onAdd({ id: `custom_${Date.now()}`, name: customName.trim(), category: customCat.trim() || 'Custom', equipment: customEquip.trim() || 'None' });
    onClose(); reset();
  };

  const SearchHeader = (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips} style={s.chipsRow}>
        {CATEGORIES.map(cat => {
          const active = activeCategory === cat.id;
          const color  = CAT_COLORS[cat.label] ?? '#9ca3af';
          return (
            <TouchableOpacity
              key={cat.id}
              style={[s.chip, active && { backgroundColor: color, borderColor: color }]}
              onPress={() => active ? (setActiveCategory(null), setResults([])) : searchByCategory(cat)}
              activeOpacity={0.75}
            >
              <Text style={[s.chipText, active && { color: '#ffffff' }]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {loading && <ActivityIndicator color="#30d158" style={s.loader} />}
      {error   && <Text style={s.error}>{error}</Text>}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={s.root}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.headerSup}>EXERCISES</Text>
            <Text style={s.headerTitle}>Add Exercise</Text>
          </View>
          <TouchableOpacity onPress={() => { onClose(); reset(); }} style={s.closeBtn} activeOpacity={0.75}>
            <Text style={s.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Mode toggle */}
        <View style={s.toggle}>
          <TouchableOpacity style={[s.toggleBtn, mode==='search'&&s.toggleActive]} onPress={() => setMode('search')} activeOpacity={0.75}>
            <Text style={[s.toggleText, mode==='search'&&s.toggleTextActive]}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.toggleBtn, mode==='custom'&&s.toggleActive]} onPress={() => setMode('custom')} activeOpacity={0.75}>
            <Text style={[s.toggleText, mode==='custom'&&s.toggleTextActive]}>Custom</Text>
          </TouchableOpacity>
        </View>

        {mode === 'search' ? (
          <View style={s.searchPane}>
            {/* Input */}
            <View style={s.inputRow}>
              <TextInput
                style={s.input}
                placeholder="Search exercises..."
                placeholderTextColor="#9ca3af"
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={() => searchByText(query)}
                returnKeyType="search"
                autoFocus
              />
              <TouchableOpacity style={s.searchBtn} onPress={() => searchByText(query)} activeOpacity={0.8}>
                <Text style={s.searchBtnText}>Search</Text>
              </TouchableOpacity>
            </View>

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
                    <View style={s.addChip}>
                      <Text style={s.addChipText}>+ Add</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={s.sep} />}
              ListEmptyComponent={
                !loading && (query.length > 0 || activeCategory) ? (
                  <Text style={s.noResults}>No results — try a different term</Text>
                ) : null
              }
              keyboardShouldPersistTaps="handled"
            />
          </View>
        ) : (
          <ScrollView style={{ flex:1 }} contentContainerStyle={s.customForm} keyboardShouldPersistTaps="handled">
            <Text style={s.customHint}>Can't find it in the database? Create your own.</Text>
            {[
              { label:'EXERCISE NAME *', placeholder:'e.g. Cable Face Pull', val:customName, set:setCustomName, focus:true },
              { label:'MUSCLE GROUP',    placeholder:'e.g. Shoulders',        val:customCat,  set:setCustomCat  },
              { label:'EQUIPMENT',       placeholder:'e.g. Cable Machine',    val:customEquip,set:setCustomEquip },
            ].map(({ label, placeholder, val, set, focus }) => (
              <View key={label} style={s.customField}>
                <Text style={s.customLabel}>{label}</Text>
                <TextInput
                  style={s.customInput}
                  placeholder={placeholder}
                  placeholderTextColor="#9ca3af"
                  value={val}
                  onChangeText={set}
                  autoFocus={!!focus}
                />
              </View>
            ))}
            <TouchableOpacity
              style={[s.customAddBtn, !customName.trim() && s.customAddBtnDisabled]}
              onPress={handleAddCustom}
              activeOpacity={0.8}
              disabled={!customName.trim()}
            >
              <Text style={[s.customAddBtnText, !customName.trim() && { color: '#9ca3af' }]}>
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
  root: { flex:1, backgroundColor:'#f2f2f7' },

  header: {
    flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start',
    paddingHorizontal:20, paddingTop:16, paddingBottom:16,
    borderBottomWidth:1, borderBottomColor:'#e5e7eb',
  },
  headerSup:   { fontSize:10, fontWeight:'800', color:'#30d158', letterSpacing:2, marginBottom:4 },
  headerTitle: { fontSize:26, fontWeight:'800', color:'#1a1a1e' },
  closeBtn:    {
    width:36, height:36, borderRadius:18, backgroundColor:'#1a1a1e',
    alignItems:'center', justifyContent:'center', marginTop:4,
  },
  closeBtnText: { fontSize:14, fontWeight:'800', color:'#ffffff' },

  toggle: {
    flexDirection:'row', margin:16, backgroundColor:'#e5e7eb', borderRadius:14, padding:4, gap:4,
  },
  toggleBtn:        { flex:1, paddingVertical:12, borderRadius:11, alignItems:'center' },
  toggleActive:     { backgroundColor:'#1a1a1e', shadowColor:'#1a1a1e', shadowOffset:{width:0,height:2}, shadowOpacity:0.2, shadowRadius:6, elevation:3 },
  toggleText:       { fontSize:13, fontWeight:'700', color:'#9ca3af' },
  toggleTextActive: { color:'#ffffff', fontWeight:'800' },

  searchPane: { flex:1, paddingHorizontal:16, paddingTop:4 },
  inputRow:   { flexDirection:'row', gap:8, marginBottom:8 },
  input: {
    flex:1, backgroundColor:'#ffffff', borderWidth:1.5, borderColor:'#e5e7eb',
    borderRadius:14, paddingHorizontal:16, paddingVertical:13,
    color:'#1a1a1e', fontSize:15,
    shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.05, shadowRadius:8,
  },
  searchBtn:     { backgroundColor:'#1a1a1e', borderRadius:14, paddingHorizontal:18, justifyContent:'center', shadowColor:'#1a1a1e', shadowOffset:{width:0,height:2}, shadowOpacity:0.2, shadowRadius:8, elevation:4 },
  searchBtnText: { fontSize:13, fontWeight:'800', color:'#ffffff' },

  chipsRow: { height:44, marginBottom:10 },
  chips:    { gap:6, paddingRight:4, alignItems:'center' },
  chip: {
    paddingHorizontal:14, paddingVertical:8, borderRadius:22,
    borderWidth:1.5, borderColor:'#e5e7eb', backgroundColor:'#ffffff',
    shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.04, shadowRadius:4,
  },
  chipText: { fontSize:12, fontWeight:'700', color:'#6b7280' },

  loader:    { marginVertical:16 },
  error:     { color:'#ef4444', fontSize:12, fontWeight:'600', marginBottom:12 },

  result:     { paddingVertical:2 },
  resultInner:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:14 },
  resultLeft: { flex:1, gap:4 },
  resultName: { fontSize:15, fontWeight:'700', color:'#1a1a1e' },
  resultMeta: { fontSize:11, fontWeight:'500', color:'#9ca3af' },
  addChip:    { backgroundColor:'#f0fdf4', borderRadius:10, paddingHorizontal:12, paddingVertical:7, borderWidth:1.5, borderColor:'#86efac' },
  addChipText:{ fontSize:12, fontWeight:'800', color:'#16a34a' },
  sep:        { height:1, backgroundColor:'#f3f4f6' },
  noResults:  { fontSize:12, fontWeight:'500', color:'#d1d5db', textAlign:'center', paddingVertical:28 },

  customForm: { gap:20, padding:20 },
  customHint: { fontSize:13, color:'#9ca3af', marginBottom:4 },
  customField:{ gap:8 },
  customLabel:{ fontSize:10, fontWeight:'800', color:'#9ca3af', letterSpacing:1, textTransform:'uppercase' },
  customInput:{
    backgroundColor:'#ffffff', borderWidth:1.5, borderColor:'#e5e7eb',
    borderRadius:14, paddingHorizontal:16, paddingVertical:14, color:'#1a1a1e', fontSize:15,
    shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.05, shadowRadius:8,
  },
  customAddBtn:        { backgroundColor:'#1a1a1e', borderRadius:16, paddingVertical:17, alignItems:'center', marginTop:8, shadowColor:'#1a1a1e', shadowOffset:{width:0,height:4}, shadowOpacity:0.25, shadowRadius:12, elevation:6 },
  customAddBtnDisabled:{ backgroundColor:'#e5e7eb', shadowOpacity:0 },
  customAddBtnText:    { fontSize:15, fontWeight:'800', color:'#ffffff' },
});

import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';

function fmtDuration(secs) {
  if (!secs) return '--';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2,'0')}s`;
  return `${s}s`;
}

export default function SessionSummaryModal({ visible, onClose, exercises, logs, date, duration }) {
  const todayLogs = logs[date] ?? {};
  const stats = exercises
    .map(ex => {
      const sets = todayLogs[ex.id] ?? [];
      if (!sets.length) return null;
      const volume    = sets.reduce((s, x) => s + x.weight * x.reps, 0);
      const maxWeight = Math.max(...sets.map(x => x.weight));
      const totalReps = sets.reduce((s, x) => s + x.reps, 0);
      return { ...ex, setCount: sets.length, volume, maxWeight, totalReps };
    })
    .filter(Boolean);

  const totalVolume = stats.reduce((s, e) => s + e.volume, 0);
  const totalSets   = stats.reduce((s, e) => s + e.setCount, 0);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.sheet}>

          <View style={s.header}>
            <View>
              <Text style={s.badge}>WORKOUT COMPLETE</Text>
              <Text style={s.title}>Session Summary</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={s.closeBtn} activeOpacity={0.75}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={s.statsRow}>
            {[
              { val: fmtDuration(duration), lbl: 'Duration',  color: '#30d158' },
              { val: String(totalSets),     lbl: 'Sets',       color: '#1a1a1e' },
              { val: String(stats.length),  lbl: 'Exercises',  color: '#1a1a1e' },
              { val: totalVolume.toLocaleString(), lbl: 'Total lbs', color: '#ff6b35' },
            ].map(({ val, lbl, color }) => (
              <View key={lbl} style={s.statBox}>
                <Text style={[s.statVal, { color }]}>{val}</Text>
                <Text style={s.statLbl}>{lbl}</Text>
              </View>
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={s.sectionLabel}>BREAKDOWN</Text>
            {stats.length === 0 ? (
              <Text style={s.noSets}>No sets logged today</Text>
            ) : (
              stats.map((ex, i) => (
                <View key={i} style={s.exRow}>
                  <View style={s.exLeft}>
                    <Text style={s.exName}>{ex.name}</Text>
                    <Text style={s.exMeta}>{ex.setCount} sets · {ex.totalReps} reps · {ex.maxWeight} lbs max</Text>
                  </View>
                  <View style={s.exVol}>
                    <Text style={s.exVolVal}>{ex.volume.toLocaleString()}</Text>
                    <Text style={s.exVolLbl}>lbs</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <TouchableOpacity style={s.doneBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={s.doneBtnText}>Done  🎉</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex:1, justifyContent:'flex-end', backgroundColor:'rgba(0,0,0,0.45)' },
  sheet: {
    backgroundColor:'#ffffff', borderTopLeftRadius:28, borderTopRightRadius:28,
    padding:20, maxHeight:'82%',
    shadowColor:'#000', shadowOffset:{width:0,height:-4}, shadowOpacity:0.12, shadowRadius:20,
  },
  header: { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 },
  badge:  { fontSize:10, fontWeight:'800', color:'#30d158', letterSpacing:1.5, marginBottom:4 },
  title:  { fontSize:22, fontWeight:'800', color:'#1a1a1e' },
  closeBtn:   { width:34, height:34, borderRadius:17, backgroundColor:'#f3f4f6', alignItems:'center', justifyContent:'center' },
  closeBtnText: { fontSize:14, fontWeight:'800', color:'#6b7280' },

  statsRow: { flexDirection:'row', gap:8, marginBottom:24 },
  statBox: {
    flex:1, backgroundColor:'#f9fafb', borderRadius:14, padding:12, alignItems:'center', gap:4,
    shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.04, shadowRadius:6,
  },
  statVal: { fontSize:15, fontWeight:'800', color:'#1a1a1e' },
  statLbl: { fontSize:9, fontWeight:'700', color:'#9ca3af', letterSpacing:0.5, textTransform:'uppercase' },

  sectionLabel: { fontSize:9, fontWeight:'800', color:'#d1d5db', letterSpacing:1.5, textTransform:'uppercase', marginBottom:12 },
  noSets:       { fontSize:12, fontWeight:'500', color:'#d1d5db', textAlign:'center', paddingVertical:20 },

  exRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:13, borderBottomWidth:1, borderBottomColor:'#f9fafb' },
  exLeft:   { flex:1, gap:3 },
  exName:   { fontSize:14, fontWeight:'700', color:'#1a1a1e' },
  exMeta:   { fontSize:10, fontWeight:'500', color:'#9ca3af' },
  exVol:    { alignItems:'flex-end', gap:1 },
  exVolVal: { fontSize:16, fontWeight:'800', color:'#30d158' },
  exVolLbl: { fontSize:9, fontWeight:'700', color:'#30d158', opacity:0.7 },

  doneBtn: {
    marginTop:16, backgroundColor:'#1a1a1e', borderRadius:14, paddingVertical:16, alignItems:'center',
    shadowColor:'#1a1a1e', shadowOffset:{width:0,height:4}, shadowOpacity:0.25, shadowRadius:12, elevation:6,
  },
  doneBtnText: { fontSize:15, fontWeight:'800', color:'#ffffff' },
});

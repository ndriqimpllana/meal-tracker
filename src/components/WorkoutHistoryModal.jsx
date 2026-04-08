import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function fmtDuration(secs) {
  if (!secs) return null;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2,'0')}s`;
  return `${s}s`;
}

export default function WorkoutHistoryModal({ visible, onClose, completedWorkouts, onDelete }) {
  const [confirmDate, setConfirmDate] = useState(null);

  const sessions = Object.values(completedWorkouts).sort((a,b) => b.date.localeCompare(a.date));

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={s.root}>

        <View style={s.header}>
          <View>
            <Text style={s.badge}>HISTORY</Text>
            <Text style={s.title}>Past Workouts</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={s.closeBtn} activeOpacity={0.75}>
            <Text style={s.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {sessions.length > 0 && (
          <View style={s.countBar}>
            <Text style={s.countText}><Text style={s.countNum}>{sessions.length}</Text> workout{sessions.length!==1?'s':''} logged</Text>
          </View>
        )}

        <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {sessions.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>🏋️</Text>
              <Text style={s.emptyTitle}>No workout history yet</Text>
              <Text style={s.emptySub}>Finish a workout to see it here</Text>
            </View>
          ) : (
            sessions.map((session) => {
              const totalSets = session.exercises.reduce((s,e) => s + e.sets.length, 0);
              const totalVol  = session.exercises.reduce((s,e) => s + e.sets.reduce((s2,set) => s2 + set.weight*set.reps, 0), 0);
              const isConfirm = confirmDate === session.date;
              const dur       = fmtDuration(session.duration);

              return (
                <View key={session.date} style={s.card}>

                  {/* Card header */}
                  <View style={s.cardHeader}>
                    <View style={s.cardDateBlock}>
                      <Text style={s.cardDate}>{session.date}</Text>
                      {dur && (
                        <View style={s.durBadge}><Text style={s.durText}>⏱  {dur}</Text></View>
                      )}
                    </View>

                    {isConfirm ? (
                      <View style={s.confirmRow}>
                        <Text style={s.confirmLabel}>Delete?</Text>
                        <TouchableOpacity style={s.confirmYes} onPress={() => { onDelete(session.date); setConfirmDate(null); }} activeOpacity={0.75}>
                          <Text style={s.confirmYesText}>Yes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.confirmNo} onPress={() => setConfirmDate(null)} activeOpacity={0.75}>
                          <Text style={s.confirmNoText}>No</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity style={s.deleteBtn} onPress={() => setConfirmDate(session.date)} activeOpacity={0.75}>
                        <Text style={s.deleteBtnText}>Delete</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Stats row */}
                  <View style={s.statsRow}>
                    <View style={s.statBox}>
                      <Text style={s.statVal}>{session.exercises.length}</Text>
                      <Text style={s.statLbl}>Exercises</Text>
                    </View>
                    <View style={s.statDiv} />
                    <View style={s.statBox}>
                      <Text style={s.statVal}>{totalSets}</Text>
                      <Text style={s.statLbl}>Sets</Text>
                    </View>
                    <View style={s.statDiv} />
                    <View style={s.statBox}>
                      <Text style={[s.statVal, { color:'#30d158' }]}>{totalVol.toLocaleString()}</Text>
                      <Text style={s.statLbl}>Total lbs</Text>
                    </View>
                  </View>

                  {/* Exercise breakdown */}
                  {session.exercises.map((ex, j) => {
                    const maxW = Math.max(...ex.sets.map(st => st.weight));
                    return (
                      <View key={j} style={s.exRow}>
                        <Text style={s.exName}>{ex.name}</Text>
                        <Text style={s.exMeta}>{ex.sets.length} sets · {maxW} lbs max</Text>
                      </View>
                    );
                  })}
                </View>
              );
            })
          )}
        </ScrollView>

      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex:1, backgroundColor:'#f2f2f7' },

  header: {
    flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start',
    paddingHorizontal:20, paddingTop:20, paddingBottom:16,
    borderBottomWidth:1, borderBottomColor:'#e5e7eb', backgroundColor:'#f2f2f7',
  },
  badge: { fontSize:10, fontWeight:'800', color:'#30d158', letterSpacing:2, marginBottom:4 },
  title: { fontSize:26, fontWeight:'800', color:'#1a1a1e' },
  closeBtn:    { width:36, height:36, borderRadius:18, backgroundColor:'#1a1a1e', alignItems:'center', justifyContent:'center', marginTop:4 },
  closeBtnText:{ fontSize:14, fontWeight:'800', color:'#ffffff' },

  countBar: { paddingHorizontal:20, paddingVertical:10, backgroundColor:'#f9fafb', borderBottomWidth:1, borderBottomColor:'#e5e7eb' },
  countText: { fontSize:12, fontWeight:'500', color:'#9ca3af' },
  countNum:  { fontWeight:'800', color:'#1a1a1e' },

  scroll:  { flex:1 },
  content: { padding:16, paddingBottom:32 },

  empty:      { paddingVertical:80, alignItems:'center', gap:10 },
  emptyEmoji: { fontSize:44 },
  emptyTitle: { fontSize:16, fontWeight:'800', color:'#1a1a1e' },
  emptySub:   { fontSize:12, fontWeight:'500', color:'#9ca3af' },

  card: {
    backgroundColor:'#ffffff', borderRadius:20, padding:16, marginBottom:14,
    shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.07, shadowRadius:14, elevation:2,
  },

  cardHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 },
  cardDateBlock: { gap:6 },
  cardDate:  { fontSize:14, fontWeight:'800', color:'#1a1a1e', letterSpacing:0.3 },
  durBadge:  { alignSelf:'flex-start', backgroundColor:'#f0fdf4', borderWidth:1.5, borderColor:'#86efac', borderRadius:8, paddingHorizontal:9, paddingVertical:3 },
  durText:   { fontSize:10, fontWeight:'700', color:'#16a34a' },

  deleteBtn:     { paddingVertical:7, paddingHorizontal:12, borderRadius:10, backgroundColor:'#fef2f2', borderWidth:1.5, borderColor:'#fecaca' },
  deleteBtnText: { fontSize:11, fontWeight:'800', color:'#ef4444' },
  confirmRow:    { flexDirection:'row', alignItems:'center', gap:6 },
  confirmLabel:  { fontSize:11, fontWeight:'700', color:'#ef4444' },
  confirmYes:    { paddingVertical:6, paddingHorizontal:12, borderRadius:8, backgroundColor:'#ef4444' },
  confirmYesText:{ fontSize:11, fontWeight:'800', color:'#ffffff' },
  confirmNo:     { paddingVertical:6, paddingHorizontal:12, borderRadius:8, backgroundColor:'#f3f4f6' },
  confirmNoText: { fontSize:11, fontWeight:'700', color:'#6b7280' },

  statsRow: { flexDirection:'row', alignItems:'center', backgroundColor:'#f9fafb', borderRadius:12, padding:12, marginBottom:12 },
  statBox:  { flex:1, alignItems:'center', gap:2 },
  statDiv:  { width:1, height:28, backgroundColor:'#e5e7eb' },
  statVal:  { fontSize:18, fontWeight:'800', color:'#1a1a1e' },
  statLbl:  { fontSize:9, fontWeight:'700', color:'#9ca3af', letterSpacing:0.5, textTransform:'uppercase' },

  exRow:   { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:9, borderTopWidth:1, borderTopColor:'#f3f4f6' },
  exName:  { fontSize:13, fontWeight:'700', color:'#1a1a1e', flex:1 },
  exMeta:  { fontSize:10, fontWeight:'500', color:'#9ca3af' },
});

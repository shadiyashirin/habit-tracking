import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  StyleSheet, useColorScheme, ActivityIndicator, Animated,
} from 'react-native'
import { useState, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { useHabits } from '../../src/hooks/useHabits'
import { useAuth } from '../../src/context/AuthContext'
import { HABIT_COLORS, COLORS, SPACING, RADIUS, FONT } from '../../src/theme'
import AddHabitSheet from '../../src/components/AddHabitSheet'

const TODAY = new Date()
const TODAY_ISO = TODAY.toISOString().split('T')[0]
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const todayLabel = `${DAY_NAMES[TODAY.getDay()]}, ${TODAY.getDate()} ${MONTH_NAMES[TODAY.getMonth()]}`

function CheckRow({ habit, onToggle, streak }) {
  const scheme  = useColorScheme()
  const isDark  = scheme === 'dark'
  const log     = habit.logs.find(l => l.date === TODAY_ISO)
  const checked = log?.completed ?? false
  const colors  = HABIT_COLORS[habit.color] || HABIT_COLORS.teal
  const scale   = useRef(new Animated.Value(1)).current

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(scale,  { toValue: 1,    useNativeDriver: true }),
    ]).start()
    onToggle(habit.id, TODAY_ISO, !checked)
  }

  return (
    <View style={[styles.checkRow, { backgroundColor: isDark ? COLORS.dark.bgCard : '#fff', borderColor: isDark ? COLORS.dark.border : COLORS.borderLight }]}>
      <View style={styles.checkLeft}>
        <View style={[styles.colorDot, { backgroundColor: colors.main }]} />
        <View style={styles.checkMeta}>
          <Text style={[styles.habitName, { color: isDark ? COLORS.dark.text : COLORS.text }]}>{habit.name}</Text>
          {streak > 0 && (
            <Text style={[styles.streakLabel, { color: colors.main }]}>🔥 {streak} day streak</Text>
          )}
        </View>
      </View>
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          onPress={handlePress}
          style={[
            styles.checkbox,
            checked
              ? { backgroundColor: colors.main, borderColor: colors.main }
              : { backgroundColor: 'transparent', borderColor: isDark ? '#444' : colors.main },
          ]}
          activeOpacity={0.8}
        >
          {checked && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}

export default function TodayScreen() {
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const { user } = useAuth()
  const { habits, loading, error, refreshing, onRefresh, toggle, addHabit, removeHabit, getStreak } = useHabits()
  const [showAdd, setShowAdd] = useState(false)

  const completedToday = habits.filter(h => h.logs.find(l => l.date === TODAY_ISO)?.completed).length
  const total = habits.length
  const pct   = total > 0 ? Math.round((completedToday / total) * 100) : 0

  const bg = isDark ? COLORS.dark.bg : COLORS.bg

  if (loading) return (
    <View style={[styles.centered, { backgroundColor: bg }]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  )

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: isDark ? COLORS.dark.textSecondary : COLORS.textSecondary }]}>
              Hi, {user?.username || 'there'} 👋
            </Text>
            <Text style={[styles.dateLabel, { color: isDark ? COLORS.dark.text : COLORS.text }]}>{todayLabel}</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)} activeOpacity={0.85}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Progress ring card */}
        {total > 0 && (
          <View style={[styles.progressCard, { backgroundColor: isDark ? COLORS.dark.bgCard : '#fff', borderColor: isDark ? COLORS.dark.border : COLORS.borderLight }]}>
            <View style={styles.progressLeft}>
              <Text style={[styles.progressPct, { color: COLORS.primary }]}>{pct}%</Text>
              <Text style={[styles.progressSub, { color: isDark ? COLORS.dark.textSecondary : COLORS.textSecondary }]}>
                {completedToday} of {total} done
              </Text>
            </View>
            <View style={styles.progressBarWrap}>
              <View style={[styles.progressBg, { backgroundColor: isDark ? '#333' : COLORS.primaryLight }]}>
                <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: COLORS.primary }]} />
              </View>
              <Text style={[styles.progressHint, { color: isDark ? COLORS.dark.textSecondary : COLORS.textMuted }]}>
                {pct === 100 ? '🎉 All done!' : `${total - completedToday} remaining`}
              </Text>
            </View>
          </View>
        )}

        {/* Error */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠ {error}</Text>
          </View>
        )}

        {/* Habits list */}
        {habits.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: isDark ? COLORS.dark.bgCard : '#fff', borderColor: isDark ? COLORS.dark.border : COLORS.borderLight }]}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={[styles.emptyTitle, { color: isDark ? COLORS.dark.text : COLORS.text }]}>No habits yet</Text>
            <Text style={[styles.emptySub, { color: isDark ? COLORS.dark.textSecondary : COLORS.textSecondary }]}>
              Tap "+ Add" to start tracking something meaningful.
            </Text>
          </View>
        ) : (
          <View style={styles.listSection}>
            <Text style={[styles.sectionLabel, { color: isDark ? COLORS.dark.textSecondary : COLORS.textSecondary }]}>Your habits</Text>
            {habits.map(h => (
              <CheckRow key={h.id} habit={h} onToggle={toggle} streak={getStreak(h)} />
            ))}
          </View>
        )}
      </ScrollView>

      <AddHabitSheet
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={async (data) => { await addHabit(data); setShowAdd(false) }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:       { flex: 1 },
  centered:   { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll:     { padding: SPACING.md, paddingBottom: SPACING.xxl },
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: SPACING.lg },
  greeting:   { fontSize: FONT.sizes.sm, fontWeight: FONT.weights.semibold, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 },
  dateLabel:  { fontSize: FONT.sizes.xl, fontWeight: FONT.weights.heavy, letterSpacing: -0.3 },
  addBtn:     { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md },
  addBtnText: { color: '#fff', fontWeight: FONT.weights.bold, fontSize: FONT.sizes.sm },

  progressCard: { borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.md, marginBottom: SPACING.lg, flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  progressLeft: { alignItems: 'center', minWidth: 72 },
  progressPct:  { fontSize: FONT.sizes.xxxl, fontWeight: FONT.weights.heavy, letterSpacing: -1 },
  progressSub:  { fontSize: FONT.sizes.xs, fontWeight: FONT.weights.medium, marginTop: 2 },
  progressBarWrap: { flex: 1, gap: 6 },
  progressBg:   { height: 10, borderRadius: RADIUS.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: RADIUS.full },
  progressHint: { fontSize: FONT.sizes.xs },

  sectionLabel: { fontSize: FONT.sizes.xs, fontWeight: FONT.weights.bold, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: SPACING.sm },
  listSection:  { gap: SPACING.sm },

  checkRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1 },
  checkLeft:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  colorDot:   { width: 10, height: 10, borderRadius: RADIUS.full },
  checkMeta:  { flex: 1 },
  habitName:  { fontSize: FONT.sizes.md, fontWeight: FONT.weights.semibold },
  streakLabel:{ fontSize: FONT.sizes.xs, marginTop: 2, fontWeight: FONT.weights.medium },
  checkbox:   { width: 32, height: 32, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkmark:  { color: '#fff', fontSize: 16, fontWeight: FONT.weights.bold },

  emptyCard:  { borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.xl, alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.lg },
  emptyEmoji: { fontSize: 40, marginBottom: SPACING.sm },
  emptyTitle: { fontSize: FONT.sizes.lg, fontWeight: FONT.weights.bold },
  emptySub:   { fontSize: FONT.sizes.sm, textAlign: 'center', lineHeight: 20 },

  errorBanner:{ backgroundColor: '#FAECE7', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md },
  errorText:  { color: '#993C1D', fontSize: FONT.sizes.sm },
})

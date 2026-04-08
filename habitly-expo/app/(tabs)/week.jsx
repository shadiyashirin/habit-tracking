import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, useColorScheme, RefreshControl, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { useHabits } from '../../src/hooks/useHabits'
import { getLast7Days } from '../../src/utils/dates'
import { HABIT_COLORS, COLORS, SPACING, RADIUS, FONT } from '../../src/theme'

const DAYS = getLast7Days()
const COL_W = 52

export default function WeekScreen() {
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const { habits, loading, refreshing, onRefresh, toggle, getStreak } = useHabits()

  const bg = isDark ? COLORS.dark.bg : COLORS.bg

  const isChecked = (habit, iso) => habit.logs.find(l => l.date === iso)?.completed ?? false

  const handleToggle = (habitId, iso, current) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    toggle(habitId, iso, !current)
  }

  if (loading) return (
    <View style={[styles.centered, { backgroundColor: bg }]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  )

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      <View style={styles.headerWrap}>
        <Text style={[styles.title, { color: isDark ? COLORS.dark.text : COLORS.text }]}>This week</Text>
        <Text style={[styles.subtitle, { color: isDark ? COLORS.dark.textSecondary : COLORS.textSecondary }]}>{habits.length} habit{habits.length !== 1 ? 's' : ''}</Text>
      </View>

      {habits.length === 0 ? (
        <View style={[styles.centered, { backgroundColor: bg }]}>
          <Text style={{ fontSize: 36 }}>📅</Text>
          <Text style={[styles.emptyText, { color: isDark ? COLORS.dark.textSecondary : COLORS.textSecondary }]}>Add habits from the Today tab</Text>
        </View>
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          showsVerticalScrollIndicator={false}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>
              {/* Column headers */}
              <View style={styles.headerRow}>
                <View style={styles.nameCol} />
                {DAYS.map(d => (
                  <View key={d.iso} style={[styles.dayColHeader, d.isToday && { backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.sm }]}>
                    <Text style={[styles.dayName, { color: d.isToday ? COLORS.primaryDark : (isDark ? COLORS.dark.textSecondary : COLORS.textMuted) }]}>{d.dayName}</Text>
                    <Text style={[styles.dayNum, { color: d.isToday ? COLORS.primary : (isDark ? COLORS.dark.text : COLORS.text) }]}>{d.dayNum}</Text>
                    <Text style={[styles.dayMonth, { color: d.isToday ? COLORS.primaryDark : (isDark ? '#555' : COLORS.textMuted) }]}>{d.month}</Text>
                    {d.isToday && <View style={styles.todayDot} />}
                  </View>
                ))}
                <View style={styles.streakColHeader}>
                  <Text style={[styles.streakHeaderText, { color: isDark ? '#555' : COLORS.textMuted }]}>🔥</Text>
                </View>
              </View>

              {/* Habit rows */}
              {habits.map((habit, idx) => {
                const colors  = HABIT_COLORS[habit.color] || HABIT_COLORS.teal
                const streak  = getStreak(habit)
                const rowBg   = isDark
                  ? (idx % 2 === 0 ? COLORS.dark.bgCard : COLORS.dark.bgMuted)
                  : (idx % 2 === 0 ? '#fff' : COLORS.bgMuted)

                return (
                  <View key={habit.id} style={[styles.habitRow, { backgroundColor: rowBg }]}>
                    <View style={styles.nameCol}>
                      <View style={[styles.colorBar, { backgroundColor: colors.main }]} />
                      <Text style={[styles.habitName, { color: isDark ? COLORS.dark.text : COLORS.text }]} numberOfLines={2}>{habit.name}</Text>
                    </View>

                    {DAYS.map(d => {
                      const checked = isChecked(habit, d.iso)
                      return (
                        <View key={d.iso} style={[styles.dayCell, d.isToday && { backgroundColor: COLORS.primaryLight + '55' }]}>
                          <TouchableOpacity
                            onPress={() => handleToggle(habit.id, d.iso, checked)}
                            style={[
                              styles.cell,
                              checked
                                ? { backgroundColor: colors.main, borderColor: colors.main }
                                : { backgroundColor: 'transparent', borderColor: isDark ? '#444' : colors.main + '66' },
                            ]}
                            activeOpacity={0.7}
                          >
                            {checked && <Text style={styles.cellCheck}>✓</Text>}
                          </TouchableOpacity>
                        </View>
                      )
                    })}

                    <View style={styles.streakCol}>
                      {streak > 0 ? (
                        <View style={[styles.streakBadge, { backgroundColor: colors.light }]}>
                          <Text style={[styles.streakText, { color: colors.main }]}>{streak}d</Text>
                        </View>
                      ) : (
                        <Text style={{ color: isDark ? '#444' : '#ccc', fontSize: 16 }}>—</Text>
                      )}
                    </View>
                  </View>
                )
              })}
            </View>
          </ScrollView>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:      { flex: 1 },
  centered:  { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.sm },
  emptyText: { fontSize: FONT.sizes.sm, marginTop: SPACING.sm },
  headerWrap:{ padding: SPACING.md, paddingBottom: SPACING.sm },
  title:     { fontSize: FONT.sizes.xl, fontWeight: FONT.weights.heavy, letterSpacing: -0.3 },
  subtitle:  { fontSize: FONT.sizes.sm, marginTop: 2 },

  table:       { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xxl },
  headerRow:   { flexDirection: 'row', alignItems: 'flex-end', paddingBottom: SPACING.sm },
  nameCol:     { width: 130, paddingRight: SPACING.sm, flexDirection: 'row', alignItems: 'center', gap: 6 },
  colorBar:    { width: 3, height: 36, borderRadius: 2 },
  dayColHeader:{ width: COL_W, alignItems: 'center', paddingVertical: 6, paddingHorizontal: 4, gap: 1 },
  dayName:     { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  dayNum:      { fontSize: 18, fontWeight: '800', lineHeight: 22 },
  dayMonth:    { fontSize: 10 },
  todayDot:    { width: 5, height: 5, borderRadius: 99, backgroundColor: COLORS.primary, marginTop: 2 },
  streakColHeader: { width: 52, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 4 },
  streakHeaderText: { fontSize: 16 },

  habitRow:  { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, borderRadius: RADIUS.md, marginBottom: 2 },
  habitName: { fontSize: FONT.sizes.sm, fontWeight: FONT.weights.semibold, flex: 1 },
  dayCell:   { width: COL_W, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  cell:      { width: 30, height: 30, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  cellCheck: { color: '#fff', fontSize: 14, fontWeight: '800' },
  streakCol: { width: 52, alignItems: 'center' },
  streakBadge:{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  streakText: { fontSize: FONT.sizes.xs, fontWeight: FONT.weights.bold },
})

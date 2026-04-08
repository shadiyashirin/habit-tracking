import {
  ActivityIndicator, Dimensions,
  RefreshControl,
  ScrollView, StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg'
import { useHabits } from '../../src/hooks/useHabits'
import { COLORS, FONT, HABIT_COLORS, RADIUS, SPACING } from '../../src/theme'

const { width: SCREEN_W } = Dimensions.get('window')
const CHART_PADDING_H = SPACING.md * 2  // horizontal padding of parent card
const CHART_W = SCREEN_W - CHART_PADDING_H * 2 - 40  // subtract card padding + y-axis width
const CHART_H = 160
const Y_AXIS_W = 36
const PLOT_W = CHART_W - Y_AXIS_W
const PLOT_H = CHART_H - 28  // leave room for x-axis labels at bottom
const Y_TICKS = [100, 75, 50, 25, 0]

export default function StatsScreen() {
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const { habits, stats, loading, refreshing, onRefresh, getStreak } = useHabits()
  const bg = isDark ? COLORS.dark.bg : COLORS.bg

  if (loading) return (
    <View style={[styles.centered, { backgroundColor: bg }]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  )

  const todayStats     = stats.find(s => s.is_today) || { percentage: 0, completed: 0, total: 0 }
  const totalCheckins  = stats.reduce((a, s) => a + s.completed, 0)
  const totalPossible  = stats.reduce((a, s) => a + s.total,     0)
  const weekPct        = totalPossible > 0 ? Math.round((totalCheckins / totalPossible) * 100) : 0
  const bestStreak     = habits.length > 0 ? Math.max(...habits.map(h => getStreak(h))) : 0

  // Build line graph points from stats
  const linePoints = stats.map((s, i) => {
    const x = stats.length > 1
      ? (i / (stats.length - 1)) * PLOT_W
      : PLOT_W / 2
    const y = PLOT_H - (s.percentage / 100) * PLOT_H
    return { x, y, stat: s }
  })

  const polylinePoints = linePoints.map(p => `${p.x},${p.y}`).join(' ')

  // Smooth cubic bezier path
  const buildPath = (pts) => {
    if (pts.length < 2) return ''
    let d = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1]
      const curr = pts[i]
      const cpX = (prev.x + curr.x) / 2
      d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`
    }
    return d
  }

  const buildFillPath = (pts) => {
    if (pts.length < 2) return ''
    const linePath = buildPath(pts)
    return `${linePath} L ${pts[pts.length - 1].x} ${PLOT_H} L ${pts[0].x} ${PLOT_H} Z`
  }

  const primaryColor   = COLORS.primary          // e.g. '#1D9E75'
  const primaryLight   = isDark ? '#2a5c45' : (COLORS.primaryLight || '#9FE1CB')
  const gridColor      = isDark ? '#2a2a28' : '#f0efea'
  const labelColor     = isDark ? '#555555' : COLORS.textMuted
  const todayColor     = COLORS.primary
  const dotColor       = primaryLight

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: isDark ? COLORS.dark.text : COLORS.text }]}>Progress</Text>
        <Text style={[styles.subtitle, { color: isDark ? COLORS.dark.textSecondary : COLORS.textSecondary }]}>Last 7 days</Text>

        {/* Summary cards */}
        <View style={styles.cardRow}>
          {[
            { label: 'Today',       value: `${todayStats.percentage}%`, sub: `${todayStats.completed}/${todayStats.total} habits` },
            { label: 'This week',   value: `${weekPct}%`,               sub: `${totalCheckins} check-ins` },
            { label: 'Best streak', value: `${bestStreak}d`,            sub: bestStreak > 0 ? '🔥 keep going!' : 'start today' },
          ].map(c => (
            <View key={c.label} style={[styles.card, { backgroundColor: isDark ? COLORS.dark.bgCard : '#fff', borderColor: isDark ? COLORS.dark.border : COLORS.borderLight }]}>
              <Text style={[styles.cardValue, { color: COLORS.primary }]}>{c.value}</Text>
              <Text style={[styles.cardLabel, { color: isDark ? COLORS.dark.textSecondary : COLORS.textSecondary }]}>{c.label}</Text>
              <Text style={[styles.cardSub,   { color: isDark ? '#555' : COLORS.textMuted }]}>{c.sub}</Text>
            </View>
          ))}
        </View>

        {/* Line chart */}
        <View style={[styles.chartCard, { backgroundColor: isDark ? COLORS.dark.bgCard : '#fff', borderColor: isDark ? COLORS.dark.border : COLORS.borderLight }]}>
          <Text style={[styles.chartTitle, { color: isDark ? COLORS.dark.text : COLORS.text }]}>Daily completion</Text>
          <View style={styles.chartArea}>

            {/* Y-axis labels */}
            <View style={[styles.yAxis, { width: Y_AXIS_W, height: CHART_H }]}>
              {Y_TICKS.map(v => (
                <Text
                  key={v}
                  style={[
                    styles.yLabel,
                    {
                      color: labelColor,
                      top: PLOT_H - (v / 100) * PLOT_H - 6,
                    },
                  ]}
                >
                  {v}%
                </Text>
              ))}
            </View>

            {/* SVG plot area */}
            <View style={{ flex: 1 }}>
              <Svg width={PLOT_W} height={CHART_H}>
                <Defs>
                  <LinearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={primaryColor} stopOpacity="0.18" />
                    <Stop offset="1" stopColor={primaryColor} stopOpacity="0" />
                  </LinearGradient>
                </Defs>

                {/* Horizontal grid lines at 0%, 25%, 50%, 75%, 100% */}
                {Y_TICKS.slice().reverse().map(v => {
                  const y = PLOT_H - (v / 100) * PLOT_H
                  return (
                    <Line
                      key={v}
                      x1={0} y1={y}
                      x2={PLOT_W} y2={y}
                      stroke={gridColor}
                      strokeWidth={1}
                    />
                  )
                })}

                {/* Gradient fill under the line */}
                {linePoints.length >= 2 && (
                  <Path
                    d={buildFillPath(linePoints)}
                    fill="url(#lineGrad)"
                  />
                )}

                {/* The line itself */}
                {linePoints.length >= 2 && (
                  <Path
                    d={buildPath(linePoints)}
                    fill="none"
                    stroke={primaryColor}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                )}

                {/* Data points + x-axis labels */}
                {linePoints.map(({ x, y, stat }) => (
                  <View key={stat.date}>
                    {/* Dot */}
                    <Circle
                      cx={x}
                      cy={y}
                      r={stat.is_today ? 5 : 3.5}
                      fill={stat.is_today ? primaryColor : dotColor}
                      stroke={stat.is_today ? primaryColor : primaryLight}
                      strokeWidth={stat.is_today ? 2 : 1}
                    />

                    {/* Percentage label above dot (only if > 0) */}
                    {stat.percentage > 0 && (
                      <SvgText
                        x={x}
                        y={y - 10}
                        fontSize={9}
                        fontWeight="700"
                        fill={stat.is_today ? primaryColor : labelColor}
                        textAnchor="middle"
                      >
                        {stat.percentage}%
                      </SvgText>
                    )}

                    {/* Day name */}
                    <SvgText
                      x={x}
                      y={PLOT_H + 14}
                      fontSize={10}
                      fontWeight="700"
                      fill={stat.is_today ? primaryColor : labelColor}
                      textAnchor="middle"
                    >
                      {stat.day_name}
                    </SvgText>

                    {/* Date */}
                    <SvgText
                      x={x}
                      y={PLOT_H + 26}
                      fontSize={9}
                      fill={stat.is_today ? COLORS.primaryDark || primaryColor : labelColor}
                      textAnchor="middle"
                    >
                      {stat.day_num} {stat.month}
                    </SvgText>
                  </View>
                ))}
              </Svg>
            </View>
          </View>
        </View>

        {/* Per-habit breakdown */}
        {habits.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? COLORS.dark.text : COLORS.text }]}>Habit breakdown</Text>
            {habits.map(h => {
              const colors = HABIT_COLORS[h.color] || HABIT_COLORS.teal
              const streak = getStreak(h)
              const done7  = h.logs.filter(l => l.completed).length
              const pct7   = Math.round((done7 / 7) * 100)

              return (
                <View key={h.id} style={[styles.habitCard, { backgroundColor: isDark ? COLORS.dark.bgCard : '#fff', borderColor: isDark ? COLORS.dark.border : COLORS.borderLight }]}>
                  <View style={styles.habitCardHeader}>
                    <View style={[styles.habitDot, { backgroundColor: colors.main }]} />
                    <Text style={[styles.habitCardName, { color: isDark ? COLORS.dark.text : COLORS.text }]}>{h.name}</Text>
                    <Text style={[styles.habitCardPct, { color: colors.main }]}>{pct7}%</Text>
                  </View>
                  <View style={[styles.miniBarBg, { backgroundColor: isDark ? '#333' : colors.light }]}>
                    <View style={[styles.miniBarFill, { width: `${pct7}%`, backgroundColor: colors.main }]} />
                  </View>
                  <View style={styles.habitCardFooter}>
                    <Text style={[styles.habitCardSub, { color: isDark ? '#555' : COLORS.textMuted }]}>{done7}/7 days this week</Text>
                    {streak > 0 && <Text style={[styles.habitCardStreak, { color: colors.main }]}>🔥 {streak} day streak</Text>}
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:     { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll:   { padding: SPACING.md, paddingBottom: SPACING.xxl },
  title:    { fontSize: FONT.sizes.xl, fontWeight: FONT.weights.heavy, letterSpacing: -0.3 },
  subtitle: { fontSize: FONT.sizes.sm, marginTop: 2, marginBottom: SPACING.lg },

  cardRow:   { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  card:      { flex: 1, borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.sm, alignItems: 'center', gap: 2 },
  cardValue: { fontSize: FONT.sizes.xl, fontWeight: FONT.weights.heavy, letterSpacing: -0.5 },
  cardLabel: { fontSize: 10, fontWeight: FONT.weights.bold, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardSub:   { fontSize: 10 },

  chartCard:  { borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.md, marginBottom: SPACING.md },
  chartTitle: { fontSize: FONT.sizes.md, fontWeight: FONT.weights.bold, marginBottom: SPACING.md },
  chartArea:  { flexDirection: 'row', alignItems: 'flex-start' },
  yAxis:      { position: 'relative', marginRight: SPACING.xs },
  yLabel:     { position: 'absolute', right: 0, fontSize: 9, textAlign: 'right' },

  section:         { gap: SPACING.sm },
  sectionTitle:    { fontSize: FONT.sizes.lg, fontWeight: FONT.weights.bold, marginBottom: SPACING.xs },
  habitCard:       { borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.md, gap: 8 },
  habitCardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  habitDot:        { width: 10, height: 10, borderRadius: RADIUS.full },
  habitCardName:   { flex: 1, fontSize: FONT.sizes.md, fontWeight: FONT.weights.semibold },
  habitCardPct:    { fontSize: FONT.sizes.md, fontWeight: FONT.weights.heavy },
  miniBarBg:       { height: 8, borderRadius: RADIUS.full, overflow: 'hidden' },
  miniBarFill:     { height: '100%', borderRadius: RADIUS.full },
  habitCardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  habitCardSub:    { fontSize: FONT.sizes.xs },
  habitCardStreak: { fontSize: FONT.sizes.xs, fontWeight: FONT.weights.semibold },
})

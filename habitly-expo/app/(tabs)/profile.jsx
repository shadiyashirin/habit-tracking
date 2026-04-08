import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, useColorScheme, Alert, Animated,
} from 'react-native'
import { useRef, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAuth } from '../../src/context/AuthContext'
import { useHabits } from '../../src/hooks/useHabits'
import { COLORS, SPACING, RADIUS, FONT } from '../../src/theme'

export default function ProfileScreen() {
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const router = useRouter()
  const { user, logout } = useAuth()
  const { habits, stats } = useHabits()

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start()
  }, [])

  const bg     = isDark ? COLORS.dark.bg : COLORS.bg
  const cardBg = isDark ? COLORS.dark.bgCard : '#fff'
  const borderC = isDark ? COLORS.dark.border : COLORS.borderLight
  const textC   = isDark ? COLORS.dark.text : COLORS.text
  const textSecC = isDark ? COLORS.dark.textSecondary : COLORS.textSecondary

  // Stats
  const totalHabits   = habits.length
  const totalCheckins = stats.reduce((a, s) => a + s.completed, 0)
  const avgCompletion = stats.length > 0
    ? Math.round(stats.reduce((a, s) => a + s.percentage, 0) / stats.length)
    : 0

  const initial = user?.username ? user.username[0].toUpperCase() : '?'

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
            await logout()
            router.replace('/auth')
          },
        },
      ],
    )
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Profile header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <Text style={[styles.username, { color: textC }]}>
              {user?.username || 'User'}
            </Text>
            <Text style={[styles.email, { color: textSecC }]}>
              {user?.email || ''}
            </Text>
          </View>

          {/* Quick stats */}
          <View style={styles.statsRow}>
            {[
              { label: 'Habits', value: totalHabits, icon: '🎯' },
              { label: 'Check-ins', value: totalCheckins, icon: '✅' },
              { label: 'Avg', value: `${avgCompletion}%`, icon: '📊' },
            ].map(s => (
              <View
                key={s.label}
                style={[styles.statCard, { backgroundColor: cardBg, borderColor: borderC }]}
              >
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={[styles.statValue, { color: COLORS.primary }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: textSecC }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Account section */}
          <View style={[styles.section, { backgroundColor: cardBg, borderColor: borderC }]}>
            <Text style={[styles.sectionTitle, { color: textSecC }]}>Account</Text>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: textSecC }]}>Username</Text>
              <Text style={[styles.infoValue, { color: textC }]}>{user?.username}</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: borderC }]} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: textSecC }]}>Email</Text>
              <Text style={[styles.infoValue, { color: textC }]}>{user?.email || '—'}</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: borderC }]} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: textSecC }]}>User ID</Text>
              <Text style={[styles.infoValue, { color: textSecC }]}>#{user?.id}</Text>
            </View>
          </View>

          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={[styles.versionText, { color: textSecC }]}>
            Habitly v1.0.0
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { padding: SPACING.md, paddingBottom: SPACING.xxl },

  // Profile Header
  profileHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    marginTop: SPACING.md,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  avatarText: {
    color: '#fff',
    fontSize: FONT.sizes.xxl,
    fontWeight: FONT.weights.heavy,
  },
  username: {
    fontSize: FONT.sizes.xl,
    fontWeight: FONT.weights.heavy,
    letterSpacing: -0.3,
  },
  email: {
    fontSize: FONT.sizes.sm,
    marginTop: 2,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    fontSize: FONT.sizes.xl,
    fontWeight: FONT.weights.heavy,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: FONT.sizes.xs,
    fontWeight: FONT.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Section
  section: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT.sizes.xs,
    fontWeight: FONT.weights.bold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: FONT.sizes.sm,
    fontWeight: FONT.weights.medium,
  },
  infoValue: {
    fontSize: FONT.sizes.sm,
    fontWeight: FONT.weights.semibold,
  },
  divider: {
    height: 1,
  },

  // Logout
  logoutBtn: {
    backgroundColor: COLORS.coral,
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: SPACING.md,
    shadowColor: COLORS.coral,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  logoutBtnText: {
    color: '#fff',
    fontSize: FONT.sizes.md,
    fontWeight: FONT.weights.bold,
    letterSpacing: 0.3,
  },

  versionText: {
    textAlign: 'center',
    fontSize: FONT.sizes.xs,
    marginTop: SPACING.xs,
  },
})

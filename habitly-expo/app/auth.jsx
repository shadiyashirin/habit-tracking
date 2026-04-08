import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, useColorScheme, KeyboardAvoidingView,
  Platform, ActivityIndicator, Animated, Dimensions,
} from 'react-native'
import { useState, useRef, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAuth } from '../src/context/AuthContext'
import { COLORS, SPACING, RADIUS, FONT } from '../src/theme'

const { width: SCREEN_W } = Dimensions.get('window')

export default function AuthScreen() {
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const { login, register, authError, setAuthError, isAuthenticated } = useAuth()
  const router = useRouter()

  const [mode, setMode]         = useState('login')  // 'login' | 'register'
  const [username, setUsername] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [loading, setLoading]   = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  // Animations
  const fadeAnim  = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const logoScale = useRef(new Animated.Value(0.5)).current
  const formSlide = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
    ]).start()
  }, [])

  // Redirect to main app when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/today')
    }
  }, [isAuthenticated])

  const animateSwitch = () => {
    Animated.sequence([
      Animated.timing(formSlide, { toValue: -20, duration: 150, useNativeDriver: true }),
      Animated.timing(formSlide, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start()
  }

  const switchMode = () => {
    Haptics.selectionAsync()
    animateSwitch()
    setMode(m => m === 'login' ? 'register' : 'login')
    setAuthError(null)
    setFieldErrors({})
    setPassword('')
    setPassword2('')
  }

  const validate = () => {
    const errors = {}
    if (!username.trim()) errors.username = 'Username is required'
    if (mode === 'register' && !email.trim()) errors.email = 'Email is required'
    if (mode === 'register' && email && !email.includes('@')) errors.email = 'Invalid email address'
    if (!password) errors.password = 'Password is required'
    if (password && password.length < 6) errors.password = 'At least 6 characters'
    if (mode === 'register' && password !== password2) errors.password2 = 'Passwords do not match'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setLoading(true)
    setAuthError(null)

    let success
    if (mode === 'login') {
      success = await login(username.trim(), password)
    } else {
      success = await register(username.trim(), email.trim(), password, password2)
    }

    setLoading(false)
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }

  const bg       = isDark ? COLORS.dark.bg : COLORS.bg
  const cardBg   = isDark ? COLORS.dark.bgCard : '#fff'
  const borderC  = isDark ? COLORS.dark.border : COLORS.borderLight
  const textC    = isDark ? COLORS.dark.text : COLORS.text
  const textSecC = isDark ? COLORS.dark.textSecondary : COLORS.textSecondary
  const inputBg  = isDark ? COLORS.dark.bgMuted : COLORS.bgMuted

  const renderField = (label, value, setter, options = {}) => {
    const { placeholder, secure, error, keyboardType, autoCapitalize } = options
    return (
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: textSecC }]}>{label}</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: inputBg,
              borderColor: error ? COLORS.coral : borderC,
              color: textC,
            },
          ]}
          placeholder={placeholder || label}
          placeholderTextColor={isDark ? '#555' : COLORS.textMuted}
          value={value}
          onChangeText={(t) => {
            setter(t)
            setFieldErrors(prev => ({ ...prev, [label.toLowerCase()]: undefined }))
            setAuthError(null)
          }}
          secureTextEntry={secure}
          keyboardType={keyboardType || 'default'}
          autoCapitalize={autoCapitalize || 'none'}
          autoCorrect={false}
          returnKeyType="next"
        />
        {error && <Text style={styles.fieldError}>{error}</Text>}
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo & Branding */}
          <Animated.View style={[
            styles.brandWrap,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: logoScale },
              ],
            },
          ]}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🌱</Text>
            </View>
            <Text style={[styles.appName, { color: textC }]}>Habitly</Text>
            <Text style={[styles.tagline, { color: textSecC }]}>
              Build better habits, one day at a time
            </Text>
          </Animated.View>

          {/* Auth Card */}
          <Animated.View style={[
            styles.card,
            {
              backgroundColor: cardBg,
              borderColor: borderC,
              opacity: fadeAnim,
              transform: [{ translateY: formSlide }],
            },
          ]}>
            {/* Mode switcher */}
            <View style={[styles.modeSwitcher, { backgroundColor: inputBg }]}>
              <TouchableOpacity
                style={[
                  styles.modeTab,
                  mode === 'login' && styles.modeTabActive,
                  mode === 'login' && { backgroundColor: COLORS.primary },
                ]}
                onPress={() => mode !== 'login' && switchMode()}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.modeTabText,
                  mode === 'login' && styles.modeTabTextActive,
                ]}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeTab,
                  mode === 'register' && styles.modeTabActive,
                  mode === 'register' && { backgroundColor: COLORS.primary },
                ]}
                onPress={() => mode !== 'register' && switchMode()}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.modeTabText,
                  mode === 'register' && styles.modeTabTextActive,
                ]}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* Fields */}
            {renderField('Username', username, setUsername, {
              placeholder: 'Enter your username',
              error: fieldErrors.username,
            })}

            {mode === 'register' && renderField('Email', email, setEmail, {
              placeholder: 'you@example.com',
              keyboardType: 'email-address',
              error: fieldErrors.email,
            })}

            {renderField('Password', password, setPassword, {
              placeholder: '••••••••',
              secure: true,
              error: fieldErrors.password,
            })}

            {mode === 'register' && renderField('Confirm Password', password2, setPassword2, {
              placeholder: '••••••••',
              secure: true,
              error: fieldErrors.password2 || fieldErrors['confirm password'],
            })}

            {/* Error banner */}
            {authError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>⚠ {authError}</Text>
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, { opacity: loading ? 0.7 : 1 }]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Footer hint */}
            <View style={styles.footerHint}>
              <Text style={[styles.footerText, { color: textSecC }]}>
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              </Text>
              <TouchableOpacity onPress={switchMode}>
                <Text style={[styles.footerLink, { color: COLORS.primary }]}>
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Privacy note */}
          <Text style={[styles.privacyNote, { color: textSecC }]}>
            Your data stays private and secure 🔒
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  flex:   { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  // Branding
  brandWrap: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    // Subtle shadow
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 36,
  },
  appName: {
    fontSize: FONT.sizes.xxxl,
    fontWeight: FONT.weights.heavy,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: FONT.sizes.sm,
    marginTop: 4,
  },

  // Card
  card: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.lg,
    gap: SPACING.md,
    // Elevation
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  // Mode switcher
  modeSwitcher: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    padding: 3,
    marginBottom: SPACING.xs,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  modeTabActive: {
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  modeTabText: {
    fontSize: FONT.sizes.sm,
    fontWeight: FONT.weights.semibold,
    color: '#888',
  },
  modeTabTextActive: {
    color: '#fff',
    fontWeight: FONT.weights.bold,
  },

  // Fields
  fieldGroup: { gap: 6 },
  fieldLabel: {
    fontSize: FONT.sizes.xs,
    fontWeight: FONT.weights.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    paddingHorizontal: SPACING.md,
    paddingVertical: 13,
    fontSize: FONT.sizes.md,
  },
  fieldError: {
    fontSize: FONT.sizes.xs,
    color: COLORS.coral,
    marginTop: -2,
  },

  // Error banner
  errorBanner: {
    backgroundColor: COLORS.coralLight,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  errorBannerText: {
    color: '#993C1D',
    fontSize: FONT.sizes.sm,
    fontWeight: FONT.weights.medium,
  },

  // Submit
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: SPACING.xs,
    // Glow
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: FONT.sizes.md,
    fontWeight: FONT.weights.bold,
    letterSpacing: 0.3,
  },

  // Footer
  footerHint: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xs,
  },
  footerText: {
    fontSize: FONT.sizes.sm,
  },
  footerLink: {
    fontSize: FONT.sizes.sm,
    fontWeight: FONT.weights.bold,
  },

  // Privacy
  privacyNote: {
    textAlign: 'center',
    fontSize: FONT.sizes.xs,
    marginTop: SPACING.lg,
  },
})

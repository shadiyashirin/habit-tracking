import {
  View, Text, TextInput, TouchableOpacity, Modal,
  StyleSheet, useColorScheme, KeyboardAvoidingView,
  Platform, Animated, Pressable,
} from 'react-native'
import { useState, useRef, useEffect } from 'react'
import * as Haptics from 'expo-haptics'
import { HABIT_COLORS, COLORS, SPACING, RADIUS, FONT } from '../theme'

const COLOR_KEYS = Object.keys(HABIT_COLORS)
const COLOR_NAMES = { teal: 'Teal', purple: 'Purple', coral: 'Coral', blue: 'Blue', amber: 'Amber', green: 'Green' }

export default function AddHabitSheet({ visible, onClose, onAdd }) {
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const [name,    setName]    = useState('')
  const [color,   setColor]   = useState('teal')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const slideY = useRef(new Animated.Value(400)).current

  useEffect(() => {
    if (visible) {
      setName(''); setColor('teal'); setError('')
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start()
    } else {
      Animated.timing(slideY, { toValue: 400, duration: 220, useNativeDriver: true }).start()
    }
  }, [visible])

  const handleAdd = async () => {
    if (!name.trim()) { setError('Please enter a habit name'); return }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setLoading(true)
    try {
      await onAdd({ name: name.trim(), color })
    } finally {
      setLoading(false)
    }
  }

  const sheetBg = isDark ? COLORS.dark.bgCard : '#fff'
  const borderC = isDark ? COLORS.dark.border : COLORS.borderLight

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
          <Pressable>
            <Animated.View style={[styles.sheet, { backgroundColor: sheetBg, transform: [{ translateY: slideY }] }]}>
              {/* Handle */}
              <View style={styles.handle} />

              <Text style={[styles.sheetTitle, { color: isDark ? COLORS.dark.text : COLORS.text }]}>New habit</Text>

              {/* Name input */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: isDark ? COLORS.dark.textSecondary : COLORS.textSecondary }]}>Name</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? COLORS.dark.bgMuted : COLORS.bgMuted,
                      borderColor: error ? COLORS.coral : borderC,
                      color: isDark ? COLORS.dark.text : COLORS.text,
                    },
                  ]}
                  placeholder="e.g. Drink 2L water"
                  placeholderTextColor={isDark ? '#555' : COLORS.textMuted}
                  value={name}
                  onChangeText={t => { setName(t); setError('') }}
                  onSubmitEditing={handleAdd}
                  returnKeyType="done"
                  maxLength={60}
                  autoFocus
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
              </View>

              {/* Color picker */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: isDark ? COLORS.dark.textSecondary : COLORS.textSecondary }]}>
                  Color — {COLOR_NAMES[color]}
                </Text>
                <View style={styles.colorRow}>
                  {COLOR_KEYS.map(c => {
                    const col = HABIT_COLORS[c]
                    const selected = color === c
                    return (
                      <TouchableOpacity
                        key={c}
                        onPress={() => { Haptics.selectionAsync(); setColor(c) }}
                        style={[
                          styles.swatch,
                          { backgroundColor: col.main },
                          selected && styles.swatchSelected,
                        ]}
                        activeOpacity={0.8}
                      >
                        {selected && <Text style={styles.swatchCheck}>✓</Text>}
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </View>

              {/* Preview */}
              <View style={[styles.preview, { backgroundColor: HABIT_COLORS[color].light, borderColor: HABIT_COLORS[color].main + '44' }]}>
                <View style={[styles.previewDot, { backgroundColor: HABIT_COLORS[color].main }]} />
                <Text style={[styles.previewName, { color: HABIT_COLORS[color].main }]}>
                  {name.trim() || 'Your new habit'}
                </Text>
              </View>

              {/* Buttons */}
              <View style={styles.btnRow}>
                <TouchableOpacity style={[styles.btnCancel, { borderColor: borderC }]} onPress={onClose} activeOpacity={0.7}>
                  <Text style={[styles.btnCancelText, { color: isDark ? COLORS.dark.textSecondary : COLORS.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btnAdd, { backgroundColor: COLORS.primary, opacity: loading ? 0.7 : 1 }]}
                  onPress={handleAdd}
                  activeOpacity={0.85}
                  disabled={loading}
                >
                  <Text style={styles.btnAddText}>{loading ? 'Adding…' : 'Add Habit'}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  kav:      { justifyContent: 'flex-end' },
  sheet:    { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.lg, paddingBottom: SPACING.xxl, gap: SPACING.lg },
  handle:   { width: 40, height: 4, borderRadius: 2, backgroundColor: '#ccc', alignSelf: 'center', marginBottom: -SPACING.sm },
  sheetTitle:{ fontSize: FONT.sizes.xl, fontWeight: FONT.weights.heavy, letterSpacing: -0.3 },

  fieldGroup: { gap: SPACING.sm },
  fieldLabel: { fontSize: FONT.sizes.xs, fontWeight: FONT.weights.bold, letterSpacing: 0.6, textTransform: 'uppercase' },
  input:      { borderRadius: RADIUS.md, borderWidth: 1.5, paddingHorizontal: SPACING.md, paddingVertical: 12, fontSize: FONT.sizes.md },
  errorText:  { fontSize: FONT.sizes.xs, color: COLORS.coral },

  colorRow:      { flexDirection: 'row', gap: SPACING.sm },
  swatch:        { width: 40, height: 40, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center' },
  swatchSelected:{ borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  swatchCheck:   { color: '#fff', fontSize: 16, fontWeight: '800' },

  preview:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.md },
  previewDot:  { width: 10, height: 10, borderRadius: RADIUS.full },
  previewName: { fontSize: FONT.sizes.md, fontWeight: FONT.weights.semibold },

  btnRow:       { flexDirection: 'row', gap: SPACING.sm },
  btnCancel:    { flex: 1, borderRadius: RADIUS.md, borderWidth: 1.5, paddingVertical: 14, alignItems: 'center' },
  btnCancelText:{ fontSize: FONT.sizes.md, fontWeight: FONT.weights.semibold },
  btnAdd:       { flex: 2, borderRadius: RADIUS.md, paddingVertical: 14, alignItems: 'center' },
  btnAddText:   { color: '#fff', fontSize: FONT.sizes.md, fontWeight: FONT.weights.bold },
})

import { Redirect } from 'expo-router'
import { View, ActivityIndicator, StyleSheet, useColorScheme } from 'react-native'
import { useAuth } from '../src/context/AuthContext'
import { COLORS } from '../src/theme'

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth()
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'

  // Show a branded splash while restoring tokens
  if (isLoading) {
    return (
      <View style={[styles.loader, { backgroundColor: isDark ? COLORS.dark.bg : COLORS.bg }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  // Route based on auth state
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/today" />
  }

  return <Redirect href="/auth" />
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

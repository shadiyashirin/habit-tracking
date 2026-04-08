import { Tabs } from 'expo-router'
import { useColorScheme, View, Text, StyleSheet } from 'react-native'
import { COLORS } from '../../src/theme'

function TabIcon({ name, focused, color }) {
  const icons = {
    today:   focused ? '●' : '○',
    week:    focused ? '▦' : '▢',
    stats:   focused ? '▲' : '△',
    profile: focused ? '◉' : '○',
  }
  return (
    <View style={styles.iconWrap}>
      <Text style={[styles.icon, { color }]}>{icons[name] ?? '●'}</Text>
    </View>
  )
}

export default function TabLayout() {
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'

  const tabBar = {
    backgroundColor: isDark ? COLORS.dark.bgCard : '#fff',
    borderTopColor:  isDark ? COLORS.dark.border  : COLORS.border,
    borderTopWidth:  1,
    paddingBottom:   8,
    paddingTop:      8,
    height:          64,
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: isDark ? '#666' : COLORS.textMuted,
        tabBarStyle: tabBar,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: ({ focused, color }) => <TabIcon name="today" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="week"
        options={{
          title: 'Week',
          tabBarIcon: ({ focused, color }) => <TabIcon name="week" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Progress',
          tabBarIcon: ({ focused, color }) => <TabIcon name="stats" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => <TabIcon name="profile" focused={focused} color={color} />,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  iconWrap: { alignItems: 'center', justifyContent: 'center', width: 28, height: 28 },
  icon:     { fontSize: 16 },
})

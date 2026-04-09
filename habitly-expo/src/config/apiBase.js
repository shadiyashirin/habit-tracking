import Constants from 'expo-constants'
import { Platform } from 'react-native'

function getExpoHost() {
  const candidates = [
    Constants.expoConfig?.hostUri,
    Constants.manifest2?.extra?.expoGo?.debuggerHost,
    Constants.manifest?.debuggerHost,
  ]

  for (const value of candidates) {
    if (typeof value === 'string' && value.length > 0) {
      return value.split(':')[0]
    }
  }

  return null
}

function getDevApiBase() {
  const expoHost = getExpoHost()

  if (expoHost) {
    return `http://${expoHost}:8000/api`
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api'
  }

  return 'http://localhost:8000/api'
}

export const API_BASE =
  typeof __DEV__ !== 'undefined' && __DEV__
    ? getDevApiBase()
    : 'https://habitly-backend.onrender.com/api'

const STORAGE_KEY = 'weather_api_key'

export function getStoredApiKey() {
  return localStorage.getItem(STORAGE_KEY) || ''
}

export function setStoredApiKey(apiKey) {
  localStorage.setItem(STORAGE_KEY, apiKey)
}

export function clearStoredApiKey() {
  localStorage.removeItem(STORAGE_KEY)
}

export function getEnvApiKey() {
  return import.meta.env.VITE_OPENWEATHER_API_KEY || ''
}

export function getEffectiveApiKey() {
  return getStoredApiKey() || getEnvApiKey()
}

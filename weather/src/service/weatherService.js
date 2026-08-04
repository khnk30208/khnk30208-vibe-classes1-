import { fetchCurrentWeather } from '../api/weatherApi'

export const UNITS = 'metric'

export function getWindDirection(deg) {
  const normalized = ((deg % 360) + 360) % 360

  if (normalized === 0) return '북'
  if (normalized > 0 && normalized < 90) return '북동'
  if (normalized === 90) return '동'
  if (normalized > 90 && normalized < 180) return '남동'
  if (normalized === 180) return '남'
  if (normalized > 180 && normalized < 270) return '남서'
  if (normalized === 270) return '서'
  return '북서'
}

export function getWeatherIconUrl(icon) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`
}

export async function searchCityWeather({ city, apiKey }) {
  const data = await fetchCurrentWeather({ city, apiKey, units: UNITS })
  const weather = data.weather?.[0]

  return {
    cityName: data.name,
    country: data.sys?.country,
    description: weather?.description,
    iconUrl: weather ? getWeatherIconUrl(weather.icon) : null,
    temp: Math.round(data.main.temp),
    tempMin: Math.round(data.main.temp_min),
    tempMax: Math.round(data.main.temp_max),
    windSpeed: data.wind?.speed,
    windDirection: getWindDirection(data.wind?.deg ?? 0),
  }
}

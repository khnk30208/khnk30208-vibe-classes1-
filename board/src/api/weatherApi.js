import axios from 'axios'

// OpenWeatherMap 현재 날씨
// 키는 .env 의 VITE_OPENWEATHER_API_KEY 에서 읽는다 (값은 개발자가 직접 입력)
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'

const weatherClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

export function getApiKey() {
  return import.meta.env.VITE_OPENWEATHER_API_KEY ?? ''
}

// HTTP 요청/응답만 담당한다. 가공과 조건 분기는 service 에서 한다
export async function fetchCurrentWeather({ query, apiKey }) {
  const response = await weatherClient.get('', {
    params: {
      q: query,
      appid: apiKey,
      units: 'metric',
      lang: 'kr',
    },
  })

  return response.data
}

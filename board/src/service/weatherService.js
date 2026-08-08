import { fetchCurrentWeather, getApiKey } from '../api/weatherApi'

export const NO_API_KEY_MESSAGE =
  '.env 에 VITE_OPENWEATHER_API_KEY 를 입력해 주세요.'

export function hasApiKey() {
  return getApiKey().trim().length > 0
}

function toErrorMessage(error) {
  if (error.response?.status === 401) return 'API 키를 확인해 주세요.'
  if (error.response?.status === 404) return '도시를 찾지 못했습니다.'
  return '날씨를 불러오지 못했습니다.'
}

// 응답을 화면이 쓰는 모양으로 가공한다. React 를 import 하지 않는다
export async function getCurrentWeather({ query }) {
  const data = await fetchCurrentWeather({ query, apiKey: getApiKey() })
  const weather = data.weather?.[0]

  return {
    description: weather?.description ?? '정보 없음',
    // 아이콘 코드만 넘긴다. 그리는 것은 화면(WeatherGlyph)이 한다
    iconCode: weather?.icon ?? null,
    temperature: Math.round(data.main.temp * 10) / 10,
  }
}

// 여러 도시를 한 번에 조회한다. 한 도시가 실패해도 나머지는 살린다
export async function getWeatherByCity(cities) {
  if (!hasApiKey()) {
    return cities.reduce((acc, city) => {
      acc[city.key] = { status: 'noKey', message: NO_API_KEY_MESSAGE }
      return acc
    }, {})
  }

  const results = await Promise.allSettled(
    cities.map((city) => getCurrentWeather(city)),
  )

  return cities.reduce((acc, city, index) => {
    const result = results[index]

    acc[city.key] =
      result.status === 'fulfilled'
        ? { status: 'success', ...result.value }
        : { status: 'error', message: toErrorMessage(result.reason) }

    return acc
  }, {})
}

import { useState } from 'react'
import Header from '../components/Header'
import SearchSection from '../components/SearchSection'
import WeatherDashboard from '../components/WeatherDashboard'
import continents from '../assets/continents.json'
import { searchCityWeather } from '../service/weatherService'
import { getEffectiveApiKey } from '../service/apiKeyService'
import styles from './WeatherPage.module.css'

export default function WeatherPage() {
  const [continentCode, setContinentCode] = useState('')
  const [cityQuery, setCityQuery] = useState('')
  const [manualCity, setManualCity] = useState('')

  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChangeContinent = (code) => {
    setContinentCode(code)
    setCityQuery('')
  }

  const handleSearch = async () => {
    const targetCity = manualCity.trim() || cityQuery

    if (!targetCity) {
      setError('대륙/도시를 선택하거나 도시명을 입력해주세요.')
      return
    }

    const apiKey = getEffectiveApiKey()
    if (!apiKey) {
      setError('API Key가 설정되지 않았습니다.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await searchCityWeather({ city: targetCity, apiKey })
      setWeather(result)
    } catch (err) {
      setWeather(null)
      const status = err.response?.status
      if (status === 401) {
        setError('API Key가 유효하지 않습니다.')
      } else if (status === 404) {
        setError('해당 도시의 날씨 정보를 찾을 수 없습니다.')
      } else {
        setError('날씨 정보를 불러오는 중 오류가 발생했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <Header />

      <main className="max-w-2xl mx-auto flex flex-col items-center gap-5 px-4 pb-16">
        <SearchSection
          continents={continents}
          continentCode={continentCode}
          onChangeContinent={handleChangeContinent}
          cityQuery={cityQuery}
          onChangeCity={setCityQuery}
          manualCity={manualCity}
          onChangeManualCity={setManualCity}
          onSearch={handleSearch}
          loading={loading}
        />

        {error && <p className={styles.error}>{error}</p>}

        {weather && <WeatherDashboard weather={weather} />}
      </main>
    </div>
  )
}

import { useEffect, useState } from 'react'
import styles from './HomePage.module.css'
import WeatherGlyph from '../components/WeatherGlyph'
import { CITIES } from '../constants/cities'
import { getWeatherByCity } from '../service/weatherService'
import { formatDate, formatTimeParts } from '../utils/datetime'

function Reading({ weather }) {
  if (!weather) {
    return <p className={styles.note}>불러오는 중</p>
  }

  if (weather.status !== 'success') {
    return (
      <p className={`${styles.note} ${styles.noteAlert}`}>{weather.message}</p>
    )
  }

  return (
    <div className={styles.reading}>
      <WeatherGlyph code={weather.iconCode} className={styles.glyph} />
      <div>
        <p className={styles.temp}>
          {weather.temperature}
          <span className={styles.degree}>°</span>
        </p>
        <p className={styles.desc}>{weather.description}</p>
      </div>
    </div>
  )
}

function CityPanel({ city, now, weather }) {
  const time = formatTimeParts(now, city.timeZone)

  return (
    <article className={styles.panel}>
      <p className={styles.latin}>{city.latin}</p>
      <h2 className={styles.korean}>{city.label}</h2>

      <p className={styles.clock}>
        <span className={styles.meridiem}>{time.meridiem}</span>
        <span className={styles.hourMinute}>{time.hourMinute}</span>
        <span className={styles.second}>{time.second}</span>
      </p>
      <p className={styles.date}>{formatDate(now, city.timeZone)}</p>

      <div className={styles.rule} />

      <Reading weather={weather} />
    </article>
  )
}

// 대문 페이지. 앱을 열면 이 화면이 맨 처음 보인다
export default function HomePage() {
  const [now, setNow] = useState(() => new Date())
  const [weatherByCity, setWeatherByCity] = useState(null)

  // 시계는 1초마다 갱신한다
  useEffect(() => {
    const timerId = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timerId)
  }, [])

  // 날씨는 진입 시 한 번 조회한다
  useEffect(() => {
    let alive = true

    getWeatherByCity(CITIES).then((result) => {
      if (alive) setWeatherByCity(result)
    })

    return () => {
      alive = false
    }
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.masthead}>
          <p className={styles.eyebrow}>UTC+09:00 · 같은 시간대</p>
          <h1 className={styles.display}>
            같은 시각,
            <br />
            다른 하늘.
          </h1>
        </header>

        {/* 두 도시는 한 장의 판을 실선으로 나눈 형태다 */}
        <div className={styles.diptych}>
          {CITIES.map((city) => (
            <CityPanel
              key={city.key}
              city={city}
              now={now}
              weather={weatherByCity?.[city.key]}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

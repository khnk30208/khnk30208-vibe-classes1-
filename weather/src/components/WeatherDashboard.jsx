import neon from '../styles/neon.module.css'
import styles from './WeatherDashboard.module.css'

export default function WeatherDashboard({ weather }) {
  return (
    <section className={`${neon.panel} w-full p-5 sm:p-6`}>
      <div className={styles.summary}>
        {weather.iconUrl && (
          <img src={weather.iconUrl} alt={weather.description} className={styles.icon} />
        )}
        <div className={styles.summaryText}>
          <h2 className={styles.cityName}>
            {weather.cityName}
            {weather.country ? `, ${weather.country}` : ''}
          </h2>
          <p className={styles.description}>{weather.description}</p>
        </div>
        <div className={styles.mainTemp}>{weather.temp}°C</div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <span className={neon.label}>최고 온도</span>
          <span className={styles.cardValue}>{weather.tempMax}°C</span>
        </div>
        <div className={styles.card}>
          <span className={neon.label}>최저 온도</span>
          <span className={styles.cardValue}>{weather.tempMin}°C</span>
        </div>
        <div className={styles.card}>
          <span className={neon.label}>풍향</span>
          <span className={styles.cardValue}>{weather.windDirection}</span>
        </div>
        <div className={styles.card}>
          <span className={neon.label}>풍속</span>
          <span className={styles.cardValue}>{weather.windSpeed} m/s</span>
        </div>
      </div>
    </section>
  )
}

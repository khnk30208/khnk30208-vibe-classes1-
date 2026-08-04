import styles from './Header.module.css'

export default function Header() {
  return (
    <header className="w-full px-4 pt-10 pb-6 text-center">
      <h1 className={`text-3xl sm:text-5xl font-black tracking-[0.25em] ${styles.title}`}>
        CURRENT WEATHER
      </h1>
      <p className={`mt-3 text-xs sm:text-sm tracking-[0.35em] uppercase ${styles.subtitle}`}>
        실시간 도시별 날씨 정보
      </p>
    </header>
  )
}

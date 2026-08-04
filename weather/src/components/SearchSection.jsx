import neon from '../styles/neon.module.css'

export default function SearchSection({
  continents,
  continentCode,
  onChangeContinent,
  cityQuery,
  onChangeCity,
  manualCity,
  onChangeManualCity,
  onSearch,
  loading,
}) {
  const selectedContinent = continents.find((c) => c.code === continentCode)
  const cities = selectedContinent ? selectedContinent.cities : []

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch()
  }

  return (
    <form className={`${neon.panel} w-full p-4 sm:p-5 flex flex-col gap-3`} onSubmit={handleSubmit}>
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          className={`${neon.select} flex-1`}
          value={continentCode}
          onChange={(e) => onChangeContinent(e.target.value)}
        >
          <option value="">대륙 선택</option>
          {continents.map((continent) => (
            <option key={continent.code} value={continent.code}>
              {continent.nameKo}
            </option>
          ))}
        </select>

        <select
          className={`${neon.select} flex-1`}
          value={cityQuery}
          onChange={(e) => onChangeCity(e.target.value)}
          disabled={!continentCode}
        >
          <option value="">도시 선택</option>
          {cities.map((city) => (
            <option key={city.query} value={city.query}>
              {city.nameKo}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          className={`${neon.input} flex-1`}
          placeholder="도시명을 직접 입력 (예: Seoul)"
          value={manualCity}
          onChange={(e) => onChangeManualCity(e.target.value)}
        />
        <button type="submit" className={`${neon.button} px-6 py-2`} disabled={loading}>
          {loading ? '검색중...' : '검색'}
        </button>
      </div>
    </form>
  )
}

import { useState } from 'react'
import styles from './GymCard.module.css'
import {
  DEFAULT_RADIUS,
  RADIUS_OPTIONS,
  buildGymText,
  findNearbyGyms,
  getSourceLabel,
} from '../service/gymService'
import { formatDistance } from '../utils/geo'
import { downloadText, todayStamp } from '../utils/download'

// 비동기 상태만 자체적으로 갖는다. 검색·정렬은 gymService 가 한다
export default function GymCard() {
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [radius, setRadius] = useState(DEFAULT_RADIUS)

  async function handleSearch() {
    setStatus('loading')
    setError('')

    try {
      const found = await findNearbyGyms({ radius })
      setResult(found)
      setStatus('done')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  const radiusLabel =
    RADIUS_OPTIONS.find((option) => option.value === radius)?.label ?? ''

  // 검색 전에는 "쓸 예정인" 데이터원, 검색 후에는 "실제로 쓴" 데이터원을 보여 준다
  const sourceLabel = result?.sourceLabel ?? getSourceLabel()

  return (
    <div className={styles.wrap}>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.button}
          onClick={handleSearch}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? '찾는 중...' : '내 주변 찾기'}
        </button>
        <label className={styles.radiusLabel}>
          <span className="sr-only">검색 반경</span>
          <select
            className={styles.radius}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            disabled={status === 'loading'}
          >
            {RADIUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                반경 {option.label}
              </option>
            ))}
          </select>
        </label>

        {status === 'done' && result.gyms.length > 0 && (
          <button
            type="button"
            className={styles.saveButton}
            onClick={() =>
              downloadText(`주변헬스장_${todayStamp()}.txt`, buildGymText(result))
            }
          >
            TXT 저장
          </button>
        )}

        <span className={styles.source}>데이터 · {sourceLabel}</span>
      </div>

      {status === 'idle' && (
        <p className={styles.notice}>
          위치 권한을 허용하면 현재 위치를 기준으로 가까운 헬스장을 찾습니다. 위치는
          검색에만 쓰고 저장하지 않습니다.
        </p>
      )}

      {status === 'error' && <p className={styles.error}>{error}</p>}

      {/* 카카오를 쓰려다 실패해 Overpass 로 되돌아온 경우 이유를 밝힌다 */}
      {status === 'done' && result.fallbackReason && (
        <p className={styles.error}>
          카카오맵 검색에 실패해 OpenStreetMap 결과를 보여 줍니다. {result.fallbackReason}
        </p>
      )}

      {status === 'done' && result.gyms.length === 0 && (
        <p className={styles.empty}>
          반경 {radiusLabel} 안에서 찾은 곳이 없습니다. 반경을 넓혀 보세요.
        </p>
      )}

      {status === 'done' && result.gyms.length > 0 && (
        <div className={styles.list}>
          {result.gyms.map((gym) => (
            <div className={styles.item} key={gym.id}>
              <span className={styles.name}>{gym.name}</span>
              <span className={styles.distance}>{formatDistance(gym.distance)}</span>
              <span className={styles.meta}>
                {gym.address || '주소 정보 없음'}
                {gym.phone ? ` · ${gym.phone}` : ''}
                {gym.url ? (
                  <>
                    {' · '}
                    <a
                      className={styles.link}
                      href={gym.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      상세보기
                    </a>
                  </>
                ) : null}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* OSM 은 한국 헬스장 데이터가 성기다. 결과가 적은 이유를 밝혀 둔다 */}
      {status === 'done' && result.source === 'osm' && !result.fallbackReason && (
        <p className={styles.notice}>
          지금은 키가 필요 없는 OpenStreetMap 데이터를 쓰고 있어 등록된 곳이 적을 수
          있습니다. <code>.env</code> 에 <code>VITE_KAKAO_MAP_KEY</code> 를 넣으면
          카카오맵 검색으로 자동 전환됩니다.
        </p>
      )}
    </div>
  )
}

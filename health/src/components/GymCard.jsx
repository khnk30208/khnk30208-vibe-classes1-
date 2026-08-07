import { useState } from 'react'
import styles from './GymCard.module.css'
import { findNearbyGyms, getSourceLabel } from '../service/gymService'
import { formatDistance } from '../utils/geo'

// 비동기 상태만 자체적으로 갖는다. 검색·정렬은 gymService 가 한다
export default function GymCard() {
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function handleSearch() {
    setStatus('loading')
    setError('')

    try {
      const found = await findNearbyGyms()
      setResult(found)
      setStatus('done')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  const usingKakao = result?.usingKakao ?? false

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
        <span className={styles.source}>데이터 · {getSourceLabel()}</span>
      </div>

      {status === 'idle' && (
        <p className={styles.notice}>
          위치 권한을 허용하면 현재 위치를 기준으로 가까운 헬스장을 찾습니다. 위치는
          검색에만 쓰고 저장하지 않습니다.
        </p>
      )}

      {status === 'error' && <p className={styles.error}>{error}</p>}

      {status === 'done' && result.gyms.length === 0 && (
        <p className={styles.empty}>반경 2km 안에서 찾은 곳이 없습니다.</p>
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
      {status === 'done' && !usingKakao && (
        <p className={styles.notice}>
          지금은 키가 필요 없는 OpenStreetMap 데이터를 쓰고 있어 등록된 곳이 적을 수
          있습니다. <code>.env</code> 에 <code>VITE_KAKAO_MAP_KEY</code> 를 넣으면
          카카오맵 검색으로 자동 전환됩니다.
        </p>
      )}
    </div>
  )
}

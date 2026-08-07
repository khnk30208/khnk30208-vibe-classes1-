// 헬스장 검색 비지니스 로직. React 를 import 하지 않는다 (CLAUDE.md 3.1)

import * as gymApi from '../api/gymApi'
import { distanceInMeters } from '../utils/geo'

export const DEFAULT_RADIUS = 2000
export const MAX_RESULTS = 12

// 카카오 로컬의 radius 상한은 20000m 다. 그 안에서 고르게 한다
export const RADIUS_OPTIONS = [
  { value: 1000, label: '1km' },
  { value: 2000, label: '2km' },
  { value: 5000, label: '5km' },
]

export const SOURCE_LABEL = {
  kakao: '카카오맵',
  osm: 'OpenStreetMap',
}

// 키가 있으면 카카오를 먼저 시도한다는 뜻이지, 성공을 보장하지는 않는다
export function getPreferredSource() {
  return gymApi.hasKakaoKey() ? 'kakao' : 'osm'
}

export function getSourceLabel() {
  return SOURCE_LABEL[getPreferredSource()]
}

function decorate(gyms, origin) {
  return gyms
    .map((gym) => ({
      ...gym,
      distance: distanceInMeters(origin, { lat: gym.lat, lng: gym.lng }),
    }))
    // 거리를 못 구한 항목은 뒤로 밀지 말고 아예 뺀다 (정렬이 흔들린다)
    .filter((gym) => Number.isFinite(gym.distance))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, MAX_RESULTS)
}

/**
 * 현재 위치 기준으로 주변 헬스장을 찾는다.
 * 위치는 검색에만 쓰고 어디에도 저장하지 않는다 (CLAUDE.md 5장)
 *
 * 카카오 키가 있으면 카카오를 먼저 쓰고, 실패하면 Overpass 로 되돌아간다.
 * 키 문제로 결과가 통째로 안 나오는 상황을 만들지 않는다
 */
export async function findNearbyGyms({ radius = DEFAULT_RADIUS } = {}) {
  const origin = await gymApi.getCurrentPosition()

  if (gymApi.hasKakaoKey()) {
    try {
      const gyms = await gymApi.searchGymsByKakao({ ...origin, radius })

      return {
        origin,
        gyms: decorate(gyms, origin),
        source: 'kakao',
        sourceLabel: SOURCE_LABEL.kakao,
        fallbackReason: '',
      }
    } catch (error) {
      // 카카오가 안 되면 조용히 실패하지 말고, 왜 폴백했는지 화면에 남긴다
      const gyms = await gymApi.searchGymsByOverpass({ ...origin, radius })

      return {
        origin,
        gyms: decorate(gyms, origin),
        source: 'osm',
        sourceLabel: SOURCE_LABEL.osm,
        fallbackReason: error.message,
      }
    }
  }

  const gyms = await gymApi.searchGymsByOverpass({ ...origin, radius })

  return {
    origin,
    gyms: decorate(gyms, origin),
    source: 'osm',
    sourceLabel: SOURCE_LABEL.osm,
    fallbackReason: '',
  }
}

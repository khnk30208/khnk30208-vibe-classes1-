// 헬스장 검색 비지니스 로직. React 를 import 하지 않는다 (CLAUDE.md 3.1)

import * as gymApi from '../api/gymApi'
import { distanceInMeters } from '../utils/geo'

export const DEFAULT_RADIUS = 2000
export const MAX_RESULTS = 12

export function getSourceLabel() {
  return gymApi.hasKakaoKey() ? '카카오맵' : 'OpenStreetMap'
}

/**
 * 현재 위치 기준으로 주변 헬스장을 찾는다.
 * 위치는 검색에만 쓰고 어디에도 저장하지 않는다 (CLAUDE.md 5장)
 */
export async function findNearbyGyms({ radius = DEFAULT_RADIUS } = {}) {
  const origin = await gymApi.getCurrentPosition()

  const gyms = gymApi.hasKakaoKey()
    ? await gymApi.searchGymsByKakao({ ...origin, radius })
    : await gymApi.searchGymsByOverpass({ ...origin, radius })

  const withDistance = gyms
    .map((gym) => ({
      ...gym,
      distance: distanceInMeters(origin, { lat: gym.lat, lng: gym.lng }),
    }))
    // 거리를 못 구한 항목은 뒤로 밀지 말고 아예 뺀다 (정렬이 흔들린다)
    .filter((gym) => Number.isFinite(gym.distance))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, MAX_RESULTS)

  return {
    origin,
    gyms: withDistance,
    source: getSourceLabel(),
    usingKakao: gymApi.hasKakaoKey(),
  }
}

// 헬스장 데이터 취득만 담당한다. 거리 계산·정렬은 service 가 한다 (CLAUDE.md 3.1)
//
// 기본은 OpenStreetMap Overpass API 다. 키가 필요 없고 무료이며 CORS 를 허용한다.
// .env 에 VITE_KAKAO_MAP_KEY 가 있으면 카카오맵 JS SDK 로 자동 전환한다
// (한국 헬스장 데이터는 카카오 쪽이 훨씬 촘촘하다)

import axios from 'axios'

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'
const KAKAO_SDK_URL = 'https://dapi.kakao.com/v2/maps/sdk.js'

export function getKakaoKey() {
  return import.meta.env.VITE_KAKAO_MAP_KEY || ''
}

export function hasKakaoKey() {
  return Boolean(getKakaoKey())
}

// 브라우저 위치. 권한을 거부해도 예외로 끝내지 않고 이유를 담아 던진다
export function getCurrentPosition({ timeout = 10000 } = {}) {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('이 브라우저는 위치 기능을 지원하지 않습니다.'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error('위치 권한이 거부되었습니다.'))
          return
        }

        reject(new Error('위치를 가져오지 못했습니다.'))
      },
      { timeout, maximumAge: 60000 },
    )
  })
}

export async function searchGymsByOverpass({ lat, lng, radius = 2000 }) {
  // fitness_centre 가 표준 태그이고, sport=fitness 로만 달린 곳도 함께 훑는다
  const query = `[out:json][timeout:20];
(
  node["leisure"="fitness_centre"](around:${radius},${lat},${lng});
  way["leisure"="fitness_centre"](around:${radius},${lat},${lng});
  node["sport"="fitness"](around:${radius},${lat},${lng});
);
out center 40;`

  const response = await axios.post(
    OVERPASS_URL,
    new URLSearchParams({ data: query }),
    { timeout: 25000 },
  )

  const elements = response.data?.elements ?? []

  return elements
    .map((element) => {
      // way 는 좌표가 center 에 들어온다
      const lat2 = element.lat ?? element.center?.lat
      const lng2 = element.lon ?? element.center?.lon

      if (!Number.isFinite(lat2) || !Number.isFinite(lng2)) return null

      const tags = element.tags ?? {}

      return {
        id: `osm-${element.type}-${element.id}`,
        name: tags.name || '이름 없는 운동시설',
        address: [tags['addr:city'], tags['addr:street'], tags['addr:housenumber']]
          .filter(Boolean)
          .join(' '),
        phone: tags.phone || tags['contact:phone'] || '',
        lat: lat2,
        lng: lng2,
        source: 'osm',
      }
    })
    .filter(Boolean)
}

let sdkPromise = null

// 카카오 JS SDK 를 한 번만 주입한다
function loadKakaoSdk() {
  if (sdkPromise) return sdkPromise

  sdkPromise = new Promise((resolve, reject) => {
    if (window.kakao?.maps?.services) {
      resolve(window.kakao)
      return
    }

    const script = document.createElement('script')
    script.src = `${KAKAO_SDK_URL}?appkey=${getKakaoKey()}&libraries=services&autoload=false`
    script.async = true
    script.onload = () => {
      window.kakao.maps.load(() => resolve(window.kakao))
    }
    script.onerror = () => {
      sdkPromise = null
      reject(new Error('카카오맵 SDK 를 불러오지 못했습니다. 키와 도메인 등록을 확인하세요.'))
    }

    document.head.appendChild(script)
  })

  return sdkPromise
}

export async function searchGymsByKakao({ lat, lng, radius = 2000 }) {
  const kakao = await loadKakaoSdk()

  return new Promise((resolve, reject) => {
    const places = new kakao.maps.services.Places()

    places.keywordSearch(
      '헬스장',
      (data, status) => {
        if (status === kakao.maps.services.Status.ZERO_RESULT) {
          resolve([])
          return
        }

        if (status !== kakao.maps.services.Status.OK) {
          reject(new Error('카카오 장소 검색에 실패했습니다.'))
          return
        }

        resolve(
          data.map((place) => ({
            id: `kakao-${place.id}`,
            name: place.place_name,
            address: place.road_address_name || place.address_name || '',
            phone: place.phone || '',
            lat: Number(place.y),
            lng: Number(place.x),
            url: place.place_url,
            source: 'kakao',
          })),
        )
      },
      { location: new kakao.maps.LatLng(lat, lng), radius, sort: kakao.maps.services.SortBy.DISTANCE },
    )
  })
}

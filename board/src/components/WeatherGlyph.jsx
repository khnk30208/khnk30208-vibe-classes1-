// OpenWeatherMap 이 주는 PNG 아이콘 대신 선으로 그린 글리프를 쓴다.
// 외부 이미지 의존이 없어지고, 화면 톤과 굵기를 맞출 수 있다

const CLOUD =
  'M13 33.5h21a6 6 0 0 0 0-12 8.5 8.5 0 0 0-16.2-2.2A6.4 6.4 0 0 0 13 33.5z'

function Sun() {
  return (
    <>
      <circle cx="24" cy="24" r="7.5" />
      <path d="M24 8v4M24 36v4M8 24h4M36 24h4M12.7 12.7l2.8 2.8M32.5 32.5l2.8 2.8M35.3 12.7l-2.8 2.8M15.5 32.5l-2.8 2.8" />
    </>
  )
}

function Moon() {
  return <path d="M31.5 29.8A11.5 11.5 0 0 1 19.2 12a12.5 12.5 0 1 0 15.3 15.9 11.5 11.5 0 0 1-3 1.9z" />
}

function Cloud({ y = 0 }) {
  return <path d={CLOUD} transform={y ? `translate(0 ${y})` : undefined} />
}

// 해/달이 구름 뒤로 살짝 보이는 상태.
// scale 은 원점(0,0) 기준이므로 translate 로 자리를 잡는다
function PartlyCloudy({ night }) {
  return (
    <>
      <g transform="translate(2 1) scale(0.62)">{night ? <Moon /> : <Sun />}</g>
      <path d={CLOUD} transform="translate(2 5) scale(0.92)" />
    </>
  )
}

function Overcast() {
  return (
    <>
      <path d="M18 20.5a7 7 0 0 1 12.6 1.4" transform="translate(0 -8)" opacity="0.55" />
      <Cloud y={2} />
    </>
  )
}

function Rain({ heavy }) {
  return (
    <>
      <Cloud y={-4} />
      <path
        d={
          heavy
            ? 'M17 33l-2 6M24 33l-2 6M31 33l-2 6M38 33l-2 6'
            : 'M19 33l-2 6M27 33l-2 6M35 33l-2 6'
        }
      />
    </>
  )
}

function Thunder() {
  return (
    <>
      <Cloud y={-7} />
      <path d="M26 28l-6 8h5l-2 7 7-9h-5l3-6z" />
    </>
  )
}

function Snow() {
  return (
    <>
      <Cloud y={-4} />
      <path d="M19 34v6M16.4 35.5l5.2 3M21.6 35.5l-5.2 3M32 34v6M29.4 35.5l5.2 3M34.6 35.5l-5.2 3" />
    </>
  )
}

function Mist() {
  return <path d="M11 15h26M9 21h30M13 27h22M17 33h18" />
}

function pickGlyph(code) {
  const group = code.slice(0, 2)
  const night = code.endsWith('n')

  switch (group) {
    case '01':
      return night ? <Moon /> : <Sun />
    case '02':
      return <PartlyCloudy night={night} />
    case '03':
      return <Cloud y={2} />
    case '04':
      return <Overcast />
    case '09':
      return <Rain heavy />
    case '10':
      return <Rain />
    case '11':
      return <Thunder />
    case '13':
      return <Snow />
    case '50':
      return <Mist />
    default:
      return <Cloud y={2} />
  }
}

export default function WeatherGlyph({ code, className }) {
  if (!code) return null

  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {pickGlyph(code)}
    </svg>
  )
}

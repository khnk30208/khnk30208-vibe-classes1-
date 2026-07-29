(function () {
  "use strict";

  // ==================== 설정 ====================
  // 아래 따옴표 사이에 OpenWeatherMap API 키를 입력하세요.
  // 키 발급: https://home.openweathermap.org/api_keys (무료 가입 후 발급)
  const API_KEY = "97d18319572b3537649d00267f011590";

  const API_URL = "https://api.openweathermap.org/data/2.5/weather";

  // ==================== DOM ====================
  const form = document.getElementById("searchForm");
  const cityInput = document.getElementById("cityInput");
  const weatherCard = document.getElementById("weatherCard");
  const message = document.getElementById("message");

  // ==================== 풍향 계산 (PRD 규칙) ====================
  function getWindDirection(deg) {
    const d = ((deg % 360) + 360) % 360; // 0 ~ 359 로 정규화
    if (d === 0) return "북";            // 0 또는 360
    if (d < 90) return "북동";           // 0 < x < 90
    if (d === 90) return "동";           // 90
    if (d < 180) return "남동";          // 90 < x < 180
    if (d === 180) return "남";          // 180
    if (d < 270) return "남서";          // 180 < x < 270
    if (d === 270) return "서";          // 270
    return "북서";                       // 270 < x < 360
  }

  // ==================== 상태 메시지 ====================
  function showMessage(text) {
    message.textContent = text;
    weatherCard.hidden = true;
  }

  // ==================== 날씨 카드 렌더링 ====================
  function renderWeather(data) {
    const info = data.weather[0];
    const main = data.main;
    const wind = data.wind || {};
    const deg = typeof wind.deg === "number" ? wind.deg : 0;
    const speed = typeof wind.speed === "number" ? wind.speed : 0;

    const iconUrl = `https://openweathermap.org/img/wn/${info.icon}@4x.png`;
    const country = data.sys && data.sys.country ? `, ${data.sys.country}` : "";

    weatherCard.innerHTML = `
      <div class="city">${data.name}${country}</div>
      <div class="description">${info.description}</div>
      <div class="card-main">
        <img class="weather-icon" src="${iconUrl}" alt="${info.description}">
        <div class="temp">${Math.round(main.temp)}°</div>
      </div>
      <div class="temp-range">
        <span class="pill max">최고 ${Math.round(main.temp_max)}°</span>
        <span class="pill min">최저 ${Math.round(main.temp_min)}°</span>
      </div>
      <div class="detail-grid">
        <div class="tile">
          <span class="tile-icon">🧭</span>
          <span class="tile-label">풍향</span>
          <span class="tile-value"><span class="arrow" style="transform: rotate(${deg}deg)">↑</span> ${getWindDirection(deg)} <small>${deg}°</small></span>
        </div>
        <div class="tile">
          <span class="tile-icon">💨</span>
          <span class="tile-label">풍속</span>
          <span class="tile-value">${speed} <small>m/s</small></span>
        </div>
        <div class="tile">
          <span class="tile-icon">💧</span>
          <span class="tile-label">습도</span>
          <span class="tile-value">${main.humidity}<small>%</small></span>
        </div>
      </div>
    `;

    message.textContent = "";
    weatherCard.hidden = false;
  }

  // ==================== API 호출 ====================
  async function fetchWeather(city) {
    if (!API_KEY) {
      showMessage("API 키가 설정되지 않았습니다. weather.js 파일 상단의 API_KEY 값을 입력하세요.");
      return;
    }

    showMessage("날씨 정보를 불러오는 중...");

    const params = new URLSearchParams({
      q: city,
      appid: API_KEY,
      units: "metric", // 섭씨(°C) 로 표시
      lang: "kr",      // 한글 날씨 설명
    });

    try {
      const response = await fetch(`${API_URL}?${params.toString()}`);

      if (!response.ok) {
        if (response.status === 404) {
          showMessage(`'${city}' 도시를 찾을 수 없습니다.`);
        } else if (response.status === 401) {
          showMessage("API 키가 올바르지 않습니다. 키를 다시 확인하세요.");
        } else {
          showMessage(`오류가 발생했습니다. (${response.status})`);
        }
        return;
      }

      const data = await response.json();
      renderWeather(data);
    } catch (error) {
      showMessage("네트워크 오류가 발생했습니다. 잠시 후 다시 시도하세요.");
    }
  }

  // ==================== 이벤트 ====================
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const city = cityInput.value.trim();
    if (!city) {
      showMessage("도시 이름을 입력하세요.");
      cityInput.focus();
      return;
    }
    fetchWeather(city);
  });
})();

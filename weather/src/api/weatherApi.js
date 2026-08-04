import axios from 'axios'

const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export async function fetchCurrentWeather({ city, apiKey = API_KEY, units }) {
  const response = await axios.get(BASE_URL, {
    params: {
      q: city,
      appid: apiKey,
      units,
    },
  })
  return response.data
}

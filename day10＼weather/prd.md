
# 1. 최근 날씨 정보 사이트 만들기
- 원하는 도시의 현재 날씨를 표현


# 2. API 사용
- https://openweathermap.org 를 이요
- https://openweathermap.org/api/current?collection=current_forecast#other 페이지 참고

## 2.1 API 설명
- end-point : https://api.openweathermap.org/data/2.5/weather
- 매개변수
    - q : 도시이름
    - appid : api key
    - unsit : 
- 결과 내용
'''
{
     "coord": {
       "lon": -0.13,
       "lat": 51.51
     },
     "weather": [
       {
         "id": 300,
         "main": "Drizzle",
         "description": "light intensity drizzle",
         "icon": "09d"
       }
     ],
     "base": "stations",
     "main": {
       "temp": 280.32,
       "pressure": 1012,
       "humidity": 81,
       "temp_min": 279.15,
       "temp_max": 281.15
     },
     "visibility": 10000,
     "wind": {
       "speed": 4.1,
       "deg": 80
     },
     "clouds": {
       "all": 90
     },
     "dt": 1485789600,
     "sys": {
       "type": 1,
       "id": 5091,
       "message": 0.0103,
       "country": "GB",
       "sunrise": 1485762037,
       "sunset": 1485794875
     },
     "id": 2643743,
     "name": "London",
     "cod": 200
     }
'''
- icon 을 이용해서 날씨 이미지 표현



# 3. UI 설정
- 기본적으로 화면 중앙 정렬
- 도시를 입력받을 input 창과 검색 버튼
- 검색을 누르면 해당 도시의 날씨 정보 출력
- 날씨 정보는 , 현재 온도 , 최고 , 최저 온도 , 풍향 , 풍속
- 풍향 :
     0 ~ 9 < x < 90 : 북동
     90 : 동
     90 < x < 180 : 남동
     180 : 남
     180 < x < 270 남서
     270 : 서
     270 < x < 360 : 북서
     360 또는 0 : 북

## 3.1 디자인
- 밝은 계열의 바탕화면
- 기본적으로 모두 중앙 정렬
- input 박스는 라운딩 처리가된 부드러운 곡선
- 버튼도 푸른색 계열의 그라데이션 배경
- 글자는 고딕체의 흰색
- 폰트는 button 크기의 90%
- 날씨 정보 창은 산뜻한 디자인으로 처리


## 4. 기술 스펙
- html/css/js 를 이용해서 작성
- Es6 문법을 준수하여 구현
- css/js 파일 별도 분리

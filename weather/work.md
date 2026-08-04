
# 1. 최근 날씨 정보 사이트 만들기
- 원하는 도시의 현재 날씨를 표현


# 2. API 사용
- https://openweathermap.org 를 이요
- https://openweathermap.org/api/current?collection=current_forecast#other 페이지 참고

# 3. API KEY
- .env 파일을 만들어서 관리한다.
- KEY는 사용자가 직접 입력할 수 있도록 하낟.
- .env 파일은 gitignore 처리 한다.

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

### 3.1.1 디자인 구성
- 헤더에는 current Weather 라는 타이틀
- 중앙에 검색섹션을 만들고 input 과 검색 버튼을 위치
- 검색 섹션에는 2개의 셀렉트 박스와 검색 버튼을 위치
- 첫번째는 대륙을 선택
- 두번째는 해당 대륙에 존재하는 도시 목록을 보여준다.
- 검색버튼을 누르면 
- 검색섹션 하단에 결과를 출력하도록 한다.
- 결과는 대시보드 형태
- 전체적으로 사이버틱한 디자인



## 4. 대륙/도시정보 데이터
- assets 폴더에 셀렉트 박스에서 사용할 대륙과 도시정보를 만든다.
- 해당 정보는 사이트에서 가져오도록 한다.
- 하나의 대륙에는 대표적으로 20개 정도의 도시를 보여준다.
- 수집은 랜덤하게 판단하여 알아서 가져오도록 한다.
- 데이터 포멧은 json 형태로 한다.
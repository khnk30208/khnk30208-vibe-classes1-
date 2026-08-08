# health — 건강관리 대시보드

나이·체중·신장을 입력하면 BMI·기초대사량·필요 영양소·운동·주변 헬스장을 알려 주는
대시보드. React + Vite, 백엔드 없이 브라우저 안에서만 동작한다.

- 규칙: `CLAUDE.md`
- 요구사항: `work.md`
- 작업별 프롬프트: `doc/`

## 실행

```bash
npm install
npm run dev
```

`http://localhost:3000` 이 자동으로 열린다.

### 같은 공유기의 다른 기기에서 열기

`vite.config.js` 에 `server.host: true` 가 있어 실행하면 **Network 주소가 함께 출력**된다.

```
➜  Local:   http://localhost:3000/
➜  Network: http://192.168.0.10:3000/     ← 휴대폰·다른 PC 에서 이 주소로 접속
```

- 같은 와이파이에 있어야 한다
- 윈도우 방화벽이 처음 한 번 물어보면 **허용**을 눌러야 한다
- 카카오맵을 쓰려면 이 주소도 카카오 콘솔의 Web 플랫폼에 등록해야 한다

## 인터넷에 올리기 (GitHub Pages)

`.github/workflows/deploy-health.yml` 이 `main` 의 `health/` 변경을 감지해 자동 배포한다.
**저장소에서 한 번만 설정하면 된다.**

1. GitHub 저장소 → **Settings → Pages → Build and deployment → Source** 를
   **GitHub Actions** 로 바꾼다
2. (선택) **Settings → Secrets and variables → Actions → New repository secret**
   - 이름 `VITE_KAKAO_MAP_KEY`, 값은 카카오 JavaScript 키
   - 넣지 않아도 빌드된다. 그때는 헬스장 검색이 OpenStreetMap 으로 동작한다
3. `main` 에 `health/` 를 푸시하면 배포된다 (Actions 탭에서 진행 상황 확인)

배포 주소는 `https://<계정>.github.io/<저장소>/` 다.
빌드 시 `VITE_BASE` 로 하위 경로를 넘기므로 자산 경로가 어긋나지 않는다.

> 카카오맵을 배포본에서도 쓰려면 **그 주소도 카카오 콘솔의 Web 플랫폼에 등록**해야 한다.
> 등록하지 않으면 401 이 나고 자동으로 OpenStreetMap 으로 넘어간다.

## 확인

```bash
npm run lint     # oxlint
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과를 실제로 열어 보기
```

## 저장되는 데이터

전부 이 브라우저의 localStorage 에만 남는다. 서버로 보내지 않는다.

| 키 | 내용 |
|---|---|
| `health:posts` | 게시판 글 |
| `health:records` | 건강 기록 (하루 한 줄) |
| `health:habits` | 오늘 체크한 생활 습관 |
| `health:currentUser` · `health:token` | 로그인 상태 (목 구현) |
| `health:theme` | 라이트/다크 선택 |

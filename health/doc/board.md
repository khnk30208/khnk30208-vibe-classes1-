# board.md

> 게시판 기능 작업 프롬프트 (work.md 단계 2)
> 작성일: 2026-08-07
> 대상 프로젝트: `health/`


# 1. 요청

`work.md` 1. 진행 단계의 **단계 2 — 게시판 기능 (목록/상세/글쓰기/수정, localStorage)**


# 2. 해석 및 결정 사항

## 2.1 삭제 기능 포함

- `work.md` 에는 `목록/상세/글쓰기/수정` 만 적혀 있다
- 그러나 수정만 있고 삭제가 없으면 잘못 쓴 글을 지울 방법이 없다.
  수정과 같은 권한(작성자 본인)·같은 레이어에서 처리되므로 **삭제를 함께 넣는다**
- 원치 않으면 `BoardDetail` 의 삭제 버튼과 `postService.removePost` 만 걷어내면 된다

## 2.2 저장소

- 백엔드 서버를 두지 않는다 (`CLAUDE.md` 1.5)
- `api/postApi.js` 가 **localStorage 를 읽고 쓰는 비동기 함수**로 REST API 흉내를 낸다
  - 나중에 실제 백엔드가 생기면 이 파일만 axios 호출로 바꾸면 된다
  - 화면·서비스는 `await` 로 부르므로 교체해도 코드가 바뀌지 않는다
- 저장 키: `health:posts`

## 2.3 권한 규칙

- 글쓰기: **로그인 사용자만**. 비로그인 시 목록에 글쓰기 버튼을 노출하지 않는다
- 수정·삭제: **작성자 본인만**
- 판정은 `postService.canEditPost(post, user)` 에서 하고,
  화면은 그 결과(boolean)만 받아 버튼 노출을 결정한다 (`CLAUDE.md` 3.1 레이어 규칙)

## 2.4 화면 전환

- 게시판 내부 전환은 페이지 이동이 아니다 (`CLAUDE.md` 4.4)
- `BoardPage` 가 `view`(`'list' | 'detail' | 'write' | 'edit'`) 와 `selectedPostId` 를 갖는다
- 하위 컴포넌트는 스스로 화면을 바꾸지 않는다. `goList` / `goDetail(id)` /
  `goWrite` / `goEdit(id)` 를 props 로 내려받아 호출만 한다

## 2.5 목록

- 최신순(작성일 내림차순) 정렬
- 페이지당 10개, 페이지네이션
- 글이 하나도 없으면 "등록된 글이 없습니다" 안내

## 2.6 유효성 검사

| 항목 | 규칙 |
|---|---|
| 제목 | 필수, 1~100자 |
| 내용 | 필수, 1~2000자 |

- 검사는 `postService.validatePostInput` 에서 하고 화면은 메시지만 표시한다


# 3. 데이터 모델

```js
{
  id: string,          // crypto.randomUUID()
  title: string,
  content: string,
  authorId: string,    // user.id
  authorName: string,  // user.nickname
  createdAt: string,   // ISO 문자열
  updatedAt: string,   // ISO 문자열
}
```


# 4. 파일 계획

```
src/
  api/
    postApi.js         localStorage 읽기/쓰기만. 권한·검증 로직 없음
  service/
    postService.js     유효성 검사, 권한 판정, 정렬·페이징, api 호출 조합
  pages/
    BoardPage.jsx      view / selectedPostId 상태. 전환 함수를 props 로 내려준다
    BoardPage.module.css
  components/
    BoardList.jsx      목록 + 페이지네이션 + 글쓰기 버튼
    BoardList.module.css
    BoardDetail.jsx    상세 + 수정/삭제 버튼(작성자만)
    BoardDetail.module.css
    BoardForm.jsx      글쓰기/수정 공용 폼
    BoardForm.module.css
```

- 레이어 규칙: `pages` → `service` → `api`. `pages` 가 `api` 를 직접 import 하지 않는다
- `service` 는 React 를 import 하지 않는다


# 5. 완료 조건

- 비로그인 상태에서 목록을 볼 수 있고, 글쓰기 버튼은 보이지 않는다
- 로그인 후 글을 쓰면 목록 맨 위에 나타난다
- 상세로 들어가면 제목·작성자·작성일·내용이 보인다
- 작성자 본인일 때만 수정/삭제 버튼이 보인다
- 수정하면 내용이 반영되고 `updatedAt` 이 갱신된다
- 삭제하면 목록에서 사라진다
- 글이 11개 이상이면 페이지네이션이 동작한다
- 모든 전환에서 **주소가 바뀌지 않는다**
- 새로고침해도 글이 남아 있다 (localStorage)
- 콘솔 에러 0건, `npm run lint` 통과

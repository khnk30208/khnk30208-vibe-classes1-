---
name: add-feature
description: front-app 게시판에 화면/기능을 레이어 규칙(pages → service → api)에 맞게 추가한다. 새 페이지, 새 API 연동, 목 데이터 추가 요청에 사용.
---

`CLAUDE.md` 의 레이어 규칙을 코드로 옮기는 절차다.
**작업 전 `work.md` 를 먼저 읽고, 명세에 없는 기능은 만들지 않는다.**

## 작성 순서

항상 안쪽(api)부터 바깥쪽(pages)으로 만든다. 반대로 하면 화면에서
`api` 를 직접 import 하는 위반이 생기기 쉽다.

### 1. api — `src/api/*Api.js`

HTTP 요청/응답만. 조건 분기·권한 판단·에러 메시지 가공 금지.

```js
import client from './client'

export const fetchPosts = (params) => client.get('/posts', { params })
export const fetchPost = (id) => client.get(`/posts/${id}`)
export const createPost = (body) => client.post('/posts', body)
```

- 실제 백엔드가 없으므로 요청은 `src/api/mockAdapter.js` 가 가로챈다
- 새 엔드포인트를 쓰면 `mockAdapter.js` 에 해당 경로 핸들러를 함께 추가한다
- 핸들러는 localStorage 를 읽고 쓰며, 실제 서버처럼 `{ data, status }` 형태로 응답한다

### 2. service — `src/service/*Service.js`

비지니스 로직. **React 를 import 하지 않는다** (훅·JSX 금지).

여기에 들어갈 것:
- 유효성 검사 (아이디 길이, 제목 100자 제한 등)
- 권한 판정 (`canEditPost(post, currentUser)` → boolean)
- 페이징·정렬 계산
- api 에러를 화면이 쓸 수 있는 메시지로 변환

```js
import { fetchPosts } from '../api/postApi'

export const getPostPage = async (page) => {
  const { data } = await fetchPosts({ page, size: 10 })
  return { items: data.items, totalPages: Math.ceil(data.total / 10) }
}

export const canEditPost = (post, user) => !!user && post.authorId === user.id
```

### 3. store — `src/store/`

로그인 사용자처럼 **여러 화면이 공유하는 상태만** 여기 둔다.
한 화면에서만 쓰는 상태는 그 화면의 `useState` 로 둔다.

### 4. pages / components

- `pages/` 는 라우트 하나당 파일 하나
- 스타일은 같은 이름의 `*.module.css`
- `api` 를 직접 import 하지 않는다. `service` 만 부른다
- 권한 판정을 화면에서 직접 하지 않는다. `canEditPost()` 같은 service 함수의
  결과만 받아 버튼 노출을 결정한다

### 5. 라우트 등록

`src/App.jsx` 의 `<Routes>` 에 추가한다. 로그인이 필요한 경로는
`RequireAuth` 로 감싼다.

```jsx
<Route path="/posts/new" element={<RequireAuth><PostEditorPage /></RequireAuth>} />
```

## 마무리 체크

- [ ] `pages/` 안에서 `from '../api/` 를 import 한 곳이 없다
- [ ] `service/` 안에서 `from 'react'` 를 import 한 곳이 없다
- [ ] 새 엔드포인트마다 `mockAdapter.js` 핸들러가 있다
- [ ] `npm --prefix front-app run lint` 통과
- [ ] `run-board` 스킬의 기본 확인 시나리오로 화면 동작 확인

## 검사 명령

레이어 위반을 빠르게 훑는다.

```bash
rg "from '\.\./api/" front-app/src/pages front-app/src/components
```

```bash
rg "from 'react'" front-app/src/service front-app/src/utils
```

둘 다 결과가 없어야 한다.

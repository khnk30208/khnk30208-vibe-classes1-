// 예제용 간이 해시.
// 비밀번호를 평문으로 남기지 않기 위한 최소 장치일 뿐, 실제 서비스에서는
// 서버에서 bcrypt / argon2 같은 검증된 알고리즘을 써야 한다.
const SALT = 'board-example'

export const hashPassword = (password) => {
  const input = `${SALT}:${password}`
  let hash = 5381
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0
  }
  return `h${(hash >>> 0).toString(36)}`
}

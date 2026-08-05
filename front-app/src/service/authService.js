import { requestSignup, requestLogin } from '../api/authApi'
import { KEYS, readJson, writeJson, writeText, removeKey } from '../utils/storage'

export const USERNAME_MIN_LENGTH = 4
export const PASSWORD_MIN_LENGTH = 6

export const validateSignup = ({ username, password, passwordConfirm, nickname }) => {
  const errors = {}

  if (!username?.trim()) {
    errors.username = '아이디를 입력하세요.'
  } else if (username.trim().length < USERNAME_MIN_LENGTH) {
    errors.username = `아이디는 ${USERNAME_MIN_LENGTH}자 이상이어야 합니다.`
  }

  if (!password) {
    errors.password = '비밀번호를 입력하세요.'
  } else if (password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`
  }

  if (password !== passwordConfirm) {
    errors.passwordConfirm = '비밀번호가 일치하지 않습니다.'
  }

  if (!nickname?.trim()) {
    errors.nickname = '닉네임을 입력하세요.'
  }

  return errors
}

export const validateLogin = ({ username, password }) => {
  const errors = {}
  if (!username?.trim()) errors.username = '아이디를 입력하세요.'
  if (!password) errors.password = '비밀번호를 입력하세요.'
  return errors
}

// 토큰과 사용자 정보를 저장하는 곳은 여기 한 곳뿐이다.
const persistSession = ({ token, user }) => {
  writeText(KEYS.token, token)
  writeJson(KEYS.currentUser, user)
  return user
}

export const signupUser = async ({ username, password, nickname }) => {
  const { data } = await requestSignup({
    username: username.trim(),
    password,
    nickname: nickname.trim(),
  })
  return persistSession(data)
}

export const loginUser = async ({ username, password }) => {
  const { data } = await requestLogin({ username: username.trim(), password })
  return persistSession(data)
}

export const clearSession = () => {
  removeKey(KEYS.token)
  removeKey(KEYS.currentUser)
}

export const getStoredUser = () => readJson(KEYS.currentUser, null)

const PREFIX = 'board:'

export const KEYS = {
  users: `${PREFIX}users`,
  posts: `${PREFIX}posts`,
  token: `${PREFIX}token`,
  currentUser: `${PREFIX}currentUser`,
}

export const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const readText = (key) => localStorage.getItem(key)

export const writeText = (key, value) => {
  localStorage.setItem(key, value)
}

export const removeKey = (key) => {
  localStorage.removeItem(key)
}

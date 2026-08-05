import client from './client'

export const requestSignup = (body) => client.post('/auth/signup', body)

export const requestLogin = (body) => client.post('/auth/login', body)

export const fetchMe = () => client.get('/auth/me')

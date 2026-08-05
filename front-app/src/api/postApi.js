import client from './client'

export const fetchPosts = (params) => client.get('/posts', { params })

export const fetchPost = (id) => client.get(`/posts/${id}`)

export const increaseViewCount = (id) => client.post(`/posts/${id}/view`)

export const createPost = (body) => client.post('/posts', body)

export const updatePost = (id, body) => client.put(`/posts/${id}`, body)

export const deletePost = (id) => client.delete(`/posts/${id}`)

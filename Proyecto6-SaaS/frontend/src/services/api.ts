import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const isAuthRoute = err.config?.url?.startsWith('/auth/')
    if (err.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const register = (data: { email: string; name: string; password: string }) =>
  api.post('/auth/register', data)

export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data)

export const getMe = () => api.get('/auth/me')

// Sessions
export const createSession = (data: {
  job_title: string
  company: string
  job_description: string
  cv_text: string
}) => api.post('/sessions/', data)

export const getSessions = () => api.get('/sessions/')

export const getSession = (id: number) => api.get(`/sessions/${id}`)

export const submitAnswer = (sessionId: number, data: { question_id: number; answer_text: string }) =>
  api.post(`/sessions/${sessionId}/answers`, data)

export const completeSession = (sessionId: number) =>
  api.post(`/sessions/${sessionId}/complete`)

export const retryAnswer = (sessionId: number, questionId: number, data: { answer_text: string }) =>
  api.post(`/sessions/${sessionId}/retry/${questionId}`, data)

export const parseCv = (file: File) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/cv/parse', form)
}

// Profile
export const getProfile = () => api.get('/profile/')

export const updateProfile = (data: {
  name?: string
  experience_level?: string
  target_roles?: string[]
  target_locations?: string[]
  target_modality?: string
  target_industries?: string[]
  practice_language?: string
}) => api.put('/profile/', data)

export const uploadProfileCv = (file: File) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/profile/cv', form)
}

// Jobs
export const getJobMatches = (params?: { status?: string; limit?: number }) =>
  api.get('/jobs/', { params })

export const updateJobMatchStatus = (matchId: number, status: string) =>
  api.put(`/jobs/${matchId}`, { status })

export const prepareInterviewFromJob = (matchId: number) =>
  api.post(`/jobs/${matchId}/prepare`)

export const refreshJobMatches = () => api.post('/jobs/refresh')

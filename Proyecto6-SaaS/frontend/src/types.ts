export interface User {
  id: number
  email: string
  name: string
  created_at: string
}

export interface Answer {
  id: number
  answer_text: string
  feedback_text: string
  strengths: string      // JSON string
  improvements: string   // JSON string
  ideal_answer_hint: string
  llm_score: number
  embedding_score: number | null
  final_score: number
  verdict: 'excellent' | 'good' | 'needs_improvement' | 'poor'
  created_at: string
}

export interface RetryAnswer {
  id: number
  answer_text: string
  feedback_text: string
  strengths: string
  improvements: string
  ideal_answer_hint: string
  llm_score: number
  embedding_score: number | null
  final_score: number
  verdict: 'excellent' | 'good' | 'needs_improvement' | 'poor'
  created_at: string
}

export interface Question {
  id: number
  question_text: string
  question_type: 'technical' | 'behavioral' | 'situational' | 'motivation'
  focus: string
  order_index: number
  answer?: Answer
  retries: RetryAnswer[]
}

export interface SessionListItem {
  id: number
  job_title: string
  company: string
  status: 'active' | 'completed'
  overall_score: number | null
  created_at: string
  completed_at: string | null
  question_count: number
  answered_count: number
}

export interface SessionDetail {
  id: number
  job_title: string
  company: string
  status: 'active' | 'completed'
  overall_score: number | null
  improvement_plan: string | null
  created_at: string
  completed_at: string | null
  questions: Question[]
}

// ── Profile ──────────────────────────────────────────────────────────────────

export interface CVExperience {
  empresa: string
  rol: string
  inicio?: string
  fin?: string
  descripcion?: string
  tecnologias?: string[]
}

export interface CVEducation {
  institucion: string
  titulo: string
  area?: string
  año_fin?: string
}

export interface CVLanguage {
  idioma: string
  nivel: string
}

export interface ParsedCV {
  nombre?: string
  resumen?: string
  anos_experiencia_total?: number
  experiencia?: CVExperience[]
  educacion?: CVEducation[]
  skills?: string[]
  idiomas?: CVLanguage[]
}

export interface UserProfile {
  id: number
  email: string
  name: string
  created_at: string
  experience_level: 'junior' | 'mid' | 'senior' | 'lead' | null
  target_roles: string[] | null
  target_locations: string[] | null
  target_modality: 'remote' | 'hybrid' | 'onsite' | 'any' | null
  target_industries: string[] | null
  practice_language: 'es' | 'en'
  cv_filename: string | null
  cv_parsed: ParsedCV | null
  profile_complete: boolean
}

// ── Jobs ─────────────────────────────────────────────────────────────────────

export interface JobOffer {
  id: number
  title: string
  company: string
  location: string | null
  description: string | null
  url: string
  source: string
  modality: 'remote' | 'hybrid' | 'onsite' | null
  salary_range: string | null
  posted_at: string | null
  scraped_at: string
}

export interface JobMatch {
  id: number
  status: 'new' | 'seen' | 'saved' | 'applied' | 'dismissed'
  created_at: string
  job_offer: JobOffer
}

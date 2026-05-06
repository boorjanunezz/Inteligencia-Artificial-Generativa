from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime


# ── Auth ────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# ── Session ──────────────────────────────────────────────────────────────────

class SessionCreate(BaseModel):
    job_title: str
    company: str
    job_description: str
    cv_text: str


class AnswerResponse(BaseModel):
    id: int
    answer_text: str
    feedback_text: str
    strengths: str
    improvements: str
    ideal_answer_hint: str
    llm_score: float
    embedding_score: Optional[float]
    final_score: float
    verdict: str
    created_at: datetime

    model_config = {"from_attributes": True}


class RetryAnswerResponse(BaseModel):
    id: int
    answer_text: str
    feedback_text: str
    strengths: str
    improvements: str
    ideal_answer_hint: str
    llm_score: float
    embedding_score: Optional[float]
    final_score: float
    verdict: str
    created_at: datetime

    model_config = {"from_attributes": True}


class QuestionResponse(BaseModel):
    id: int
    question_text: str
    question_type: str
    focus: str
    order_index: int
    answer: Optional[AnswerResponse] = None
    retries: List[RetryAnswerResponse] = []

    model_config = {"from_attributes": True}


class SessionListItem(BaseModel):
    id: int
    job_title: str
    company: str
    status: str
    overall_score: Optional[float]
    created_at: datetime
    completed_at: Optional[datetime]
    question_count: int = 0
    answered_count: int = 0

    model_config = {"from_attributes": True}


class SessionDetail(BaseModel):
    id: int
    job_title: str
    company: str
    status: str
    overall_score: Optional[float]
    improvement_plan: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]
    questions: List[QuestionResponse] = []

    model_config = {"from_attributes": True}


# ── Interview ────────────────────────────────────────────────────────────────

class AnswerSubmit(BaseModel):
    question_id: int
    answer_text: str


class RetrySubmit(BaseModel):
    answer_text: str


class CompleteResponse(BaseModel):
    overall_score: float
    improvement_plan: str


# ── Profile ──────────────────────────────────────────────────────────────────

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    experience_level: Optional[str] = None       # junior | mid | senior | lead
    target_roles: Optional[List[str]] = None
    target_locations: Optional[List[str]] = None
    target_modality: Optional[str] = None        # remote | hybrid | onsite | any
    target_industries: Optional[List[str]] = None
    practice_language: Optional[str] = None      # es | en


class UserProfileResponse(BaseModel):
    id: int
    email: str
    name: str
    created_at: datetime
    experience_level: Optional[str] = None
    target_roles: Optional[List[str]] = None
    target_locations: Optional[List[str]] = None
    target_modality: Optional[str] = None
    target_industries: Optional[List[str]] = None
    practice_language: str = "es"
    cv_filename: Optional[str] = None
    cv_parsed: Optional[Dict[str, Any]] = None
    profile_complete: bool = False

    model_config = {"from_attributes": True}


# ── Jobs ─────────────────────────────────────────────────────────────────────

class JobOfferResponse(BaseModel):
    id: int
    title: str
    company: str
    location: Optional[str] = None
    description: Optional[str] = None
    url: str
    source: str
    modality: Optional[str] = None
    salary_range: Optional[str] = None
    posted_at: Optional[datetime] = None
    scraped_at: datetime

    model_config = {"from_attributes": True}


class UserJobMatchResponse(BaseModel):
    id: int
    status: str
    created_at: datetime
    job_offer: JobOfferResponse

    model_config = {"from_attributes": True}


class JobMatchStatusUpdate(BaseModel):
    status: str  # new | seen | saved | applied | dismissed


class JobsRefreshResponse(BaseModel):
    message: str
    status: str

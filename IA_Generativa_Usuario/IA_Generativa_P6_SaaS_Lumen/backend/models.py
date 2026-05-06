from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Profile fields
    experience_level = Column(String, nullable=True)       # junior | mid | senior | lead
    target_roles = Column(Text, nullable=True)             # JSON: ["Backend Engineer", ...]
    target_locations = Column(Text, nullable=True)         # JSON: ["Madrid", "Remote", ...]
    target_modality = Column(String, nullable=True)        # remote | hybrid | onsite | any
    target_industries = Column(Text, nullable=True)        # JSON: ["tech", "fintech", ...]
    practice_language = Column(String, default="es")       # es | en

    # CV stored in profile
    cv_text = Column(Text, nullable=True)
    cv_parsed = Column(Text, nullable=True)                # JSON: structured CV data
    cv_filename = Column(String, nullable=True)

    sessions = relationship("InterviewSession", back_populates="user")
    job_matches = relationship("UserJobMatch", back_populates="user")


class InterviewSession(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    job_description = Column(Text, nullable=False)
    cv_text = Column(Text, nullable=False)
    status = Column(String, default="active")  # active | completed
    overall_score = Column(Float, nullable=True)
    improvement_plan = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="sessions")
    questions = relationship("Question", back_populates="session", order_by="Question.order_index")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String, nullable=False)  # technical | behavioral | situational | motivation
    focus = Column(String, nullable=False)
    ideal_answer_points = Column(Text, nullable=False)  # JSON array string
    order_index = Column(Integer, nullable=False)

    session = relationship("InterviewSession", back_populates="questions")
    answer = relationship("Answer", back_populates="question", uselist=False)
    retries = relationship("RetryAnswer", back_populates="question", order_by="RetryAnswer.created_at")


class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    answer_text = Column(Text, nullable=False)
    feedback_text = Column(Text, nullable=False)
    strengths = Column(Text, nullable=False)      # JSON array string
    improvements = Column(Text, nullable=False)   # JSON array string
    ideal_answer_hint = Column(Text, nullable=False)
    llm_score = Column(Float, nullable=False)
    embedding_score = Column(Float, nullable=True)
    final_score = Column(Float, nullable=False)
    verdict = Column(String, nullable=False)      # excellent | good | needs_improvement | poor
    created_at = Column(DateTime, default=datetime.utcnow)

    question = relationship("Question", back_populates="answer")


class RetryAnswer(Base):
    __tablename__ = "retry_answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    answer_text = Column(Text, nullable=False)
    feedback_text = Column(Text, nullable=False)
    strengths = Column(Text, nullable=False)
    improvements = Column(Text, nullable=False)
    ideal_answer_hint = Column(Text, nullable=False)
    llm_score = Column(Float, nullable=False)
    embedding_score = Column(Float, nullable=True)
    final_score = Column(Float, nullable=False)
    verdict = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    question = relationship("Question", back_populates="retries")


class JobOffer(Base):
    __tablename__ = "job_offers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    url = Column(String, unique=True, nullable=False, index=True)
    source = Column(String, nullable=False)        # linkedin | indeed | glassdoor | ...
    modality = Column(String, nullable=True)       # remote | hybrid | onsite
    salary_range = Column(String, nullable=True)
    posted_at = Column(DateTime, nullable=True)
    scraped_at = Column(DateTime, default=datetime.utcnow)

    matches = relationship("UserJobMatch", back_populates="job_offer")


class UserJobMatch(Base):
    __tablename__ = "user_job_matches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_offer_id = Column(Integer, ForeignKey("job_offers.id"), nullable=False)
    status = Column(String, default="new")         # new | seen | saved | applied | dismissed
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("user_id", "job_offer_id", name="uq_user_job"),)

    user = relationship("User", back_populates="job_matches")
    job_offer = relationship("JobOffer", back_populates="matches")

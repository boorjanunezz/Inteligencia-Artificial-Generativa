import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from dependencies import get_current_user
from services import ai_service
import models
import schemas

router = APIRouter(prefix="/sessions", tags=["sessions"])


# ── Crear sesión y generar preguntas ─────────────────────────────────────────

@router.post("/", response_model=schemas.SessionDetail, status_code=status.HTTP_201_CREATED)
def create_session(
    data: schemas.SessionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    session = models.InterviewSession(
        user_id=current_user.id,
        job_title=data.job_title,
        company=data.company,
        job_description=data.job_description,
        cv_text=data.cv_text,
        status="active",
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Generar preguntas con IA
    raw_questions = ai_service.generate_questions(
        job_title=data.job_title,
        company=data.company,
        job_description=data.job_description,
        cv_text=data.cv_text,
    )

    for i, q in enumerate(raw_questions):
        question = models.Question(
            session_id=session.id,
            question_text=q["question"],
            question_type=q["type"],
            focus=q["focus"],
            ideal_answer_points=json.dumps(q["ideal_answer_points"]),
            order_index=i,
        )
        db.add(question)

    db.commit()
    db.refresh(session)
    return session


# ── Listar sesiones del usuario ───────────────────────────────────────────────

@router.get("/", response_model=list[schemas.SessionListItem])
def list_sessions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    sessions = (
        db.query(models.InterviewSession)
        .filter(models.InterviewSession.user_id == current_user.id)
        .order_by(models.InterviewSession.created_at.desc())
        .all()
    )

    result = []
    for s in sessions:
        answered = sum(1 for q in s.questions if q.answer is not None)
        item = schemas.SessionListItem(
            id=s.id,
            job_title=s.job_title,
            company=s.company,
            status=s.status,
            overall_score=s.overall_score,
            created_at=s.created_at,
            completed_at=s.completed_at,
            question_count=len(s.questions),
            answered_count=answered,
        )
        result.append(item)
    return result


# ── Detalle de una sesión ─────────────────────────────────────────────────────

@router.get("/{session_id}", response_model=schemas.SessionDetail)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    session = (
        db.query(models.InterviewSession)
        .filter_by(id=session_id, user_id=current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="session_not_found")
    return session


# ── Enviar respuesta y recibir feedback ──────────────────────────────────────

@router.post("/{session_id}/answers", response_model=schemas.AnswerResponse)
def submit_answer(
    session_id: int,
    data: schemas.AnswerSubmit,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    session = (
        db.query(models.InterviewSession)
        .filter_by(id=session_id, user_id=current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="session_not_found")
    if session.status == "completed":
        raise HTTPException(status_code=400, detail="session_already_completed")

    question = (
        db.query(models.Question)
        .filter_by(id=data.question_id, session_id=session_id)
        .first()
    )
    if not question:
        raise HTTPException(status_code=404, detail="question_not_found")
    if question.answer:
        raise HTTPException(status_code=400, detail="question_already_answered")

    ideal_points = json.loads(question.ideal_answer_points)

    # Evaluación cualitativa con LLM
    evaluation = ai_service.evaluate_answer(
        job_title=session.job_title,
        company=session.company,
        question_text=question.question_text,
        question_type=question.question_type,
        ideal_answer_points=ideal_points,
        answer_text=data.answer_text,
    )

    # Puntuación semántica con embeddings
    emb_score = ai_service.embedding_score(data.answer_text, ideal_points)

    # Puntuación final: 65% LLM + 35% embeddings
    llm_score = float(evaluation["score"])
    final = round(0.65 * llm_score + 0.35 * emb_score, 1)

    answer = models.Answer(
        question_id=question.id,
        answer_text=data.answer_text,
        feedback_text=evaluation["feedback"],
        strengths=json.dumps(evaluation.get("strengths", [])),
        improvements=json.dumps(evaluation.get("improvements", [])),
        ideal_answer_hint=evaluation.get("ideal_answer_hint", ""),
        llm_score=llm_score,
        embedding_score=round(emb_score, 1),
        final_score=final,
        verdict=evaluation["verdict"],
    )
    db.add(answer)
    db.commit()
    db.refresh(answer)
    return answer


# ── Reintentar una pregunta (sesión completada) ──────────────────────────────

@router.post("/{session_id}/retry/{question_id}", response_model=schemas.RetryAnswerResponse)
def retry_answer(
    session_id: int,
    question_id: int,
    data: schemas.RetrySubmit,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    session = (
        db.query(models.InterviewSession)
        .filter_by(id=session_id, user_id=current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="session_not_found")

    question = (
        db.query(models.Question)
        .filter_by(id=question_id, session_id=session_id)
        .first()
    )
    if not question:
        raise HTTPException(status_code=404, detail="question_not_found")
    if not question.answer:
        raise HTTPException(status_code=400, detail="answer_original_first")

    ideal_points = json.loads(question.ideal_answer_points)

    evaluation = ai_service.evaluate_answer(
        job_title=session.job_title,
        company=session.company,
        question_text=question.question_text,
        question_type=question.question_type,
        ideal_answer_points=ideal_points,
        answer_text=data.answer_text,
    )

    emb_score = ai_service.embedding_score(data.answer_text, ideal_points)
    llm_score = float(evaluation["score"])
    final = round(0.65 * llm_score + 0.35 * emb_score, 1)

    retry = models.RetryAnswer(
        question_id=question_id,
        answer_text=data.answer_text,
        feedback_text=evaluation["feedback"],
        strengths=json.dumps(evaluation.get("strengths", [])),
        improvements=json.dumps(evaluation.get("improvements", [])),
        ideal_answer_hint=evaluation.get("ideal_answer_hint", ""),
        llm_score=llm_score,
        embedding_score=round(emb_score, 1),
        final_score=final,
        verdict=evaluation["verdict"],
    )
    db.add(retry)
    db.commit()
    db.refresh(retry)
    return retry


# ── Completar sesión y generar plan de mejora ────────────────────────────────

@router.post("/{session_id}/complete", response_model=schemas.CompleteResponse)
def complete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    session = (
        db.query(models.InterviewSession)
        .filter_by(id=session_id, user_id=current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="session_not_found")
    if session.status == "completed":
        return schemas.CompleteResponse(
            overall_score=session.overall_score,
            improvement_plan=session.improvement_plan,
        )

    answered_questions = [q for q in session.questions if q.answer is not None]
    if not answered_questions:
        raise HTTPException(status_code=400, detail="no_answers_submitted")

    overall_score = round(
        sum(q.answer.final_score for q in answered_questions) / len(answered_questions), 1
    )

    qa_pairs = [
        {
            "question": q.question_text,
            "answer": q.answer.answer_text,
            "score": q.answer.final_score,
            "feedback": q.answer.feedback_text,
        }
        for q in answered_questions
    ]

    improvement_plan = ai_service.generate_improvement_plan(
        job_title=session.job_title,
        company=session.company,
        qa_pairs=qa_pairs,
        overall_score=overall_score,
    )

    session.overall_score = overall_score
    session.improvement_plan = improvement_plan
    session.status = "completed"
    session.completed_at = datetime.utcnow()
    db.commit()

    return schemas.CompleteResponse(
        overall_score=overall_score,
        improvement_plan=improvement_plan,
    )

import json
import logging
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from database import get_db
from dependencies import get_current_user
import models
import schemas

router = APIRouter(prefix="/jobs", tags=["jobs"])
logger = logging.getLogger(__name__)


@router.get("/", response_model=list[schemas.UserJobMatchResponse])
def get_job_matches(
    status: str = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = (
        db.query(models.UserJobMatch)
        .filter(models.UserJobMatch.user_id == current_user.id)
        .options(joinedload(models.UserJobMatch.job_offer))
        .order_by(models.UserJobMatch.created_at.desc())
    )
    if status:
        query = query.filter(models.UserJobMatch.status == status)
    return query.limit(limit).all()


@router.put("/{match_id}", response_model=schemas.UserJobMatchResponse)
def update_match_status(
    match_id: int,
    data: schemas.JobMatchStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    match = (
        db.query(models.UserJobMatch)
        .filter_by(id=match_id, user_id=current_user.id)
        .options(joinedload(models.UserJobMatch.job_offer))
        .first()
    )
    if not match:
        raise HTTPException(status_code=404, detail="match_not_found")

    valid = {"new", "seen", "saved", "applied", "dismissed"}
    if data.status not in valid:
        raise HTTPException(status_code=400, detail="invalid_status")

    match.status = data.status
    db.commit()
    db.refresh(match)
    return match


@router.post("/{match_id}/prepare", response_model=schemas.SessionDetail)
def prepare_interview_from_job(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Crea una sesión de entrevista directamente desde una oferta guardada."""
    from services import ai_service

    match = (
        db.query(models.UserJobMatch)
        .filter_by(id=match_id, user_id=current_user.id)
        .options(joinedload(models.UserJobMatch.job_offer))
        .first()
    )
    if not match:
        raise HTTPException(status_code=404, detail="match_not_found")
    if not current_user.cv_text:
        raise HTTPException(status_code=400, detail="cv_required")

    job = match.job_offer
    job_description = job.description or f"Puesto de {job.title} en {job.company}."

    session = models.InterviewSession(
        user_id=current_user.id,
        job_title=job.title,
        company=job.company,
        job_description=job_description,
        cv_text=current_user.cv_text,
        status="active",
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    raw_questions = ai_service.generate_questions(
        job_title=job.title,
        company=job.company,
        job_description=job_description,
        cv_text=current_user.cv_text,
    )

    for i, q in enumerate(raw_questions):
        db.add(models.Question(
            session_id=session.id,
            question_text=q["question"],
            question_type=q["type"],
            focus=q["focus"],
            ideal_answer_points=json.dumps(q["ideal_answer_points"]),
            order_index=i,
        ))

    match.status = "applied"
    db.commit()
    db.refresh(session)
    return session


@router.post("/refresh", response_model=schemas.JobsRefreshResponse)
def refresh_job_matches(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Dispara un scraping de ofertas para el usuario actual (tarea en background)."""
    if not current_user.target_roles:
        raise HTTPException(status_code=400, detail="target_roles_required")

    target_roles = json.loads(current_user.target_roles)
    target_locations = json.loads(current_user.target_locations) if current_user.target_locations else ["Spain"]

    if not target_roles:
        raise HTTPException(status_code=400, detail="target_roles_empty")

    background_tasks.add_task(
        _scrape_background,
        user_id=current_user.id,
        target_roles=target_roles,
        target_locations=target_locations,
    )

    return schemas.JobsRefreshResponse(
        message="Búsqueda iniciada. Las ofertas aparecerán en breve.",
        status="running",
    )


def _scrape_background(user_id: int, target_roles: list, target_locations: list):
    """Background task con su propia sesión de BD."""
    from database import SessionLocal
    from services.scheduler_service import _scrape_and_persist

    db = SessionLocal()
    try:
        _scrape_and_persist(db, user_id, target_roles, target_locations)
    except Exception as e:
        logger.error(f"Background scrape error for user {user_id}: {e}")
    finally:
        db.close()

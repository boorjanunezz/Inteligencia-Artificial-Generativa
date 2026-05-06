import io
import json
import pdfplumber  # type: ignore
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from dependencies import get_current_user
from services import ai_service
import models
import schemas

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/", response_model=schemas.UserProfileResponse)
def get_profile(current_user: models.User = Depends(get_current_user)):
    return _to_response(current_user)


@router.put("/", response_model=schemas.UserProfileResponse)
def update_profile(
    data: schemas.UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if data.name is not None:
        current_user.name = data.name
    if data.experience_level is not None:
        current_user.experience_level = data.experience_level
    if data.target_roles is not None:
        current_user.target_roles = json.dumps(data.target_roles)
    if data.target_locations is not None:
        current_user.target_locations = json.dumps(data.target_locations)
    if data.target_modality is not None:
        current_user.target_modality = data.target_modality
    if data.target_industries is not None:
        current_user.target_industries = json.dumps(data.target_industries)
    if data.practice_language is not None:
        current_user.practice_language = data.practice_language

    db.commit()
    db.refresh(current_user)
    return _to_response(current_user)


@router.post("/cv", response_model=schemas.UserProfileResponse)
async def upload_cv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="pdf_only")

    content = await file.read()

    try:
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            text = "\n\n".join(page.extract_text() or "" for page in pdf.pages)
    except Exception as e:
        raise HTTPException(status_code=400, detail="pdf_parse_error")

    text = text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="pdf_no_text")

    try:
        parsed = ai_service.parse_cv(text)
    except Exception:
        parsed = {}

    current_user.cv_text = text
    current_user.cv_parsed = json.dumps(parsed)
    current_user.cv_filename = file.filename
    db.commit()
    db.refresh(current_user)
    return _to_response(current_user)


def _to_response(user: models.User) -> schemas.UserProfileResponse:
    target_roles = json.loads(user.target_roles) if user.target_roles else None
    target_locations = json.loads(user.target_locations) if user.target_locations else None
    target_industries = json.loads(user.target_industries) if user.target_industries else None
    cv_parsed = json.loads(user.cv_parsed) if user.cv_parsed else None

    profile_complete = bool(
        user.experience_level
        and target_roles
        and len(target_roles) > 0
        and user.cv_text
    )

    return schemas.UserProfileResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        created_at=user.created_at,
        experience_level=user.experience_level,
        target_roles=target_roles,
        target_locations=target_locations,
        target_modality=user.target_modality,
        target_industries=target_industries,
        practice_language=user.practice_language or "es",
        cv_filename=user.cv_filename,
        cv_parsed=cv_parsed,
        profile_complete=profile_complete,
    )

import io
import pdfplumber
from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter(prefix="/cv", tags=["cv"])


@router.post("/parse")
async def parse_cv(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="pdf_only")

    content = await file.read()

    try:
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            page_count = len(pdf.pages)
            text = "\n\n".join(page.extract_text() or "" for page in pdf.pages)
    except Exception as e:
        raise HTTPException(status_code=400, detail="pdf_parse_error")

    text = text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="pdf_no_text")

    return {"text": text, "pages": page_count}

import os
import uuid
import shutil
from typing import List
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

import schemas, database, rag, auth

database.Base.metadata.create_all(bind=database.engine)
database.run_migrations()

app = FastAPI(title="RAG Assistants API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def startup_event():
    if rag.AOAI_KEY and rag.SEARCH_KEY:
        try:
            rag.setup_search_index()
        except Exception as e:
            print(f"Error checking/creating index: {e}")

@app.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(database.UserDB).filter(database.UserDB.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Usuario ya existe")
    hashed_password = auth.get_password_hash(user.password)
    new_user = database.UserDB(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(database.UserDB).filter(database.UserDB.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/assistants", response_model=schemas.AssistantResponse)
def create_assistant(assistant: schemas.AssistantCreate, db: Session = Depends(get_db), current_user: database.UserDB = Depends(auth.get_current_user)):
    db_assistant = database.AssistantDB(**assistant.model_dump(), user_id=current_user.id)
    db.add(db_assistant)
    db.commit()
    db.refresh(db_assistant)
    return db_assistant

@app.get("/assistants", response_model=List[schemas.AssistantResponse])
def get_assistants(db: Session = Depends(get_db), current_user: database.UserDB = Depends(auth.get_current_user)):
    return db.query(database.AssistantDB).filter(database.AssistantDB.user_id == current_user.id).all()

@app.get("/assistants/{assistant_id}", response_model=schemas.AssistantResponse)
def get_assistant(assistant_id: int, db: Session = Depends(get_db), current_user: database.UserDB = Depends(auth.get_current_user)):
    db_assistant = db.query(database.AssistantDB).filter(database.AssistantDB.id == assistant_id, database.AssistantDB.user_id == current_user.id).first()
    if not db_assistant:
        raise HTTPException(status_code=404, detail="Asistente no encontrado o no es tuyo")
    return db_assistant

@app.delete("/assistants/{assistant_id}")
def delete_assistant(assistant_id: int, db: Session = Depends(get_db), current_user: database.UserDB = Depends(auth.get_current_user)):
    db_assistant = db.query(database.AssistantDB).filter(database.AssistantDB.id == assistant_id, database.AssistantDB.user_id == current_user.id).first()
    if not db_assistant:
        raise HTTPException(status_code=404, detail="Asistente no encontrado")
    
    for doc in db_assistant.documents:
        try:
            rag.delete_document_from_index(doc.id)
        except:
            pass
        
    db.delete(db_assistant)
    db.commit()
    return {"message": "Asistente eliminado"}

os.makedirs("uploads", exist_ok=True)

@app.post("/assistants/{assistant_id}/documents/text", response_model=schemas.DocumentResponse)
def ingest_text_document(assistant_id: int, req: schemas.IngestTextRequest, db: Session = Depends(get_db), current_user: database.UserDB = Depends(auth.get_current_user)):
    db_assistant = db.query(database.AssistantDB).filter(database.AssistantDB.id == assistant_id, database.AssistantDB.user_id == current_user.id).first()
    if not db_assistant:
        raise HTTPException(status_code=404, detail="Asistente no encontrado")
    db_doc = database.DocumentDB(assistant_id=assistant_id, filename=req.filename, mimetype="text/plain")
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    try:
        rag.process_text_directly(assistant_id, db_doc.id, req.content)
    except Exception as e:
        db.delete(db_doc)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Error indexando documento: {str(e)}")
    return db_doc

@app.post("/assistants/{assistant_id}/documents", response_model=schemas.DocumentResponse)
def upload_document(assistant_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: database.UserDB = Depends(auth.get_current_user)):
    db_assistant = db.query(database.AssistantDB).filter(database.AssistantDB.id == assistant_id, database.AssistantDB.user_id == current_user.id).first()
    if not db_assistant:
        raise HTTPException(status_code=404, detail="Asistente no encontrado")
        
    db_doc = database.DocumentDB(
        assistant_id=assistant_id,
        filename=file.filename,
        mimetype=file.content_type
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    
    file_path = f"uploads/{db_doc.id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        rag.process_and_upload_document(assistant_id, db_doc.id, file_path, file.content_type)
    except Exception as e:
        db.delete(db_doc)
        db.commit()
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error procesando documento: {str(e)}")
        
    return db_doc

@app.get("/assistants/{assistant_id}/documents", response_model=List[schemas.DocumentResponse])
def get_documents(assistant_id: int, db: Session = Depends(get_db), current_user: database.UserDB = Depends(auth.get_current_user)):
    db_assistant = db.query(database.AssistantDB).filter(database.AssistantDB.id == assistant_id, database.AssistantDB.user_id == current_user.id).first()
    if not db_assistant:
        raise HTTPException(status_code=404, detail="Asistente no encontrado")
    return db.query(database.DocumentDB).filter(database.DocumentDB.assistant_id == assistant_id).all()

@app.delete("/documents/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db), current_user: database.UserDB = Depends(auth.get_current_user)):
    db_doc = db.query(database.DocumentDB).filter(database.DocumentDB.id == document_id).first()
    if not db_doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    
    db_assistant = db.query(database.AssistantDB).filter(database.AssistantDB.id == db_doc.assistant_id, database.AssistantDB.user_id == current_user.id).first()
    if not db_assistant:
         raise HTTPException(status_code=404, detail="No autorizado para este documento")
        
    try:
        rag.delete_document_from_index(document_id)
    except Exception as e:
        print(f"Error erasing from index: {e}")
        
    db.delete(db_doc)
    db.commit()
    return {"message": "Documento eliminado"}

@app.post("/assistants/{assistant_id}/chat", response_model=schemas.ChatSessionResponse)
def create_chat_session(assistant_id: int, db: Session = Depends(get_db), current_user: database.UserDB = Depends(auth.get_current_user)):
    db_assistant = db.query(database.AssistantDB).filter(database.AssistantDB.id == assistant_id, database.AssistantDB.user_id == current_user.id).first()
    if not db_assistant:
        raise HTTPException(status_code=404, detail="Asistente no encontrado")
        
    session_id = str(uuid.uuid4())
    db_session = database.ChatSessionDB(id=session_id, assistant_id=assistant_id)
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@app.get("/assistants/{assistant_id}/chats", response_model=List[schemas.ChatSessionResponse])
def get_chat_sessions(assistant_id: int, db: Session = Depends(get_db), current_user: database.UserDB = Depends(auth.get_current_user)):
    db_assistant = db.query(database.AssistantDB).filter(database.AssistantDB.id == assistant_id, database.AssistantDB.user_id == current_user.id).first()
    if not db_assistant:
        raise HTTPException(status_code=404, detail="Asistente no encontrado")
    return db.query(database.ChatSessionDB).filter(database.ChatSessionDB.assistant_id == assistant_id).all()

@app.get("/chat/{session_id}/messages", response_model=List[schemas.ChatMessageResponse])
def get_chat_messages(session_id: str, db: Session = Depends(get_db), current_user: database.UserDB = Depends(auth.get_current_user)):
    db_session = db.query(database.ChatSessionDB).filter(database.ChatSessionDB.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    
    db_assistant = db.query(database.AssistantDB).filter(database.AssistantDB.id == db_session.assistant_id, database.AssistantDB.user_id == current_user.id).first()
    if not db_assistant:
         raise HTTPException(status_code=404, detail="No autorizado")

    return db.query(database.ChatMessageDB).filter(database.ChatMessageDB.session_id == session_id).order_by(database.ChatMessageDB.created_at).all()

@app.put("/chat/messages/{message_id}/feedback")
def set_message_feedback(message_id: int, req: schemas.FeedbackRequest, db: Session = Depends(get_db), current_user: database.UserDB = Depends(auth.get_current_user)):
    if req.feedback not in (1, -1):
        raise HTTPException(status_code=400, detail="feedback debe ser 1 o -1")
    msg = db.query(database.ChatMessageDB).filter(database.ChatMessageDB.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    if msg.session.assistant.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")
    msg.feedback = req.feedback
    db.commit()
    return {"message": "Feedback guardado"}

@app.delete("/chat/messages/{message_id}/feedback")
def clear_message_feedback(message_id: int, db: Session = Depends(get_db), current_user: database.UserDB = Depends(auth.get_current_user)):
    msg = db.query(database.ChatMessageDB).filter(database.ChatMessageDB.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    if msg.session.assistant.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")
    msg.feedback = None
    db.commit()
    return {"message": "Feedback eliminado"}

@app.post("/chat/{session_id}/messages", response_model=schemas.ChatMessageResponse)
def post_chat_message(session_id: str, request: schemas.ChatMessageRequest, db: Session = Depends(get_db), current_user: database.UserDB = Depends(auth.get_current_user)):
    db_session = db.query(database.ChatSessionDB).filter(database.ChatSessionDB.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
        
    assistant = db_session.assistant
    if assistant.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="No autorizado")
    
    user_msg = database.ChatMessageDB(session_id=session_id, role="user", content=request.content)
    db.add(user_msg)
    db.commit()
    
    history = db.query(database.ChatMessageDB).filter(database.ChatMessageDB.session_id == session_id).order_by(database.ChatMessageDB.created_at).all()
    
    try:
        response_data = rag.rag_chat(assistant.id, assistant.instructions, history[:-1], request.content)
        ai_response_text = response_data["text"]
    except Exception as e:
        ai_response_text = f"Error al generar respuesta: {str(e)}"
        
    ai_msg = database.ChatMessageDB(session_id=session_id, role="assistant", content=ai_response_text)
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)
    
    return ai_msg

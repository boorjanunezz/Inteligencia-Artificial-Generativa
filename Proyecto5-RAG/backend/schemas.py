from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class AssistantCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    instructions: str

class AssistantResponse(AssistantCreate):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: int
    filename: str
    mimetype: str
    created_at: datetime
    class Config:
        from_attributes = True

class ChatSessionResponse(BaseModel):
    id: str
    assistant_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    feedback: Optional[int] = None
    created_at: datetime
    class Config:
        from_attributes = True

class ChatMessageRequest(BaseModel):
    content: str

class FeedbackRequest(BaseModel):
    feedback: int  # 1 or -1

class IngestTextRequest(BaseModel):
    filename: str
    content: str

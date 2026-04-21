from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

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
    created_at: datetime
    class Config:
        from_attributes = True

class ChatMessageRequest(BaseModel):
    content: str

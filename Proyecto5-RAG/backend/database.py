import os
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ragapp.db")

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)
    
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class AssistantDB(Base):
    __tablename__ = "assistants"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, default="")
    instructions = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    documents = relationship("DocumentDB", back_populates="assistant", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSessionDB", back_populates="assistant", cascade="all, delete-orphan")

class DocumentDB(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    assistant_id = Column(Integer, ForeignKey("assistants.id"))
    filename = Column(String)
    mimetype = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    assistant = relationship("AssistantDB", back_populates="documents")

class ChatSessionDB(Base):
    __tablename__ = "chat_sessions"
    id = Column(String, primary_key=True, index=True) # UUID string
    assistant_id = Column(Integer, ForeignKey("assistants.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    assistant = relationship("AssistantDB", back_populates="chat_sessions")
    messages = relationship("ChatMessageDB", back_populates="session", cascade="all, delete-orphan", order_by="ChatMessageDB.created_at")

class ChatMessageDB(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("chat_sessions.id"))
    role = Column(String) # "user" or "assistant"
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ChatSessionDB", back_populates="messages")

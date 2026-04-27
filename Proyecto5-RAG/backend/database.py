import os
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey, DateTime, text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ragapp.db")

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)
    
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    assistants = relationship("AssistantDB", back_populates="user", cascade="all, delete-orphan")

class AssistantDB(Base):
    __tablename__ = "assistants"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, index=True)
    description = Column(String, default="")
    instructions = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("UserDB", back_populates="assistants")
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
    feedback = Column(Integer, nullable=True)  # 1=up, -1=down
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ChatSessionDB", back_populates="messages")


def run_migrations():
    """Add columns introduced after initial schema creation."""
    if not DATABASE_URL.startswith("sqlite"):
        return
    with engine.connect() as conn:
        cols = [row[1] for row in conn.execute(text("PRAGMA table_info(chat_messages)")).fetchall()]
        if "feedback" not in cols:
            conn.execute(text("ALTER TABLE chat_messages ADD COLUMN feedback INTEGER"))
            conn.commit()

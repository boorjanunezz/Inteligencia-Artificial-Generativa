# CLAUDE.md

## Response rules

- No introductions, no closing summaries. Code direct.
- One-line explanations max, only when the WHY is non-obvious.
- No context repetition.

## Stack

| Layer | Tech |
|---|---|
| Backend | FastAPI + SQLAlchemy (SQLite) + Azure AI Search + OpenAI |
| Frontend | React + Vite + axios + lucide-react |
| Auth | JWT (PyJWT) + bcrypt |
| Embeddings | Azure OpenAI text-embedding-ada-002 |
| LLM | Azure OpenAI GPT-4o |

## Conventions

- Python: snake_case, Pydantic v2 (`model_dump()`), SQLAlchemy 2.x
- React: functional components, hooks only, no class components
- CSS: existing class system (`.glass-panel`, `.btn`, `.btn-primary`, etc.)
- Auth: all protected routes use `Depends(auth.get_current_user)`
- DB session: `Depends(get_db)` via FastAPI DI

## Project structure

```
Proyecto5-RAG/
├── backend/
│   ├── main.py        # FastAPI app + all endpoints
│   ├── database.py    # SQLAlchemy models
│   ├── schemas.py     # Pydantic schemas
│   ├── auth.py        # JWT + bcrypt
│   └── rag.py         # Azure AI Search + OpenAI RAG logic
└── frontend/
    └── src/
        ├── pages/     # Home, AssistantDetail, Chat, Login
        ├── components/ # Sidebar
        └── lib/api.js  # axios instance + API functions
```

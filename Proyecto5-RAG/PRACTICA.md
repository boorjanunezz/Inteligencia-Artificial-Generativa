# NexRAG — Aplicación Full-Stack de Asistentes con RAG

> Producto interno de IA generativa para una empresa que necesita asistentes de conocimiento aislados, cada uno con sus propios documentos y comportamiento.

---

## Caso de uso

Una empresa quiere desplegar múltiples asistentes de IA dentro de su intranet. Cada departamento tiene su propio asistente con documentación propia (manuales, contratos, normativas). Un asistente de RRHH nunca debe responder usando documentos de Legal, y viceversa. El historial de cada conversación persiste para que los empleados puedan retomarlo.

---

## Funcionalidades core ✅

### 1 · Gestión de asistentes

| Operación | Estado |
|---|---|
| Crear asistente (nombre, descripción, instrucciones) | ✅ |
| Listar asistentes del usuario | ✅ |
| Ver detalle de asistente | ✅ |
| Eliminar asistente (cascada: docs + índice) | ✅ |

Cada asistente se asocia a un `user_id`, por lo que el aislamiento entre usuarios es completo.

### 2 · Documentos por asistente

| Operación | Formatos | Estado |
|---|---|---|
| Subir documento | PDF, DOCX, TXT | ✅ |
| Listar documentos | — | ✅ |
| Eliminar documento (borra del índice vectorial) | — | ✅ |

### 3 · Ingesta, chunking y vectorización

El flujo al subir un documento:

```
Archivo → Extracción de texto → Chunking (LangChain) → Embeddings (Azure OpenAI) → Azure AI Search
```

**Aislamiento garantizado:** cada chunk se indexa con un campo `assistant_id`. Todas las búsquedas filtran por ese campo — un asistente nunca recupera contexto ajeno.

### 4 · Chat con RAG (aislado por asistente)

Flujo por mensaje:

```
Query usuario
   ↓
Búsqueda vectorial filtrada por assistant_id
   ↓
Prompt = instrucciones + historial + contexto recuperado
   ↓
LLM (GPT-4o via Azure OpenAI)
   ↓
Respuesta con citas de fuentes
```

Si el asistente no tiene evidencia suficiente en sus documentos, responde explícitamente que no puede contestar (no inventa).

### 5 · Persistencia del chat

| Feature | Estado |
|---|---|
| Guardar historial por sesión (UUID) | ✅ |
| Múltiples sesiones por asistente | ✅ |
| Reanudar conversación anterior | ✅ |
| Crear sesión nueva (chat limpio) | ✅ |

---

## Features adicionales implementadas

### 🔐 Autenticación (JWT + bcrypt)

Sistema completo de registro y login:

| Endpoint | Descripción |
|---|---|
| `POST /register` | Crea usuario con contraseña hasheada (bcrypt) |
| `POST /login` | Devuelve JWT firmado (7 días de validez) |

- Token almacenado en `localStorage`, incluido en todas las requests via interceptor de axios.
- Todos los endpoints de asistentes, documentos y chat están protegidos.
- El `user_id` del token determina qué recursos son accesibles — no hay posibilidad de acceder a los datos de otro usuario.

**Flujo de sesión:**

```
Login / Registro → JWT → localStorage → interceptor axios → requests autenticadas
                                                                        ↓
                                                      token expirado → logout automático
```

### 👍 Feedback en respuestas RAG

Los usuarios pueden valorar cada respuesta del asistente con pulgar arriba o abajo:

- `PUT /chat/messages/{id}/feedback` — body: `{ "feedback": 1 }` (arriba) o `{ "feedback": -1 }` (abajo)
- Estado visual inmediato en el chat: el botón activo se resalta
- Toggle: hacer clic en el mismo botón activo lo desmarca
- Valor persiste en base de datos (columna `feedback` en `chat_messages`)

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + React Router + axios + lucide-react |
| Backend | FastAPI + SQLAlchemy + SQLite |
| Auth | PyJWT + bcrypt |
| Vectorización | Azure OpenAI (text-embedding-ada-002) |
| Índice vectorial | Azure AI Search |
| LLM | Azure OpenAI (GPT-4o) |
| Chunking | LangChain Text Splitters |

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│  React SPA (Vite)                                       │
│  ├── Login/Register ──────────────────────────────────┐ │
│  ├── Home (crear asistente)                           │ │
│  ├── AssistantDetail (docs + sesiones de chat)        │ │
│  └── Chat (RAG + feedback)                            │ │
└───────────────────────────┬───────────────────────────┘ │
                            │ HTTP + JWT Bearer            │
┌───────────────────────────▼─────────────────────────────┐
│                   FastAPI Backend                        │
│  /register  /login                                       │
│  /assistants  /assistants/{id}/documents                 │
│  /assistants/{id}/chat  /chat/{id}/messages              │
│  /chat/messages/{id}/feedback                            │
└──────┬──────────────────────────┬───────────────────────┘
       │                          │
┌──────▼──────┐          ┌────────▼────────────┐
│   SQLite    │          │  Azure AI Search     │
│  (usuarios, │          │  (chunks + embeddings│
│   asistentes│          │   filtrados por      │
│   chats,    │          │   assistant_id)      │
│   mensajes) │          └────────┬────────────┘
└─────────────┘                   │
                          ┌───────▼──────────┐
                          │  Azure OpenAI    │
                          │  Embeddings + LLM│
                          └──────────────────┘
```

---

## Cómo se cumplen los requisitos críticos

**Aislamiento por asistente en retrieval:**
Cada chunk indexado incluye `assistant_id` como campo de metadatos. La función `rag_chat()` en `rag.py` siempre incluye un filtro `$filter=assistant_id eq {id}` en la búsqueda vectorial de Azure AI Search.

**Persistencia del chat:**
`ChatSessionDB` (UUID) + `ChatMessageDB` en SQLite. Al abrir una sesión existente, el frontend carga los mensajes via `GET /chat/{session_id}/messages` y los históriales se pasan al LLM en cada turno.

**Citas y comportamiento de no inventar:**
El system prompt incluye la instrucción de citar fuentes y responder solo con información de los fragmentos recuperados. Si el contexto está vacío o no es relevante, el prompt fuerza una respuesta de "no tengo información suficiente".

---

## Setup local

### Backend

```bash
cd backend
python -m venv venv && source venv/Scripts/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env  # edita con tus API keys
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Variables de entorno necesarias (ver `.env.example`):

| Variable | Descripción |
|---|---|
| `AZURE_OPENAI_KEY` | API key de Azure OpenAI |
| `AZURE_OPENAI_ENDPOINT` | Endpoint del recurso |
| `AZURE_SEARCH_ENDPOINT` | Endpoint de Azure AI Search |
| `AZURE_SEARCH_KEY` | API key admin de Azure AI Search |
| `SECRET_KEY` | Clave para firmar JWT |

---

## Entregables

| Entregable | Estado |
|---|---|
| Repositorio GitHub con código completo | ✅ |
| `.gitignore` apropiado | ✅ |
| `.env.example` con variables documentadas | ✅ |
| README técnico con arquitectura y decisiones | ✅ |
| Vídeo demo (3–5 min) | ⏳ Pendiente |

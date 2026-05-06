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

---

## FAQ — Preguntas frecuentes

### ¿Por qué Azure AI Search y no una base de datos vectorial local como ChromaDB o Faiss?

Azure AI Search es un servicio gestionado: no hay infraestructura que levantar ni mantener. Ofrece **búsqueda híbrida** (vectorial + texto léxico) de forma nativa, filtrado por metadatos con sintaxis OData (`$filter=assistant_id eq 'X'`) y escalado automático. ChromaDB o Faiss son más sencillos de arrancar en local, pero requieren gestión propia en producción. Para este proyecto ya disponíamos de créditos de Azure, así que era la elección natural.

---

### ¿Por qué SQLite y no PostgreSQL?

SQLite elimina la necesidad de levantar un servidor de base de datos para el desarrollo y la demo. SQLAlchemy abstrae el motor — cambiar a PostgreSQL en producción es una sola línea en el `.env` (`DATABASE_URL=postgresql://...`). Para un proyecto de esta escala, SQLite es suficiente y reduce la fricción de setup.

---

### ¿Cómo garantizas que el asistente no inventa información?

Dos mecanismos:

1. **Instrucción en el system prompt:** `"Responde ÚNICAMENTE utilizando la información extraída de tus documentos. Si la información no está en el contexto, indica explícitamente que no puedes contestar. NO te inventes datos."`
2. **`temperature=0.3`:** valor bajo que reduce la variabilidad y creatividad del modelo, haciéndolo más fiel al contexto proporcionado.

Si la búsqueda vectorial no devuelve chunks relevantes, el contexto llega vacío (`"No se encontraron documentos relevantes"`) y el modelo no tiene material con el que fabricar una respuesta.

---

### ¿Cómo funciona el aislamiento entre asistentes?

Cada chunk indexado en Azure AI Search incluye el campo `assistant_id` como metadato filtrable. La función `rag_chat()` siempre incluye `filter=f"assistant_id eq '{assistant_id}'"` en la consulta — Azure AI Search descarta físicamente todos los chunks que no pertenezcan a ese asistente antes de calcular similitud. No hay posibilidad de fuga de información entre asistentes.

---

### ¿Qué es un embedding y por qué se necesita?

Un embedding es la representación numérica del significado de un texto: un array de 1536 números (con `text-embedding-ada-002`) donde textos semánticamente similares tienen vectores matemáticamente cercanos. Se necesita porque los LLMs no "buscan" texto literal — para encontrar el fragmento más relevante a una pregunta hay que comparar significados, no palabras. La distancia coseno entre dos vectores mide esa similitud semántica.

---

### ¿Por qué JWT y no sesiones de servidor?

JWT es **stateless**: el token lleva el `user_id` firmado con una clave secreta. El backend no necesita consultar ninguna tabla de sesiones para autenticar una request — solo verifica la firma. Esto hace que cualquier instancia del backend pueda validar cualquier token sin estado compartido, lo que es la base de la escalabilidad horizontal.

---

### ¿Qué pasa si se sube un PDF muy grande?

LangChain `RecursiveCharacterTextSplitter` lo parte en chunks de **1000 caracteres con 200 de solape**. El solape evita que una idea que cae justo en el corte entre dos chunks quede truncada e irrecuperable. Cada chunk se vectoriza y sube de forma independiente. Los chunks se envían en lotes de 50 a Azure AI Search para no saturar la API.

---

### ¿Por qué HNSW para la búsqueda vectorial?

HNSW (Hierarchical Navigable Small World) es un algoritmo de búsqueda aproximada de vecinos más cercanos (ANN). En lugar de comparar la pregunta contra todos los vectores del índice (fuerza bruta, O(n)), construye un grafo jerárquico que permite encontrar los k vecinos más cercanos en O(log n). La configuración usada: `m=4` (conexiones por nodo), `efConstruction=400` (calidad del grafo en construcción), `efSearch=500` (amplitud de búsqueda en consulta), métrica coseno.

---

### ¿Dónde se guardan las contraseñas?

Nunca en claro. Al registrarse, bcrypt genera un **hash irreversible** con salt aleatorio incorporado. En la tabla `users` solo se almacena ese hash. En el login, bcrypt verifica que la contraseña introducida produce el mismo hash — sin necesidad de desencriptar nada, porque bcrypt no es encriptación sino hashing.

---

### ¿Qué ocurre si se elimina un documento?

Se ejecutan dos operaciones:
1. **Azure AI Search:** se buscan todos los chunks con `document_id eq '{id}'` y se borran del índice vectorial.
2. **SQLite:** se elimina el registro de la tabla `documents`.

El asistente deja de tener acceso a ese conocimiento de forma inmediata en la siguiente consulta.

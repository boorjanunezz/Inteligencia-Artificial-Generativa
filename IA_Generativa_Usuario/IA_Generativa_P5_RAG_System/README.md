# NexRAG - Plataforma Multiasistente RAG

Este proyecto implementa una plataforma full-stack para crear y gestionar asistentes de IA conversacionales basados en documentos (RAG) utilizando Azure OpenAI y Azure AI Search, garantizando el aislamiento de la información por asistente.

## Arquitectura

- **Frontend:** React (Vite) con React Router para navegación, estilos modulares en CSS.
- **Backend:** FastAPI (Python), SQLAlchemy para base de datos SQLite (persistiendo en `ragapp.db`).
- **RAG & GenAI:** Azure OpenAI (`gpt-4o`, `text-embedding-ada-002`) para LLM y Embeddings, Azure AI Search (índice vectorial con búsqueda HNSW y aislamiento por `assistant_id`) para Retrieval Vectorizado.

### Decisiones de Diseño

- **Aislamiento por asistente:** El índice en Azure AI Search etiqueta cada chunk (fragmento) con el campo `assistant_id`. Cuando se genera el contexto para una respuesta, la consulta vectorial se filtra primero con `filter=assistant_id eq 'X'`, imposibilitando que el asistente recupere documentos que no le pertenecen.
- **Persistencia de Chat:** Usando SQLAlchemy y SQLite, todos los chats generan un `session_id`. Se persisten tanto mensajes del `user` como del `assistant`. En cada iteración, el historial previo se inyecta en el contexto de GPT-4o.
- **Respuesta sin inventar datos:** En el system prompt inyectado, se restringe estrictamente al LLM para que responda **solo** con el contexto extraído de sus documentos, obligándolo a indicar explícitamente si la información no está disponible.
- **Chunking Documental:** Documentos cargados pasan por PyPDF2/docx, se trocean en chunks de 1000 caracteres con overlap de 200, logrando un balance en contexto y ruido.

## Guía de Instalación Local

### Requisitos

- Node.js & npm
- Python 3.9+
- Una instancia de Azure OpenAI y Azure AI Search.

### Backend

1. Ve a `Proyecto5-RAG/backend`.
2. Crea el entorno virtual y actívalo:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   ```
3. Instala dependencias:
   ```bash
   pip install -r requirements.txt
   ```
4. Copia el archivo `.env.example` a `.env` y rellena tus claves de Azure.
5. Inicializa la creación del índice Vectorial:
   ```bash
   python -c "import rag; rag.setup_search_index()"
   ```
6. Corre el servidor FastAPI:
   ```bash
   uvicorn main:app --reload
   ```
El backend estará disponible en `http://localhost:8000`.

### Frontend

1. Ve a `Proyecto5-RAG/frontend`.
2. Instala módulos de JS:
   ```bash
   npm install
   ```
3. Ejecuta en local:
   ```bash
   npm run dev
   ```

Visita el puerto indicado por Vite.

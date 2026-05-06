# Lumen — AI Interview Coach

**Plataforma SaaS de simulación de entrevistas con Inteligencia Artificial.**  
Proyecto final del Máster en IA y Big Data.

🔗 **Demo en vivo:** [https://perpetual-surprise-production-4562.up.railway.app](https://perpetual-surprise-production-4562.up.railway.app)

---

## Qué hace

Lumen genera entrevistas de trabajo personalizadas a partir de una oferta de empleo y el CV del candidato, evalúa cada respuesta con IA y genera un plan de mejora al finalizar.

- Sube tu CV en PDF o pega el texto
- Introduce la oferta de trabajo (título, empresa, descripción)
- Responde 8 preguntas generadas por GPT-4o adaptadas a tu perfil
- Recibe feedback inmediato con puntuación, fortalezas y áreas de mejora
- Obtén un plan de acción personalizado de 30 días
- Reintenta cualquier pregunta para mejorar tu puntuación
- Disponible en español, inglés, francés y chino

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | FastAPI (Python 3.11) |
| Base de datos | SQLite + SQLAlchemy |
| IA — Generación y evaluación | Azure OpenAI GPT-4o |
| IA — Scoring semántico | Azure OpenAI text-embedding-ada-002 |
| Extracción de PDF | pdfplumber |
| Autenticación | JWT (python-jose) |
| i18n | i18next (ES / EN / FR / ZH) |
| Despliegue | Railway (Docker) |

## Cómo funciona el scoring

Cada respuesta recibe una puntuación combinada:

```
Score final = 65% × evaluación GPT-4o + 35% × similitud semántica (embeddings)
```

GPT-4o evalúa la calidad, estructura y relevancia de la respuesta.  
Los embeddings miden si la respuesta cubre los conceptos clave esperados, independientemente de las palabras exactas usadas.

## Estructura del proyecto

```
Proyecto6-SaaS/
├── backend/          # FastAPI — API REST + lógica IA
│   ├── routers/      # auth, sessions, cv, profile, jobs
│   ├── services/     # ai_service.py (GPT-4o + embeddings)
│   └── main.py       # Entrada, sirve también el frontend
├── frontend/         # React + TypeScript
│   ├── src/pages/    # Dashboard, Interview, Results, Jobs...
│   ├── src/locales/  # Traducciones ES/EN/FR/ZH
│   └── src/services/ # Cliente Axios
├── Dockerfile        # Build multi-etapa (Node + Python)
└── nixpacks.toml
```

## Ejecutar en local

**Backend:**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# Crear backend/.env con las variables de Azure OpenAI (ver .env.example)
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

La app estará en `http://localhost:5173`.

## Variables de entorno necesarias

```
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_GPT4O_DEPLOYMENT=gpt-4o
AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT=text-embedding-ada-002
SECRET_KEY=
```

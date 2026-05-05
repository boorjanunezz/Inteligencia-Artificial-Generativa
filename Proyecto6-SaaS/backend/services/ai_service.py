import json
import re
import numpy as np
from openai import AzureOpenAI
from config import settings

client = AzureOpenAI(
    azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
    api_key=settings.AZURE_OPENAI_API_KEY,
    api_version="2024-02-15-preview",
)

GPT = settings.AZURE_OPENAI_GPT4O_DEPLOYMENT
EMB = settings.AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT


# ── Helpers ──────────────────────────────────────────────────────────────────

def _parse_json(text: str) -> dict | list:
    """Limpia el texto de bloques markdown y parsea el JSON."""
    cleaned = re.sub(r"```(?:json)?", "", text).strip()
    return json.loads(cleaned)


def embed_text(text: str) -> list[float]:
    response = client.embeddings.create(input=text[:8000], model=EMB)
    return response.data[0].embedding


def cosine_similarity(a: list[float], b: list[float]) -> float:
    va, vb = np.array(a), np.array(b)
    return float(np.dot(va, vb) / (np.linalg.norm(va) * np.linalg.norm(vb)))


def embedding_score(answer_text: str, ideal_points: list[str]) -> float:
    """Mide la similitud semántica entre la respuesta y los puntos ideales."""
    ideal_text = " ".join(ideal_points)
    answer_emb = embed_text(answer_text)
    ideal_emb = embed_text(ideal_text)
    sim = cosine_similarity(answer_emb, ideal_emb)
    # Normaliza cosine similarity (rango típico 0.3–1.0) a 0–100
    normalized = max(0.0, (sim - 0.3) / 0.7) * 100
    return min(100.0, normalized)


# ── Core AI Calls ─────────────────────────────────────────────────────────────

def generate_questions(
    job_title: str,
    company: str,
    job_description: str,
    cv_text: str,
) -> list[dict]:
    """
    Genera 8 preguntas de entrevista personalizadas al puesto y al CV.
    Devuelve lista de dicts: {question, type, focus, ideal_answer_points}.
    """
    prompt = f"""Eres un experto en reclutamiento técnico y coaching de entrevistas.
Basándote en la siguiente descripción del puesto y el CV del candidato, genera exactamente 8 preguntas de entrevista altamente específicas.

Puesto: {job_title}
Empresa: {company}

Descripción del puesto:
{job_description}

CV del candidato:
{cv_text}

Distribución requerida:
- 2 preguntas Técnicas (sobre habilidades técnicas específicas del rol)
- 3 preguntas de Comportamiento (método STAR, basadas en experiencias concretas del CV)
- 2 preguntas Situacionales (escenarios hipotéticos relevantes para el rol)
- 1 pregunta de Motivación (por qué este rol en esta empresa específica)

Devuelve ÚNICAMENTE un objeto JSON con esta estructura exacta (sin markdown, sin texto adicional):
{{
  "questions": [
    {{
      "question": "texto de la pregunta",
      "type": "technical|behavioral|situational|motivation",
      "focus": "qué evalúa esta pregunta en 5-10 palabras",
      "ideal_answer_points": ["punto clave 1", "punto clave 2", "punto clave 3"]
    }}
  ]
}}"""

    response = client.chat.completions.create(
        model=GPT,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        response_format={"type": "json_object"},
    )

    data = _parse_json(response.choices[0].message.content)
    return data.get("questions", [])


def evaluate_answer(
    job_title: str,
    company: str,
    question_text: str,
    question_type: str,
    ideal_answer_points: list[str],
    answer_text: str,
) -> dict:
    """
    Evalúa la respuesta del candidato y devuelve un dict con score y feedback.
    """
    points_str = "\n".join(f"- {p}" for p in ideal_answer_points)

    prompt = f"""Eres un coach experto en entrevistas evaluando la respuesta de un candidato.

Contexto:
- Puesto: {job_title} en {company}
- Tipo de pregunta: {question_type}
- Pregunta: {question_text}

Puntos clave esperados:
{points_str}

Respuesta del candidato:
{answer_text}

Evalúa en profundidad y devuelve ÚNICAMENTE JSON (sin markdown):
{{
  "score": <entero 0-100>,
  "verdict": "<excellent|good|needs_improvement|poor>",
  "strengths": ["fortaleza 1", "fortaleza 2"],
  "improvements": ["mejora 1", "mejora 2"],
  "feedback": "<valoración global en 2-3 frases>",
  "ideal_answer_hint": "<una frase indicando qué incluiría una respuesta perfecta>"
}}

Criterios de puntuación:
- 90-100: Excelente, respuesta completa y estructurada
- 70-89: Buena, cubre los puntos principales con alguna carencia menor
- 50-69: Necesita mejora, cubre solo algunos puntos clave
- 0-49: Pobre, respuesta incompleta o irrelevante"""

    response = client.chat.completions.create(
        model=GPT,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        response_format={"type": "json_object"},
    )

    return _parse_json(response.choices[0].message.content)


def parse_cv(cv_text: str) -> dict:
    """Extrae datos estructurados de un CV en texto plano usando IA."""
    prompt = f"""Analiza este CV y extrae la información en formato JSON estructurado.
Devuelve ÚNICAMENTE JSON válido sin markdown ni texto adicional:

{{
  "nombre": "nombre completo o null",
  "resumen": "resumen profesional en 2-3 frases o null",
  "anos_experiencia_total": <número entero o null>,
  "experiencia": [
    {{
      "empresa": "nombre empresa",
      "rol": "título del puesto",
      "inicio": "año o mes/año",
      "fin": "año o mes/año o 'Actualidad'",
      "descripcion": "breve descripción de responsabilidades",
      "tecnologias": ["tech1", "tech2"]
    }}
  ],
  "educacion": [
    {{
      "institucion": "nombre del centro",
      "titulo": "nombre del título",
      "area": "área de estudio",
      "año_fin": "año de finalización"
    }}
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "idiomas": [
    {{"idioma": "Inglés", "nivel": "C1"}}
  ]
}}

CV:
{cv_text[:6000]}"""

    response = client.chat.completions.create(
        model=GPT,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        response_format={"type": "json_object"},
    )
    return _parse_json(response.choices[0].message.content)


def generate_improvement_plan(
    job_title: str,
    company: str,
    qa_pairs: list[dict],
    overall_score: float,
) -> str:
    """
    Genera un plan de mejora personalizado basado en toda la sesión.
    """
    summary_parts = []
    for qa in qa_pairs:
        summary_parts.append(
            f"P: {qa['question']}\n"
            f"R (extracto): {qa['answer'][:300]}\n"
            f"Puntuación: {qa['score']:.0f}/100 — {qa['feedback']}"
        )
    summary = "\n\n".join(summary_parts)

    prompt = f"""Eres un coach de carrera senior. Basándote en esta simulación de entrevista para {job_title} en {company}, crea un plan de mejora personalizado y accionable.

Puntuación global: {overall_score:.0f}/100

Resumen de la entrevista:
{summary}

Escribe el plan en markdown con estas secciones exactas:
## Valoración General
(2-3 frases honestas y constructivas sobre el desempeño)

## Fortalezas Detectadas
- (3 puntos fuertes con evidencia concreta de las respuestas)

## Áreas de Mejora Prioritarias
### 1. [Área]
- Qué mejorar: ...
- Cómo practicarlo: ...

### 2. [Área]
- Qué mejorar: ...
- Cómo practicarlo: ...

### 3. [Área]
- Qué mejorar: ...
- Cómo practicarlo: ...

## Plan de Acción — 30 días
- **Semana 1:** ...
- **Semana 2:** ...
- **Semana 3:** ...
- **Semana 4:** ...

## Recursos Recomendados
- (2-3 recursos específicos: libros, cursos, plataformas de práctica)

Sé específico, usa ejemplos de las respuestas del candidato, y mantén un tono motivador."""

    response = client.chat.completions.create(
        model=GPT,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )

    return response.choices[0].message.content

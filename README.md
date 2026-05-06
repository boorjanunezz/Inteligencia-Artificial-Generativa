# Inteligencia Artificial Generativa

Repositorio central para los proyectos y prácticas del Máster en IA y Big Data — módulo de IA Generativa.

## Estructura del Repositorio

```
├── IA_Generativa_Usuario/       # Prácticas y proyectos completados
│   ├── IA_Generativa_P1_Guardrails_Reasoning_Multimodal
│   ├── IA_Generativa_P2_Prompt_Engineering
│   ├── IA_Generativa_P3_Fine_Tuning
│   ├── IA_Generativa_P4_Embeddings_VectorSearch
│   ├── IA_Generativa_P5_RAG_System
│   └── IA_Generativa_P6_SaaS_Lumen
└── IA_Generativa_Desarrollo/    # Proyectos en desarrollo
```

## Prácticas

| # | Nombre | Descripción |
|---|--------|-------------|
| P1 | Guardrails, Reasoning y Multimodal | Notebooks con guardrails, razonamiento y visión con GPT-4o |
| P2 | Prompt Engineering | Técnicas de prompting y experimentación con parámetros del modelo (`temperature`, `top_p`, `penalties`) |
| P3 | Fine-Tuning | Entrenamiento fino de modelos con datasets JSONL propios |
| P4 | Embeddings y Vector Search | Búsqueda semántica con embeddings y Azure AI Search |

## Proyectos

| # | Nombre | Descripción | Stack |
|---|--------|-------------|-------|
| P5 | RAG System | Sistema de Retrieval-Augmented Generation con autenticación y chat | FastAPI + React |
| P6 | SaaS Lumen | Plataforma SaaS de preparación de entrevistas con IA | FastAPI + React + TypeScript |

## Configuración General

Cada práctica/proyecto tiene su propio `requirements.txt` y `.env.example`. El flujo general es:

```bash
# 1. Clonar el repositorio
git clone https://github.com/boorjanunezz/Inteligencia-Artificial-Generativa.git

# 2. Entrar a la carpeta del proyecto
cd IA_Generativa_Usuario/IA_Generativa_P<N>_<Nombre>

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus claves de Azure OpenAI
```

Para los proyectos full-stack (P5, P6) consulta el `README.md` dentro de cada proyecto, que incluye instrucciones para levantar backend y frontend por separado.

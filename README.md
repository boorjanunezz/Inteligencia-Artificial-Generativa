# Inteligencia Artificial Generativa

Repositorio central para los proyectos y prácticas de IA Generativa.

## 📁 Contenido del Repositorio

* **Práctica 1**: Guardrails, Reasoning y Multimodalidad. Incluye notebooks experimentando con imágenes mediante GPT-4o.
* **Práctica 2**: Prompt Engineering y experimentación con parámetros del modelo (`temperature`, `top_p`, `penalties`).

## ⚙️ Configuración del Entorno (Guía de Inico Rápido)

Para ejecutar cualquiera de estos cuadernos localmente, sigue estos pasos:

1. **Clonar este repositorio:**
```bash
git clone https://github.com/boorjanunezz/Inteligencia-Artificial-Generativa.git
cd Inteligencia-Artificial-Generativa
```

2. **Instalar las dependencias necesarias:**
Para asegurarnos de que todo corra sin errores, instala los paquetes requeridos usando pip:
```bash
pip install -r requirements.txt
```

3. **Configurar credenciales (Variables de entorno):**
Para que los modelos puedan comunicarse con la API, necesitas establecer tus claves. 
He creado un archivo `.env.example`. Simplemente haz una copia de este archivo y llámala `.env`. Luego, edita `.env` con tus claves de Azure OpenAI:
```env
AZURE_OPENAI_ENDPOINT="https://<tu-recurso>.openai.azure.com/"
AZURE_OPENAI_KEY="tU-cLaVe-SeCrEtA"
AZURE_OPENAI_DEPLOYMENT="gpt-4o"
```

4. **Lanzar Jupyter Notebook:**
Finalmente, corre el servicio y abre los archivos `.ipynb`:
```bash
jupyter notebook
```

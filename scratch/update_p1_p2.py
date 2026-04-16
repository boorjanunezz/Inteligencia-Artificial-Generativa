import json
import os

def update_notebook(path, emphasis_map, title_map):
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as f:
        nb = json.load(f)
    for cell in nb["cells"]:
        if cell["cell_type"] == "markdown":
            text = "".join(cell["source"])
            # Aplicar negritas
            for old, new in emphasis_map.items():
                text = text.replace(old, new)
            # Actualizar títulos
            for old, new in title_map.items():
                text = text.replace(old, new)
            cell["source"] = [text]
    with open(path, "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=1, ensure_ascii=False)

# Configuración Práctica 1
update_notebook(
    r"c:\Users\nunez\Desktop\Master IA y Big Data\IA Generativa\Practica1-InteligenciaArtificial_Generativa\Practica_1_Guardrails.ipynb",
    {"salidas estructuradas": "**salidas estructuradas (JSON)**", "Guardrails": "**Guardrails**", "System Prompt": "**System Prompt**"},
    {"## 1.1 ": "## Sección 1: ", "## 1.2 ": "## Sección 2: ", "## 1.3 ": "## Sección 3: "}
)

# Configuración Práctica 2
update_notebook(
    r"c:\Users\nunez\Desktop\Master IA y Big Data\IA Generativa\Practica2-InteligenciaArtificial_Generativa\Parte1_Prompt_Engineering.ipynb",
    {"Few-Shot": "**Few-Shot Coaching**", "Chain of Thought": "**Chain of Thought (CoT)**", "Prompt Engineering": "**Prompt Engineering**"},
    {"## ": "## Sección: "}
)

print("Notebooks de Práctica 1 y 2 actualizados con el estilo de la Práctica 3.")

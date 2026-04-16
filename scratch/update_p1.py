import json

# Leer el notebook original
path_p1 = r"c:\Users\nunez\Desktop\Master IA y Big Data\IA Generativa\Practica1-InteligenciaArtificial_Generativa\Practica_1_Guardrails.ipynb"
with open(path_p1, "r", encoding="utf-8") as f:
    nb = json.load(f)

# Modificar las celdas de Markdown para añadir énfasis (negritas)
for cell in nb["cells"]:
    if cell["cell_type"] == "markdown":
        text = "".join(cell["source"])
        
        # Aplicamos énfasis a términos clave
        text = text.replace("salidas estructuradas", "**salidas estructuradas (JSON)**")
        text = text.replace("mecanismos de seguridad", "**mecanismos de seguridad (Content Safety / Guardrails)**")
        text = text.replace("System Prompt", "**System Prompt**")
        text = text.replace("JSON válido", "**JSON válido**")
        text = text.replace("Guardrails", "**Guardrails**")
        
        # Mejoramos títulos
        if "## 1.1 Generación de Texto" in text:
            text = text.replace("## 1.1 Generación de Texto", "## Sección 1: Generación de Texto y Comportamiento")
        if "## 1.2 Respuesta Estructurada en JSON" in text:
            text = text.replace("## 1.2 Respuesta Estructurada en JSON", "## Sección 2: Salidas Estructuradas (JSON Mode)")
        if "## 1.3 Implementación de Guardrails" in text:
            text = text.replace("## 1.3 Implementación de Guardrails", "## Sección 3: Seguridad y Guardrails")
            
        cell["source"] = [text]

# Guardar el notebook actualizado
with open(path_p1, "w", encoding="utf-8") as f:
    json.dump(nb, f, indent=)

print("Practica 1 (Notebook 1) actualizada con énfasis.")

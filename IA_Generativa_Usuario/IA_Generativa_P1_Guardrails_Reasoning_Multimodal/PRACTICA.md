# Práctica: Despliegue y uso de modelos en AI Foundry

Este repositorio contiene la práctica para aprender a desplegar y usar modelos en AI Foundry. La práctica está dividida en 3 partes independientes. Cada parte debe entregarse como un notebook Jupyter (`.ipynb`) con un nombre claro y apropiado.


## 1) Text, JSON y Guardrails
Objetivo: Desplegar un modelo y realizar tres tipos de interacciones:
### 1.1- Generar texto. 
Simple generación de texto con system prompt y user prompt.

⭐ Suma puntos crear un chat interactivo por CLI que persista la memoria a corto plazo.

[Documentación](https://learn.microsoft.com/en-us/azure/foundry/foundry-models/how-to/generate-responses?tabs=python)
### 1.2- Generar respuesta estructurada en formato JSON.
Generación de respuesta estructurada en JSON.

[Documentación](https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/structured-outputs?tabs=python-secure%2Cdotnet-entra-id&pivots=programming-language-python)
### 1.3- Implementar y demostrar Guardrails. 
Crear Guardrails para el modelo, documentar el proceso y hacer pruebas contra el modelo.

[Documentación](https://learn.microsoft.com/en-us/azure/foundry/guardrails/how-to-create-guardrails?tabs=python)

### Entregable: 
Notebook con código que muestre la llamada al endpoint del modelo para cada caso, ejemplos de prompts, validación del JSON recibido y una sección que muestre cómo se configuran y activan los Guardrails.

---

## 2) Reasoning y Function Calling
Objetivo: Practicar con modelos razonadores y ver el function calling

### 2.1- Razonamiento
Desplegar un modelo razonador y parametrizar distintos grados de razonamiento (low, medium, high)

[Documentación](https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/reasoning?tabs=csharp%2Cgpt-5)

### 2.2- Function calling
Activar un motor de búsqueda web para probar llamadas a funciones (`function calling`) que recuperen información externa.

[Documentación](https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/web-search)

⭐ Suma puntos usar deep research o hacer function calling con una función custom.


### Entregable: 
Notebook que muestre:
	- Ejemplos comparativos (misma tarea con distintos niveles de razonamiento).
	- Integración del web search y ejemplo de `function calling` que combine resultados externos con la respuesta del modelo.

---

## 3) Modelos Multimodales
### Objetivo: 
Desplegar un modelo multimodal y probar interacciones que involucren imágenes, audio y/o texto combinado (por ejemplo: describir una imagen, transcribir audio y responder preguntas sobre su contenido, etc.).

[Documentación](https://learn.microsoft.com/en-us/azure/foundry-classic/foundry-models/how-to/use-chat-multi-modal?context=%2Fazure%2Ffoundry%2Fcontext%2Fcontext&pivots=programming-language-python)

### Entregable: 
Notebook con llamadas al endpoint multimodal mostrando varios ejemplos: subida/consulta de imágenes, audios y prompts mixtos; incluir control de formatos y manejo de respuestas (texto y/o estructuras).

---

Formato y criterios de entrega
- Cada parte debe entregarse como un notebook `.ipynb` autocontenido que incluya:
	- Sección de configuración / credenciales (explicando cómo configurar variables de entorno localmente).
	- Código reproducible conecta a un modelo ya desplegado, realiza las llamadas y procesa las respuestas.
	- Celdas de explicación y resultados visibles (salidas, figuras, JSON validados).
	- Una sección final de conclusiones y problemas encontrados.




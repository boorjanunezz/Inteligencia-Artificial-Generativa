# 🔁 Redes Neuronales Recurrentes (RNN) y LSTM

> **📖 Resumen:** Las RNN modelan datos secuenciales manteniendo memoria del contexto previo; las LSTM son una evolución diseñada para aprender dependencias largas con más estabilidad.


---

## 📑 Índice

| Sección | Contenido |
|---|---|
| 📌 | [Conceptos clave](#-conceptos-clave) |
| 🧠 | [Qué es una RNN y cómo procesa secuencias](#-qué-es-una-rnn-y-cómo-procesa-secuencias) |
| ⚠️ | [Problemas de las RNN clásicas](#-problemas-de-las-rnn-clásicas) |
| 🚪 | [LSTM: memoria, puertas y flujo de información](#-lstm-memoria-puertas-y-flujo-de-información) |
| 🔧 | [Ejemplos prácticos en Keras](#-ejemplos-prácticos-en-keras) |
| 🔍 | [Cuándo usar RNN o LSTM](#-cuándo-usar-rnn-o-lstm) |
| ✅ | [Mejores prácticas](#-mejores-prácticas) |
| 📚 | [Referencias](#-referencias) |

---

## 📌 Conceptos clave

> 💡 **Idea central:** una red secuencial no trata cada muestra como independiente; usa el contexto anterior para interpretar la actual.

### 1️⃣ **Secuencia**

**📝 Explicación:** una secuencia es una serie ordenada de elementos donde el orden importa. Puede ser texto, audio, series temporales o eventos.

```markdown
💬 Ejemplo/Uso:
Una serie de precios diarios o una frase en lenguaje natural.
```

---

### 2️⃣ **Estado oculto**

**📝 Explicación:** es la “memoria” interna de la red. Se actualiza en cada paso temporal con la nueva entrada y el estado anterior.

```markdown
💬 Ejemplo/Uso:
La red recuerda lo que ha visto en pasos previos para interpretar el paso actual.
```

---

### 3️⃣ **Desenrollado temporal**

**📝 Explicación:** una RNN se puede imaginar como la misma celda repetida a lo largo del tiempo, compartiendo pesos en todos los pasos.

```markdown
💬 Ejemplo/Uso:
La misma unidad procesa t1, t2, t3... con los mismos parámetros.
```

---

### 4️⃣ **Dependencias a largo plazo**

**📝 Explicación:** son relaciones entre eventos separados por muchos pasos temporales. Son clave en texto, series financieras y lenguaje.

```markdown
💬 Ejemplo/Uso:
El sentido de una palabra al final de una frase puede depender de una palabra al principio.
```

---

## 🧠 Qué es una RNN y cómo procesa secuencias

Una **RNN (Recurrent Neural Network)** es una red diseñada para secuencias. En vez de consumir todo el vector de una vez, procesa los elementos paso a paso y va actualizando su estado oculto.

En cada instante `t`, la red combina:

- la entrada actual `x_t`,
- el estado anterior `h_(t-1)`,
- y produce un nuevo estado `h_t`.

La intuición es simple: la red no solo ve “lo de ahora”, sino también un resumen de “lo de antes”.

### Tipos de salida más comunes

| Tipo | Entrada | Salida | Ejemplo |
|---|---|---|---|
| **Many-to-one** | secuencia completa | una sola salida | clasificar una reseña |
| **Many-to-many** | secuencia completa | secuencia completa | etiquetado por token |
| **One-to-many** | una entrada | secuencia | generación de texto |

> ⚠️ **Clave didáctica:** el valor de una RNN no está en “ver más datos”, sino en conservar contexto útil mientras avanza por la secuencia.

---

## ⚠️ Problemas de las RNN clásicas

Las RNN simples funcionan bien en secuencias cortas, pero sufren al intentar aprender relaciones muy separadas en el tiempo.

### Problemas principales

- **Desvanecimiento del gradiente**: el aprendizaje de eventos antiguos se debilita.
- **Explosión del gradiente**: las actualizaciones pueden crecer demasiado.
- **Memoria limitada**: cuesta retener señales importantes durante muchos pasos.
- **Entrenamiento lento**: el cálculo secuencial limita la paralelización.

### Consecuencia práctica

Las RNN clásicas suelen fallar cuando:

- una decisión depende de información lejana,
- el texto es largo,
- la serie temporal tiene patrones de largo alcance.

---

## 🚪 LSTM: memoria, puertas y flujo de información

> 💡 **Contexto:** una LSTM (Long Short-Term Memory) es una RNN mejorada para conservar información relevante durante más tiempo.

La LSTM introduce una **celda de memoria** y tres puertas que controlan el flujo de información:

### 1. Puerta de olvido

Decide qué parte de la memoria anterior se descarta.

### 2. Puerta de entrada

Decide qué nueva información se incorpora.

### 3. Puerta de salida

Decide qué parte de la memoria se expone como salida.

### Idea mental

La LSTM actúa como un filtro inteligente:

1. borra lo irrelevante,
2. guarda lo importante,
3. expone solo lo útil en cada paso.

### Por qué funciona mejor

- reduce el problema del gradiente desvanecido,
- conserva contexto durante más tiempo,
- suele rendir mejor en texto y series temporales complejas.

> ⚠️ **Regla práctica:** si una RNN simple se “olvida” demasiado pronto, una LSTM suele ser la primera mejora sensata.

---

## 🔧 Ejemplos prácticos en Keras

### RNN simple con `SimpleRNN`

```python
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

model = keras.Sequential([
    layers.Input(shape=(30, 10)),  # 30 pasos temporales, 10 variables
    layers.SimpleRNN(64, activation="tanh"),
    layers.Dense(1, activation="sigmoid")
])

model.compile(
    optimizer="adam",
    loss="binary_crossentropy",
    metrics=["accuracy"]
)
```

**💡 Explicación:**
- `Input(shape=(30, 10))`: cada muestra es una secuencia de 30 pasos con 10 features.
- `SimpleRNN(64)`: resume la secuencia en un estado interno.
- `Dense(1)`: produce una predicción binaria.

### LSTM para regresión temporal

```python
model = keras.Sequential([
    layers.Input(shape=(90, 6)),  # 90 días, 6 variables
    layers.LSTM(128, return_sequences=True),
    layers.Dropout(0.2),
    layers.LSTM(64),
    layers.Dense(5, activation="linear")  # predecir 5 pasos futuros
])

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=1e-3),
    loss="mse",
    metrics=["mae"]
)
```

**💡 Explicación:**
- la primera LSTM devuelve secuencias para apilar otra capa;
- `Dropout` reduce sobreajuste;
- la salida lineal sirve para regresión.

### LSTM para texto

```python
text_model = keras.Sequential([
    layers.Input(shape=(max_len,)),
    layers.Embedding(input_dim=vocab_size, output_dim=128),
    layers.LSTM(64),
    layers.Dense(1, activation="sigmoid")
])
```

Aquí la capa `Embedding` transforma tokens en vectores densos antes de que la LSTM procese la secuencia.

---

## 🔍 Cuándo usar RNN o LSTM

| Caso | Mejor opción | Motivo |
|---|---|---|
| Secuencias cortas y simples | RNN simple | Menor complejidad |
| Texto largo | LSTM | Conserva mejor el contexto |
| Series temporales con dependencias largas | LSTM | Más estabilidad temporal |
| Prototipos rápidos didácticos | RNN simple | Más fácil de entender |

> 💡 **Decisión rápida:** usa RNN simple para aprender el concepto; usa LSTM cuando el problema real requiera memoria más robusta.

---

## ✅ Mejores prácticas

| Práctica | Recomendación | 🎯 |
|---|---|---|
| **Normalizar secuencias** | Escala las variables numéricas antes de entrenar | ✓ |
| **Elegir la ventana temporal** | Usa una longitud de secuencia coherente con el problema | ✓ |
| **Controlar overfitting** | Aplica `Dropout` y `EarlyStopping` si hace falta | ✓ |
| **Probar baseline simple** | Compara contra una versión básica antes de complicar | ✓ |
| **Alinear salida y tarea** | Binaria, multiclase o regresión deben usar salidas distintas | ✓ |

> 💡 **Tip:** en problemas secuenciales, el preprocesado y la forma de la ventana suelen importar tanto como la arquitectura.

---

## 📚 Referencias

| Fuente | Enlace |
|---|---|
| Keras — RNN layers | https://keras.io/api/layers/recurrent_layers/ |
| TensorFlow — Recurrent neural networks | https://www.tensorflow.org/guide/keras/working_with_rnns |
| TensorFlow — LSTM layer | https://www.tensorflow.org/api_docs/python/tf/keras/layers/LSTM |
| Deep Learning Book | https://www.deeplearningbook.org/ |

---

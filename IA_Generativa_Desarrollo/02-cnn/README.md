# CNN — Reconocimiento de dígitos

![Demo](../docs/demo.mp4)

Dos redes neuronales convolucionales entrenadas sobre datasets de distinto tamaño y dificultad, comparadas en tiempo real mediante una app interactiva con canvas de dibujo.

## Modelos entrenados

### CNN-A · El Clásico
Arquitectura LeNet clásica entrenada sobre MNIST.

- **Dataset:** MNIST — 60 000 imágenes de entrenamiento
- **Arquitectura:** `Conv32 → MaxPool → Conv64 → MaxPool → Flatten → Dense(128) → Dropout(0.3) → Dense(10)`
- **Sin augmentación**
- ~93 000 parámetros

### CNN-B · El Robusto
Arquitectura moderna con BatchNorm y augmentación, entrenada sobre EMNIST Digits.

- **Dataset:** EMNIST Digits — 240 000 imágenes de entrenamiento + 40 000 de test
- **Arquitectura:** `Conv32+BN → MaxPool → Conv64+BN → MaxPool → Conv128+BN → GlobalAvgPool → Dense(256) → Dropout(0.5) → Dense(10)`
- **Augmentación:** rotación ±12°, traslación ±10%, zoom ±10%
- ~230 000 parámetros

## Archivos

| Ruta | Descripción |
|---|---|
| `notebooks/cnn_a_mnist.ipynb` | Entrenamiento CNN-A: EDA, arquitectura, evaluación, matriz de confusión |
| `notebooks/cnn_b_emnist.ipynb` | Entrenamiento CNN-B: carga IDX desde zip local, arquitectura, comparativa |
| `models/cnn_a_mnist.keras` | Modelo CNN-A entrenado |
| `models/cnn_b_emnist.keras` | Modelo CNN-B entrenado |

## Nota sobre EMNIST

El dataset se lee directamente desde el zip descargado de Kaggle (`emnist-digits`) sin extracción, usando solo librería estándar (`zipfile` + `struct`). No requiere ningún paquete adicional de descarga.

Las imágenes EMNIST están almacenadas transpuestas respecto a MNIST — se aplica la corrección estándar (`transpose + flip horizontal`) antes del entrenamiento. La app aplica el flip inverso al vuelo para compensar.

## Cómo ejecutar

```bash
# 1. Entrenar CNN-A
jupyter notebook notebooks/cnn_a_mnist.ipynb

# 2. Entrenar CNN-B (requiere el zip de EMNIST en ~/Downloads/archive.zip)
jupyter notebook notebooks/cnn_b_emnist.ipynb
```

Ambos notebooks guardan el modelo en `models/` al terminar.

## App interactiva

Canvas de dibujo con predicción en tiempo real de ambos modelos en [`../AppRedesNeuronales/`](../AppRedesNeuronales/). Ver el [README de la app](../AppRedesNeuronales/README.md).

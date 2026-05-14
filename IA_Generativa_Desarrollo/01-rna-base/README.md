# RNA — Predicción de precios de vivienda

Red neuronal densa (MLP) entrenada para predecir el precio de inmuebles en ciudades de India a partir de características numéricas y codificación one-hot de localización.

## Qué se construyó

Un pipeline completo de regresión con Keras:

- **Dataset:** 98 000 propiedades (Kaggle — India House Prices)
- **Features:** 6 numéricas (área, baños, planta, plantas totales, mobiliario, tipo de transacción) + 81 one-hot por ciudad = **87 features**
- **Target:** `log₁p(precio en INR)` — se invierte con `expm1` al predecir
- **Arquitectura:** `Input(87) → Dense(512, ReLU) → Dense(256, ReLU) → Dense(128, ReLU) → Dense(1, linear)`
- **Resultados:** R² = 0.93 · MAE ≈ $15 700 USD

## Archivos

| Archivo | Descripción |
|---|---|
| `rna_prediccion_precios_onehot.ipynb` | Notebook completo: EDA, preprocesado, entrenamiento, evaluación |
| `house_rna_onehot_model.keras` | Modelo entrenado serializado |
| `house_scaler_onehot.joblib` | StandardScaler ajustado sobre las 6 features numéricas |
| `house_feature_cols.joblib` | Lista ordenada de las 87 columnas de entrada |
| `location_encoding.csv` | Mapeo ciudad → columna one-hot |
| `house_prices_clean.csv` | Dataset limpio |
| `house_prices_onehot.csv` | Dataset con encoding aplicado |

## Cómo ejecutar

```bash
# Activar entorno con TensorFlow instalado
jupyter notebook rna_prediccion_precios_onehot.ipynb
```

El notebook genera los tres ficheros `.keras` y `.joblib` que consume la app interactiva.

## App interactiva

La predicción en tiempo real está integrada en la app del directorio [`../AppRedesNeuronales/`](../AppRedesNeuronales/). Ver el [README de la app](../AppRedesNeuronales/README.md) para instrucciones de arranque.

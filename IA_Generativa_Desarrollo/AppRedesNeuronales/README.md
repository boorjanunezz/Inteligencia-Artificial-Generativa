# Neural Network Playground — App interactiva

App Streamlit que agrupa las prácticas de redes neuronales del máster en una única interfaz: predicción de precios de vivienda (RNA) y reconocimiento de dígitos dibujados a mano (CNN).

## Funcionalidades

### ✍️ Reconocimiento de dígitos (CNN)
- Canvas de dibujo en tiempo real (trazo blanco sobre fondo negro, formato MNIST)
- Predicción simultánea con dos modelos: **CNN-A** (LeNet/MNIST) y **CNN-B** (EMNIST/Robusto)
- Gráfica de probabilidades por dígito para cada modelo
- Barra de confianza y veredicto de coincidencia/discrepancia entre modelos

### 🏠 Predicción de precio de vivienda (RNA)
- Sliders para las 6 características numéricas del inmueble
- Selector de ciudad (81 ciudades de India)
- Precio estimado en USD, EUR e INR actualizado en tiempo real
- Comparativa con la media del dataset

## Arranque

```bash
cd AppRedesNeuronales
python -m streamlit run app.py
```

Requiere que los modelos estén entrenados previamente:
- `../01-rna-base/house_rna_onehot_model.keras`
- `../02-cnn/models/cnn_a_mnist.keras`
- `../02-cnn/models/cnn_b_emnist.keras`

## Instalación de dependencias

```bash
pip install -r requirements.txt
```

## Stack

| Componente | Tecnología |
|---|---|
| UI | Streamlit |
| Canvas | streamlit-drawable-canvas |
| Modelos | TensorFlow / Keras |
| Preprocesado | NumPy, Pillow |
| Escalado | scikit-learn / joblib |

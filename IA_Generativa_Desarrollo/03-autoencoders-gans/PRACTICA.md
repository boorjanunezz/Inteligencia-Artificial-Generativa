# ### **Práctica: Autoencoders aplicados a generación o detección de anomalías**

> **Objetivo:** elegir una de estas dos rutas:
> - **Opción A:** entrenar un **VAE** para generar rostros nuevos.
> - **Opción B:** entrenar un **autoencoder** para detectar fraude en tarjetas de crédito.

---

## **1. Configuración Inicial**

### **Objetivo**
Preparar el entorno, el dataset y la estrategia de trabajo según la opción elegida.

### **Instrucciones comunes**
1. Definir qué opción se va a desarrollar: **VAE** o **fraude**.
2. Preparar el entorno con TensorFlow/Keras y librerías de apoyo para carga de datos, visualización y métricas.
3. Separar claramente:
   - datos de entrenamiento,
   - validación,
   - prueba.

---

## **2. Opción A — VAE para generar rostros**

### **2.1 Contexto**
El objetivo es construir un **Variational Autoencoder (VAE)** convolucional que aprenda una representación latente útil para generar rostros nuevos.

### **2.2 Dataset**
Usa [**CelebA**](https://www.kaggle.com/datasets/jessicali9530/celeba-dataset) como base de entrenamiento. 

- Dataset de rostros a gran escala.
- Se recomienda trabajar con imágenes alineadas y recortadas.
- Tamaño sugerido: `64x64`.

### **2.3 Preprocesamiento**
- Redimensionar las imágenes si hace falta.
- Normalizar píxeles a `[0, 1]`.
- Crear un pipeline con `tf.data.Dataset`.

### **2.4 Arquitectura**
- **Encoder** convolucional.
- Capa latente con `z_mean` y `z_log_var`.
- **Reparameterization trick**.
- **Decoder** con `Conv2DTranspose` o `UpSampling2D + Conv2D`.

### **2.5 Pérdida**
- Reconstrucción.
- Divergencia KL.
- Pérdida total con `beta` opcional.

### **2.6 Entregables**
- Código del VAE.
- Imágenes generadas en distintas épocas.
- Análisis de calidad y diversidad.

---

## **3. Opción B — Autoencoder para detección de fraude**

### **3.1 Contexto**
El objetivo es construir un **autoencoder denso** para detectar transacciones anómalas en tarjetas de crédito.

El modelo se entrenará para aprender el patrón normal de las transacciones y detectar como sospechosas aquellas que presenten un alto error de reconstrucción.

### **3.2 Dataset**
Usa este dataset de Kaggle:

**Credit Card Fraud Detection**  
https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud

### **3.3 Qué problema resuelve**
- **Detección de anomalías** en transacciones financieras.
- Identificación de operaciones inusuales o potencialmente fraudulentas.

### **3.4 Preprocesamiento**
- Revisar el desbalance extremo entre clases.
- Normalizar variables numéricas.
- Separar transacciones normales y fraudulentas.
- Entrenar el autoencoder principalmente con la clase normal.

> **Pista importante:** en este tipo de problema, el autoencoder aprende “cómo es una transacción normal”; después, una transacción rara suele reconstruirse peor.

### **3.5 Estrategia de entrenamiento**
1. Usar solo transacciones normales para entrenar.
2. Validar con una mezcla de normales y fraudulentas.
3. Calcular el **error de reconstrucción** para cada muestra.
4. Elegir un **umbral** para marcar anomalías.

### **3.6 Arquitectura recomendada**
- Autoencoder **denso**.
- Capas `Dense` con reducción progresiva.
- Bottleneck pequeño para forzar compresión.
- Salida con dimensión igual a la entrada.

### **3.7 Evaluación**
- **Precision**
- **Recall**
- **F1-score**
- **Matriz de confusión**
- Curva **PR-AUC** si se quiere profundizar

### **3.8 Entregables**
- Código del autoencoder.
- Justificación del umbral de anomalía.
- Evaluación del rendimiento en fraude.
- Análisis de falsos positivos y falsos negativos.

---

## **4. Comparación rápida entre las dos opciones**

| Opción | Tipo de problema | Dataset | Dificultad | Salida esperada |
|---|---|---|---|---|
| **VAE** | Generación | CelebA | Media/alta | Rostros nuevos |
| **Fraude** | Anomaly detection | Kaggle Credit Card Fraud | Media | Detección de transacciones sospechosas |

> **Recomendación:** si quieres una práctica más visual, elige el VAE. Si quieres una práctica más aplicada y fácil de justificar con métricas, elige fraude.

---

## **5. Model Building and Selection**

### **5.1 Construcción**
El alumno deberá implementar la arquitectura correspondiente a la opción elegida y documentar:
- entrada y preprocesado,
- diseño del encoder/decoder,
- función de pérdida,
- entrenamiento y validación.

### **5.2 Validación**
- Revisar la evolución de las pérdidas.
- Observar ejemplos de reconstrucción o detección.
- Ajustar arquitectura y umbral si procede.

### **5.3 Selección del modelo final**
Elegir la configuración que mejor cumpla el objetivo:
- generar imágenes realistas,
- o detectar fraude con buen equilibrio entre recall y precisión.

---

## **6. Presentación de Resultados**

### **6.1 Análisis cuantitativo**
- **VAE:** pérdida total, reconstrucción y KL.
- **Fraude:** precision, recall, F1 y matriz de confusión.

### **6.2 Visualización**
- **VAE:** imágenes generadas por época.
- **Fraude:** distribución del error de reconstrucción y ejemplos anómalos.

### **6.3 Reflexión crítica**
- ¿Qué limita la calidad del resultado?
- ¿Qué mejora más: más capas, más datos o mejor preprocesado?
- ¿Qué errores son más costosos en cada caso?

---

## **7. Entrega**

### **Entregables**
- Código limpio y comentado.
- Breve memoria de resultados.
- Conclusiones sobre la opción elegida.
- Justificación de decisiones técnicas.
- **Vídeo obligatorio** estilo videotutorial explicando el trabajo paso a paso, como si fuera un vídeo de YouTube sobre autoencoders.
- **Exploración libre**: se pueden proponer y desarrollar otros casos de uso adicionales si aportan valor y están bien justificados.

---

## **8. Pistas para problemas comunes**

- **VAE borroso:** probar más capacidad en el decoder o revisar la pérdida de reconstrucción.
- **VAE inestable:** ajustar `beta` o la dimensión latente.
- **Fraude con demasiados falsos positivos:** subir el umbral o revisar el balance de clases.
- **Fraude con pocos fraudes detectados:** ajustar el threshold o usar métricas más sensibles al recall.

---

## **9. Recursos**

- **Dataset CelebA:** http://mmlab.ie.cuhk.edu.hk/projects/CelebA.html
- **Kaggle Credit Card Fraud Detection:** https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud
- **Keras VAE example:** https://keras.io/examples/generative/vae/


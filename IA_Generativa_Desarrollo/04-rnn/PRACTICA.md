### **Caso de Estudio: Predicción del Precio del Oro con Redes LSTM**  


---

## **1. Business Case Discovery**  
### **1.1 Contexto del Negocio**  
La empresa **Commodity Analytics** busca optimizar estrategias de inversión en metales preciosos. **El oro se ve afectado por factores macroeconómicos complejos (inflación, tasas de interés, crisis geopolíticas)** que dificultan el análisis manual. El objetivo es desarrollar un modelo predictivo que analice datos históricos **del precio del oro (XAU/USD) y variables macroeconómicas** para predecir su valor futuro.

 
### **1.2 Objetivo del Proyecto**  
Construir una LSTM que prediga el precio de cierre del oro para los próximos **5 días hábiles**, usando:
- **Datos históricos diarios** (2010-2025)
- **Indicadores macro:** Índice Dólar (DXY), tasas de interés FED, inflación , etc
- **Métrica de éxito:** RMSE < 10% 

---

## **2. Data Processing**  
### **2.1 Fuentes de Datos**  
- **Precio oro:** Yahoo Finance (`GC=F`) 
- **Datos macro:** Yahoo Finance 

```
# Todos los datos necesarios se pueden obtener con estos tickers públicos:
import yfinance as yf

# 1. Precio del oro (futuros)
df_oro = yf.download("GC=F", start="2010-01-01")

# 2. Índice Dólar (DXY)
df_dxy = yf.download("DX-Y.NYB", start="2010-01-01")  # Ticker correcto para DXY

# 3. Bonos 10 años (^TNX como proxy de tasas de interés)
df_bonos = yf.download("^TNX", start="2010-01-01")

# 4. Inflación (usar ETF TIP como proxy)
df_inflacion = yf.download("TIP", start="2010-01-01")  # ETF de bonos indexados a inflación
```


### **2.2 Ingeniería de Características**  
**Variables clave para el oro:**
1. **Ratio Oro/Dólar:** Precio oro ajustado por fuerza del USD (`Precio Oro / DXY`), Para evitar data leakage, se calcula la razón utilizando los valores del día anterior. De esta forma, para predecir el precio en el día t la característica se basa en datos hasta t–1 y no "mira hacia el futuro".
2. **Inflación implícita:** Variación porcentual mensual del ETF TIP (proxy para CPI)
3. **Tasa real aproximada** Rendimiento bonos 10 años (^TNX) - Inflación implícita  

```oro = df_oro['Close']
dxy = df_dxy['Close']
bonos = df_bonos['Close']
tip = df_inflacion['Close']

df = pd.concat([oro, dxy, bonos, tip], axis=1)
df.columns = ["Oro", "DXY", "Bonos_10y", "TIP"]

# Calcular la razón usando un lag de 1 día para evitar target leakage
df['Ratio_Oro_Dolar'] = df['Oro'].shift(1) / df['DXY'].shift(1)
```

**Variables técnicas (complementarias):**  
- SMA de 200 días (identificar tendencias largas)  
- Bandas de Bollinger (volatilidad histórica)  

### **2.3 Ventana Temporal**  
Estructurar los datos en secuencias de entrada-salida para entrenar la LSTM:  
- **Look-back (ventana histórica):** 90 días de datos (precio oro, DXY, inflación implícita, ratio oro/dólar, volatilidad) como entrada.  
- **Forecast horizon (horizonte de predicción):** 5 días futuros de precios de cierre del oro como salida.  
- **Normalización robusta:** Usar `RobustScaler` para manejar outliers en crisis económicas.  
- **Reformateo:** Transformar los datos en tensores 3D (muestras, pasos temporales, características) usando `TimeseriesGenerator` de Keras.  

Ejemplo:

```# Crear secuencias temporales para LSTM
look_back = 90  # 3 meses bursátiles
horizon = 5     # Predecir 5 días futuros

data_trimmed = data_scaled[:len(data_scaled)-horizon]

generator = TimeseriesGenerator(
    data_scaled,
    targets=data_trimmed[:, 0],  # Predecir solo el precio del oro (columna 0)
    length=look_back,
    batch_size=32,
    sampling_rate=1,
    stride=1,
    shuffle=True
)

#Ejemplo de secuencia resultante
X_sample, y_sample = generator[0]
print(f"Input shape: {X_sample.shape}")  # (batch, 90 días, 5 features)
print(f"Target shape: {y_sample.shape}") # (batch, 5 días a predecir)
```

### **2.4 División de Datos**  
Dividir cronológicamente para preservar la integridad temporal:  
- **Entrenamiento (2010-2024):** Datos con crisis históricas relevantes.  
- **Test (2025):** Datos recientes con alta inflación y tensión geopolítica.  

**Código ejemplo:**  
```python  
train = data.loc['2010':'2024']  
test = data.loc['2025':]
```  
---

## **3. Model Planning**  
### **3.1 Definición del Problema**  
El proyecto se enmarca como un problema de **regresión multivariante secuencial**, donde múltiples características (precio del oro, índice DXY, inflación, tasas de interés o volumen) se usan para predecir una secuencia futura. La LSTM es ideal por su capacidad para recordar patrones a largo plazo y gestionar dependencias temporales complejas, como ciclos macroeconómicos, crisis geopolíticas, y correlación histórica oro-dólar.

### **3.2 Ejemplo de Arquitectura de la Red**  
Diseñar una LSTM jerárquica **específica para series de commodities**:  
1. **Capa LSTM (192 unidades):** Captura relaciones complejas en secuencias largas (90 días), incluyendo **patrones de demanda física (ej: compras centrales bancarias)**.  
2. **Dropout (35%):** Aleatoriza la desactivación de neuronas para contrarrestar sobreajuste en datos con **eventos black-swan** (ej: crisis 2008, COVID-19).  
3. **Capa LSTM (96 unidades):** Refina los patrones aprendidos, enfocándose en **dependencias macroeconómicas a mediano plazo** (ej: impacto de reuniones de la FED).  
4. **Capa Densa (5 neuronas):** Genera predicciones para los 5 días futuros, usando activación lineal para regresión.  

**Código adaptado (Keras):**  
```python
model = Sequential([
    LSTM(192, input_shape=(90, 6),  # 6 features: precio, DXY, tasas, volumen, ratio oro/dólar
    Dropout(0.35),
    LSTM(96, return_sequences=False),
    Dense(5)
])
```

### **3.3 Función de Pérdida y Optimizador**  
- **Función de pérdida:** Error cuadrático medio (MSE) **con ponderación exponencial** (da 2x más peso a errores en períodos de alta volatilidad).  
- **Optimizador:** Adam con **tasa de aprendizaje variable** (`lr=0.001` inicial, reduciendo a 0.0001 después de 50 épocas).  
- **Métricas adicionales:**  
  - **MAE:** Error absoluto medio  
  - **Directional Accuracy:** Precisión direccional personalizada para oro (umbral de ±0.8% para considerar movimiento significativo)  


### **3.4 Estrategias Contra el Sobreajuste**  **(OPCIONAL si lo ves necesario)**
1. **Early Stopping:** Detener entrenamiento si pérdida en validación no mejora en **15 épocas** 
2. **Regularización L2 (λ=0.001):** Aplicada solo a capas LSTM para **evitar sobre-énfasis en features macroeconómicas**.  
3. **Aumentación de datos: (OPCIONAL)**  
   - **Ruido gaussiano** (σ=0.2) en secuencias de entrenamiento  
   - **Time Warping:** Deformaciones temporales controladas (±5 días) para simular ciclos económicos acelerados/retrasados  

---

## **4. Model Building and Selection**  
### **4.1 Implementación en Keras**  

Construir la arquitectura usando la API secuencial de Keras, asegurando que las dimensiones de entrada coincidan con las secuencias (ej: `input_shape=(90, 7)` para **90 días históricos y 7 características**: precio oro, DXY, tasas FED, volumen, ratio oro/dólar, VIX). Configurar el entrenamiento por EJEMPLO con `batch_size=48` y `epochs=150`, monitoreando la pérdida en validación para ajustar hiperparámetros dinámicamente.  

**Código de ejemplo:**  
```python
from keras.models import Sequential
from keras.layers import LSTM, Dropout, Dense

model = Sequential([
    LSTM(192, input_shape=(90, 7), return_sequences=True),
    Dropout(0.35),
    LSTM(96),
    Dense(5)  # Predice 5 días futuros
])
model.compile(optimizer='adam', loss='mse', metrics=['mae'])
```

### **4.2 Experimentación con Hiperparámetros**  **OPCIONAL: Por temas de tiempo podemos reducir la experimientacion**
Probar configuraciones alternativas para optimizar el modelo:  
- **Número de capas LSTM:** Comparar 2 vs 3 capas, evaluando si mayor profundidad mejora la captura de **patrones macroeconómicos complejos**.  
- **Unidades por capa:** Probar 96 vs 384 unidades, analizando impacto en la detección de **eventos geopolíticos relevantes para el oro**.  
- **Tamaño de ventana histórica:** Evaluar si 60, 90 o 120 días proporcionan mejor contexto para predecir **ciclos largos típicos del oro**.  


### **4.4 Interpretabilidad del Modelo**  **(OPCIONAL)**  
- **SHAP Values para oro:**  Calcular la contribución de cada característica

Ejemplo:

  ```python
  import shap
  explainer = shap.DeepExplainer(model, X_train[:100])
  shap_values = explainer.shap_values(X_test[:10])
  shap.summary_plot(shap_values, X_test, feature_names=['Precio', 'DXY', 'Tasas', 'Volumen', 'Ratio Oro/USD', 'VIX'])
  ```  
- **Visualización de Pesos LSTM:** Usar `keract` para analizar qué **eventos históricos** (ej: máximos del DXY en 2022) activan neuronas específicas: 

Ejemplo:

  ```python
  from keract import get_activations
  activations = get_activations(model, X_sample, layer_names='lstm_1')
  ```  


---

## **5. Presentación de Resultados**  
### **5.1 Evaluación Cuantitativa**  
El alumno deberá generar un informe comparando las métricas clave (**RMSE, MAE, precisión direccional**) entre los conjuntos de entrenamiento, validación y test.  

**(OPCIONAL)** Además, se incluirán gráficos de líneas superponiendo las predicciones del modelo con los valores reales en **períodos clave para el oro** (ej: crisis del COVID-19 en 2020, rally alcista de 2022 por inflación global), resaltando cómo el modelo:  
- Acierta en tendencias impulsadas por **factores macroeconómicos estables** (ej: subidas de tasas progresivas)  
- Falla durante **eventos geopolíticos abruptos** (ej: invasión de Ucrania en 2022)  

 ### **5.2 Análisis Cualitativo**  
- **Casos de éxito:** Identificar períodos donde el modelo predijo correctamente tendencias impulsadas por factores macroeconómicos clave para el oro. Por ejemplo:  
  - **2019-2020:** Subida durante tensiones comerciales USA-China y COVID-19 ([referencia histórica](https://www.gold.org/goldhub/data/gold-prices)).  
  - **2022:** Rally por inflación global y alzas de tasas de la FED ([datos LBMA](https://www.lbma.org.uk/prices-and-data/precious-metal-prices)).  

- **Casos de error:** Analizar momentos donde el modelo falló, investigando posibles causas:
  - **Shocks externos no modelados:** Crisis geopolíticas repentinas.  
  - **Cambios regulatorios:** Restricciones a la exportación/importación de oro.
 

---

## **6. Deployment**  
### **6.1 Serialización del Modelo**  
Guardar el modelo entrenado en formato `.h5` (Keras) o `.joblib` (Scikit-learn), incluyendo metadata específica para oro:  
- **Features usadas:** Lista de variables macro (DXY, tasas de interés)  
- **Rango temporal entrenamiento:** Ej: "2011-01-01 a 2023-12-31"  
- **Normalizadores:** Guardar escaladores para **precio oro** y **DXY** por separado  

### **6.2 Creación de una API REST**  **(OPCIONAL por temas de tiempo)**
Desarrollar un servicio usando Flask/FastAPI que:  
1. Reciba una solicitud con:  
   ```json  
   {  
       "gold_prices": [últimos 90 días],  
       "dxy_values": [últimos 90 días],  
       "inflacion": valor_mensual_actual  
   }  
   ```  
2. Preprocese los datos aplicando:  
   - **Ratio oro/dólar** en tiempo real  
   - Alineación temporal de datos macro mensuales con serie diaria  
3. Genere predicción para **5 días + bandas de confianza** basadas en volatilidad histórica del oro  
4. Ejemplo de respuesta:  
   ```json  
   {  
       "predictions": [2075.30, 2081.15, 2088.40, 2092.10, 2095.80],  
       "confidence_interval": [±0.8%, ±1.1%, ±1.3%, ±1.6%, ±1.9%],  
       "hedge_recommendation": "SHORT DXY futures"  
   }  
   ```  
 


"""
Neural Network Playground
RNA · regresión de precios | CNN · reconocimiento de dígitos
"""

import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

import numpy as np
import joblib
import matplotlib.pyplot as plt
from pathlib import Path
from PIL import Image
import streamlit as st

BASE      = Path(__file__).parent
RNA_DIR   = BASE.parent / "01-rna-base"
CNN_DIR   = BASE.parent / "02-cnn" / "models"

st.set_page_config(
    page_title="Neural Network Playground",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ── Google Fonts ──────────────────────────────────────────────────────────────
st.markdown("""
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
""", unsafe_allow_html=True)

# ── CSS ───────────────────────────────────────────────────────────────────────
st.markdown("""
<style>
  /* ── Variables ──────────────────────────────── */
  :root {
    --bg:       #F4F3EE;
    --surface:  #FFFFFF;
    --border:   #DDD9D0;
    --text-1:   #1A1916;
    --text-2:   #6B6860;
    --text-3:   #A09D96;
    --blue:     #1D3FFF;
    --orange:   #D63B1F;
    --green:    #1E7A4A;
    --f-title:  'Syne', sans-serif;
    --f-body:   'DM Sans', sans-serif;
    --f-mono:   'JetBrains Mono', monospace;
  }

  /* ── Base y tipografía ──────────────────────── */
  html, body, [class*="css"], p, label, span, div {
    font-family: var(--f-body) !important;
  }
  .block-container { padding-top: 2.2rem !important; max-width: 1280px; }

  /* ── Fondo: graph paper + viñeta radial ─────── */
  [data-testid="stAppViewContainer"] {
    background-color: var(--bg);
    background-image:
      radial-gradient(ellipse 80% 60% at 50% 0%, rgba(244,243,238,0) 60%, rgba(200,196,186,0.18) 100%),
      linear-gradient(rgba(160,157,148,0.30) 1px, transparent 1px),
      linear-gradient(90deg, rgba(160,157,148,0.30) 1px, transparent 1px),
      linear-gradient(rgba(160,157,148,0.09) 1px, transparent 1px),
      linear-gradient(90deg, rgba(160,157,148,0.09) 1px, transparent 1px);
    background-size:
      100% 100%,
      80px 80px,
      80px 80px,
      20px 20px,
      20px 20px;
  }
  [data-testid="stHeader"] { background: transparent !important; }

  /* ── Header ─────────────────────────────────── */
  .app-title {
    font-family: var(--f-title) !important;
    font-size: 2.2rem; font-weight: 800; color: var(--text-1);
    letter-spacing: -0.04em; margin: 0; line-height: 1.3;
    padding-bottom: 6px; overflow: visible; display: block;
  }
  .app-title-wrap, .app-title-wrap > div, .app-title-wrap p {
    overflow: visible !important;
  }
  .app-sub {
    font-family: var(--f-body) !important;
    font-size: 0.72rem; font-weight: 500; color: var(--text-3);
    letter-spacing: 0.14em; text-transform: uppercase;
    margin: 6px 0 0; display: flex; align-items: center; gap: 8px;
  }
  .app-sub span { color: var(--border); }
  .header-rule {
    border: none; border-top: 1px solid var(--border);
    margin: 16px 0 24px;
  }

  /* ── Etiquetas de sección ───────────────────── */
  .slabel {
    font-family: var(--f-body) !important;
    font-size: 0.62rem; font-weight: 600; letter-spacing: 0.18em;
    text-transform: uppercase; color: var(--text-3); margin: 0 0 10px;
    display: flex; align-items: center; gap: 6px;
  }
  .slabel::after {
    content: ''; flex: 1; height: 1px; background: var(--border);
  }

  /* ── Tarjetas de modelo ─────────────────────── */
  .mcard {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 4px; padding: 14px 16px; margin-bottom: 8px;
    position: relative;
  }
  .mcard-a { border-left: 3px solid var(--blue); }
  .mcard-b { border-left: 3px solid var(--orange); }
  .mcard-tag {
    font-family: var(--f-mono) !important;
    font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; margin: 0 0 6px;
  }
  .tag-a { color: var(--blue); }
  .tag-b { color: var(--orange); }
  .mcard-name {
    font-family: var(--f-body) !important;
    font-size: 0.82rem; font-weight: 600; color: var(--text-1);
    margin: 0 0 8px;
  }
  .mcard-row {
    display: flex; justify-content: space-between;
    font-size: 0.68rem; color: var(--text-2); margin-bottom: 2px;
    font-family: var(--f-body) !important;
  }
  .mcard-val { font-family: var(--f-mono) !important; color: var(--text-1); }

  /* ── Canvas ─────────────────────────────────── */
  .canvas-frame {
    border: 1px solid var(--border); border-radius: 4px;
    background: #000; display: inline-block;
    box-shadow: 2px 3px 12px rgba(0,0,0,0.10);
  }

  /* ── Resultado: dígito ──────────────────────── */
  .result-wrap {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 4px; padding: 18px 14px 14px; margin-bottom: 8px;
  }
  .result-wrap-a { border-top: 3px solid var(--blue); }
  .result-wrap-b { border-top: 3px solid var(--orange); }

  .digit-readout {
    font-family: var(--f-mono) !important;
    font-size: 5.5rem; font-weight: 700; line-height: 1;
    text-align: center; letter-spacing: -0.04em;
    animation: digit-pop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .digit-readout-a { color: var(--blue); }
  .digit-readout-b { color: var(--orange); }

  @keyframes digit-pop {
    0%   { opacity: 0.3; transform: scale(0.82); }
    100% { opacity: 1;   transform: scale(1); }
  }

  .conf-bar-bg {
    height: 3px; background: var(--border);
    border-radius: 2px; margin: 10px 0 6px; overflow: hidden;
  }
  .conf-bar-fill-a { height: 100%; border-radius: 2px; background: var(--blue); }
  .conf-bar-fill-b { height: 100%; border-radius: 2px; background: var(--orange); }

  .conf-text {
    font-family: var(--f-mono) !important;
    font-size: 0.65rem; color: var(--text-3); letter-spacing: 0.06em;
    text-align: center;
  }

  /* ── Veredicto ──────────────────────────────── */
  .verdict {
    border-radius: 4px; padding: 11px 15px;
    font-size: 0.8rem; font-weight: 600; margin-top: 10px;
    font-family: var(--f-body) !important;
    display: flex; align-items: center; gap: 8px;
  }
  .verdict-match {
    background: #EBF5EF; border-left: 3px solid var(--green); color: #155230;
  }
  .verdict-diff {
    background: #FEF8EC; border-left: 3px solid #C07000; color: #7A4200;
  }

  /* ── Estado vacío ───────────────────────────── */
  .empty-pred {
    border: 1.5px dashed var(--border); border-radius: 4px;
    padding: 52px 20px; text-align: center;
    font-size: 0.78rem; color: var(--text-3);
    font-family: var(--f-body) !important;
  }

  /* ── RNA: precio ─────────────────────────────── */
  .price-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 4px; border-top: 3px solid var(--green);
    padding: 30px 20px; text-align: center; margin-bottom: 14px;
  }
  .price-label {
    font-family: var(--f-body) !important;
    font-size: 0.6rem; font-weight: 600; letter-spacing: 0.18em;
    text-transform: uppercase; color: var(--text-3); margin-bottom: 10px;
  }
  .price-num {
    font-family: var(--f-mono) !important;
    font-size: 3rem; font-weight: 700; color: var(--green);
    line-height: 1; letter-spacing: -0.03em;
  }
  .price-sub {
    font-family: var(--f-body) !important;
    font-size: 0.68rem; color: var(--text-3); margin-top: 8px;
  }

  /* ── Botón ───────────────────────────────────── */
  .stButton > button {
    background: var(--surface) !important; border: 1px solid var(--border) !important;
    color: var(--text-2) !important; border-radius: 4px !important;
    font-size: 0.78rem !important; font-family: var(--f-body) !important;
    font-weight: 500 !important; letter-spacing: 0.02em !important;
    transition: border-color 0.15s, color 0.15s !important;
  }
  .stButton > button:hover {
    border-color: var(--text-2) !important; color: var(--text-1) !important;
    background: var(--surface) !important;
  }

  /* ── Tabs ────────────────────────────────────── */
  [data-testid="stTab"] button p {
    font-family: var(--f-body) !important;
    font-weight: 600 !important; font-size: 0.85rem !important;
    letter-spacing: 0.01em !important;
  }

  /* ── Divider ─────────────────────────────────── */
  hr { border-color: var(--border) !important; }

  /* ── Experimentos tips ───────────────────────── */
  .tip-list {
    list-style: none; padding: 0; margin: 0;
  }
  .tip-list li {
    font-size: 0.72rem; color: var(--text-2); padding: 5px 0;
    border-bottom: 1px solid var(--border);
    display: flex; gap: 8px; align-items: baseline;
    font-family: var(--f-body) !important;
  }
  .tip-list li:last-child { border-bottom: none; }
  .tip-arrow {
    font-family: var(--f-mono) !important;
    color: var(--text-3); font-size: 0.65rem; flex-shrink: 0;
  }

  /* ── Vista 28×28 ─────────────────────────────── */
  .thumb-label {
    font-family: var(--f-mono) !important;
    font-size: 0.6rem; color: var(--text-3); margin-bottom: 5px;
    letter-spacing: 0.06em;
  }
</style>
""", unsafe_allow_html=True)


# ─── Carga de modelos ─────────────────────────────────────────────────────────
@st.cache_resource(show_spinner="Cargando modelos…")
def load_cnn_a():
    import tensorflow as tf
    p = CNN_DIR / "cnn_a_mnist.keras"
    return tf.keras.models.load_model(str(p)) if p.exists() else None

@st.cache_resource(show_spinner="Cargando modelos…")
def load_cnn_b():
    import tensorflow as tf
    p = CNN_DIR / "cnn_b_emnist.keras"
    return tf.keras.models.load_model(str(p)) if p.exists() else None

@st.cache_resource(show_spinner="Cargando modelos…")
def load_rna():
    import tensorflow as tf
    mp = RNA_DIR / "house_rna_onehot_model.keras"
    sp = RNA_DIR / "house_scaler_onehot.joblib"
    fp = RNA_DIR / "house_feature_cols.joblib"
    if not all(p.exists() for p in [mp, sp, fp]):
        return None, None, None
    return (
        tf.keras.models.load_model(str(mp)),
        joblib.load(str(sp)),
        joblib.load(str(fp)),
    )


# ─── Helpers ─────────────────────────────────────────────────────────────────
def preprocess_canvas(image_data: np.ndarray) -> np.ndarray:
    rgb = image_data[:, :, :3].astype("uint8")
    img = Image.fromarray(rgb).convert("L").resize((28, 28), Image.LANCZOS)
    return (np.array(img, dtype="float32") / 255.0).reshape(1, 28, 28, 1)


def prob_barchart(probs: np.ndarray, pred: int, accent: str) -> plt.Figure:
    BG = "#F4F3EE"
    fig, ax = plt.subplots(figsize=(2.5, 2.7))
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)

    bar_colors = [accent if i == pred else "#DDD9D0" for i in range(10)]
    ax.barh(range(10), probs, color=bar_colors, edgecolor="none", height=0.6)
    ax.set_yticks(range(10))
    ax.set_yticklabels(
        [str(i) for i in range(10)],
        fontsize=8.5, color="#A09D96",
        fontfamily="monospace",
    )
    ax.set_xlim(0, 1.22)
    ax.invert_yaxis()

    for spine in ax.spines.values():
        spine.set_visible(False)
    ax.tick_params(length=0)
    ax.xaxis.set_visible(False)

    if probs[pred] > 0.01:
        ax.text(
            probs[pred] + 0.04, pred,
            f"{probs[pred]*100:.0f}%",
            va="center", fontsize=7.5, fontweight="bold",
            color=accent, fontfamily="monospace",
        )
    fig.tight_layout(pad=0.3)
    return fig


# ── Overlays: grano de papel + marcas de registro + label técnico ────────────
st.markdown("""
<svg style="position:fixed;top:0;left:0;width:100vw;height:100vh;
            pointer-events:none;z-index:9000;opacity:0.038;"
     xmlns="http://www.w3.org/2000/svg">
  <filter id="grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.78"
                  numOctaves="4" stitchTiles="stitch"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#grain)"/>
</svg>

<!-- Marcas de registro: esquinas en L -->
<div style="position:fixed;top:18px;left:18px;width:16px;height:16px;
            border-top:1.5px solid #A09D96;border-left:1.5px solid #A09D96;
            pointer-events:none;z-index:9001;opacity:0.55;"></div>
<div style="position:fixed;top:18px;right:18px;width:16px;height:16px;
            border-top:1.5px solid #A09D96;border-right:1.5px solid #A09D96;
            pointer-events:none;z-index:9001;opacity:0.55;"></div>
<div style="position:fixed;bottom:18px;left:18px;width:16px;height:16px;
            border-bottom:1.5px solid #A09D96;border-left:1.5px solid #A09D96;
            pointer-events:none;z-index:9001;opacity:0.55;"></div>
<div style="position:fixed;bottom:18px;right:18px;width:16px;height:16px;
            border-bottom:1.5px solid #A09D96;border-right:1.5px solid #A09D96;
            pointer-events:none;z-index:9001;opacity:0.55;"></div>

<!-- Label técnico inferior derecha -->
<div style="position:fixed;bottom:16px;right:36px;
            font-family:'JetBrains Mono',monospace;font-size:0.52rem;
            color:#C8C5BC;letter-spacing:0.12em;text-transform:uppercase;
            pointer-events:none;z-index:9001;">
  NN-PLAYGROUND · 2025
</div>
""", unsafe_allow_html=True)

# ─── Header ──────────────────────────────────────────────────────────────────
st.markdown(
    '<div class="app-title-wrap"><div class="app-title">Neural Network Playground</div></div>',
    unsafe_allow_html=True,
)
st.markdown(
    '<p class="app-sub">'
    'Master IA y Big Data <span>·</span> Práctica RNA + CNN'
    '</p>',
    unsafe_allow_html=True,
)
st.markdown('<hr class="header-rule">', unsafe_allow_html=True)

tab_cnn, tab_rna = st.tabs(["  ✍️  Reconocimiento de Dígitos  ", "  🏠  Predicción de Precios  "])


# ══════════════════════════════════════════════════════════════════════════════
# TAB CNN
# ══════════════════════════════════════════════════════════════════════════════
with tab_cnn:
    c_info, c_canvas, c_pred = st.columns([1.05, 1.45, 2.5], gap="large")

    # ── Info ──────────────────────────────────────────────────────────────────
    with c_info:
        st.markdown('<p class="slabel">Modelos</p>', unsafe_allow_html=True)

        st.markdown("""
<div class="mcard mcard-a">
  <p class="mcard-tag tag-a">CNN-A</p>
  <p class="mcard-name">El Clásico</p>
  <div class="mcard-row"><span>Dataset</span><span class="mcard-val">MNIST</span></div>
  <div class="mcard-row"><span>Imágenes</span><span class="mcard-val">60 000</span></div>
  <div class="mcard-row"><span>Arquitectura</span><span class="mcard-val">LeNet</span></div>
  <div class="mcard-row"><span>Parámetros</span><span class="mcard-val">~93 K</span></div>
</div>""", unsafe_allow_html=True)

        st.markdown("""
<div class="mcard mcard-b">
  <p class="mcard-tag tag-b">CNN-B</p>
  <p class="mcard-name">El Robusto</p>
  <div class="mcard-row"><span>Dataset</span><span class="mcard-val">EMNIST</span></div>
  <div class="mcard-row"><span>Imágenes</span><span class="mcard-val">280 000</span></div>
  <div class="mcard-row"><span>Arquitectura</span><span class="mcard-val">3-block</span></div>
  <div class="mcard-row"><span>Parámetros</span><span class="mcard-val">~230 K</span></div>
</div>""", unsafe_allow_html=True)

        st.markdown('<div style="height:8px"></div>', unsafe_allow_html=True)
        st.markdown('<p class="slabel">Experimentos</p>', unsafe_allow_html=True)
        st.markdown("""
<ul class="tip-list">
  <li><span class="tip-arrow">→</span> Inclina 30°: ¿cuál aguanta?</li>
  <li><span class="tip-arrow">→</span> 7 europeo con rayita</li>
  <li><span class="tip-arrow">→</span> 9 muy cerrado (¿0 o 8?)</li>
  <li><span class="tip-arrow">→</span> Dibuja muy pequeño</li>
</ul>""", unsafe_allow_html=True)

    # ── Canvas ────────────────────────────────────────────────────────────────
    with c_canvas:
        st.markdown('<p class="slabel">Cuaderno de dibujo</p>', unsafe_allow_html=True)

        if "canvas_key" not in st.session_state:
            st.session_state.canvas_key = 0

        try:
            from streamlit_drawable_canvas import st_canvas
            canvas_result = st_canvas(
                stroke_width=18,
                stroke_color="#FFFFFF",
                background_color="#000000",
                height=260,
                width=260,
                drawing_mode="freedraw",
                key=f"canvas_{st.session_state.canvas_key}",
                display_toolbar=False,
            )
        except ImportError:
            st.error("`pip install streamlit-drawable-canvas`")
            canvas_result = None

        st.markdown("<div style='height:8px'></div>", unsafe_allow_html=True)
        if st.button("Borrar canvas", use_container_width=True):
            st.session_state.canvas_key += 1
            st.rerun()

        if canvas_result is not None and canvas_result.image_data is not None:
            raw = canvas_result.image_data
            if raw[:, :, :3].max() > 10:
                pre   = preprocess_canvas(raw)
                thumb = Image.fromarray(
                    (pre.squeeze() * 255).astype("uint8")
                ).resize((72, 72), Image.NEAREST)
                st.markdown("<div style='height:14px'></div>", unsafe_allow_html=True)
                st.markdown('<p class="thumb-label">VISTA 28 × 28 px</p>', unsafe_allow_html=True)
                st.image(thumb, width=72)

    # ── Predicciones ──────────────────────────────────────────────────────────
    with c_pred:
        st.markdown('<p class="slabel">Predicciones</p>', unsafe_allow_html=True)

        cnn_a = load_cnn_a()
        cnn_b = load_cnn_b()

        for name, model in [("CNN-A", cnn_a), ("CNN-B", cnn_b)]:
            if model is None:
                st.warning(f"{name} no cargado — ejecuta el notebook correspondiente.")

        has_drawing = (
            canvas_result is not None
            and canvas_result.image_data is not None
            and canvas_result.image_data[:, :, :3].max() > 10
        )

        if not has_drawing:
            st.markdown(
                '<div class="empty-pred">← Dibuja un dígito para ver las predicciones</div>',
                unsafe_allow_html=True,
            )
        else:
            preprocessed = preprocess_canvas(canvas_result.image_data)
            col_a, col_b = st.columns(2, gap="medium")

            with col_a:
                if cnn_a is not None:
                    probs_a = cnn_a.predict(preprocessed, verbose=0)[0]
                    pred_a  = int(np.argmax(probs_a))
                    conf_a  = float(probs_a[pred_a])
                    bar_w   = int(conf_a * 100)

                    st.markdown(f"""
<div class="result-wrap result-wrap-a">
  <div class="digit-readout digit-readout-a">{pred_a}</div>
  <div class="conf-bar-bg">
    <div class="conf-bar-fill-a" style="width:{bar_w}%"></div>
  </div>
  <div class="conf-text">CNN-A &nbsp;·&nbsp; {conf_a*100:.1f}% confianza</div>
</div>""", unsafe_allow_html=True)
                    fig_a = prob_barchart(probs_a, pred_a, "#1D3FFF")
                    st.pyplot(fig_a, use_container_width=True)
                    plt.close(fig_a)

            with col_b:
                if cnn_b is not None:
                    preprocessed_b = np.flip(preprocessed, axis=2)
                    probs_b = cnn_b.predict(preprocessed_b, verbose=0)[0]
                    pred_b  = int(np.argmax(probs_b))
                    conf_b  = float(probs_b[pred_b])
                    bar_w_b = int(conf_b * 100)

                    st.markdown(f"""
<div class="result-wrap result-wrap-b">
  <div class="digit-readout digit-readout-b">{pred_b}</div>
  <div class="conf-bar-bg">
    <div class="conf-bar-fill-b" style="width:{bar_w_b}%"></div>
  </div>
  <div class="conf-text">CNN-B &nbsp;·&nbsp; {conf_b*100:.1f}% confianza</div>
</div>""", unsafe_allow_html=True)
                    fig_b = prob_barchart(probs_b, pred_b, "#D63B1F")
                    st.pyplot(fig_b, use_container_width=True)
                    plt.close(fig_b)

            if cnn_a is not None and cnn_b is not None:
                if pred_a == pred_b:
                    st.markdown(
                        f'<div class="verdict verdict-match">'
                        f'<span>✓</span> Ambos modelos coinciden — el dígito es <strong>&nbsp;{pred_a}</strong>'
                        f'</div>',
                        unsafe_allow_html=True,
                    )
                else:
                    st.markdown(
                        f'<div class="verdict verdict-diff">'
                        f'<span>≠</span> Discrepancia — CNN-A detecta <strong>{pred_a}</strong>'
                        f' &nbsp;·&nbsp; CNN-B detecta <strong>{pred_b}</strong>'
                        f'</div>',
                        unsafe_allow_html=True,
                    )


# ══════════════════════════════════════════════════════════════════════════════
# TAB RNA
# ══════════════════════════════════════════════════════════════════════════════
with tab_rna:
    rna_model, rna_scaler, rna_feature_cols = load_rna()

    if rna_model is None:
        st.error("Modelos RNA no encontrados. Ejecuta el notebook `01-rna-base/`.")
        st.stop()

    loc_cols   = [c for c in rna_feature_cols if c.startswith("loc_")]
    city_names = [c.replace("loc_", "").replace("-", " ").title() for c in loc_cols]

    st.markdown(
        '<p class="slabel">Red neuronal · predicción de precio de inmueble en India</p>',
        unsafe_allow_html=True,
    )

    col_in, col_out = st.columns([1.45, 1.0], gap="large")

    with col_in:
        st.markdown('<p class="slabel">Características del inmueble</p>', unsafe_allow_html=True)
        r1, r2 = st.columns(2)
        with r1:
            area         = st.slider("Área (sqft)", 100, 5000, 1000, 50)
            bathrooms    = st.slider("Baños", 1, 10, 2)
            floor        = st.slider("Planta", 0, 75, 3)
        with r2:
            total_floors = st.slider("Total plantas", 1, 150, 10)
            furnishing   = st.selectbox(
                "Mobiliario", [0, 1, 2],
                format_func=lambda x: ["Sin muebles", "Semi-amueblado", "Amueblado"][x],
            )
            transaction  = st.selectbox(
                "Transacción", [0, 1],
                format_func=lambda x: ["Reventa", "Obra nueva"][x],
            )
        default = "Ahmedabad" if "Ahmedabad" in city_names else city_names[0]
        city    = st.selectbox("Ciudad", city_names, index=city_names.index(default))

    with col_out:
        idx = city_names.index(city)
        x   = np.zeros(len(rna_feature_cols), dtype="float64")
        x[0] = area;  x[1] = bathrooms;    x[2] = floor
        x[3] = total_floors; x[4] = furnishing; x[5] = transaction
        x[6 + idx] = 1.0

        x_sc     = x.copy()
        x_sc[:6] = rna_scaler.transform(x[:6].reshape(1, -1))[0]

        log_pred = rna_model.predict(x_sc.reshape(1, -1), verbose=0)[0][0]
        pred_inr = float(np.expm1(log_pred))
        pred_usd = pred_inr / 84.0
        pred_eur = pred_inr / 90.0

        st.markdown(f"""
<div class="price-card">
  <div class="price-label">Precio estimado</div>
  <div class="price-num">${pred_usd:,.0f}</div>
  <div class="price-sub">USD &nbsp;·&nbsp; {city}</div>
</div>""", unsafe_allow_html=True)

        m1, m2 = st.columns(2)
        m1.metric("EUR", f"€{pred_eur:,.0f}")
        m2.metric("INR", f"₹{pred_inr:,.0f}")

        st.markdown("<div style='height:4px'></div>", unsafe_allow_html=True)

        MEDIA_USD = 147_017
        diff      = (pred_usd - MEDIA_USD) / MEDIA_USD * 100
        icon      = "↑" if diff > 0 else "↓"
        direction = "por encima" if diff > 0 else "por debajo"
        st.caption(
            f"{icon} **{abs(diff):.1f}% {direction}** de la media del dataset (${MEDIA_USD:,})"
        )
        st.caption(
            f"📍 {area} sqft · {bathrooms}B · "
            f"{'Sin muebles' if furnishing==0 else 'Semi' if furnishing==1 else 'Amueblado'} · "
            f"{'Reventa' if transaction==0 else 'Obra nueva'}"
        )

    st.divider()
    with st.expander("ℹ️  Arquitectura del modelo"):
        st.markdown("""
**Dataset:** 98 000 propiedades en India (Kaggle) &nbsp;·&nbsp; **R² = 0.93** &nbsp;·&nbsp; MAE ≈ $15 700

**Features:** 6 numéricas + 81 one-hot (ciudades) = **87 total**

**Arquitectura:** `Input(87) → Dense(512, ReLU) → Dense(256, ReLU) → Dense(128, ReLU) → Dense(1, linear)`

**Target:** `log₁p(precio INR)` — invertido con `expm1` para obtener el precio real.
""")

st.markdown("<div style='height:20px'></div>", unsafe_allow_html=True)
st.caption("Master IA y Big Data &nbsp;·&nbsp; RNA + CNN &nbsp;·&nbsp; 2025")

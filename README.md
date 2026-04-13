# 📚 LinkedIn Article Creation Guide
> Guía personal para crear futuras apps de LinkedIn. Escrita para Antigravity con mala memoria.

---

## 🧠 La Fórmula

Cada "programa" es una **app web de una sola página** publicada como artículo/post en LinkedIn.  
El objetivo: parecer impresionante en el screenshot, ser útil de verdad, y que sea fácil de entender.

---

## ✅ Checklist de idea válida

Antes de empezar, la idea debe cumplir **todo esto**:

- [ ] **Útil para alguien que no es developer** (marketer, estudiante, freelancer…)
- [ ] **Sin APIs de pago** — solo CDNs gratuitas o APIs nativas del navegador
- [ ] **Una sola acción principal** (generar, convertir, calcular, visualizar…)
- [ ] **Screenshot atractivo** — tiene que verse brutal en LinkedIn sin explicación
- [ ] **Hook claro en una línea** — "sin servidor", "sin registro", "en segundos"

---

## 🗺️ Regla de Navegación Global
- **Botón Retroceso (`back-btn`)**: Para mantener el ecosistema de aplicaciones unido de forma permanente, cualquier programa nuevo publicado en su carpeta `Programa_N` debe inyectar forzosamente un ancla html apuntando a `../index.html` en la esquina superior izquierda, vinculándolo eternamente al GStore Hub general.


---

## 📁 Estructura de archivos

```
Linkdn/
├── README.md              ← este archivo
├── Programa_1/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
└── Programa_N/
    ├── index.html         ← Entry point
    ├── css/
    │   └── style.css      ← Vanilla CSS
    └── js/
        └── main.js        ← Vanilla JS
```

Cada programa debe tener **esta estructura separada** para mayor orden y escalabilidad. Sin npm, sin builds, pero organizado en directorios `css` y `js` de forma profesional.

---

## 🎨 Stack & Reglas de UI

### Tecnología permitida
| Qué | Cómo |
|-----|------|
| Lógica | Vanilla JS (ES6+) |
| Estilos | Vanilla CSS dentro del `<style>` |
| Librerías | CDN únicamente (jsDelivr, unpkg) |
| Fuentes | Google Fonts — usar siempre `Inter` |
| APIs | Solo gratuitas / nativas del navegador |

### Diseño obligatorio (siempre)
- **Dark mode** — fondo `#0a0a14` o similar
- **Glassmorphism** — `backdrop-filter: blur()` + bordes con `rgba`
- **Gradiente de acento** — violeta/índigo (o elige otro pero coherente)
- **Animaciones de entrada** — `fadeUp` / `fadeDown` en header y card
- **Gradiente en el `<h1>`** — `background-clip: text` con `-webkit-text-fill-color: transparent`
- **Google Fonts** — `<link>` en el `<head>`
- **Footer** con tu nombre y link a LinkedIn

### Variables CSS base (copiar y adaptar)
```css
:root {
  --bg: #0a0a14;
  --surface: rgba(255,255,255,0.05);
  --border: rgba(255,255,255,0.10);
  --accent: #6c63ff;
  --accent2: #a78bfa;
  --text: #f1f0ff;
  --muted: #8b8aa8;
  --radius: 18px;
}
```

---

## 🔍 SEO mínimo (siempre incluir)

```html
<title>Nombre del Tool — Descripción corta</title>
<meta name="description" content="Qué hace, en qué se diferencia, gratis/sin registro." />
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
```

---

## 📝 Fórmula del post de LinkedIn

### Estructura probada:
```
[Frase de gancho — sin emoji al inicio]

[Qué problema resuelve — 1-2 líneas]
[Cómo lo soluciona tu tool — 1 línea]
[Qué tecnología usa / por qué es gratis — 1 línea]

Un like o comentario me ayuda mucho con el alcance 🙏

[Título visual del proyecto — suele ser el h1 del HTML]
```

### Ejemplos de hooks que funcionan:
- *"I built a QR code generator that runs 100% in your browser — no server, no tracking, no bs."*
- *"What if language was never a barrier on a video call?"*
- *"WhatsApp bulk messaging with Python. No official API needed. No monthly fees."*

### Reglas del post:
- Escríbelo **en inglés** para mayor alcance
- El gancho va **sin emoji** en la primera línea (LinkedIn penaliza el reach)
- Pide el like **de forma directa** pero honesta (`me ayuda con el alcance`)
- Incluye el **screenshot de la app** — que se vea el glassmorphism

---

## 💡 Ideas para próximas apps (sin APIs de pago)

| Idea | Hook | API/Lib |
|------|------|---------|
| Password Generator | "Generate unbreakable passwords without trusting any website" | Nativa (`crypto.getRandomValues`) |
| Color Palette from Image | "Extract a full color palette from any image in 2 seconds" | Canvas API |
| Markdown Previewer | "Write and preview Markdown without installing anything" | `marked.js` CDN |
| Pomodoro Timer | "The Pomodoro timer that actually looks good on your second monitor" | Nativa |
| Word Counter / Readability | "Know if your blog post is readable before publishing it" | Nativa |
| Base64 Encoder/Decoder | "Encode and decode Base64 without googling it every time" | `atob` / `btoa` |
| JSON Formatter | "Paste ugly JSON, get beautiful JSON" | Nativa |
| CSS Gradient Generator | "Generate CSS gradients visually and copy the code" | Nativa |
| Regex Tester | "Test your regex live with syntax highlighting" | Nativa |
| Text Diff Tool | "Compare two texts and see exactly what changed" | Nativa o `diff.js` CDN |

---

## 🚀 Proceso completo de publicación

1. Escribe y prueba `index.html` en local (doble clic o arrastra al navegador)
2. Sube el código a GitHub (repositorio público — da credibilidad)
3. Haz un screenshot de la app en acción (usa Windows + Shift + S)
4. Escribe el post siguiendo la fórmula de arriba
5. Adjunta el screenshot al post de LinkedIn
6. **Publica a primera hora de la mañana** o entre 12-14h (mejor reach)
7. Los primeros 30 min: responde cualquier comentario rápido para activar el algoritmo

---

## 📊 Histórico de programas

| # | Nombre | Concepto | Fecha |
|---|--------|----------|-------|
| 1 | Color Palette Extractor | Extrae paletas de color con el API nativa de Canvas | Abr 2026 |
| 2 | CSS Gradient Generator | Genera gradientes interactivos en tiempo real y extrae el CSS nativo | Abr 2026 |
| 3 | Markdown Live Previewer | Editor en tiempo real divido impulsado por marked.js | Abr 2026 |
| 4 | QR Code Generator | Genera QR codes 100% en el navegador | Abr 2026 |
| 5 | Password Generator | Genera contraseñas irrompibles offline | Abr 2026 |
| 6 | Pomodoro Timer | Temporizador atractivo sin requerir instalación | Abr 2026 |
| 7 | Private JSON Formatter | Formateador offline de JSON estructurado y de alto rendimiento | Abr 2026 |
| 8 | Offline PDF Editor | Edición de metadatos y sellado de marcas de agua 100% privado | Abr 2026 |
| 9 | AI Vision Extractor | IA Neuronal offline para extraer texto de capturas de pantalla (OCR) | Abr 2026 |
| 10 | YouTube Media Downloader | Descarga MP3 y MP4 de YouTube usando APIs públicas | Abr 2026 |

/**
 * QR Code Generator – script.js
 * Depends on: qrcode.js (loaded via CDN in index.html)
 */

// ── DOM References ──────────────────────────────────────────────
const qrTextEl     = document.getElementById('qr-text');
const colorDarkEl  = document.getElementById('color-dark');
const colorLightEl = document.getElementById('color-light');
const sizeSlider   = document.getElementById('qr-size');
const sizeDisplay  = document.getElementById('size-display');
const qrLabelInput = document.getElementById('qr-label');
const previewEl    = document.getElementById('preview');
const qrCanvas     = document.getElementById('qr-canvas');
const qrWrapper    = document.getElementById('qr-wrapper');
const labelDisplay = document.getElementById('qr-label-display');

let qrInstance = null;

// ── Slider label update ─────────────────────────────────────────
sizeSlider.addEventListener('input', () => {
  sizeDisplay.textContent = sizeSlider.value + 'px';
});

// ── Core: generate QR code ──────────────────────────────────────
function generateQR() {
  const text = qrTextEl.value.trim();

  if (!text) {
    shakeElement(qrTextEl);
    return;
  }

  const colorDark  = colorDarkEl.value;
  const colorLight = colorLightEl.value;
  const size       = parseInt(sizeSlider.value, 10);
  const label      = qrLabelInput.value.trim();

  // Clear previous instance
  qrCanvas.innerHTML = '';
  if (qrInstance) {
    qrInstance.clear();
    qrInstance = null;
  }

  // Render new QR code
  qrInstance = new QRCode(qrCanvas, {
    text,
    width:         size,
    height:        size,
    colorDark,
    colorLight,
    correctLevel:  QRCode.CorrectLevel.H,
  });

  labelDisplay.textContent = label;

  // Show preview + pulse animation
  previewEl.classList.add('visible');
  triggerPulse();

  // Scroll into view
  setTimeout(() => {
    previewEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
}

// ── Download as PNG ─────────────────────────────────────────────
function downloadPNG() {
  const canvas = qrCanvas.querySelector('canvas');
  if (!canvas) return;

  const label      = qrLabelInput.value.trim();
  const colorDark  = colorDarkEl.value;
  const colorLight = colorLightEl.value;

  if (!label) {
    triggerDownload(canvas.toDataURL('image/png'), 'qrcode.png');
    return;
  }

  // Composite canvas: QR + label text below
  const padding  = 14;
  const fontSize = 14;
  const lineH    = fontSize + 8;
  const w        = canvas.width;
  const h        = canvas.height;

  const offscreen    = document.createElement('canvas');
  offscreen.width    = w + padding * 2;
  offscreen.height   = h + padding * 2 + lineH;

  const ctx = offscreen.getContext('2d');
  ctx.fillStyle = colorLight;
  ctx.fillRect(0, 0, offscreen.width, offscreen.height);
  ctx.drawImage(canvas, padding, padding);

  ctx.fillStyle  = colorDark;
  ctx.font       = `600 ${fontSize}px Inter, sans-serif`;
  ctx.textAlign  = 'center';
  ctx.fillText(label, offscreen.width / 2, h + padding + lineH - 2);

  triggerDownload(offscreen.toDataURL('image/png'), 'qrcode.png');
}

// ── Copy text to clipboard ──────────────────────────────────────
function copyText() {
  const text = qrTextEl.value.trim();
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('btn-copy');
    const original = btn.textContent;
    btn.textContent = '✓ Copiado!';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
    }, 1500);
  });
}

// ── Helper: download a data URL ─────────────────────────────────
function triggerDownload(dataUrl, filename) {
  const link    = document.createElement('a');
  link.href     = dataUrl;
  link.download = filename;
  link.click();
}

// ── Helper: shake invalid field ─────────────────────────────────
function shakeElement(el) {
  el.style.borderColor = '#f87171';
  el.style.boxShadow   = '0 0 0 3px rgba(248, 113, 113, 0.3)';
  setTimeout(() => {
    el.style.borderColor = '';
    el.style.boxShadow   = '';
  }, 1200);
}

// ── Helper: QR wrapper pulse animation ──────────────────────────
function triggerPulse() {
  qrWrapper.classList.remove('pulse');
  void qrWrapper.offsetWidth; // force reflow
  qrWrapper.classList.add('pulse');
}

// ── Events ──────────────────────────────────────────────────────

// Enter (without Shift) in textarea → generate
qrTextEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    generateQR();
  }
});

// Auto-regenerate when options change (only if already generated)
[colorDarkEl, colorLightEl, sizeSlider].forEach((el) => {
  el.addEventListener('change', () => {
    if (previewEl.classList.contains('visible')) {
      generateQR();
    }
  });
});

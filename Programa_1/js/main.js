const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-input');
const loading = document.getElementById('loading');
const paletteResult = document.getElementById('palette-result');
const imagePreview = document.getElementById('image-preview');
const swatchGrid = document.getElementById('swatch-grid');
const resetBtn = document.getElementById('reset-btn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const toast = document.getElementById('toast');

// --- Events ---
dropzone.addEventListener('click', () => fileInput.click());

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropzone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
  dropzone.addEventListener(eventName, () => dropzone.classList.add('dragover'), false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropzone.addEventListener(eventName, () => dropzone.classList.remove('dragover'), false);
});

dropzone.addEventListener('drop', handleDrop, false);
fileInput.addEventListener('change', handleFiles, false);
resetBtn.addEventListener('click', resetApp);

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  handleFiles({ target: { files }});
}

function handleFiles(e) {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith('image/')) return;

  dropzone.classList.add('hidden');
  loading.classList.remove('hidden');

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      imagePreview.src = event.target.result;
      extractColors(img);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

// --- Heavy Logic ---
function extractColors(img) {
  // Use a constrained canvas to avoid memory/performance crashes on huge images
  const MAX_SIZE = 800;
  let width = img.width;
  let height = img.height;
  
  if (width > MAX_SIZE || height > MAX_SIZE) {
    const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
    width *= ratio;
    height *= ratio;
  }
  
  canvas.width = Math.floor(width);
  canvas.height = Math.floor(height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  // Improved Color Quantization & Diversity algorithm
  const colorMap = {};
  
  // Step every 40 data points (10 pixels) for speed
  for (let i = 0; i < imageData.length; i += 40) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const a = imageData[i + 3];

    // ignore transparent pixels
    if (a < 125) continue;
    
    // ignore pure whites and pure blacks
    if ((r > 240 && g > 240 && b > 240) || (r < 15 && g < 15 && b < 15)) continue;

    // Bucketize to nearest 25 to group similar colors solidly
    const roundTo = 25;
    const bucketR = Math.min(255, Math.max(0, Math.round(r / roundTo) * roundTo));
    const bucketG = Math.min(255, Math.max(0, Math.round(g / roundTo) * roundTo));
    const bucketB = Math.min(255, Math.max(0, Math.round(b / roundTo) * roundTo));
    
    const rgbStr = `${bucketR},${bucketG},${bucketB}`;

    // Calculate basic saturation to boost vibrant colors over dull backgrounds
    const maxC = Math.max(bucketR, bucketG, bucketB);
    const minC = Math.min(bucketR, bucketG, bucketB);
    const saturationBoost = (maxC - minC) * 0.05;
    
    if (colorMap[rgbStr]) {
      colorMap[rgbStr].score += 1 + saturationBoost;
    } else {
      colorMap[rgbStr] = {
        r: bucketR,
        g: bucketG,
        b: bucketB,
        score: 1 + saturationBoost
      };
    }
  }

  // Sort by highest score (frequency + vibrancy)
  const sortedColors = Object.values(colorMap).sort((a, b) => b.score - a.score);
  
  // Enforce visual diversity
  const topColors = [];
  const minDistance = 55; // Euclidean distance threshold

  for (const c of sortedColors) {
    if (topColors.length >= 5) break;
    
    let isDistinct = true;
    for (const selected of topColors) {
      const dr = c.r - selected.r;
      const dg = c.g - selected.g;
      const db = c.b - selected.b;
      const distance = Math.sqrt(dr*dr + dg*dg + db*db);
      
      if (distance < minDistance) {
        isDistinct = false;
        break;
      }
    }
    
    if (isDistinct) {
      topColors.push(c);
    }
  }

  // Map to HEX
  const topHexColors = topColors.map(c => rgbToHex(c.r, c.g, c.b));

  // Fallback pattern if picture is extremely monochrome
  while (topHexColors.length < 5) {
      topHexColors.push("#1a1a2e"); 
  }

  renderSwatches(topHexColors);
}

function renderSwatches(hexArray) {
  swatchGrid.innerHTML = '';
  
  hexArray.forEach((hex, index) => {
    const div = document.createElement('div');
    div.className = 'swatch';
    div.style.backgroundColor = hex;
    div.style.animationDelay = `${index * 0.1}s`; // Staggered entry

    // Make dark colors have bright text, bright colors have dark text
    const isLight = isColorLight(hex);
    
    div.innerHTML = `<span class="swatch-hex" style="color:${isLight ? '#000' : '#fff'}; background: ${isLight ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'}">${hex.toUpperCase()}</span>`;
    
    div.addEventListener('click', () => {
      copyToClipboard(hex.toUpperCase());
    });

    swatchGrid.appendChild(div);
  });

  // Transition UI
  loading.classList.add('hidden');
  paletteResult.classList.remove('hidden');
}

function resetApp() {
  fileInput.value = '';
  imagePreview.src = '';
  paletteResult.classList.add('hidden');
  dropzone.classList.remove('hidden');
}

// --- Utils ---
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast();
  }).catch(err => console.error('Clipboard error:', err));
}

let toastTimeout;
function showToast() {
  toast.classList.remove('hidden');
  // Small delay for class application
  setTimeout(() => toast.classList.add('show'), 10);
  
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 400); // wait for anim out
  }, 2000);
}

function componentToHex(c) {
  const hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// Simplified luma to check if color is bright
function isColorLight(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma > 160;
}

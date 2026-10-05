import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// ============================================================================
// ⚠️ PASO OBLIGATORIO: PEGA AQUÍ TU CONFIGURACIÓN DE FIREBASE
// 1. Ve a Firebase Console -> Crea proyecto nuevo -> Crea "App Web" (icono < />)
// 2. Crea una "Realtime Database" y pon las reglas (Rules) en "True" para leer/escribir.
// ============================================================================
const firebaseConfig = {
  apiKey: "AIzaSyCAoqXj4LjC3DgRuHWBy_zV-I7gTDrMn2c",
  authDomain: "app-hub-3631e.firebaseapp.com",
  databaseURL: "https://app-hub-3631e-default-rtdb.firebaseio.com",
  projectId: "app-hub-3631e",
  storageBucket: "app-hub-3631e.firebasestorage.app",
  messagingSenderId: "472221576420",
  appId: "1:472221576420:web:dc59a6eb5a373b404a90f1"
};

const STORE_KEY = 'portfolio_hub_votes_v1';
const IS_FIREBASE_READY = firebaseConfig.apiKey !== "ACA_TU_API_KEY";

const appCatalog = [
  { id: 'prog1', name: 'Color Palette Extractor', desc: 'Extract a full color palette from any image purely in your browser in seconds.', icon: '🎨', folder: 'palette-extractor/index.html' },
  { id: 'prog2', name: 'CSS Gradient Generator', desc: 'Generate CSS gradients visually from an immersive background and copy the clean code.', icon: '🌈', folder: 'gradient-generator/index.html' },
  { id: 'prog3', name: 'Markdown Live Previewer', desc: 'Write and preview GitHub-styled HTML Markdown instantly right in your browser.', icon: '📝', folder: 'markdown-previewer/index.html' },
  { id: 'prog4', name: 'QR Code Generator', desc: 'Generate customized QR codes completely locally with zero external network tracking.', icon: '📱', folder: 'qr-generator/index.html' },
  { id: 'prog5', name: 'Vault Password Gen', desc: 'Generate unbreakable passwords dynamically using native offline crypto logic.', icon: '🔐', folder: 'password-generator/index.html' },
  { id: 'prog6', name: 'Pomodoro Prod Hub', desc: 'A gorgeous focus timer equipped with native tasks and daily session tracking.', icon: '🍅', folder: 'pomodoro-timer/index.html' },
  { id: 'prog7', name: 'Private JSON Formatter', desc: 'Stop pasting your private JSON online. Format and validate data 100% securely offline.', icon: '🖧', folder: 'json-formatter/index.html' },
  { id: 'prog8', name: 'Offline PDF Editor', desc: 'Privacy-first editor. Edit document metadata and stamp permanent watermarks 100% locally.', icon: '📄', folder: 'pdf-editor/index.html' },
  { id: 'prog9', name: 'AI Vision Extractor', desc: 'Extract clean text natively from any image or screenshot using an offline neural network.', icon: '👁️', folder: 'image-text-extractor/index.html' }
];

let localVotes = {};
let db = null;
const gridEl = document.getElementById('app-grid');

function init() {
  if (IS_FIREBASE_READY) {
    try {
      const app = initializeApp(firebaseConfig);
      db = getDatabase(app);
      listenToFirebase(); // directo, sin auth
    } catch (e) {
      console.error("Firebase Init Error:", e);
      fallbackLocalInit();
    }
  } else {
    fallbackLocalInit();
  }
}

// ========================
// LÓGICA CLOUD (FIREBASE)
// ========================
function listenToFirebase() {
  const votesRef = ref(db, 'appVotes');
  // Se ejecuta automáticamente cada vez que alguien en el mundo vota
  onValue(votesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      localVotes = data;
    } else {
      // Si la DB está vacía, inicializamos desde cero
      appCatalog.forEach(app => localVotes[app.id] = 0);
    }
    renderCatalog(IS_FIREBASE_READY);
  });
}

function firebaseUpvote(id) {
  const appRef = ref(db, `appVotes/${id}`);
  // runTransaction evita peleas de votos concurrentes si 2 personas votan a la vez
  runTransaction(appRef, (currentVotes) => {
    return (currentVotes || 0) + 1;
  });
}

// ========================
// LÓGICA LOCAL (FALLBACK)
// ========================
function fallbackLocalInit() {
  console.warn("⚠️ Usando LocalStorage. Firebase no está configurado aún.");
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) localVotes = JSON.parse(raw);
    else {
      appCatalog.forEach(app => localVotes[app.id] = 0);
      saveLocalData();
    }
  } catch (e) {
    appCatalog.forEach(app => localVotes[app.id] = 0);
  }
  renderCatalog(false);
}

function saveLocalData() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(localVotes)); } catch (e) { }
}

function localUpvote(id) {
  if (localVotes[id] === undefined) localVotes[id] = 0;
  localVotes[id] += 1;
  saveLocalData();
  renderCatalog(false);
}

// ========================
// RENDER UI GLOBAL
// ========================
window.upvote = function (id) {
  if (IS_FIREBASE_READY) {
    firebaseUpvote(id);
  } else {
    localUpvote(id);
  }
};

function renderCatalog(connectedToCloud) {
  const sortedApps = [...appCatalog].sort((a, b) => {
    const voteA = localVotes[a.id] || 0;
    const voteB = localVotes[b.id] || 0;
    return voteB - voteA;
  });

  gridEl.innerHTML = '';

  sortedApps.forEach((app, index) => {
    const votes = localVotes[app.id] || 0;
    const isTop = index === 0 && votes > 0;

    const cardContent = `
      ${isTop ? '<div class="rank-badge" title="Most Popular App">👑</div>' : ''}
      <div class="app-icon">${app.icon}</div>
      <h3>${app.name}</h3>
      <p>${app.desc}</p>
      
      <div class="app-card-footer">
        <button class="vote-btn ${votes > 0 ? 'voted' : ''}" onclick="upvote('${app.id}')" title="${connectedToCloud ? 'Global Upvote' : 'Local Upvote'}">
          🚀 <span class="vote-count">${votes}</span>
        </button>
        <a href="${app.folder}" class="open-btn">Open</a>
      </div>
    `;

    const card = document.createElement('div');
    card.className = 'app-card';
    card.innerHTML = cardContent;
    card.style.animation = `fadeUp 0.${4 + index}s ease-out forwards`;

    gridEl.appendChild(card);
  });

  if (connectedToCloud) {
    document.querySelector('.catalog-controls .muted-text').textContent = "🌍 Live Global Cloud Leaderboard";
  }
}

document.addEventListener('DOMContentLoaded', init);

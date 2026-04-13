const timeEl = document.getElementById('time');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const modeBtns = document.querySelectorAll('.mode-btn');
const modeText = document.getElementById('mode-text');
const sessionBadge = document.getElementById('session-tracker');
const circle = document.querySelector('.progress-ring__circle');

// Tasks form and array
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('new-task-input');
const taskListEl = document.getElementById('tasks-list');

// Audio setup
const alarmAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

// Modes definition in seconds
const MODES = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60
};

// Global context
let currentMode = 'work';
let timeLeft = MODES[currentMode];
let timerInterval = null;
let isRunning = false;
let sessionsCompletedCount = 0;
let uiTasks = [];

// Storage Keys
const DATE_KEY = `pomoDate_${new Date().toISOString().split('T')[0]}`;
const STATS_KEY = "pomoStats_v1";
const TASKS_KEY = "pomoTasks_v1";

function init() {
  loadStorage();
  updateDisplay();
  renderTasks();
  
  try {
    if (window.Notification && Notification.permission !== "denied" && Notification.permission !== "granted") {
      Notification.requestPermission().catch(e => console.log(e));
    }
  } catch (e) { console.log('Notification API restricted'); }
}

// ----------------------
// TIMER LOGIC
// ----------------------
const radius = circle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = 0;

function setProgress(percent) {
  const offset = circumference - percent * circumference;
  circle.style.strokeDashoffset = offset;
}

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const displayString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  timeEl.textContent = displayString;
  document.title = `${displayString} - PomoFocus`;

  // Calculate percentage
  const totalModeTime = MODES[currentMode];
  const percentage = timeLeft / totalModeTime;
  setProgress(percentage);
}

function switchMode(mode) {
  if (isRunning) pauseTimer();
  currentMode = mode;
  timeLeft = MODES[mode];
  updateDisplay();

  // Update UI Context
  modeBtns.forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-mode="${mode}"]`).classList.add('active');

  const oldBreakClasses = ['break-mode', 'longBreak-mode'];
  document.body.classList.remove(...oldBreakClasses);

  if (mode === 'shortBreak') {
    document.body.classList.add('break-mode');
    modeText.textContent = "Short Break";
  } else if (mode === 'longBreak') {
    document.body.classList.add('longBreak-mode');
    modeText.textContent = "Long Break";
  } else {
    modeText.textContent = "Work Session";
  }
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  
  startBtn.classList.add('hidden');
  pauseBtn.classList.remove('hidden');

  timerInterval = setInterval(() => {
    timeLeft--;
    updateDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      isRunning = false;
      
      // Attempt ring
      alarmAudio.play().catch(e => console.log('Audio autoplay blocked'));
      
      // Auto-increment analytics if it was a work session
      if (currentMode === 'work') {
        sessionsCompletedCount++;
        saveStorage();
        updateBadge();
        
        // Auto-switch to long or short break logic
        if (sessionsCompletedCount > 0 && sessionsCompletedCount % 4 === 0) {
          switchMode('longBreak');
        } else {
          switchMode('shortBreak');
        }
      } else {
        switchMode('work');
      }
      
      try {
        if (window.Notification && Notification.permission === "granted") {
          new Notification("PomoFocus", {
            body: "Time is up! Switching sessions.",
            icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍅</text></svg>"
          });
        }
      } catch(e) {}
    }
  }, 1000);
}

function pauseTimer() {
  isRunning = false;
  clearInterval(timerInterval);
  startBtn.classList.remove('hidden');
  pauseBtn.classList.add('hidden');
}

function resetTimer() {
  pauseTimer();
  timeLeft = MODES[currentMode];
  updateDisplay();
}

// Event Listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    switchMode(btn.dataset.mode);
  });
});

// ----------------------
// TASK & LOCAL STORAGE LOGIC
// ----------------------
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (text !== '') {
    const newTask = {
      id: Date.now().toString(),
      text: text,
      done: false
    };
    uiTasks.push(newTask);
    taskInput.value = '';
    saveStorage();
    renderTasks();
  }
});

function toggleTask(id) {
  const t = uiTasks.find(t => t.id === id);
  if (t) {
    t.done = !t.done;
    saveStorage();
    renderTasks();
  }
}

function deleteTask(id) {
  uiTasks = uiTasks.filter(t => t.id !== id);
  saveStorage();
  renderTasks();
}

function renderTasks() {
  taskListEl.innerHTML = '';
  if(uiTasks.length === 0) {
    taskListEl.innerHTML = `<li style="text-align:center;color:var(--muted);font-size:0.9rem;padding:1rem;">All caught up! Add a new task above.</li>`;
    return;
  }

  uiTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.done ? 'done' : ''}`;
    
    li.innerHTML = `
      <input type="checkbox" class="task-checkbox" ${task.done ? 'checked' : ''} onchange="toggleTask('${task.id}')">
      <span class="task-text">${escapeHTML(task.text)}</span>
      <button class="btn-delete" onclick="deleteTask('${task.id}')" title="Delete">
        <svg viewBox="0 0 24 24"><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4zM6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/></svg>
      </button>
    `;
    taskListEl.appendChild(li);
  });
}

function loadStorage() {
  try {
    // Stats load
    const rawStats = localStorage.getItem(STATS_KEY);
    if (rawStats) {
      try {
        const statsObj = JSON.parse(rawStats);
        if (statsObj.date === DATE_KEY) {
          sessionsCompletedCount = statsObj.count || 0;
        } else {
          // new day, start at 0
          sessionsCompletedCount = 0;
          saveStorage();
        }
      } catch(e) { console.error('storage JSON failed'); }
    }
  } catch(e) { console.log('localStorage restricted'); }

  updateBadge();

  try {
    // Tasks load
    const rawTasks = localStorage.getItem(TASKS_KEY);
    if (rawTasks) {
      try {
        uiTasks = JSON.parse(rawTasks);
      } catch(e) {}
    }
  } catch(e) { console.log('localStorage restricted'); }
}

function saveStorage() {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify({
      date: DATE_KEY,
      count: sessionsCompletedCount
    }));
    localStorage.setItem(TASKS_KEY, JSON.stringify(uiTasks));
  } catch(e) { console.log('localStorage save restricted'); }
}

function updateBadge() {
  sessionBadge.innerHTML = `${sessionsCompletedCount} 🍅`;
  
  if (sessionsCompletedCount > 0) {
    // Pop animation restart
    sessionBadge.style.animation = 'none';
    sessionBadge.offsetHeight; /* trigger reflow */
    sessionBadge.style.animation = null; 
  }

  const shortBreakBtn = document.querySelector('[data-mode="shortBreak"]');
  if (shortBreakBtn) {
    if (sessionsCompletedCount >= 1) {
      shortBreakBtn.disabled = false;
      shortBreakBtn.title = "Break Unlocked!";
    } else {
      shortBreakBtn.disabled = true;
      shortBreakBtn.title = "Complete 1 🍅 to unlock";
    }
  }

  const longBreakBtn = document.querySelector('[data-mode="longBreak"]');
  if (longBreakBtn) {
    if (sessionsCompletedCount >= 4) {
      longBreakBtn.disabled = false;
      longBreakBtn.title = "Long Break Unlocked!";
    } else {
      longBreakBtn.disabled = true;
      longBreakBtn.title = "Complete 4 🍅 to unlock";
    }
  }
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag])
  );
}

// Init application state
init();

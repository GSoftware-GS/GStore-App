const jsonInput = document.getElementById('json-input');
const jsonOutput = document.getElementById('json-output');
const errorBadge = document.getElementById('error-badge');
const copyBtn = document.getElementById('copy-btn');
const minifyBtn = document.getElementById('minify-btn');
const toast = document.getElementById('toast');

// Optional highlighting feature
function syntaxHighlight(json) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let cls = 'json-value';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'json-key';
        return `<span style="color: #f1f0ff;">${match.slice(0, match.length-1)}</span><span style="color: #8b8aa8;">:</span>`;
      } else {
        cls = 'json-string';
        return `<span style="color: #a78bfa;">${match}</span>`;
      }
    } else if (/true|false/.test(match)) {
      return `<span style="color: #4ade80;">${match}</span>`;
    } else if (/null/.test(match)) {
      return `<span style="color: #f87171;">${match}</span>`;
    }
    // Number
    return `<span style="color: #60a5fa;">${match}</span>`;
  });
}

function reformat(minify = false) {
  const raw = jsonInput.value.trim();
  
  if (!raw) {
    jsonOutput.innerHTML = '';
    errorBadge.classList.add('hidden');
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    const spacing = minify ? 0 : 4;
    const formatted = JSON.stringify(parsed, null, spacing);
    
    // Apply highly aesthetic syntax highlighting to the stringified output
    jsonOutput.innerHTML = syntaxHighlight(formatted);
    errorBadge.classList.add('hidden');
  } catch (err) {
    // Graceful error state
    errorBadge.textContent = "Syntax Error: " + err.message;
    errorBadge.classList.remove('hidden');
  }
}

// Events
jsonInput.addEventListener('input', () => reformat(false));

minifyBtn.addEventListener('click', () => {
    reformat(true);
});

copyBtn.addEventListener('click', () => {
  const codeText = jsonOutput.textContent; // .textContent inherently strips any raw HTML spans
  if (!codeText) return;

  navigator.clipboard.writeText(codeText).then(() => {
    showToast();
  }).catch(err => console.error('Clipboard error:', err));
});

let toastTimeout;
function showToast() {
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('show'), 10);
  
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 400); 
  }, 2000);
}

// Init example
const example = {
  linkedIn: "Gonzalo's JSON Formatter",
  privacyLevel: "100%",
  features: ["Offline", "Validation", "Fast"],
  isPaid: false
};

document.addEventListener('DOMContentLoaded', () => {
  jsonInput.value = JSON.stringify(example);
  reformat(false);
});

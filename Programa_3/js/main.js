const mdInput = document.getElementById('markdown-input');
const htmlPreview = document.getElementById('html-preview');
const copyMdBtn = document.getElementById('copy-markdown-btn');
const copyHtmlBtn = document.getElementById('copy-html-btn');
const toast = document.getElementById('toast');

const DEFAULT_MARKDOWN = `# Welcome to MD Previewer 🚀

Write your markdown on the left and see it instantly rendered on the right. Works entirely offline after the first CDN fetch.

## Why this is useful
1. **No installations**: Open this standard HTML file anywhere.
2. **Lightning fast**: Live parsing character by character.
3. **Beautiful defaults**: Code blocks, tables, and typography are pre-styled.

### Example Code Block
\`\`\`javascript
function greet(user) {
    if(!user) return;
    console.log(\`Hello \${user}, enjoy your clean UI!\`);
}
\`\`\`

> "Good design is making something intelligible and memorable. Great design is making something memorable and meaningful."
> — *Dieter Rams*

### Table Example
| Feature | Supported | 
|---------|:---:|
| Headers | ✅ |
| Lists | ✅ |
| Code | ✅ |
| Links | ✅ |

Ready? **Select this text, delete it, and start typing.**`;

function init() {
  // Pre-fill
  mdInput.value = DEFAULT_MARKDOWN;
  renderMarkdown();

  // Settings for marked
  if(window.marked) {
    marked.setOptions({
      gfm: true,
      breaks: true,
      headerIds: false
    });
  } else {
    // If CDN fails or offline without cache
    htmlPreview.innerHTML = '<p style="color: red;">Error: Could not load marked.js CDN. Please check your internet connection.</p>';
  }
}

function renderMarkdown() {
  if(!window.marked) return;
  const rawData = mdInput.value;
  // Parse markdown securely via marked
  const parsedHTML = marked.parse(rawData);
  htmlPreview.innerHTML = parsedHTML;
}

// Event Listeners
mdInput.addEventListener('input', renderMarkdown);

copyMdBtn.addEventListener('click', () => {
  copyToClipboard(mdInput.value);
});

copyHtmlBtn.addEventListener('click', () => {
  if(!window.marked) return;
  const parsedHTML = marked.parse(mdInput.value);
  copyToClipboard(parsedHTML);
});

// Clipboard utils
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast();
  }).catch(err => console.error('Clipboard error:', err));
}

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

// Start
document.addEventListener('DOMContentLoaded', init);

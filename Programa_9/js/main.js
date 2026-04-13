const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-input');

const aiInterface = document.getElementById('ai-interface');
const imagePreview = document.getElementById('image-preview');
const statusText = document.getElementById('status-text');
const progressFill = document.getElementById('progress-fill');

const textOutput = document.getElementById('text-output');
const clearBtn = document.getElementById('clear-btn');
const copyBtn = document.getElementById('copy-btn');
const toast = document.getElementById('toast');

let isProcessing = false;

// --- Event Listeners: Drag, Drop, and Paste ---
dropzone.addEventListener('click', () => fileInput.click());

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }

['dragenter', 'dragover'].forEach(() => dropzone.classList.add('dragover'));
['dragleave', 'drop'].forEach(() => dropzone.classList.remove('dragover'));

dropzone.addEventListener('drop', e => processFile(e.dataTransfer.files[0]));
fileInput.addEventListener('change', e => processFile(e.target.files[0]));

// Extremely useful magic: allows Ctrl+V pasting anywhere on the page
document.addEventListener('paste', e => {
    if(isProcessing) return;
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
        if (item.type.indexOf('image') === 0) {
            const blob = item.getAsFile();
            processFile(blob);
            break;
        }
    }
});

// --- File Handling & AI Subrouting ---
function processFile(file) {
    if (!file || file.type.indexOf('image') !== 0) {
        alert("Please drop or paste a valid Image (JPG, PNG, WEBP).");
        return;
    }
    
    // Switch UI States
    isProcessing = true;
    dropzone.classList.add('hidden');
    aiInterface.classList.remove('hidden');
    clearBtn.classList.add('hidden');
    copyBtn.classList.add('hidden');
    
    textOutput.value = "";
    
    // Show Preview Blob
    const objUrl = URL.createObjectURL(file);
    imagePreview.src = objUrl;

    // Trigger AI Scan
    runAIOpticalScan(file);
}

async function runAIOpticalScan(imageFile) {
    statusText.textContent = "Booting WebAssembly Engine...";
    progressFill.style.width = '0%';
    progressFill.classList.add('scanning');

    try {
        // Run neural network inference locally mapping both english and spanish
        const result = await Tesseract.recognize(
            imageFile,
            'eng+spa', // Recognizes both languages smoothly without switching
            {
                logger: m => updateProgressHUD(m)
            }
        );

        // Success State
        progressFill.classList.remove('scanning');
        progressFill.style.width = '100%';
        statusText.textContent = `A.I. Text Extraction Complete!`;
        
        textOutput.value = result.data.text;

        // Reveal post-actions
        clearBtn.classList.remove('hidden');
        copyBtn.classList.remove('hidden');

    } catch(err) {
        // Error State
        progressFill.classList.remove('scanning');
        progressFill.style.background = '#ff4757';
        statusText.textContent = "A.I. Neural Failure: " + err.message;
        console.error(err);
    } finally {
        isProcessing = false;
    }
}

// Visual HUD updater
function updateProgressHUD(message) {
    // Tesseract spits out several statuses: 'loading tesseract core', 'initializing api', 'recognizing text'
    if (message.status === 'recognizing text') {
        const percentage = Math.max(10, Math.round(message.progress * 100)); // Minimum 10% representation
        progressFill.style.width = `${percentage}%`;
        statusText.textContent = `Scanning visual tensors... ${percentage}%`;
    } else {
        const prettyStatus = message.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        statusText.textContent = `Worker: ${prettyStatus}`;
        // Give a fake bump internally so the user feels it's moving
        progressFill.style.width = `15%`;
    }
}

// --- Action Buttons ---
copyBtn.addEventListener('click', () => {
    if (!textOutput.value) return;
    navigator.clipboard.writeText(textOutput.value).then(() => {
        showToast();
    });
});

clearBtn.addEventListener('click', () => {
    // Reset Everything
    aiInterface.classList.add('hidden');
    dropzone.classList.remove('hidden');
    imagePreview.src = "";
    textOutput.value = "";
    fileInput.value = "";
});

let toastTimeout;
function showToast() {
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('show'), 10);
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 400); 
  }, 3000);
}

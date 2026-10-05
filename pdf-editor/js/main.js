const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-input');
const queueContainer = document.getElementById('file-queue-container');
const fileList = document.getElementById('file-list');

const watermarkInput = document.getElementById('watermark-input');
const titleInput = document.getElementById('title-input');

const processBtn = document.getElementById('process-btn');
const clearBtn = document.getElementById('clear-btn');
const toast = document.getElementById('toast');

// Array holding all file arrays buffers { filename: string, bytes: ArrayBuffer, id: number }
let pdfQueue = [];
let dragStartIndex;

// --- Dropzone Multiple Files Logic ---
dropzone.addEventListener('click', () => fileInput.click());

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropzone.addEventListener(eventName, e => {
      e.preventDefault(); 
      e.stopPropagation();
  });
});

['dragenter', 'dragover'].forEach(eventName => dropzone.addEventListener(eventName, () => dropzone.classList.add('dragover')));
['dragleave', 'drop'].forEach(eventName => dropzone.addEventListener(eventName, () => dropzone.classList.remove('dragover')));

dropzone.addEventListener('drop', e => handleFiles(e.dataTransfer.files));
fileInput.addEventListener('change', e => handleFiles(e.target.files));

async function handleFiles(files) {
    if (!files || files.length === 0) return;
    
    const validFiles = Array.from(files).filter(f => f.type === 'application/pdf');
    if (validFiles.length === 0) return alert("Only PDF files are allowed.");

    for (const file of validFiles) {
        const buffer = await readFileAsync(file);
        pdfQueue.push({ filename: file.name, bytes: buffer, id: Math.random() });
    }

    renderQueue();
}

function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(e);
        reader.readAsArrayBuffer(file);
    });
}

// --- Queue UI State & Drag/Drop Re-ordering ---
function renderQueue() {
    fileList.innerHTML = '';
    
    if (pdfQueue.length > 0) {
        queueContainer.classList.remove('hidden');
        clearBtn.classList.remove('hidden');
        processBtn.classList.remove('disabled');
        processBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
            ${pdfQueue.length > 1 ? 'Merge All & Download' : 'Modify & Download'}
        `;
    } else {
        queueContainer.classList.add('hidden');
        clearBtn.classList.add('hidden');
        processBtn.classList.add('disabled');
    }

    // Render list
    pdfQueue.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'queued-file';
        div.draggable = true;
        div.setAttribute('data-index', index);
        
        // Grab icon for affordance
        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="cursor:grab; opacity:0.5; user-select:none;">☰</span>
              <span>📄 ${index + 1}. ${item.filename}</span>
            </div>
            <span class="remove-icon" title="Remove" onclick="removeItem(${index})">&times;</span>
        `;
        
        // Apply Drag and Drop API events
        div.addEventListener('dragstart', dragStart);
        div.addEventListener('dragover', dragOver);
        div.addEventListener('drop', dragDrop);
        div.addEventListener('dragenter', dragEnter);
        div.addEventListener('dragleave', dragLeave);
        div.addEventListener('dragend', dragEnd);

        fileList.appendChild(div);
    });
}

function dragStart(e) {
    dragStartIndex = +this.getAttribute('data-index');
    this.classList.add('dragging');
}

function dragEnter(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function dragLeave(e) {
    this.classList.remove('drag-over');
}

function dragOver(e) {
    e.preventDefault();
}

function dragDrop(e) {
    const dragEndIndex = +this.closest('.queued-file').getAttribute('data-index');
    this.classList.remove('drag-over');
    swapItems(dragStartIndex, dragEndIndex);
}

function dragEnd(e) {
    this.classList.remove('dragging');
    const items = document.querySelectorAll('.queued-file');
    items.forEach(item => item.classList.remove('drag-over'));
}

function swapItems(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    const itemToMove = pdfQueue[fromIndex];
    pdfQueue.splice(fromIndex, 1); // remove
    pdfQueue.splice(toIndex, 0, itemToMove); // insert at new spot
    renderQueue();
}

window.removeItem = function(index) {
    pdfQueue.splice(index, 1);
    renderQueue();
};

clearBtn.addEventListener('click', () => {
    pdfQueue = [];
    fileInput.value = "";
    watermarkInput.value = "";
    titleInput.value = "";
    renderQueue();
});

// --- Core iLovePDF-like Processing Engine ---
processBtn.addEventListener('click', async () => {
    if (pdfQueue.length === 0) return;

    try {
        processBtn.classList.add('disabled');
        processBtn.innerHTML = "Processing Local RAM...";

        const { PDFDocument, rgb, degrees, StandardFonts } = window.PDFLib;
        const masterDoc = await PDFDocument.create();

        for (const item of pdfQueue) {
            const pdfDoc = await PDFDocument.load(item.bytes);
            const copiedPages = await masterDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
            copiedPages.forEach((page) => masterDoc.addPage(page));
        }

        if (titleInput.value.trim()) masterDoc.setTitle(titleInput.value.trim());

        const wText = watermarkInput.value.trim();
        if (wText) {
            const font = await masterDoc.embedFont(StandardFonts.HelveticaBold);
            const pages = masterDoc.getPages();
            
            pages.forEach(page => {
                const { width, height } = page.getSize();
                const fontSize = width / 12; 
                page.drawText(wText, {
                    x: width / 6,
                    y: height / 3,
                    size: fontSize,
                    font: font,
                    color: rgb(1, 0, 0),
                    opacity: 0.15,
                    rotate: degrees(45),
                });
            });
        }

        const mergedPdfBytes = await masterDoc.save();
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = pdfQueue.length > 1 ? 'Merged_Document_Secure.pdf' : pdfQueue[0].filename.replace('.pdf', '_edited.pdf');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast();

    } catch (err) {
        alert("Fatal Error compiling PDF: " + err.message);
    } finally {
        renderQueue(); 
    }
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

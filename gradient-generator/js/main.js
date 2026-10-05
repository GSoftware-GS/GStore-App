const color1Input = document.getElementById('color1');
const color2Input = document.getElementById('color2');
const display1 = document.getElementById('display1');
const display2 = document.getElementById('display2');
const angleSlider = document.getElementById('angle-slider');
const angleValue = document.getElementById('angle-value');
const cssOutput = document.getElementById('css-output');
const swapBtn = document.getElementById('swap-btn');
const copyBtn = document.getElementById('copy-btn');
const toast = document.getElementById('toast');
const appBody = document.getElementById('app-body');

// Local execution context variables
let c1 = color1Input.value;
let c2 = color2Input.value;
let ang = angleSlider.value;

function init() {
  updateGradient();
}

function updateGradient() {
  c1 = color1Input.value.toUpperCase();
  c2 = color2Input.value.toUpperCase();
  ang = angleSlider.value;

  // Update UI texts
  display1.textContent = c1;
  display2.textContent = c2;
  angleValue.textContent = `${ang}°`;

  // Apply visual changes
  const gradientString = `linear-gradient(${ang}deg, ${c1}, ${c2})`;
  const styleString = `background: ${gradientString};`;
  
  appBody.style.background = gradientString;
  cssOutput.textContent = styleString;
}

function swapColors() {
  const temp = color1Input.value;
  color1Input.value = color2Input.value;
  color2Input.value = temp;
  updateGradient();
}

// Event Listeners
color1Input.addEventListener('input', updateGradient);
color2Input.addEventListener('input', updateGradient);
angleSlider.addEventListener('input', updateGradient);
swapBtn.addEventListener('click', swapColors);

// Copy to Clipboard
copyBtn.addEventListener('click', () => {
  const codeText = cssOutput.textContent;
  navigator.clipboard.writeText(codeText).then(() => {
    showToast();
  });
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

// Kickoff
init();

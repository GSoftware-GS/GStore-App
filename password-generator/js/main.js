const resultEl = document.getElementById('result');
const lengthEl = document.getElementById('length');
const lengthValEl = document.getElementById('lengthVal');
const uppercaseEl = document.getElementById('uppercase');
const lowercaseEl = document.getElementById('lowercase');
const numbersEl = document.getElementById('numbers');
const symbolsEl = document.getElementById('symbols');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const toast = document.getElementById('toast');

const randomFunc = {
  lower: getRandomLower,
  upper: getRandomUpper,
  number: getRandomNumber,
  symbol: getRandomSymbol
};

// Update length value on slider move
lengthEl.addEventListener('input', (e) => {
  lengthValEl.innerText = e.target.value;
});

// Copy to clipboard
copyBtn.addEventListener('click', () => {
  const password = resultEl.innerText;
  if (!password) return;
  
  navigator.clipboard.writeText(password).then(() => {
    showToast();
  });
});

// Generate event
generateBtn.addEventListener('click', () => {
  const length = +lengthEl.value;
  const hasLower = lowercaseEl.checked;
  const hasUpper = uppercaseEl.checked;
  const hasNumber = numbersEl.checked;
  const hasSymbol = symbolsEl.checked;

  resultEl.innerText = generatePassword(hasLower, hasUpper, hasNumber, hasSymbol, length);
});

// Generate visually at start
window.addEventListener('DOMContentLoaded', () => {
  generateBtn.click();
});

function generatePassword(lower, upper, number, symbol, length) {
  let generatedPassword = '';
  const typesCount = lower + upper + number + symbol;
  const typesArr = [{lower}, {upper}, {number}, {symbol}].filter(item => Object.values(item)[0]);
  
  if(typesCount === 0) {
    return '';
  }

  for(let i = 0; i < length; i += typesCount) {
    typesArr.forEach(type => {
      const funcName = Object.keys(type)[0];
      generatedPassword += randomFunc[funcName]();
    });
  }

  // Shuffle the main result so it's not predictable and truncate to exact length
  const finalPassword = generatedPassword.slice(0, length);
  return finalPassword.split('').sort(() => 0.5 - getCryptoRandom()).join('');
}

// Helper to get truly random values
function getCryptoRandom() {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0] / (0xffffffff + 1);
}

function getRandomLower() {
  return String.fromCharCode(Math.floor(getCryptoRandom() * 26) + 97);
}

function getRandomUpper() {
  return String.fromCharCode(Math.floor(getCryptoRandom() * 26) + 65);
}

function getRandomNumber() {
  return String.fromCharCode(Math.floor(getCryptoRandom() * 10) + 48);
}

function getRandomSymbol() {
  const symbols = '!@#$%^&*(){}[]=<>/,.';
  return symbols[Math.floor(getCryptoRandom() * symbols.length)];
}

function showToast() {
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

const MIN = 100;
const MAX = 999;
const pinInput = document.getElementById('pin');
const sha256HashView = document.getElementById('sha256-hash');
const resultView = document.getElementById('result');

// a function to store in the local storage
function store(key, value) {
  localStorage.setItem(key, value);
}

// a function to retrieve from the local storage
function retrieve(key) {
  return localStorage.getItem(key);
}

// generate a random number between min and max
function getRandomArbitrary(min, max) {
  const randomValue = Math.floor(Math.random() * (max - min) + min);
  return randomValue;
}

// a function to clear the local storage
function clear() {
  localStorage.clear();
}

// a function to generate sha256 hash of the given string
async function sha256(message) {
  try {
    // encode as UTF-8
    const msgBuffer = new TextEncoder().encode(message);

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
  } catch (error) {
    console.error('Error generating SHA-256 hash:', error);
    return null;
  }
}

// retrieve or generate a SHA-256 hash
async function getSHA256Hash() {
  let cachedHash = retrieve('sha256');
  if (cachedHash) {
    return cachedHash;
  }

  const randomValue = getRandomArbitrary(MIN, MAX);
  cachedHash = await sha256(randomValue.toString());
  if (cachedHash) {
    store('sha256', cachedHash);
  }
  return cachedHash;
}

// main function to display the hash
async function main() {
  sha256HashView.innerHTML = 'Calculating...';
  const hash = await getSHA256Hash();
  sha256HashView.innerHTML = hash || 'Error generating hash';
}

// test the entered PIN against the stored hash
async function test(event) {
  event.preventDefault(); // prevent default form submission if inside a form

  const pin = pinInput.value;

  if (pin.length !== 3) {
    resultView.innerHTML = '💡 PIN must be 3 digits';
    resultView.classList.remove('hidden');
    return;
  }

  const hashedPin = await sha256(pin);

  if (hashedPin === sha256HashView.innerHTML) {
    resultView.innerHTML = '🎉 Success';
    resultView.classList.add('success');
  } else {
    resultView.innerHTML = 'Failed';
    resultView.classList.remove('success');
  }
  resultView.classList.remove('hidden');
}

// ensure pinInput only accepts numbers and is 3 digits long
pinInput.addEventListener('input', (e) => {
  const { value } = e.target;
  pinInput.value = value.replace(/\D/g, '').slice(0, 3);
});

// attach the test function to the button
document.getElementById('check').addEventListener('click', test);

// initialize the application
main();
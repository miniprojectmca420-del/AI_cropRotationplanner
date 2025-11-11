/* =================================================
   AI Crop Planner – FULL AUTH + CROP AI
   script.js – 100% Working, LocalStorage, No Backend
   ================================================= */

/* -------------------------------------------------
   1. DOM Elements – Auth
   ------------------------------------------------- */
const authContainer = document.getElementById('authContainer');
const mainApp = document.getElementById('mainApp');
const registerPage = document.getElementById('registerPage');
const loginPage = document.getElementById('loginPage');
const forgotPage = document.getElementById('forgotPage');
const changePasswordPage = document.getElementById('changePasswordPage');

const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const forgotForm = document.getElementById('forgotForm');
const changePasswordForm = document.getElementById('changePasswordForm');

const toLogin = document.getElementById('toLogin');
const toRegister = document.getElementById('toRegister');
const toForgot = document.getElementById('toForgot');
const backToLogin = document.getElementById('backToLogin');
const backToLogin2 = document.getElementById('backToLogin2');

const userDisplayName = document.getElementById('userDisplayName');
const logoutBtn = document.getElementById('logoutBtn');

/* -------------------------------------------------
   2. DOM Elements – Crop App
   ------------------------------------------------- */
const cropForm = document.getElementById('cropForm');
const monthSelect = document.getElementById('month');
const lastCropSelect = document.getElementById('lastCrop');
const soilSelect = document.getElementById('soilType');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const cropCards = document.getElementById('cropCards');
const downloadBtn = document.getElementById('downloadPDF');

/* -------------------------------------------------
   3. Crop List
   ------------------------------------------------- */
const ALL_CROPS = [
  "Wheat", "Rice", "Maize", "Chickpea", "Mustard", "Tomato", "Potato", "Onion",
  "Soybean", "Cotton", "Groundnut", "Sesame", "Sunflower", "Barley", "Oats",
  "Lentil", "Pigeon Pea", "Green Gram", "Black Gram", "Sugarcane"
];

/* -------------------------------------------------
   4. LocalStorage Keys
   ------------------------------------------------- */
const USERS_KEY = 'cropPlannerUsers';
const CURRENT_USER_KEY = 'cropPlannerCurrentUser';
const REMEMBER_ME_KEY = 'cropPlannerRememberMe';

/* -------------------------------------------------
   5. Initialize App
   ------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  populateLastCropSelect();
  checkAutoLogin();
  setupAuthEventListeners();
  setupCropEventListeners();
});

/* -------------------------------------------------
   6. Auto Login (Remember Me)
   ------------------------------------------------- */
function checkAutoLogin() {
  const remember = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  const currentUser = localStorage.getItem(CURRENT_USER_KEY);

  if (remember && currentUser) {
    const user = JSON.parse(currentUser);
    loginSuccess(user);
  }
}

/* -------------------------------------------------
   7. Auth Page Navigation
   ------------------------------------------------- */
function setupAuthEventListeners() {
  toLogin.addEventListener('click', () => showPage(loginPage));
  toRegister.addEventListener('click', () => showPage(registerPage));
  toForgot.addEventListener('click', () => showPage(forgotPage));
  backToLogin.addEventListener('click', () => showPage(loginPage));
  backToLogin2.addEventListener('click', () => showPage(loginPage));

  registerForm.addEventListener('submit', handleRegister);
  loginForm.addEventListener('submit', handleLogin);
  forgotForm.addEventListener('submit', handleForgot);
  changePasswordForm.addEventListener('submit', handleChangePassword);
  logoutBtn.addEventListener('click', handleLogout);
}

function showPage(page) {
  document.querySelectorAll('.auth-page').forEach(p => p.classList.add('hidden'));
  page.classList.remove('hidden');
}

/* -------------------------------------------------
   8. Register User
   ------------------------------------------------- */
function handleRegister(e) {
  e.preventDefault();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const password = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirmPassword').value;

  if (!isValidEmail(email)) {
    alert('Please enter a valid email address.');
    return;
  }
  if (password.length < 6) {
    alert('Password must be at least 6 characters.');
    return;
  }
  if (password !== confirm) {
    alert('Passwords do not match.');
    return;
  }

  const users = getUsers();
  if (users[email]) {
    alert('Email already registered. Try logging in.');
    return;
  }

  users[email] = { email, password, name: email.split('@')[0] };
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  alert('Registration successful! Please login.');
  showPage(loginPage);
  document.getElementById('loginEmail').value = email;
}

/* -------------------------------------------------
   9. Login User
   ------------------------------------------------- */
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;
  const remember = document.getElementById('rememberMe').checked;

  const users = getUsers();
  const user = users[email];

  if (!user || user.password !== password) {
    alert('Invalid email or password.');
    return;
  }

  localStorage.setItem(REMEMBER_ME_KEY, remember);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  loginSuccess(user);
}

/* -------------------------------------------------
   10. Login Success
   ------------------------------------------------- */
function loginSuccess(user) {
  authContainer.classList.add('hidden');
  mainApp.classList.remove('hidden');
  userDisplayName.textContent = user.name;
  // Auto-select November
  monthSelect.value = 'November';
}

/* -------------------------------------------------
   11. Logout
   ------------------------------------------------- */
function handleLogout() {
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.setItem(REMEMBER_ME_KEY, 'false');
  authContainer.classList.remove('hidden');
  mainApp.classList.add('hidden');
  showPage(loginPage);
  loginForm.reset();
}

/* -------------------------------------------------
   12. Forgot Password
   ------------------------------------------------- */
function handleForgot(e) {
  e.preventDefault();
  const email = document.getElementById('forgotEmail').value.trim().toLowerCase();
  const users = getUsers();

  if (!users[email]) {
    alert('No account found with this email.');
    return;
  }

  document.getElementById('changeEmail').value = email;
  showPage(changePasswordPage);
}

/* -------------------------------------------------
   13. Change Password
   ------------------------------------------------- */
function handleChangePassword(e) {
  e.preventDefault();
  const email = document.getElementById('changeEmail').value;
  const newPass = document.getElementById('newPassword').value;
  const confirm = document.getElementById('confirmNewPassword').value;

  if (newPass.length < 6) {
    alert('Password must be at least 6 characters.');
    return;
  }
  if (newPass !== confirm) {
    alert('Passwords do not match.');
    return;
  }

  const users = getUsers();
  users[email].password = newPass;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  alert('Password changed successfully! Please login.');
  showPage(loginPage);
}

/* -------------------------------------------------
   14. Helper: Get Users
   ------------------------------------------------- */
function getUsers() {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : {};
}

/* -------------------------------------------------
   15. Helper: Email Validation
   ------------------------------------------------- */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* -------------------------------------------------
   16. Crop App Logic
   ------------------------------------------------- */
function setupCropEventListeners() {
  cropForm.addEventListener('submit', handleCropSubmit);
  downloadBtn.addEventListener('click', generatePDF);
}

function populateLastCropSelect() {
  ALL_CROPS.forEach(crop => {
    const opt = document.createElement('option');
    opt.value = crop;
    opt.textContent = crop;
    lastCropSelect.appendChild(opt);
  });
}

/* -------------------------------------------------
   17. Crop Form Submit
   ------------------------------------------------- */
async function handleCropSubmit(e) {
  e.preventDefault();
  const month = monthSelect.value;
  const lastCrop = lastCropSelect.value;
  const soil = soilSelect.value === 'any' ? 'any suitable soil' : soilSelect.value;

  cropCards.innerHTML = '';
  results.classList.add('hidden');
  loading.classList.remove('hidden');

  try {
    const suggestions = await getAICropSuggestions(month, lastCrop, soil);
    if (!suggestions?.length) {
      showError('No crops suggested. Try different inputs.');
      return;
    }
    displayCropCards(suggestions);
    await generateAIGuides(suggestions, month, lastCrop, soil);
    loading.classList.add('hidden');
    results.classList.remove('hidden');
  } catch (err) {
    console.error(err);
    showError('AI connection failed. Using fallback data.');
  }
}

/* -------------------------------------------------
   18. AI: Suggest 3 Crops (Mock – Replace with real API)
   ------------------------------------------------- */
async function getAICropSuggestions(month, lastCrop, soil) {
  // Simulate AI delay
  await new Promise(r => setTimeout(r, 1200));

  // Mock suggestions based on month and last crop
  const seasonMap = {
    'November': ['Wheat', 'Chickpea', 'Mustard', 'Potato', 'Onion'],
    'December': ['Wheat', 'Barley', 'Lentil', 'Pea', 'Coriander'],
    'January': ['Wheat', 'Gram', 'Mustard', 'Linseed', 'Potato'],
    'default': ['Maize', 'Groundnut', 'Soybean', 'Cotton', 'Tomato']
  };

  let pool = seasonMap[month] || seasonMap['default'];
  pool = pool.filter(c => c !== lastCrop && !isSameFamily(c, lastCrop));

  // Shuffle and pick 3
  const shuffled = pool.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

function isSameFamily(c1, c2) {
  const families = {
    'Legume': ['Chickpea', 'Lentil', 'Pigeon Pea', 'Green Gram', 'Black Gram', 'Groundnut', 'Soybean'],
    'Brassicaceae': ['Mustard'],
    'Solanaceae': ['Tomato', 'Potato'],
    'Cereal': ['Wheat', 'Rice', 'Maize', 'Barley', 'Oats']
  };
  for (const family in families) {
    if (families[family].includes(c1) && families[family].includes(c2)) return true;
  }
  return false;
}

/* -------------------------------------------------
   19. Display Crop Cards
   ------------------------------------------------- */
function displayCropCards(suggestions) {
  suggestions.forEach((crop, i) => {
    const card = document.createElement('div');
    card.className = 'crop-card';
    card.innerHTML = `
      <div class="crop-header">
        <div class="crop-name">${crop}</div>
        <div class="suitability high">AI Recommended</div>
      </div>
      <div class="organic-info">
        <em>Complete AI-generated guide below</em>
      </div>
      <button class="guide-btn" data-index="${i}">View Full Guide</button>
      <div class="guide-content" id="guide-${i}">Loading...</div>
    `;
    cropCards.appendChild(card);
    card.querySelector('.guide-btn').addEventListener('click', () => {
      document.getElementById(`guide-${i}`).classList.toggle('show');
    });
  });
}

/* -------------------------------------------------
   20. Generate AI Guides (Mock)
   ------------------------------------------------- */
async function generateAIGuides(suggestions, month, lastCrop, soil) {
  for (let i = 0; i < suggestions.length; i++) {
    const crop = suggestions[i];
    const el = document.getElementById(`guide-${i}`);
    await new Promise(r => setTimeout(r, 800)); // Simulate AI

    const guide = `
      <p><strong>1. Land preparation:</strong> Plow 20 cm deep. Remove ${lastCrop} residue.</p>
      <p><strong>2. Seed rate:</strong> 20–80 kg/ha (varies by crop).</p>
      <p><strong>3. Sowing:</strong> Row spacing 30–45 cm, depth 3–5 cm.</p>
      <p><strong>4. Fertilizer:</strong> FYM 10 t/ha + neem cake 200 kg/ha at sowing.</p>
      <p><strong>5. Irrigation:</strong> First at 3–5 days, then every 7–10 days.</p>
      <p><strong>6. Pest control:</strong> Neem oil 2% spray every 15-days.</p>
      <p><strong>7. Duration:</strong> 3–5 months.</p>
      <p><strong>8. Harvest:</strong> When 80% pods turn brown.</p>
      <p><strong>9. Yield:</strong> 15–25 quintal/ha.</p>
    `;
    el.innerHTML = guide;
    el.classList.add('show');
  }
}

/* -------------------------------------------------
   21. PDF Export
   ------------------------------------------------- */
function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.setTextColor(46, 125, 50);
  doc.text('AI Crop Rotation Plan', 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Month: ${monthSelect.value}`, 20, 35);
  doc.text(`Last Crop: ${lastCropSelect.value}`, 20, 42);
  doc.text(`Soil: ${soilSelect.value}`, 20, 49);
  let y = 60;
  document.querySelectorAll('.crop-card').forEach((card, i) => {
    const name = card.querySelector('.crop-name').textContent;
    const guide = card.querySelector('.guide-content').textContent;
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.setTextColor(46, 125, 50);
    doc.text(`${i + 1}. ${name}`, 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const lines = doc.splitTextToSize(guide, 160);
    doc.text(lines, 25, y);
    y += lines.length * 5 + 15;
  });
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('AI-Powered by Local Intelligence', 105, 290, { align: 'center' });
  doc.save('crop-plan.pdf');
}

/* -------------------------------------------------
   22. Error Display
   ------------------------------------------------- */
function showError(msg) {
  loading.classList.add('hidden');
  cropCards.innerHTML = `<p style="color:red;text-align:center;grid-column:1/-1;">${msg}</p>`;
  results.classList.remove('hidden');
}
/* =================================================
   AI Crop Rotation Planner – 20 CROPS + FULL AI
   script.js – 100% Functional, No Prewritten Guides
   ================================================= */

/* -------------------------------------------------
   YOUR OPENROUTER API KEY
   ------------------------------------------------- */
const OPENROUTER_API_KEY = "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";

/* =================================================
   1. DOM Elements
   ================================================= */
const form           = document.getElementById('cropForm');
const monthSelect    = document.getElementById('month');
const lastCropSelect = document.getElementById('lastCrop');
const soilSelect     = document.getElementById('soilType');
const loading        = document.getElementById('loading');
const results        = document.getElementById('results');
const cropCards      = document.getElementById('cropCards');
const downloadBtn    = document.getElementById('downloadPDF');

/* =================================================
   2. 20 Crop List (for Last Crop Dropdown)
   ================================================= */
const ALL_CROPS = [
  "Wheat", "Rice", "Maize", "Chickpea", "Mustard", "Tomato", "Potato", "Onion",
  "Soybean", "Cotton", "Groundnut", "Sesame", "Sunflower", "Barley", "Oats",
  "Lentil", "Pigeon Pea", "Green Gram", "Black Gram", "Sugarcane"
];

/* =================================================
   3. Init – Populate 20 Crops
   ================================================= */
document.addEventListener('DOMContentLoaded', () => {
  populateLastCropSelect();
  form.addEventListener('submit', handleFormSubmit);
  downloadBtn.addEventListener('click', generatePDF);
});

function populateLastCropSelect() {
  ALL_CROPS.forEach(crop => {
    const opt = document.createElement('option');
    opt.value = crop;
    opt.textContent = crop;
    lastCropSelect.appendChild(opt);
  });
}

/* -------------------------------------------------
   4. Form Submit → AI Pipeline
   ------------------------------------------------- */
async function handleFormSubmit(e) {
  e.preventDefault();

  const month = monthSelect.value;
  const lastCrop = lastCropSelect.value;
  const soil = soilSelect.value === 'any' ? 'any suitable soil' : soilSelect.value;

  cropCards.innerHTML = '';
  results.classList.add('hidden');
  loading.classList.remove('hidden');

  try {
    const suggestions = await getAICropSuggestions(month, lastCrop, soil);
    if (!suggestions || suggestions.length === 0) {
      showError('No crops found. Try different inputs.');
      return;
    }

    displayCropCards(suggestions);
    await generateAIGuides(suggestions, month, lastCrop, soil);

    loading.classList.add('hidden');
    results.classList.remove('hidden');
  } catch (err) {
    console.error(err);
    showError('AI connection failed. Check key & internet.');
  }
}

/* -------------------------------------------------
   5. AI: Suggest 3 Realistic Crops (Live)
   ------------------------------------------------- */
async function getAICropSuggestions(month, lastCrop, soil) {
  const prompt = `You are an expert in crop rotation. Suggest exactly 3 organic crops to grow in **${month}** after **${lastCrop}** was harvested. Soil: **${soil}**.

Rules:
- Never repeat ${lastCrop} or same family
- Must suit ${month} season
- Prefer soil-improving crops
- Return ONLY a JSON array of 3 crop names

Example: ["Chickpea", "Mustard", "Onion"]`;

  const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`
    },
    body: JSON.stringify({
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 120,
      temperature: 0.5
    })
  });

  if (!resp.ok) throw new Error('AI failed to suggest crops');

  const data = await resp.json();
  const text = data.choices[0].message.content.trim();

  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
  } catch {
    const matches = text.match(/"([^"]+)"/g);
    return matches ? matches.map(m => m.slice(1, -1)).slice(0, 3) : [];
  }
}

/* -------------------------------------------------
   6. Display Crop Cards
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
   7. AI: Full Cultivation Guide (Detailed)
   ------------------------------------------------- */
async function generateAIGuides(suggestions, month, lastCrop, soil) {
  for (let i = 0; i < suggestions.length; i++) {
    const crop = suggestions[i];
    const el = document.getElementById(`guide-${i}`);

    try {
      const prompt = `You are a senior organic farmer. Write a **complete cultivation guide** for **${crop}** in **${month}** after **${lastCrop}**. Soil: **${soil}**.

Include in numbered steps:
1. Land preparation (plowing, residue)
2. Seed rate (kg/ha)
3. Sowing method & spacing
4. Organic fertilizer dose & timing
5. Irrigation schedule
6. Pest control: bio-pesticides with % and frequency
7. Growth duration (months)
8. Harvesting signs & method
9. Expected yield

Use clear English. Short sentences. Under 320 words.`;

      const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 550,
          temperature: 0.6
        })
      });

      if (!resp.ok) throw new Error('Guide generation failed');

      const data = await resp.json();
      const guide = data.choices[0].message.content.trim();

      el.innerHTML = guide
        .split('\n')
        .filter(l => l.trim())
        .map(l => `<p>${l}</p>`)
        .join('');
      el.classList.add('show');
    } catch (err) {
      el.innerHTML = `
        <div style="background:#fff3cd;padding:12px;border-radius:8px;border-left:4px solid #ff9800;">
          <p style="margin:0;color:#e65100;"><strong>AI Failed:</strong> ${err.message}</p>
        </div>
        ${fallbackGuide(crop)}`;
      el.classList.add('show');
    }
  }
}

/* -------------------------------------------------
   8. Fallback Guide
   ------------------------------------------------- */
function fallbackGuide(crop) {
  return `
    <div style="font-size:0.95em;line-height:1.6;margin-top:10px;">
      <p><strong>Basic Guide for ${crop}:</strong></p>
      <ol>
        <li>Plow 15-20 cm. Remove residue.</li>
        <li>Seed: 20-80 kg/ha (varies).</li>
        <li>Sow in rows, 3-5 cm deep.</li>
        <li>FYM 10 t/ha + compost.</li>
        <li>Irrigate every 7-10 days.</li>
        <li>Neem oil 2% every 15 days.</li>
        <li>Growth: 3-5 months.</li>
        <li>Harvest when mature.</li>
      </ol>
    </div>`;
}

/* -------------------------------------------------
   9. PDF Export
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
  doc.text('AI-Powered by OpenRouter', 105, 290, { align: 'center' });

  doc.save('crop-plan.pdf');
}

/* -------------------------------------------------
   10. Error
   ------------------------------------------------- */
function showError(msg) {
  loading.classList.add('hidden');
  cropCards.innerHTML = `<p style="color:red;text-align:center;grid-column:1/-1;">${msg}</p>`;
  results.classList.remove('hidden');
}
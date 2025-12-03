// script.js — FINAL FIXED VERSION

// Images — replace with your own official images
const IMAGES = {
  proLunch: "images/pro_lunch.png",
  steelOn: "images/steel_tiffin.png",
  treoGlass: "images/treo_glass.png",
  thermosteel500: "images/thermosteel_500.png",
  carafe: "images/carafe.png",
};

// Scenario definitions
const scenarios = [
  {
    title: "Riya – College Student",
    desc: "Riya has long days on campus and needs a fresh, leak-proof lunch with a drink.",
    options: [
      { name: "Milton Pro Lunch Set", img: IMAGES.proLunch, score: 10 },
      { name: "Thermosteel 500 ml Flask", img: IMAGES.thermosteel500, score: 4 },
      { name: "Treo Glass Tiffin", img: IMAGES.treoGlass, score: 7 }
    ]
  },
  {
    title: "Mr. Khanna – School Teacher",
    desc: "He shares snacks and serves chai in the staff room between classes.",
    options: [
      { name: "Large Insulated Steel Tiffin", img: IMAGES.steelOn, score: 8 },
      { name: "Thermosteel Carafe", img: IMAGES.carafe, score: 10 },
      { name: "Pro Lunch Set", img: IMAGES.proLunch, score: 6 }
    ]
  },
  {
    title: "Vikram – Business Traveler",
    desc: "He travels between meetings and needs a professional lunch + hot beverage setup.",
    options: [
      { name: "Executive Pro Lunch Set", img: IMAGES.proLunch, score: 9 },
      { name: "Thermosteel 500 ml Flask", img: IMAGES.thermosteel500, score: 8 },
      { name: "Insulated Casserole", img: IMAGES.carafe, score: 6 }
    ]
  }
];

// STATE
let currentIndex = 0;
let totalScore = 0;
let isGameOver = false;

// DOM
const landing = document.querySelector(".landing");
const gamePanel = document.getElementById("gamePanel");
const preloader = document.getElementById("preloader");

const scenarioTitle = document.getElementById("scenarioTitle");
const scenarioDesc = document.getElementById("scenarioDesc");
const choicesEl = document.getElementById("choices");
const visualImg = document.getElementById("visualImg");
const visualCaption = document.getElementById("visualCaption");

const pointsEl = document.getElementById("points");
const ptypeEl = document.getElementById("ptype");

const resultCard = document.getElementById("resultCard");
const resultSummary = document.getElementById("resultSummary");

const startGameBtn = document.getElementById("startGameBtn");
const replayBtn = document.getElementById("replayBtn");
const couponBtn = document.getElementById("couponBtn");
const shareBtn = document.getElementById("shareBtn");

// SOUNDS
function clickSound() {
  // Soft click tone
  const audio = new AudioContext();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.frequency.value = 700;
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.08);
  osc.stop(audio.currentTime + 0.09);
}

// SCORE animation
function animatePoints(from, to) {
  const start = performance.now();
  const duration = 400;
  function step(now) {
    const t = Math.min(1, (now - start) / duration);
    pointsEl.textContent = Math.round(from + (to - from) * t);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Render scenario
function renderScenario(i) {
  const s = scenarios[i];

  scenarioTitle.textContent = s.title;
  scenarioDesc.textContent = s.desc;

  visualImg.src = s.options[0].img;
  visualCaption.textContent = s.options[0].name;

  choicesEl.innerHTML = "";

  s.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.innerHTML = `
      <img src="${opt.img}" alt="${opt.name}">
      <div class="meta">
        <b>${opt.name}</b>
      </div>
    `;

    btn.addEventListener("mouseenter", () => updatePreview(opt));
    btn.addEventListener("focus", () => updatePreview(opt));

    btn.addEventListener("click", () => selectOption(opt, btn));

    choicesEl.appendChild(btn);
  });
}

function updatePreview(opt) {
  visualImg.src = opt.img;
  visualCaption.textContent = opt.name;
}

// FINAL FIX – Prevent scoring after last scenario
function selectOption(opt, btn) {
  if (isGameOver) return; // ⛔ FIXED: Stop adding score after finish

  clickSound();

  // Add score
  const prev = totalScore;
  totalScore += opt.score;
  animatePoints(prev, totalScore);

  // Move to next scenario
  setTimeout(() => {
    if (currentIndex < scenarios.length - 1) {
      currentIndex++;
      renderScenario(currentIndex);
    } else {
      endGame();
    }
  }, 400);
}

function endGame() {
  isGameOver = true; // 🔥 FIXED

  // Disable all choices
  choicesEl.querySelectorAll("button.choice").forEach((btn) => {
    btn.disabled = true;
  });

  // Compute personality
  let profile = "Quick Fixer";
  if (totalScore >= 25) profile = "Smart Planner";

  ptypeEl.textContent = profile;

  resultSummary.textContent =
    `You scored ${totalScore} Freshness Points.\nYour personality: ${profile}`;

  resultCard.classList.remove("hidden");
}

// Coupon generator
function generateLocalCoupon() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `MILTON-${code}`;
}

couponBtn.addEventListener("click", () => {
  if (!isGameOver) return alert("Finish the game first!");

  const coupon = generateLocalCoupon();
  navigator.clipboard.writeText(coupon);
  alert(`🎉 Your coupon: ${coupon}\nCopied to clipboard!`);
});

// Share button
shareBtn.addEventListener("click", () => {
  if (!isGameOver) return;

  const text = `I played Milton Moments and scored ${totalScore} points!`;
  if (navigator.share) {
    navigator.share({ text });
  } else {
    navigator.clipboard.writeText(text);
    alert("Result copied! You can paste it anywhere.");
  }
});

// Start game
startGameBtn.addEventListener("click", () => {
  clickSound();
  preloader.classList.remove("hidden");

  setTimeout(() => {
    preloader.classList.add("hidden");
    landing.classList.add("hidden");
    gamePanel.classList.remove("hidden");
    resetGame();
  }, 800);
});

// Reset for Replay
function resetGame() {
  totalScore = 0;
  currentIndex = 0;
  isGameOver = false; // RESET FIX

  pointsEl.textContent = "0";
  ptypeEl.textContent = "—";
  resultCard.classList.add("hidden");

  renderScenario(0);
}

replayBtn.addEventListener("click", () => {
  window.scrollTo(0, 0);
  gamePanel.classList.add("hidden");
  landing.classList.remove("hidden");
});


// Preload images
Object.values(IMAGES).forEach(src => {
  const img = new Image();
  img.src = src;
});

// Initial
renderScenario(0);

// script.js — Milton Moments with 6 scenarios & final result card only

// Image paths — replace with real Milton product images in /images
const IMAGES = {
  proLunch: "images/pro_lunch.png",
  steelOn: "images/steel_tiffin.png",
  treoGlass: "images/treo_glass.png",
  thermosteel500: "images/thermosteel_500.png",
  carafe: "images/carafe.png",
};

// Scenarios (6 personas)
const scenarios = [
  {
    id: "student",
    title: "Riya – College Student",
    desc: "Riya has long days on campus and needs a fresh, leak-proof lunch with a drink.",
    options: [
      { name: "Milton Pro Lunch Set (multi-compartment + bottle)", img: IMAGES.proLunch, score: 10 },
      { name: "Thermosteel 500 ml Flask", img: IMAGES.thermosteel500, score: 4 },
      { name: "Treo Glass Tiffin", img: IMAGES.treoGlass, score: 7 },
    ],
  },
  {
    id: "teacher",
    title: "Mr. Khanna – School Teacher",
    desc: "He shares snacks and serves chai in the staff room between classes.",
    options: [
      { name: "Large Insulated Steel Tiffin", img: IMAGES.steelOn, score: 8 },
      { name: "Thermosteel Carafe", img: IMAGES.carafe, score: 10 },
      { name: "Pro Lunch Set", img: IMAGES.proLunch, score: 6 },
    ],
  },
  {
    id: "business",
    title: "Vikram – Business Traveler",
    desc: "He travels between meetings and needs a professional lunch + hot beverage setup.",
    options: [
      { name: "Executive Pro Lunch Set", img: IMAGES.proLunch, score: 9 },
      { name: "Thermosteel 500 ml Flask", img: IMAGES.thermosteel500, score: 8 },
      { name: "Insulated Casserole", img: IMAGES.carafe, score: 6 },
    ],
  },
  {
    id: "traveler",
    title: "Sara – Road Trip Traveler",
    desc: "Weekend drives and picnics; food & drinks should stay fresh and spill-proof.",
    options: [
      { name: "Casserole + Thermosteel Carafe combo", img: IMAGES.carafe, score: 10 },
      { name: "Thermosteel 500 ml Flask", img: IMAGES.thermosteel500, score: 7 },
      { name: "Treo Glass Tiffin", img: IMAGES.treoGlass, score: 5 },
    ],
  },
  {
    id: "gym",
    title: "Aditya – Gym-Goer",
    desc: "Needs cold water or shakes during workout and a healthy post-workout meal.",
    options: [
      { name: "Thermosteel Bottle", img: IMAGES.thermosteel500, score: 9 },
      { name: "Treo Glass Meal Box", img: IMAGES.treoGlass, score: 7 },
      { name: "Pro Lunch Set", img: IMAGES.proLunch, score: 5 },
    ],
  },
  {
    id: "host",
    title: "Leena – Home Host",
    desc: "Loves hosting friends and family, serving hot dishes and endless chai.",
    options: [
      { name: "Thermosteel Carafe", img: IMAGES.carafe, score: 9 },
      { name: "Insulated Casserole", img: IMAGES.carafe, score: 10 },
      { name: "Treo Glass Tiffin", img: IMAGES.treoGlass, score: 5 },
    ],
  },
];

// State
let currentIndex = 0;
let totalScore = 0;
let isGameOver = false;

// DOM references
const landing = document.querySelector(".landing");
const gamePanel = document.getElementById("gamePanel");
const gameContainer = document.getElementById("gameContainer");
const preloader = document.getElementById("preloader");

const scenarioTitle = document.getElementById("scenarioTitle");
const scenarioDesc = document.getElementById("scenarioDesc");
const choicesEl = document.getElementById("choices");

const visualImg = document.getElementById("visualImg");
const visualCaption = document.getElementById("visualCaption");

const pointsEl = document.getElementById("points");
const ptypeEl = document.getElementById("ptype");

// Result card DOM
const resultCard = document.getElementById("resultCard");
const finalScoreEl = document.getElementById("finalScore");
const finalProfileEl = document.getElementById("finalProfile");
const resultCopyEl = document.getElementById("resultCopy");

// Buttons
const startGameBtn = document.getElementById("startGameBtn");
const resultPlayAgainBtn = document.getElementById("resultPlayAgain");
const couponBtn = document.getElementById("couponBtn");
const shareBtn = document.getElementById("shareBtn");

// SOUND (simple tone)
function clickSound() {
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

// Score animation
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

  const first = s.options[0];
  visualImg.src = first.img;
  visualCaption.textContent = first.name;

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
    btn.addEventListener("click", () => selectOption(opt));

    choicesEl.appendChild(btn);
  });
}

function updatePreview(opt) {
  visualImg.src = opt.img;
  visualCaption.textContent = opt.name;
}

// Selecting an option
function selectOption(opt) {
  if (isGameOver) return;

  clickSound();

  const old = totalScore;
  totalScore += opt.score;
  animatePoints(old, totalScore);

  setTimeout(() => {
    if (currentIndex < scenarios.length - 1) {
      currentIndex++;
      renderScenario(currentIndex);
    } else {
      endGame();
    }
  }, 400);
}

// End game – hide questions, show only result card
function endGame() {
  isGameOver = true;

  // Hide questions + preview
  gameContainer.classList.add("hidden");

  // Personality thresholds for 6 scenarios (max possible ≈ 60)
  let profile = "Quick Fixer"; // 0–29
  if (totalScore >= 50) profile = "Smart Planner";
  else if (totalScore >= 40) profile = "Freshness Lover";
  else if (totalScore >= 30) profile = "Practical Chooser";

  ptypeEl.textContent = profile;

  finalScoreEl.textContent = totalScore.toString();
  finalProfileEl.textContent = profile;

  // Marketing copy based on profile
  let extraCopy = "";
  switch (profile) {
    case "Smart Planner":
      extraCopy =
        "I plan ahead, keep every meal sorted and rely on Milton to stay ahead of my day — fresh, organised and always ready.";
      break;
    case "Freshness Lover":
      extraCopy =
        "I love my food just the way it’s meant to be — hot, fresh and flavourful. Milton keeps every bite on point.";
      break;
    case "Practical Chooser":
      extraCopy =
        "I pick what works best in real life — Milton fits into my routine with the right mix of convenience and freshness.";
      break;
    default:
      extraCopy =
        "I fix things on the go and trust Milton to keep up — from last-minute lunches to surprise chai breaks.";
  }
  resultCopyEl.textContent = extraCopy;

  resultCard.classList.remove("hidden");
  resultCard.classList.add("fade-up");
}

// Coupon generator (local-only)
function generateLocalCoupon() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `MILTON-${code}`;
}

// Button handlers
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

resultPlayAgainBtn.addEventListener("click", () => {
  clickSound();
  window.scrollTo(0, 0);
  resultCard.classList.add("hidden");
  gamePanel.classList.add("hidden");
  landing.classList.remove("hidden");
});

couponBtn.addEventListener("click", () => {
  if (!isGameOver) return alert("Finish the game first!");
  const coupon = generateLocalCoupon();
  navigator.clipboard.writeText(coupon).catch(() => {});
  alert(`🎉 Your coupon: ${coupon}\n\nIt has been copied to your clipboard.`);
});

shareBtn.addEventListener("click", () => {
  if (!isGameOver) return;

  const profile = finalProfileEl.textContent;
  const score = finalScoreEl.textContent;
  const shareText = `My Milton Moments Report:\n• Freshness Points: ${score}\n• Smart Lunch Personality: ${profile}\n\n“I pack every day with smart, fresh choices – powered by Milton.”\n#MiltonMoments #SmartLunch #StayFreshWithMilton`;

  if (navigator.share) {
    navigator
      .share({
        title: "My Milton Moments Report",
        text: shareText,
        url: window.location.href,
      })
      .catch(() => {});
  } else {
    navigator.clipboard
      .writeText(shareText)
      .then(() => alert("Share text copied! Paste it on your favourite social platform."))
      .catch(() => alert("Could not copy share text. Please try again."));
  }
});

// Reset game for a new run
function resetGame() {
  totalScore = 0;
  currentIndex = 0;
  isGameOver = false;
  pointsEl.textContent = "0";
  ptypeEl.textContent = "—";

  gameContainer.classList.remove("hidden");
  resultCard.classList.add("hidden");

  renderScenario(0);
}

// Preload images
Object.values(IMAGES).forEach((src) => {
  const img = new Image();
  img.src = src;
});

// Initial setup
renderScenario(0);

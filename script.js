// script.js — Milton Moments game logic (no backend required)

// Image URLs – replace with local /images paths if you prefer
const IMAGES = {
  proLunch: "images/pro_lunch.png",
  steelOn: "images/steel_tiffin.png",
  treoGlass: "images/treo_glass.png",
  thermosteel500: "images/thermosteel_500.png",
  carafe: "images/carafe.png",
};

// Scenarios: characters + Milton product options
const scenarios = [
  {
    id: "student",
    title: "Riya – College Student",
    desc: "Riya has long days on campus and needs a fresh, leak-proof lunch with a drink.",
    options: [
      {
        name: "Milton Pro Lunch Set (multi-compartment + bottle)",
        img: IMAGES.proLunch,
        score: 10,
        tag: "Best match",
      },
      {
        name: "Thermosteel 500 ml Flask",
        img: IMAGES.thermosteel500,
        score: 4,
        tag: "Drink only",
      },
      {
        name: "Treo Glass Tiffin",
        img: IMAGES.treoGlass,
        score: 7,
        tag: "Healthy glass",
      },
    ],
  },
  {
    id: "teacher",
    title: "Mr. Khanna – School Teacher",
    desc: "He often shares snacks with colleagues and serves chai in the staff room.",
    options: [
      {
        name: "Large Insulated Steel Tiffin",
        img: IMAGES.steelOn,
        score: 8,
        tag: "Good capacity",
      },
      {
        name: "Thermosteel Carafe",
        img: IMAGES.carafe,
        score: 10,
        tag: "Perfect for chai rounds",
      },
      {
        name: "Pro Lunch Set",
        img: IMAGES.proLunch,
        score: 6,
        tag: "Decent, but smaller",
      },
    ],
  },
  {
    id: "business",
    title: "Vikram – Business Traveler",
    desc: "Moves between meetings, wants professional-looking lunch gear and hot coffee.",
    options: [
      {
        name: "Executive / Pro Lunch Set",
        img: IMAGES.proLunch,
        score: 9,
        tag: "Professional look",
      },
      {
        name: "Thermosteel 500 ml Flask",
        img: IMAGES.thermosteel500,
        score: 8,
        tag: "Keeps coffee hot",
      },
      {
        name: "Insulated Casserole",
        img: IMAGES.carafe,
        score: 6,
        tag: "More for serving",
      },
    ],
  },
  {
    id: "traveler",
    title: "Sara – Road Trip Traveler",
    desc: "Weekend drives and picnics; food & drinks should stay fresh and spill-proof.",
    options: [
      {
        name: "Casserole + Thermosteel Carafe combo",
        img: IMAGES.carafe,
        score: 10,
        tag: "Perfect picnic set",
      },
      {
        name: "Thermosteel 500 ml Flask",
        img: IMAGES.thermosteel500,
        score: 7,
        tag: "Ideal for hot beverages",
      },
      {
        name: "Treo Glass Tiffin",
        img: IMAGES.treoGlass,
        score: 5,
        tag: "Good but fragile for travel",
      },
    ],
  },
  {
    id: "gym",
    title: "Aditya – Gym-Goer",
    desc: "Needs cold water or shakes during workout and a healthy post-workout meal.",
    options: [
      {
        name: "Thermosteel Bottle",
        img: IMAGES.thermosteel500,
        score: 9,
        tag: "Keeps drinks cold",
      },
      {
        name: "Treo Glass Meal Box",
        img: IMAGES.treoGlass,
        score: 7,
        tag: "Great for meals",
      },
      {
        name: "Pro Lunch Set",
        img: IMAGES.proLunch,
        score: 5,
        tag: "More than needed",
      },
    ],
  },
  {
    id: "host",
    title: "Leena – Home Host",
    desc: "Loves hosting friends and family, serving hot dishes and endless chai.",
    options: [
      {
        name: "Thermosteel Carafe",
        img: IMAGES.carafe,
        score: 9,
        tag: "Keeps chai flowing",
      },
      {
        name: "Insulated Casserole",
        img: IMAGES.carafe,
        score: 10,
        tag: "Keeps dishes hot",
      },
      {
        name: "Treo Glass Tiffin",
        img: IMAGES.treoGlass,
        score: 5,
        tag: "More for individuals",
      },
    ],
  },
];

// State
let currentIndex = 0;
let totalScore = 0;

// DOM refs
const landingSection = document.querySelector(".landing");
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

// Audio (simple WebAudio tones)
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioCtx();

function playTone(freq, dur = 0.08, type = "sine", gain = 0.12) {
  if (audioCtx.state === "suspended") audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(g);
  g.connect(audioCtx.destination);
  g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(gain, audioCtx.currentTime + 0.01);
  osc.start();
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
  osc.stop(audioCtx.currentTime + dur + 0.02);
}

function clickSound() {
  playTone(720, 0.06, "triangle", 0.08);
}

function successSound() {
  playTone(880, 0.12, "sine", 0.1);
  setTimeout(() => playTone(1320, 0.08, "sine", 0.08), 110);
}

// Animations
function animatePoints(from, to) {
  const start = performance.now();
  const duration = 500;
  function step(now) {
    const t = Math.min(1, (now - start) / duration);
    const value = Math.round(from + (to - from) * t);
    pointsEl.textContent = value;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Floating +points badge
function showPointsBadge(btn, points) {
  const rect = btn.getBoundingClientRect();
  const badge = document.createElement("div");
  badge.className = "points-badge";
  badge.textContent = `+${points}`;
  badge.style.left = rect.left + rect.width / 2 + "px";
  badge.style.top = rect.top + window.scrollY + "px";
  document.body.appendChild(badge);
  setTimeout(() => badge.remove(), 700);
}

// Render scenario
function renderScenario(i) {
  const s = scenarios[i];

  scenarioTitle.textContent = s.title;
  scenarioDesc.textContent = s.desc;

  // Initial preview = first option
  const first = s.options[0];
  visualImg.src = first.img;
  visualImg.alt = first.name;
  visualCaption.textContent = first.name;

  choicesEl.innerHTML = "";

  s.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice fade-up";
    btn.setAttribute("role", "listitem");
    btn.innerHTML = `
      <img src="${opt.img}" alt="${opt.name}">
      <div class="meta">
        <b>${opt.name}</b>
        <small>${opt.tag || ""}</small>
      </div>
    `;

    btn.addEventListener("click", () => selectOption(opt, btn));
    btn.addEventListener("mouseenter", () => updatePreview(opt));
    btn.addEventListener("focus", () => updatePreview(opt));

    choicesEl.appendChild(btn);
  });
}

function updatePreview(opt) {
  visualImg.src = opt.img;
  visualImg.alt = opt.name;
  visualCaption.textContent = opt.name;
  visualImg.animate(
    [{ transform: "translateY(6px)" }, { transform: "translateY(0)" }],
    { duration: 320, easing: "cubic-bezier(0.2, 0.9, 0.3, 1)" }
  );
}

function selectOption(opt, btn) {
  clickSound();
  showPointsBadge(btn, opt.score);

  btn.animate(
    [{ transform: "scale(1)" }, { transform: "scale(0.97)" }, { transform: "scale(1)" }],
    { duration: 220 }
  );

  const oldScore = totalScore;
  totalScore += opt.score;
  animatePoints(oldScore, totalScore);

  setTimeout(() => {
    if (currentIndex < scenarios.length - 1) {
      currentIndex++;
      renderScenario(currentIndex);
    } else {
      showResult();
    }
  }, 420);
}

function showResult() {
  successSound();

  let profile = "Quick Fixer";
  if (totalScore >= 60) profile = "The Smart Planner";
  else if (totalScore >= 45) profile = "The Freshness Lover";
  else if (totalScore >= 30) profile = "The Practical Chooser";

  ptypeEl.textContent = profile;
  resultSummary.textContent = `You scored ${totalScore} Freshness Points across ${scenarios.length} scenarios. Your Milton Moments profile is: ${profile}. Share this result with #MiltonMoments!`;

  resultCard.classList.remove("hidden");
  resultCard.classList.add("fade-up");
}

// Local coupon generator (static, no backend)
function generateLocalCoupon() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `MILTON-${code}`;
}

function handleCouponClick() {
  clickSound();
  const coupon = generateLocalCoupon();
  navigator.clipboard.writeText(coupon).catch(() => {});

  alert(
    `🎉 Your coupon is: ${coupon}\n\nIt's been copied to your clipboard. Use this in the campaign / mock checkout!`
  );
}

// Sharing
function handleShareClick() {
  clickSound();
  const profile = ptypeEl.textContent || "Smart Lunch Lover";
  const text = `I just played the Milton Moments Smart Lunch Story Game and my profile is "${profile}" with ${totalScore} Freshness Points! #MiltonMoments`;

  if (navigator.share) {
    navigator
      .share({
        title: "My Milton Moments Result",
        text,
        url: window.location.href,
      })
      .catch(() => {});
  } else {
    navigator.clipboard
      .writeText(text)
      .then(() => alert("Result text copied! Paste it on your favourite social platform."))
      .catch(() => alert("Copy failed. You can share manually."));
  }
}

// Game lifecycle
function resetGame() {
  totalScore = 0;
  currentIndex = 0;
  animatePoints(0, 0);
  ptypeEl.textContent = "—";
  resultCard.classList.add("hidden");
  renderScenario(0);
}

function showPreloaderThenGame() {
  preloader.classList.remove("hidden");
  preloader.setAttribute("aria-hidden", "false");

  setTimeout(() => {
    preloader.classList.add("hidden");
    preloader.setAttribute("aria-hidden", "true");
    landingSection.classList.add("hidden");
    gamePanel.classList.remove("hidden");
    gamePanel.classList.add("fade-up");
    resetGame();
    gamePanel.scrollIntoView({ behavior: "smooth" });
  }, 900);
}

// Event bindings
startGameBtn.addEventListener("click", () => {
  clickSound();
  showPreloaderThenGame();
});

replayBtn.addEventListener("click", () => {
  clickSound();
  window.scrollTo({ top: 0, behavior: "smooth" });
  landingSection.classList.remove("hidden");
  gamePanel.classList.add("hidden");
  resultCard.classList.add("hidden");
  totalScore = 0;
  pointsEl.textContent = "0";
  ptypeEl.textContent = "—";
});

couponBtn.addEventListener("click", handleCouponClick);
shareBtn.addEventListener("click", handleShareClick);

// Initial render (games stays hidden until Start)
renderScenario(0);

// Preload images for smoother UX
Object.values(IMAGES).forEach((src) => {
  const img = new Image();
  img.src = src;
});

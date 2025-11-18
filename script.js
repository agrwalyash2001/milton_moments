/* script.js — new game engine, transitions, preloader, and audio
   - Hides landing and shows game on Start
   - Smooth transitions, hover previews, WebAudio tones
   - Scenario engine supports many characters
   - Coupon request uses /api/generate-coupon
*/

// Images (defaults). Replace with local /images paths if desired.
const IMAGES = {
  proLunch: 'https://images.openai.com/static-rsc-1/mPVNbio4RoWX844BDdYfnReMLL9JlETRjt63HUfrPlM24UVSx_yjeqZ0Kl-2_wxVrj6u8uXF1NM4BGPRM5ans3wG9_d-bKsochIjbkuiVA5Xhx3r7abeNAMuP_5wy4_W1Qbmi8riC4vJAof6toAUeA',
  steelOn: 'https://images.openai.com/static-rsc-1/Xig86_5BuTLRQxhI4BH2Ss8b-pZQJlKPVRqqOrFRfI-OvwmNTO58QSFHUaUJnUBwCA8FPMniUfivjeviGnim8VIk1qRahgxC7IjaYqSYw9mimbaGEW2N0r9DQ0WH-fRdhplxiTTZoc1ZqFzkdaPcRA',
  treoGlass: 'https://images.openai.com/static-rsc-1/jvcWROYi7vzPluuwtfTBBHohypc2SJY3dN7W8ksi7ZGOeMqVYnxlBXGOgS-TxO4jDnWOOvLFVMybYymvJBHbnUYXC7yHkHU3E2s2v6dCujHt0HE44_4B-y5WrA8oVUf7tB7WFcK05RP6SjVlKKh4TA',
  thermosteel500: 'https://images.openai.com/static-rsc-1/LtM7Irdh3ClsWliw6z2V_mLloLdqWGnYBqwDbyRaKgDXw3RU-D6pL2B9kiH5L3qY8NMKw4pZ2BeOJiV4Y1eKS2y9WTp_XdrtVIHVtC-22GWOGyjJVMX23FePv3imNR4QkglF_tc1HBJfWEx-8j-LwQ',
  carafe: 'https://images.openai.com/static-rsc-1/0qF-LCKfhxEJWmPL_9ExeAPYKiT0xnqV71-2LwjJTBBosd2mL6h-J9ED_mWbguebnYYdhZPai6tHaCVjwV4FBI6D_MmWMO2TuIkhjdW_e6p5J-e9YOLNr4SSByFniSGq2oERvLr2TpRb2SOJyPiR_g'
};

const scenarios = [
  {id:'student',title:'Riya — College Student',desc:'Long campus days; needs multi-compartment + bottle',options:[
    {name:'Pro Lunch Set',img:IMAGES.proLunch,score:10},
    {name:'Thermosteel 500ml',img:IMAGES.thermosteel500,score:4},
    {name:'Treo Glass',img:IMAGES.treoGlass,score:6}
  ]},
  {id:'teacher',title:'Mr. Khanna — Teacher',desc:'Shares food; needs capacity',options:[
    {name:'Large Steel Tiffin',img:IMAGES.steelOn,score:8},
    {name:'Thermosteel Carafe',img:IMAGES.carafe,score:10},
    {name:'Pro Lunch Set',img:IMAGES.proLunch,score:5}
  ]},
  {id:'business',title:'Vikram — Business Traveler',desc:'Professional look; reheating possible',options:[
    {name:'Executive Lunch Set',img:IMAGES.proLunch,score:9},
    {name:'Thermosteel Flask 500ml',img:IMAGES.thermosteel500,score:8},
    {name:'Insulated Casserole',img:IMAGES.carafe,score:6}
  ]},
  {id:'traveler',title:'Sara — Traveler',desc:'Road trips; needs durability',options:[
    {name:'Casserole + Carafe',img:IMAGES.carafe,score:10},
    {name:'Thermosteel Flask',img:IMAGES.thermosteel500,score:7},
    {name:'Glass Treo',img:IMAGES.treoGlass,score:5}
  ]},
  {id:'gym',title:'Aditya — Gym-Goer',desc:'Cold shakes and protein meals',options:[
    {name:'Duo Bottle',img:IMAGES.thermosteel500,score:8},
    {name:'Glass Treo (meal)',img:IMAGES.treoGlass,score:6},
    {name:'Pro Lunch Set',img:IMAGES.proLunch,score:4}
  ]}
];

// State
let current = 0, totalScore = 0;
// DOM
const startBtn = document.getElementById('startGameBtn');
const landing = document.querySelector('.landing');
const gamePanel = document.getElementById('gamePanel');
const scenarioTitle = document.getElementById('scenarioTitle');
const scenarioDesc = document.getElementById('scenarioDesc');
const choicesEl = document.getElementById('choices');
const visualImg = document.getElementById('visualImg');
const pointsEl = document.getElementById('points');
const ptypeEl = document.getElementById('ptype');
const resultCard = document.getElementById('resultCard');
const resultSummary = document.getElementById('resultSummary');
const replayBtn = document.getElementById('replayBtn');
const couponBtn = document.getElementById('couponBtn');

// Preloader (tiny)
function showPreloader(){
  const pre = document.createElement('div'); pre.className='preloader';
  pre.innerHTML = `<div class="loader"><img src="images/milton-logo.png" style="height:48px;margin-bottom:8px"/><div style="display:flex"><div class="dot"></div><div class="dot" style="animation-delay:.12s"></div><div class="dot" style="animation-delay:.24s"></div></div></div>`;
  document.body.appendChild(pre);
  setTimeout(()=>{ pre.classList.add('fade'); setTimeout(()=>pre.remove(),600); },700);
}

// Audio
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioCtx();
function tone(freq,dur=0.08,type='sine'){ if(audioCtx.state==='suspended') audioCtx.resume(); const o=audioCtx.createOscillator(), g=audioCtx.createGain(); o.type=type; o.frequency.value=freq; o.connect(g); g.connect(audioCtx.destination); g.gain.setValueAtTime(0.0001,audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.12,audioCtx.currentTime+0.01); o.start(); g.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime+dur); o.stop(audioCtx.currentTime+dur+0.02); }
function clickSound(){ tone(720,0.06,'triangle'); }
function successSound(){ tone(860,0.12,'sine'); setTimeout(()=>tone(1320,0.06,'sine'),120); }

// Helpers
function animatePoints(from,to){ const start=performance.now(); const dur=500; function step(now){ const t=Math.min(1,(now-start)/dur); const v=Math.round(from+(to-from)*t); pointsEl.textContent=v; if(t<1) requestAnimationFrame(step); } requestAnimationFrame(step); }

function renderScenario(i){ const s=scenarios[i]; scenarioTitle.textContent=s.title; scenarioDesc.textContent=s.desc; visualImg.src=s.options[0].img; choicesEl.innerHTML=''; s.options.forEach((opt, idx)=>{ const btn=document.createElement('button'); btn.className='choice fade-up'; btn.innerHTML=`<img src="${opt.img}" alt="${opt.name}"><div class="meta"><b>${opt.name}</b><small></small></div>`; btn.onclick=()=>selectOption(opt,btn); btn.onmouseover=()=>{ visualImg.src=opt.img; visualImg.animate([{transform:'translateY(8px)'},{transform:'translateY(0)'}],{duration:420,easing:'cubic-bezier(.2,.9,.3,1)'}); }; choicesEl.appendChild(btn); }); }

function selectOption(opt,btn){ clickSound(); btn.animate([{transform:'scale(1)'},{transform:'scale(0.98)'},{transform:'scale(1)'}],{duration:220}); const old=totalScore; totalScore += opt.score; animatePoints(old,totalScore); setTimeout(()=>successSound(),140); current++; if(current < scenarios.length) setTimeout(()=>renderScenario(current),420); else setTimeout(()=>showResult(),420); }

function showResult(){ let p='Quick Fixer'; if(totalScore>=40) p='The Smart Planner'; else if(totalScore>=30) p='The Freshness Lover'; else if(totalScore>=20) p='The Practical Chooser'; ptypeEl.textContent=p; resultSummary.textContent = `You scored ${totalScore} points across ${scenarios.length} scenarios. Profile: ${p}.`; resultCard.classList.remove('hidden'); resultCard.classList.add('fade-up'); successSound(); }

function resetGame(){ current=0; totalScore=0; animatePoints(0,0); ptypeEl.textContent='—'; resultCard.classList.add('hidden'); renderScenario(0); }

// --- Local coupon generator (no server needed) ---
function generateLocalCoupon() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += letters[Math.floor(Math.random() * letters.length)];
  }
  return `MILTON-${code}`;
}

function requestCoupon() {
  clickSound();

  const coupon = generateLocalCoupon();
  navigator.clipboard.writeText(coupon).catch(() => {});

  alert(
    "🎉 Your coupon is: " +
      coupon +
      "\n\nIt has been copied to your clipboard!"
  );
}

// Bindings
startBtn.addEventListener('click',()=>{ clickSound(); showPreloader(); setTimeout(()=>{ landing.classList.add('hidden'); gamePanel.classList.remove('hidden'); gamePanel.classList.add('fade-up'); resetGame(); gamePanel.scrollIntoView({behavior:'smooth'}); },900); });
replayBtn.addEventListener('click',()=>{ clickSound(); resetGame(); window.scrollTo({top:0,behavior:'smooth'}); });
document.getElementById("couponBtn").addEventListener("click", () => {
    clickSound();
    requestCoupon();   // <-- Local coupon generator
});

// Init
renderScenario(0);

// preload images
Object.values(IMAGES).forEach(u=>{ const i=new Image(); i.src = u; });

/* end script.js */

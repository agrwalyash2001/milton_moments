/* script.js — game logic, animations, sounds, coupon flow */

// --- Config / images (default public images; replace with your own in /images) ---
const IMAGES = {
  proLunch: 'https://images.openai.com/static-rsc-1/mPVNbio4RoWX844BDdYfnReMLL9JlETRjt63HUfrPlM24UVSx_yjeqZ0Kl-2_wxVrj6u8uXF1NM4BGPRM5ans3wG9_d-bKsochIjbkuiVA5Xhx3r7abeNAMuP_5wy4_W1Qbmi8riC4vJAof6toAUeA',
  steelOn: 'https://images.openai.com/static-rsc-1/Xig86_5BuTLRQxhI4BH2Ss8b-pZQJlKPVRqqOrFRfI-OvwmNTO58QSFHUaUJnUBwCA8FPMniUfivjeviGnim8VIk1qRahgxC7IjaYqSYw9mimbaGEW2N0r9DQ0WH-fRdhplxiTTZoc1ZqFzkdaPcRA',
  treoGlass: 'https://images.openai.com/static-rsc-1/jvcWROYi7vzPluuwtfTBBHohypc2SJY3dN7W8ksi7ZGOeMqVYnxlBXGOgS-TxO4jDnWOOvLFVMybYymvJBHbnUYXC7yHkHU3E2s2v6dCujHt0HE44_4B-y5WrA8oVUf7tB7WFcK05RP6SjVlKKh4TA',
  thermosteel500: 'https://images.openai.com/static-rsc-1/LtM7Irdh3ClsWliw6z2V_mLloLdqWGnYBqwDbyRaKgDXw3RU-D6pL2B9kiH5L3qY8NMKw4pZ2BeOJiV4Y1eKS2y9WTp_XdrtVIHVtC-22GWOGyjJVMX23FePv3imNR4QkglF_tc1HBJfWEx-8j-LwQ',
  carafe: 'https://images.openai.com/static-rsc-1/0qF-LCKfhxEJWmPL_9ExeAPYKiT0xnqV71-2LwjJTBBosd2mL6h-J9ED_mWbguebnYYdhZPai6tHaCVjwV4FBI6D_MmWMO2TuIkhjdW_e6p5J-e9YOLNr4SSByFniSGq2oERvLr2TpRb2SOJyPiR_g'
};

// --- Expanded scenarios (more characters) ---
const scenarios = [
  {id:'student',title:'Riya — College Student',desc:'Long campus days; needs multi-compartment + bottle',options:[
    {name:'Pro Lunch Set',img:IMAGES.proLunch,score:10,tag:'Best'},
    {name:'Thermosteel 500ml',img:IMAGES.thermosteel500,score:4,tag:'Drink'},
    {name:'Treo Glass',img:IMAGES.treoGlass,score:6,tag:'Microwave'}
  ]},
  {id:'schoolkid',title:'Arjun — School Student',desc:'Light, spill-proof & easy to open',options:[
    {name:'Arista Lunch Box (compact)',img:IMAGES.proLunch,score:8},
    {name:'Plastic box (generic)',img:IMAGES.treoGlass,score:2},
    {name:'Thermosteel 350ml',img:IMAGES.thermosteel500,score:4}
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
  ]},
  {id:'host',title:'Leena — Home Host',desc:'Entertains guests; serves hot beverages & warm dishes',options:[
    {name:'Thermosteel Carafe',img:IMAGES.carafe,score:9},
    {name:'Insulated Casserole',img:IMAGES.carafe,score:8},
    {name:'Glass Treo',img:IMAGES.treoGlass,score:5}
  ]},
  {id:'caterer',title:'Rahul — Small Caterer',desc:'Transports food for events',options:[
    {name:'Insulated Casserole (pro)',img:IMAGES.carafe,score:10},
    {name:'Large Steel Tiffin',img:IMAGES.steelOn,score:7},
    {name:'Pro Lunch Set',img:IMAGES.proLunch,score:4}
  ]}
];

// --- State ---
let current = 0, totalScore = 0;
const pointsEl = document.getElementById('points');
const ptypeEl = document.getElementById('ptype');
const scenarioTitle = document.getElementById('scenarioTitle');
const scenarioDesc = document.getElementById('scenarioDesc');
const choicesEl = document.getElementById('choices');
const visualImg = document.getElementById('visualImg');
const resultCard = document.getElementById('resultCard');
const resultSummary = document.getElementById('resultSummary');

// --- Audio (improved) ---
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioCtx();
let ambientOsc=null, soundEnabled=true;
function playClick(){ if(!soundEnabled) return; const o=audioCtx.createOscillator(); const g=audioCtx.createGain(); o.type='triangle'; o.frequency.value=720; o.connect(g); g.connect(audioCtx.destination); g.gain.setValueAtTime(0.0001,audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.08,audioCtx.currentTime+0.01); o.start(); g.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime+0.08); o.stop(audioCtx.currentTime+0.09); }
function playSuccess(){ if(!soundEnabled) return; const o=audioCtx.createOscillator(); o.type='sine'; o.frequency.value=920; const g=audioCtx.createGain(); o.connect(g); g.connect(audioCtx.destination); g.gain.setValueAtTime(0.0001,audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.14,audioCtx.currentTime+0.01); o.start(); setTimeout(()=>{o.frequency.setValueAtTime(1320,audioCtx.currentTime);},80); setTimeout(()=>{g.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime+0.25); o.stop(audioCtx.currentTime+0.26);},260); }
function toggleAmbient(){ if(!soundEnabled) return; if(ambientOsc){ ambientOsc.stop(); ambientOsc=null; } else { ambientOsc = audioCtx.createOscillator(); ambientOsc.type='sine'; ambientOsc.frequency.value=220; const g=audioCtx.createGain(); g.gain.value=0.02; ambientOsc.connect(g); g.connect(audioCtx.destination); ambientOsc.start(); } }

// --- Helpers ---
function animatePoints(from,to){ const start=performance.now(),dur=600; function step(now){ const t=Math.min(1,(now-start)/dur); const v=Math.round(from+(to-from)*t); pointsEl.textContent=v; if(t<1) requestAnimationFrame(step); } requestAnimationFrame(step); }

function renderScenario(i){ const s=scenarios[i]; scenarioTitle.textContent=s.title; scenarioDesc.textContent=s.desc; visualImg.src=s.options[0].img; choicesEl.innerHTML=''; s.options.forEach((opt, idx)=>{
  const btn=document.createElement('button'); btn.className='choice'; btn.innerHTML=`<img src="${opt.img}" alt="${opt.name}"><div class="meta"><b>${opt.name}</b><small>${opt.tag||''}</small></div>`;
  btn.onclick=()=> selectOption(opt,btn); btn.onmouseover=()=>{ visualImg.src=opt.img; }; choicesEl.appendChild(btn);
}); }

function selectOption(opt, btn){ // ensure audio unlocked
  if(audioCtx.state==='suspended') audioCtx.resume(); playClick();
  btn.animate([{transform:'scale(1)'},{transform:'scale(0.98)'},{transform:'scale(1)'}],{duration:240,easing:'cubic-bezier(.2,.9,.3,1)'});
  const old=totalScore; totalScore+=opt.score; animatePoints(old,totalScore);
  setTimeout(()=>{ playSuccess(); },120);
  // go to next scenario after short delay
  current++; if(current < scenarios.length){ setTimeout(()=>renderScenario(current),420); } else { setTimeout(()=>showResult(),420); }
}

function showResult(){ // personality mapping
  let p='Quick Fixer'; if(totalScore>=70) p='The Smart Planner'; else if(totalScore>=50) p='The Freshness Lover'; else if(totalScore>=30) p='The Practical Chooser'; ptypeEl.textContent=p; resultSummary.textContent=`You scored ${totalScore} points across ${scenarios.length} scenarios. Profile: ${p}.`;
  resultCard.classList.remove('hidden'); playSuccess(); }

function resetGame(){ current=0; totalScore=0; animatePoints(0,0); ptypeEl.textContent='—'; resultCard.classList.add('hidden'); renderScenario(0); }

// --- Coupon backend flow ---
async function requestCoupon(){ // POST to backend endpoint /api/generate-coupon
  try{
    const resp = await fetch('/api/generate-coupon',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({score:totalScore,profile:ptypeEl.textContent})});
    if(!resp.ok) throw new Error('Server error');
    const data = await resp.json();
    if(data && data.coupon){ alert('Your coupon: '+data.coupon + '\nIt is also copied to clipboard.'); navigator.clipboard.writeText(data.coupon).catch(()=>{});
    } else { alert('Could not get coupon. Try again later.'); }
  } catch(err){ console.error(err); alert('Network/server error while requesting coupon.'); }
}

// --- Preloader & bindings ---
window.addEventListener('load',()=>{
  const pre=document.getElementById('preloader'); setTimeout(()=>{ pre.classList.add('fadeOut'); pre.style.display='none'; },700);
});

// buttons
document.getElementById('startBtnHero').addEventListener('click',()=>{ if(audioCtx.state==='suspended') audioCtx.resume(); resetGame(); document.getElementById('gamePanel').scrollIntoView({behavior:'smooth'}); });
document.getElementById('replayBtn').addEventListener('click',()=>{ resetGame(); });
document.getElementById('couponBtn').addEventListener('click',()=>{ requestCoupon(); });
document.getElementById('soundToggle').addEventListener('change',(e)=>{ soundEnabled = e.target.checked; if(!soundEnabled && ambientOsc){ ambientOsc.stop(); ambientOsc=null; }});
document.getElementById('muteBtn').addEventListener('click',()=>{ if(audioCtx.state==='suspended') audioCtx.resume(); toggleAmbient(); });

// nav: previous / next
const prevBtn = document.getElementById('prevBtn'); const nextBtn = document.getElementById('nextBtn');
prevBtn.addEventListener('click',()=>{ playClick(); current = Math.max(0,current-1); renderScenario(current); });
nextBtn.addEventListener('click',()=>{ playClick(); current = Math.min(scenarios.length-1,current+1); renderScenario(current); });

// share (simple)
document.getElementById('shareBtn').addEventListener('click',()=>{ const text=`I scored ${totalScore} on Milton Moments! #MiltonMoments`; if(navigator.share){ navigator.share({title:'Milton Moments',text}); } else { navigator.clipboard.writeText(text).then(()=>alert('Result copied to clipboard — paste on social to share.')); }});

// preload images
Object.values(IMAGES).forEach(u=>{ const i=new Image(); i.src=u; });

// initial render
renderScenario(0);

/* End of script.js */

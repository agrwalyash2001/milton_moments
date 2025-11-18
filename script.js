/* JS extracted from original dynamic version */

const IMAGES = {
  proLunch:"images/pro_lunch.png",
  steelOn:"images/steel_on.png",
  treoGlass:"images/treo_glass.png",
  thermosteel500:"images/flask500.png",
  carafe:"images/carafe.png"
};

const scenarios=[
  {
    title:"Riya the College Student — needs a multi-compartment lunch",
    description:"Riya wants her food fresh and leak-proof for long campus hours.",
    options:[
      {name:"Milton Pro Lunch Set",img:IMAGES.proLunch,score:10},
      {name:"Thermosteel 500ml Flask",img:IMAGES.thermosteel500,score:4},
      {name:"Glass Treo Container",img:IMAGES.treoGlass,score:6}
    ]
  },
  {
    title:"Mr. Khanna the Teacher — shares food and hot beverages",
    description:"He prefers large capacity and serving options.",
    options:[
      {name:"Large Steel Tiffin",img:IMAGES.steelOn,score:8},
      {name:"Thermosteel Carafe",img:IMAGES.carafe,score:10},
      {name:"Pro Lunch Set",img:IMAGES.proLunch,score:5}
    ]
  }
];

let idx=0,totalScore=0;

const startBtn=document.getElementById("startBtn");
const replayBtn=document.getElementById("replayBtn");
const scenarioTitle=document.getElementById("scenarioTitle");
const scenarioDesc=document.getElementById("scenarioDesc");
const visualImg=document.getElementById("visualImg");
const choicesWrap=document.getElementById("choices");
const resultCard=document.getElementById("resultCard");
const resultSummary=document.getElementById("resultSummary");
const pointsEl=document.getElementById("points");
const ptypeEl=document.getElementById("ptype");

function loadScenario(i){
  const s=scenarios[i];
  scenarioTitle.textContent=s.title;
  scenarioDesc.textContent=s.description;
  visualImg.src=s.options[0].img;
  choicesWrap.innerHTML="";

  s.options.forEach(opt=>{
    const btn=document.createElement("button");
    btn.className="choice fade-in";
    btn.innerHTML=`<img src="${opt.img}"><div><b>${opt.name}</b></div>`;
    btn.onclick=()=>selectOption(opt);
    btn.onmouseover=()=>visualImg.src=opt.img;
    choicesWrap.appendChild(btn);
  });
}

function selectOption(opt){
  totalScore+=opt.score;
  pointsEl.textContent=totalScore;
  idx++;
  if(idx<scenarios.length){loadScenario(idx);}else{endGame();}
}

function endGame(){
  let type="Quick Fixer";
  if(totalScore>=20) type="Smart Planner";
  else if(totalScore>=14) type="Freshness Lover";
  ptypeEl.textContent=type;
  resultSummary.textContent=`You scored ${totalScore}. Personality: ${type}.`;
  resultCard.classList.remove("hidden");
}

function resetGame(){idx=0;totalScore=0;pointsEl.textContent=0;ptypeEl.textContent="—";resultCard.classList.add("hidden");loadScenario(0);}

startBtn.onclick=resetGame;
replayBtn.onclick=resetGame;

loadScenario(0);

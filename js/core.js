// FoodTrack frontend prototype. Backend integration will be added in the next phase.

// ───── DB (localStorage) ─────
const DB={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};

// ───── Helpers ─────
const $ = id => document.getElementById(id);
const D = n => { const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().split('T')[0]; };
let chartInstances={};

function daysLeft(exp){
  const ms=new Date(exp).setHours(0,0,0,0)-new Date().setHours(0,0,0,0);
  return Math.ceil(ms/(864e5));
}
function badge(exp){
  const d=daysLeft(exp);
  if(d<0) return `<span class="badge b-expired">🔴 Expired</span>`;
  if(d===0) return `<span class="badge b-critical">🟠 Expires Today</span>`;
  if(d<=3) return `<span class="badge b-critical">🟠 ${d}d left</span>`;
  if(d<=7) return `<span class="badge b-warn">🟡 ${d}d left</span>`;
  return `<span class="badge b-fresh">🟢 ${d}d left</span>`;
}
function toast(msg,ok=true){
  const t=$('toast'); t.textContent=msg;
  t.style.background=ok?'#16a34a':'#dc2626';
  t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2500);
}
function fmt(d){if(!d)return '-'; const[y,m,dd]=d.split('-'); return `${dd}/${m}/${y}`;}
function id(){return Date.now()+''+Math.floor(Math.random()*1000);}

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
function svgIcon(name){
  const paths={
    package:'<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4.3 7.6 7.7 4.3 7.7-4.3M12 12v9m-4-16.7 8 4.5"/>',
    alert:'<path d="M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 4h.01"/>',
    waste:'<path d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3"/>',
    money:'<path d="M12 2v20m5-15H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8m-8 4h8"/>',
    pin:'<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 2.8a2 2 0 0 1-.6 1.8L7.7 9.6a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 1.8-.6l2.8.5a2 2 0 0 1 1.7 2Z"/>',
    heart:'<path d="M20.8 8.6c0 5.3-8.8 11-8.8 11s-8.8-5.7-8.8-11A4.6 4.6 0 0 1 12 6.4a4.6 4.6 0 0 1 8.8 2.2Z"/>',
    check:'<path d="m5 12 4 4L19 6"/>'
  };
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.package}</svg>`;
}
function badge(exp){
  const d=daysLeft(exp);
  if(d<0) return `<span class="badge b-expired">Expired</span>`;
  if(d===0) return `<span class="badge b-critical">Expires Today</span>`;
  if(d<=3) return `<span class="badge b-critical">${d}d left</span>`;
  if(d<=7) return `<span class="badge b-warn">${d}d left</span>`;
  return `<span class="badge b-fresh">${d}d left</span>`;
}
function toast(msg,ok=true){
  const t=$('toast'); t.textContent=msg;
  t.style.background=ok?'#16a34a':'#dc2626';
  t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2500);
}
function fmt(d){if(!d)return '-'; const[y,m,dd]=d.split('-'); return `${dd}/${m}/${y}`;}
function id(){return Date.now()+''+Math.floor(Math.random()*1000);}

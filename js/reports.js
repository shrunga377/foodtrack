// FoodTrack frontend prototype. Backend integration will be added in the next phase.

// ───── Reports ─────
function renderReports(){
  const waste=DB.get('waste_log',[]);
  const catMap={};waste.forEach(w=>{catMap[w.cat]=(catMap[w.cat]||0)+Number(w.cost||0)});
  const cats=Object.keys(catMap), vals=cats.map(c=>catMap[c]);

  const monthMap={};
  waste.forEach(w=>{if(!w.date)return; const m=w.date.slice(0,7); monthMap[m]=(monthMap[m]||0)+Number(w.cost||0)});
  const months=Object.keys(monthMap).sort(), mVals=months.map(m=>monthMap[m]);

  $('page').innerHTML=`
  <h2 style="font-size:22px;font-weight:700;margin:0 0 24px">Waste Reports</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px">
    <div class="card">
      <h3 style="font-size:15px;font-weight:600;margin:0 0 16px">Waste Cost by Category (₹)</h3>
      <canvas id="cat-chart" height="230"></canvas>
    </div>
    <div class="card">
      <h3 style="font-size:15px;font-weight:600;margin:0 0 16px">Monthly Waste Trend (₹)</h3>
      <canvas id="month-chart" height="230"></canvas>
    </div>
  </div>
  <div class="card" style="margin-top:20px">
    <h3 style="font-size:15px;font-weight:600;margin:0 0 16px">Waste Summary by Category</h3>
    <table>
      <thead><tr><th>Category</th><th>Total Cost (₹)</th><th>% of Total</th></tr></thead>
      <tbody>
        ${cats.length===0?'<tr><td colspan="3" class="empty">No waste data yet.</td></tr>':
          cats.sort((a,b)=>catMap[b]-catMap[a]).map(c=>{
            const total=vals.reduce((s,v)=>s+v,0);
            const pct=total?Math.round(catMap[c]/total*100):0;
            return `<tr><td>${c}</td><td style="font-weight:600">₹${catMap[c]}</td><td><div style="display:flex;align-items:center;gap:8px"><div style="height:8px;width:${pct*1.5}px;background:#16a34a;border-radius:4px;min-width:4px"></div>${pct}%</div></td></tr>`
          }).join('')}
      </tbody>
    </table>
  </div>`;

  setTimeout(()=>{
    const mode=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
    const gc=mode==='dark'?'rgba(255,255,255,.12)':'rgba(0,0,0,.08)';
    const tc=mode==='dark'?'#9ca3af':'#6b7280';
    const palette=['#16a34a','#15803d','#166534','#4ade80','#86efac','#bbf7d0','#059669','#047857'];

    if(cats.length){
      chartInstances.cat=new Chart($('cat-chart'),{type:'bar',data:{labels:cats,datasets:[{data:vals,backgroundColor:cats.map((_,i)=>palette[i%palette.length]),borderRadius:6}]},options:{plugins:{legend:{display:false}},scales:{x:{grid:{color:gc},ticks:{color:tc}},y:{grid:{color:gc},ticks:{color:tc,callback:v=>'₹'+v}}}}});
    }
    if(months.length){
      chartInstances.month=new Chart($('month-chart'),{type:'line',data:{labels:months,datasets:[{data:mVals,borderColor:'#16a34a',backgroundColor:'rgba(22,163,74,.1)',tension:.4,fill:true,pointBackgroundColor:'#16a34a'}]},options:{plugins:{legend:{display:false}},scales:{x:{grid:{color:gc},ticks:{color:tc}},y:{grid:{color:gc},ticks:{color:tc,callback:v=>'₹'+v}}}}});
    }
  },50);
}

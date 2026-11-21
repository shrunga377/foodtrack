// FoodTrack frontend prototype. Backend integration will be added in the next phase.

// ───── Dashboard ─────
function renderDashboard(){
  const items=DB.get('food_items',[]);
  const waste=DB.get('waste_log',[]);
  const expired=items.filter(i=>daysLeft(i.exp)<0).length;
  const critical=items.filter(i=>{const d=daysLeft(i.exp);return d>=0&&d<=3;}).length;
  const totalCost=waste.reduce((s,w)=>s+Number(w.cost||0),0);

  const sorted=[...items].sort((a,b)=>daysLeft(a.exp)-daysLeft(b.exp));

  $('page').innerHTML=`
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
    <div>
      <h2 style="font-size:22px;font-weight:700;margin:0">Dashboard</h2>
      <p style="color:var(--tx2);font-size:14px;margin:4px 0 0">${new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:16px;margin-bottom:28px">
    <div class="stat-card"><span style="font-size:28px">📦</span><span style="font-size:28px;font-weight:700">${items.length}</span><span style="font-size:13px;color:var(--tx2)">Total Items</span></div>
    <div class="stat-card"><span style="font-size:28px">🔴</span><span style="font-size:28px;font-weight:700;color:#dc2626">${expired}</span><span style="font-size:13px;color:var(--tx2)">Expired</span></div>
    <div class="stat-card"><span style="font-size:28px">⚠️</span><span style="font-size:28px;font-weight:700;color:#ea580c">${critical}</span><span style="font-size:13px;color:var(--tx2)">Expiring ≤3 Days</span></div>
    <div class="stat-card"><span style="font-size:28px">💸</span><span style="font-size:28px;font-weight:700;color:#dc2626">₹${totalCost}</span><span style="font-size:13px;color:var(--tx2)">Waste Cost (All Time)</span></div>
  </div>
  ${expired+critical>0?`<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 18px;margin-bottom:20px;font-size:14px;color:#991b1b;font-weight:500">⚠️ ${expired} item(s) expired and ${critical} expiring within 3 days — take action!</div>`:''}
  <div class="card">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <h3 style="font-size:16px;font-weight:600;margin:0">All Items — Sorted by Expiry</h3>
      <button class="btn-primary" style="font-size:13px;padding:7px 14px" onclick="nav('inventory')">+ Add Item</button>
    </div>
    <div style="overflow-x:auto">
    <table>
      <thead><tr><th>Item</th><th>Category</th><th>Qty</th><th>Expiry Date</th><th>Status</th></tr></thead>
      <tbody>
        ${sorted.map(i=>`<tr><td style="font-weight:500">${i.name}</td><td>${i.cat}</td><td>${i.qty} ${i.unit}</td><td>${fmt(i.exp)}</td><td>${badge(i.exp)}</td></tr>`).join('')}
        ${items.length===0?'<tr><td colspan="5" class="empty">No items yet. <a href="#" onclick="nav(\'inventory\')" style="color:#16a34a">Add some →</a></td></tr>':''}
      </tbody>
    </table>
    </div>
  </div>`;
}

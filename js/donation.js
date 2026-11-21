// FoodTrack frontend prototype. Backend integration will be added in the next phase.

// ───── Donation ─────
function renderDonation(){
  const items=DB.get('food_items',[]);
  const urgent=items.filter(i=>daysLeft(i.exp)>=0&&daysLeft(i.exp)<=1);
  const soon=items.filter(i=>{const d=daysLeft(i.exp);return d>1&&d<=3;});
  const NGOS=[
    {name:'Akshaya Patra Foundation',phone:'+91 80 3012 7777',desc:'Mid-day meals for 2M+ children daily',area:'Bengaluru'},
    {name:'Robin Hood Army',phone:'+91 97385 09080',desc:'Collects surplus food for the underprivileged',area:'Pan-India'},
    {name:'No Food Waste',phone:'+91 93601 00028',desc:'Connects surplus food donors with recipients',area:'Chennai/Bengaluru'},
    {name:'Bangalore Food Bank',phone:'+91 80 2217 5516',desc:'Distributes food to shelters and orphanages',area:'Bengaluru'},
  ];
  $('page').innerHTML=`
  <h2 style="font-size:22px;font-weight:700;margin:0 0 6px">Donation Alerts</h2>
  <p style="color:var(--tx2);font-size:14px;margin:0 0 24px">Food expiring soon that can be donated — reduce waste, feed someone.</p>
  ${urgent.length===0&&soon.length===0?`<div class="card" style="text-align:center;padding:40px"><p style="font-size:48px;margin:0">🎉</p><p style="font-weight:600;margin:12px 0 4px">No urgent donation alerts right now</p><p style="color:var(--tx2);font-size:14px">All items are well within their expiry window.</p></div>`:
  `<div class="card" style="margin-bottom:20px">
    ${urgent.length?`<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:14px 16px;margin-bottom:16px"><strong style="color:#9a3412">🚨 Expires Today / Tomorrow — Donate Immediately!</strong>
    <table style="margin-top:12px"><thead><tr><th>Item</th><th>Qty</th><th>Expires</th></tr></thead><tbody>${urgent.map(i=>`<tr><td style="font-weight:500">${i.name}</td><td>${i.qty} ${i.unit}</td><td>${badge(i.exp)}</td></tr>`).join('')}</tbody></table></div>`:''}
    ${soon.length?`<div><strong style="color:#92400e">⚠️ Expiring in 2–3 Days — Plan Donation Soon</strong>
    <table style="margin-top:12px"><thead><tr><th>Item</th><th>Qty</th><th>Expires</th></tr></thead><tbody>${soon.map(i=>`<tr><td style="font-weight:500">${i.name}</td><td>${i.qty} ${i.unit}</td><td>${badge(i.exp)}</td></tr>`).join('')}</tbody></table></div>`:''}</div>`}
  <div class="card">
    <h3 style="font-size:16px;font-weight:600;margin:0 0 16px">📋 NGO Contacts — Bengaluru & Pan-India</h3>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px">
      ${NGOS.map(n=>`<div style="border:1px solid var(--bd);border-radius:10px;padding:16px">
        <div style="font-weight:600;font-size:15px;margin-bottom:4px">${n.name}</div>
        <div style="font-size:13px;color:var(--tx2);margin-bottom:8px">${n.desc}</div>
        <div style="font-size:12px;color:var(--tx2);margin-bottom:6px">📍 ${n.area}</div>
        <a href="tel:${n.phone}" style="font-size:14px;font-weight:600;color:#16a34a;text-decoration:none">📞 ${n.phone}</a>
      </div>`).join('')}
    </div>
  </div>`;
}

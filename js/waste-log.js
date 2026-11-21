// FoodTrack frontend prototype. Backend integration will be added in the next phase.

// ───── Waste Log ─────
function renderWastelog(){
  const log=DB.get('waste_log',[]).slice().reverse();
  const totalCost=log.reduce((s,w)=>s+Number(w.cost||0),0);
  $('page').innerHTML=`
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px">
    <div><h2 style="font-size:22px;font-weight:700;margin:0">Waste Log</h2><p style="color:var(--tx2);font-size:14px;margin:4px 0 0">Total waste cost: <strong style="color:#dc2626">₹${totalCost}</strong></p></div>
    <button class="btn-primary" onclick="showWasteModal()">+ Log Waste</button>
  </div>
  <div class="card"><div style="overflow-x:auto">
  <table>
    <thead><tr><th>Item</th><th>Category</th><th>Qty</th><th>Reason</th><th>Est. Cost</th><th>Date</th><th></th></tr></thead>
    <tbody>
      ${log.map(w=>`<tr>
        <td style="font-weight:500">${w.name}</td><td>${w.cat}</td><td>${w.qty} ${w.unit}</td>
        <td><span class="badge b-critical">${w.reason}</span></td>
        <td style="font-weight:600;color:#dc2626">₹${w.cost||0}</td><td>${fmt(w.date)}</td>
        <td><button class="btn-danger" onclick="delWaste('${w.id}')">Del</button></td>
      </tr>`).join('')}
      ${log.length===0?'<tr><td colspan="7" class="empty">No waste logged yet — great!</td></tr>':''}
    </tbody>
  </table>
  </div></div>`;
}

function showWasteModal(){
  const items=DB.get('food_items',[]);
  $('modal-box').innerHTML=`
  <h3 style="font-size:17px;font-weight:700;margin:0 0 20px">Log Wasted Item</h3>
  <div style="display:flex;flex-direction:column;gap:14px">
    <div><label style="font-size:12px;font-weight:600;color:var(--tx2);display:block;margin-bottom:5px">Item Name*</label>
      <input id="w-name" list="inv-items" placeholder="Type or pick from inventory">
      <datalist id="inv-items">${items.map(i=>`<option value="${i.name}">`).join('')}</datalist>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div><label style="font-size:12px;font-weight:600;color:var(--tx2);display:block;margin-bottom:5px">Category</label>
        <select id="w-cat"><option>Grains</option><option>Pulses</option><option>Dairy</option><option>Vegetables</option><option>Fruits</option><option>Bakery</option><option>Oils</option><option>Spices</option><option>Other</option></select>
      </div>
      <div><label style="font-size:12px;font-weight:600;color:var(--tx2);display:block;margin-bottom:5px">Reason</label>
        <select id="w-reason"><option>Expired</option><option>Spoilage</option><option>Improper Storage</option><option>Over-preparation</option><option>Damaged</option></select>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div><label style="font-size:12px;font-weight:600;color:var(--tx2);display:block;margin-bottom:5px">Qty Wasted</label><input id="w-qty" type="number" min="0" placeholder="Amount"></div>
      <div><label style="font-size:12px;font-weight:600;color:var(--tx2);display:block;margin-bottom:5px">Unit</label>
        <select id="w-unit"><option>kg</option><option>litres</option><option>loaves</option><option>packets</option><option>pieces</option></select>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div><label style="font-size:12px;font-weight:600;color:var(--tx2);display:block;margin-bottom:5px">Est. Loss (₹)</label><input id="w-cost" type="number" min="0"></div>
      <div><label style="font-size:12px;font-weight:600;color:var(--tx2);display:block;margin-bottom:5px">Date</label><input id="w-date" type="date" value="${D(0)}"></div>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:4px">
      <button class="btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveWaste()">Log Waste</button>
    </div>
  </div>`;
  $('modal').style.display='flex';
}

function saveWaste(){
  const name=$('w-name').value.trim(),cat=$('w-cat').value,reason=$('w-reason').value,qty=$('w-qty').value,unit=$('w-unit').value,cost=$('w-cost').value,date=$('w-date').value;
  if(!name||!qty){toast('Fill name and quantity',false);return;}
  const log=DB.get('waste_log',[]);
  log.push({id:id(),name,cat,reason,qty:Number(qty),unit,cost:Number(cost)||0,date});
  DB.set('waste_log',log); toast('Waste logged ✓'); closeModal(); nav('wastelog');
}

function delWaste(wid){
  if(!confirm('Remove this entry?')) return;
  DB.set('waste_log',DB.get('waste_log',[]).filter(w=>w.id!==wid));
  toast('Entry removed'); nav('wastelog');
}

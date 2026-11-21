// FoodTrack frontend prototype. Backend integration will be added in the next phase.

// ───── Inventory ─────
function renderInventory(){
  const items=DB.get('food_items',[]);
  const q=DB.get('inv_q','');
  const filtered=q?items.filter(i=>i.name.toLowerCase().includes(q.toLowerCase())||i.cat.toLowerCase().includes(q.toLowerCase())):items;
  $('page').innerHTML=`
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px">
    <h2 style="font-size:22px;font-weight:700;margin:0">Food Inventory</h2>
    <div style="display:flex;gap:10px;align-items:center">
      <input type="search" placeholder="Search items…" value="${q}" oninput="DB.set('inv_q',this.value);nav('inventory')" style="width:200px;padding:8px 12px;font-size:13px">
      <button class="btn-primary" onclick="showItemModal()">+ Add Item</button>
    </div>
  </div>
  <div class="card"><div style="overflow-x:auto">
  <table>
    <thead><tr><th>Name</th><th>Category</th><th>Qty</th><th>Unit</th><th>Purchased</th><th>Expires</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>
      ${filtered.map(i=>`<tr>
        <td style="font-weight:500">${i.name}</td><td>${i.cat}</td><td>${i.qty}</td><td>${i.unit}</td>
        <td>${fmt(i.pur)}</td><td>${fmt(i.exp)}</td><td>${badge(i.exp)}</td>
        <td style="white-space:nowrap;display:flex;gap:6px">
          <button class="btn-ghost" onclick='showItemModal(${JSON.stringify(i)})'>Edit</button>
          <button class="btn-danger" onclick="delItem('${i.id}')">Del</button>
        </td>
      </tr>`).join('')}
      ${filtered.length===0?`<tr><td colspan="8" class="empty">${q?'No matching items.':'No items yet. Click "+ Add Item" to begin.'}</td></tr>`:''}
    </tbody>
  </table>
  </div></div>`;
}

function showItemModal(item=null){
  $('modal-box').innerHTML=`
  <h3 style="font-size:17px;font-weight:700;margin:0 0 20px">${item?'Edit':'Add'} Food Item</h3>
  <div style="display:flex;flex-direction:column;gap:14px">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div><label style="font-size:12px;font-weight:600;color:var(--tx2);display:block;margin-bottom:5px">Item Name*</label><input id="f-name" value="${item?.name||''}"></div>
      <div><label style="font-size:12px;font-weight:600;color:var(--tx2);display:block;margin-bottom:5px">Category*</label>
        <select id="f-cat"><option>Grains</option><option>Pulses</option><option>Dairy</option><option>Vegetables</option><option>Fruits</option><option>Bakery</option><option>Oils</option><option>Spices</option><option>Beverages</option><option>Other</option></select>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div><label style="font-size:12px;font-weight:600;color:var(--tx2);display:block;margin-bottom:5px">Quantity*</label><input id="f-qty" type="number" min="0" value="${item?.qty||''}"></div>
      <div><label style="font-size:12px;font-weight:600;color:var(--tx2);display:block;margin-bottom:5px">Unit</label>
        <select id="f-unit"><option>kg</option><option>litres</option><option>loaves</option><option>packets</option><option>pieces</option><option>boxes</option></select>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div><label style="font-size:12px;font-weight:600;color:var(--tx2);display:block;margin-bottom:5px">Purchase Date*</label><input id="f-pur" type="date" value="${item?.pur||D(0)}"></div>
      <div><label style="font-size:12px;font-weight:600;color:var(--tx2);display:block;margin-bottom:5px">Expiry Date*</label><input id="f-exp" type="date" value="${item?.exp||D(30)}"></div>
    </div>
    <div><label style="font-size:12px;font-weight:600;color:var(--tx2);display:block;margin-bottom:5px">Cost per Unit (₹)</label><input id="f-cost" type="number" min="0" value="${item?.cost||''}"></div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:4px">
      <button class="btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveItem('${item?.id||''}')">Save Item</button>
    </div>
  </div>`;
  setTimeout(()=>{if(item){$('f-cat').value=item.cat;$('f-unit').value=item.unit}},0);
  $('modal').style.display='flex';
}

function saveItem(editId){
  const n=$('f-name').value.trim(),cat=$('f-cat').value,qty=$('f-qty').value,unit=$('f-unit').value,pur=$('f-pur').value,exp=$('f-exp').value,cost=$('f-cost').value;
  if(!n||!qty||!pur||!exp){toast('Fill all required fields',false);return;}
  const user=DB.get('cur_user',{});
  const items=DB.get('food_items',[]);
  if(editId){
    const idx=items.findIndex(i=>i.id===editId);
    if(idx>-1) items[idx]={...items[idx],name:n,cat,qty:Number(qty),unit,pur,exp,cost:Number(cost)||0};
    toast('Item updated ✓');
  } else {
    items.push({id:id(),name:n,cat,qty:Number(qty),unit,pur,exp,cost:Number(cost)||0,by:user.name||'Staff'});
    toast('Item added ✓');
  }
  DB.set('food_items',items); closeModal(); nav('inventory');
}

function delItem(iid){
  if(!confirm('Delete this item?')) return;
  DB.set('food_items',DB.get('food_items',[]).filter(i=>i.id!==iid));
  toast('Item deleted'); nav('inventory');
}

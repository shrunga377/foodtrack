// ==========================================
// FOODTRACK - SUPABASE WASTE MANAGEMENT
// ==========================================

let wasteInventoryCache = [];


// ───── HTML ESCAPING ─────

function wasteEscape(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);
}


// ───── FETCH AND DISPLAY WASTE LOG ─────

async function renderWastelog() {

    $('page').innerHTML = `
        <div class="card empty">Loading waste records...</div>
    `;

    try {

        const { data, error } = await window.supabaseClient
            .from('waste_logs')
            .select('*')
            .order('date_logged', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error;

        const log = data || [];

        const totalCost = log.reduce(
            (sum, item) => sum + Number(item.estimated_cost || 0),
            0
        );

        const currentUser = DB.get('cur_user', null);
        const canDelete = currentUser?.role === 'warden';

        $('page').innerHTML = `

        <div class="page-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px">

            <div>
                <h2 style="font-size:22px;font-weight:700;margin:0">
                    Waste Log
                </h2>

                <p style="color:var(--tx2);font-size:14px;margin:4px 0 0">
                    Total waste cost:
                    <strong style="color:#dc2626">
                        ₹${totalCost.toLocaleString('en-IN')}
                    </strong>
                </p>
            </div>

            <button class="btn-primary" onclick="showWasteModal()">
                + Add Waste
            </button>

        </div>


        <div class="card">
            <div style="overflow-x:auto">

                <table>

                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Category</th>
                            <th>Qty</th>
                            <th>Reason</th>
                            <th>Est. Cost</th>
                            <th>Date</th>
                            ${canDelete ? '<th>Actions</th>' : ''}
                        </tr>
                    </thead>

                    <tbody>

                        ${log.map(w => `

                            <tr>

                                <td style="font-weight:500">
                                    ${wasteEscape(w.item_name)}
                                </td>

                                <td>${wasteEscape(w.category)}</td>

                                <td>
                                    ${w.quantity} ${wasteEscape(w.unit)}
                                </td>

                                <td>
                                    <span class="badge b-critical">
                                        ${wasteEscape(w.reason)}
                                    </span>
                                </td>

                                <td style="font-weight:600;color:#dc2626">
                                    ₹${Number(w.estimated_cost || 0).toLocaleString('en-IN')}
                                </td>

                                <td>${fmt(w.date_logged)}</td>

                                ${canDelete ? `
                                    <td>
                                        <button
                                            class="btn-danger"
                                            onclick="delWaste('${w.id}')">
                                            Delete
                                        </button>
                                    </td>
                                ` : ''}

                            </tr>

                        `).join('')}


                        ${log.length === 0 ? `

                            <tr>
                                <td colspan="${canDelete ? 7 : 6}" class="empty">
                                    No waste logged yet — great!
                                </td>
                            </tr>

                        ` : ''}

                    </tbody>

                </table>

            </div>
        </div>

        `;

    } catch (error) {

        console.error('Waste log fetch error:', error);

        $('page').innerHTML = `
            <div class="card">
                <p style="color:#dc2626">
                    Unable to load waste records:
                    ${wasteEscape(error.message)}
                </p>

                <button class="btn-primary" onclick="renderWastelog()">
                    Retry
                </button>
            </div>
        `;

    }

}


// ───── OPEN WASTE MODAL ─────

async function showWasteModal() {

    $('modal-box').innerHTML = `
        <div class="empty">Loading inventory...</div>
    `;

    $('modal').style.display = 'flex';

    try {

        const { data, error } = await window.supabaseClient
            .from('food_items')
            .select('id, name, category, quantity, unit, cost_per_unit')
            .order('name');

        if (error) throw error;

        wasteInventoryCache = data || [];


        $('modal-box').innerHTML = `

        <h3 style="font-size:17px;font-weight:700;margin:0 0 20px">
            Log Wasted Item
        </h3>

        <div style="display:flex;flex-direction:column;gap:14px">

            <div>

                <label>Item Name*</label>

                <input
                    id="w-name"
                    list="inv-items"
                    placeholder="Type or select from inventory"
                    onchange="prefillWasteItem()"
                >

                <datalist id="inv-items">

                    ${wasteInventoryCache.map(i => `
                        <option value="${wasteEscape(i.name)}">
                    `).join('')}

                </datalist>

            </div>


            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">

                <div>
                    <label>Category</label>

                    <select id="w-cat">
                        <option>Grains</option>
                        <option>Pulses</option>
                        <option>Dairy</option>
                        <option>Vegetables</option>
                        <option>Fruits</option>
                        <option>Bakery</option>
                        <option>Oils</option>
                        <option>Spices</option>
                        <option>Beverages</option>
                        <option>Other</option>
                    </select>
                </div>

                <div>
                    <label>Reason</label>

                    <select id="w-reason">
                        <option>Expired</option>
                        <option>Spoilage</option>
                        <option>Improper Storage</option>
                        <option>Over-preparation</option>
                        <option>Damaged</option>
                    </select>
                </div>

            </div>


            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">

                <div>
                    <label>Qty Wasted*</label>

                    <input
                        id="w-qty"
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Amount"
                    >
                </div>

                <div>
                    <label>Unit</label>

                    <select id="w-unit">
                        <option>kg</option>
                        <option>litres</option>
                        <option>loaves</option>
                        <option>packets</option>
                        <option>pieces</option>
                        <option>boxes</option>
                    </select>
                </div>

            </div>


            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">

                <div>
                    <label>Estimated Loss (₹)</label>

                    <input
                        id="w-cost"
                        type="number"
                        min="0"
                        step="0.01"
                        value="0"
                    >
                </div>

                <div>
                    <label>Date</label>

                    <input
                        id="w-date"
                        type="date"
                        value="${D(0)}"
                    >
                </div>

            </div>


            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:4px">

                <button class="btn-ghost" onclick="closeModal()">
                    Cancel
                </button>

                <button class="btn-primary" onclick="saveWaste()">
                    Log Waste
                </button>

            </div>

        </div>

        `;

    } catch (error) {

        console.error('Inventory loading error:', error);

        closeModal();

        toast('Unable to load inventory: ' + error.message, false);

    }

}


// ───── AUTO-FILL ITEM DETAILS ─────

function prefillWasteItem() {

    const name = $('w-name').value.trim().toLowerCase();

    const item = wasteInventoryCache.find(
        i => i.name.toLowerCase() === name
    );

    if (!item) return;

    $('w-cat').value = item.category;

    $('w-unit').value = item.unit;

}


// ───── SAVE WASTE RECORD ─────

async function saveWaste() {

    const name = $('w-name').value.trim();
    const category = $('w-cat').value;
    const reason = $('w-reason').value;

    const quantity = Number($('w-qty').value);
    const unit = $('w-unit').value;

    const cost = Number($('w-cost').value);
    const date = $('w-date').value;

    if (
        !name ||
        !date ||
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        !Number.isFinite(cost) ||
        cost < 0
    ) {

        toast('Please enter valid waste details.', false);
        return;

    }


    try {

        const { data: authData, error: authError } =
            await window.supabaseClient.auth.getUser();

        if (authError) throw authError;

        const user = authData.user;

        if (!user) {

            toast('Please log in again.', false);
            return;

        }


        const matchedItem = wasteInventoryCache.find(
            i => i.name.toLowerCase() === name.toLowerCase()
        );


        const payload = {

            food_item_id: matchedItem?.id || null,

            item_name: name,
            category: category,

            quantity: quantity,
            unit: unit,

            reason: reason,

            estimated_cost: cost,

            date_logged: date,

            logged_by: user.id

        };


        const { error } = await window.supabaseClient
            .from('waste_logs')
            .insert([payload]);

        if (error) throw error;

        toast('Waste logged successfully!');

        closeModal();

        await renderWastelog();


    } catch (error) {

        console.error('Save waste error:', error);

        toast(error.message || 'Unable to log waste.', false);

    }

}


// ───── DELETE WASTE RECORD ─────

async function delWaste(wasteId) {

    const currentUser = DB.get('cur_user', null);

    if (currentUser?.role !== 'warden') {

        toast('Only Wardens can delete waste records.', false);
        return;

    }

    if (!confirm('Remove this waste entry?')) {
        return;
    }


    try {

        const { error } = await window.supabaseClient
            .from('waste_logs')
            .delete()
            .eq('id', wasteId);

        if (error) throw error;

        toast('Waste entry removed successfully!');

        await renderWastelog();


    } catch (error) {

        console.error('Delete waste error:', error);

        toast(error.message || 'Unable to delete waste entry.', false);

    }

}
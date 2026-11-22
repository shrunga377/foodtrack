// ==========================================
// FOODTRACK - SUPABASE INVENTORY MANAGEMENT
// ==========================================

let inventoryCache = [];


// ───── HTML ESCAPING ─────

function inventoryEscape(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);
}


// ───── DATABASE TO FRONTEND MAPPING ─────

function mapInventoryItem(item) {
    return {
        id: item.id,
        name: item.name,
        cat: item.category,
        qty: Number(item.quantity),
        unit: item.unit,
        pur: item.purchase_date,
        exp: item.expiry_date,
        cost: Number(item.cost_per_unit),
        by: item.added_by,

        // Storage paths
        imagePath: item.image_path,
        receiptPath: item.receipt_path,

        // Signed URLs
        imageUrl: null,
        receiptUrl: null
    };
}


// ───── GENERATE SIGNED FILE URLS ─────

async function getInventorySignedUrl(path) {

    if (!path) return null;

    try {

        return await getFoodTrackFileUrl(path);

    } catch (error) {

        console.error('File URL generation error:', error);

        return null;

    }

}


// ───── FETCH INVENTORY ─────

async function renderInventory() {

    $('page').innerHTML = `
        <div class="card empty">Loading inventory...</div>
    `;

    try {

        const { data, error } = await window.supabaseClient
            .from('food_items')
            .select('*')
            .order('expiry_date', { ascending: true });

        if (error) throw error;


        // Map database records
        // Generate private signed URLs for uploaded files

        inventoryCache = await Promise.all(

            (data || []).map(async row => {

                const item = mapInventoryItem(row);

                const [imageUrl, receiptUrl] = await Promise.all([

                    getInventorySignedUrl(item.imagePath),

                    getInventorySignedUrl(item.receiptPath)

                ]);

                item.imageUrl = imageUrl;
                item.receiptUrl = receiptUrl;

                return item;

            })

        );


        renderInventoryView();

    } catch (error) {

        console.error('Inventory fetch error:', error);

        $('page').innerHTML = `
            <div class="card">

                <p style="color:#dc2626">
                    Unable to load inventory:
                    ${inventoryEscape(error.message)}
                </p>

                <button class="btn-primary" onclick="renderInventory()">
                    Retry
                </button>

            </div>
        `;

    }

}


// ───── DISPLAY INVENTORY ─────

function renderInventoryView() {

    const q = DB.get('inv_q', '').toLowerCase();

    const filtered = inventoryCache.filter(item =>

        item.name.toLowerCase().includes(q) ||

        item.cat.toLowerCase().includes(q)

    );

    const currentUser = DB.get('cur_user', null);

    const canDelete = currentUser?.role === 'warden';


    $('page').innerHTML = `

    <div class="page-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px">

        <h2 style="font-size:22px;font-weight:700;margin:0">
            Food Inventory
        </h2>

        <div class="inventory-actions" style="display:flex;gap:10px;align-items:center">

            <input
                type="search"
                placeholder="Search items..."
                value="${inventoryEscape(q)}"
                oninput="filterInventory(this.value)"
                style="width:200px;padding:8px 12px;font-size:13px"
            >

            <button class="btn-primary" onclick="showItemModal()">
                + Add Item
            </button>

        </div>

    </div>


    <div class="card">

        <div style="overflow-x:auto">

            <table>

                <thead>

                    <tr>
                        <th>Name</th>
                        <th>Image</th>
                        <th>Receipt</th>
                        <th>Category</th>
                        <th>Qty</th>
                        <th>Unit</th>
                        <th>Purchased</th>
                        <th>Expires</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>

                </thead>


                <tbody>


                    ${filtered.map(item => `

                        <tr>

                            <!-- ITEM NAME -->

                            <td style="font-weight:500">
                                ${inventoryEscape(item.name)}
                            </td>


                            <!-- FOOD IMAGE -->

                            <td>

                                ${item.imageUrl ? `

                                    <a
                                        href="${inventoryEscape(item.imageUrl)}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="View food photograph"
                                    >

                                        <img
                                            src="${inventoryEscape(item.imageUrl)}"
                                            alt="${inventoryEscape(item.name)}"
                                            loading="lazy"
                                            style="
                                                width:55px;
                                                height:55px;
                                                object-fit:cover;
                                                border-radius:8px;
                                                border:1px solid var(--bd);
                                                cursor:pointer;
                                            "
                                        >

                                    </a>

                                ` : `

                                    <span style="color:var(--tx2);font-size:12px">
                                        No image
                                    </span>

                                `}

                            </td>


                            <!-- PURCHASE RECEIPT -->

                            <td>

                                ${item.receiptUrl ? `

                                    <a
                                        href="${inventoryEscape(item.receiptUrl)}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style="
                                            color:#16a34a;
                                            font-weight:600;
                                            font-size:13px;
                                            text-decoration:none;
                                        "
                                    >

                                        ${svgIcon('file')} View Receipt

                                    </a>

                                ` : `

                                    <span style="color:var(--tx2);font-size:12px">
                                        No receipt
                                    </span>

                                `}

                            </td>


                            <!-- CATEGORY -->

                            <td>
                                ${inventoryEscape(item.cat)}
                            </td>


                            <!-- QUANTITY -->

                            <td>
                                ${item.qty}
                            </td>


                            <!-- UNIT -->

                            <td>
                                ${inventoryEscape(item.unit)}
                            </td>


                            <!-- PURCHASE DATE -->

                            <td>
                                ${fmt(item.pur)}
                            </td>


                            <!-- EXPIRY DATE -->

                            <td>
                                ${fmt(item.exp)}
                            </td>


                            <!-- STATUS -->

                            <td>
                                ${badge(item.exp)}
                            </td>


                            <!-- ACTIONS -->

                            <td style="white-space:nowrap">

                                <button
                                    class="btn-ghost"
                                    onclick="showItemModalById('${item.id}')"
                                >
                                    Edit
                                </button>

                                ${canDelete ? `

                                    <button
                                        class="btn-danger"
                                        onclick="delItem('${item.id}')"
                                    >
                                        Del
                                    </button>

                                ` : ''}

                            </td>

                        </tr>

                    `).join('')}


                    ${filtered.length === 0 ? `

                        <tr>

                            <td colspan="10" class="empty">

                                ${q
                                    ? 'No matching items.'
                                    : 'No inventory items yet. Click "+ Add Item" to begin.'
                                }

                            </td>

                        </tr>

                    ` : ''}


                </tbody>

            </table>

        </div>

    </div>

    `;

}


// ───── SEARCH INVENTORY ─────

function filterInventory(query) {

    DB.set('inv_q', query);

    renderInventoryView();

}


// ───── OPEN EDIT MODAL ─────

function showItemModalById(itemId) {

    const item = inventoryCache.find(i => i.id === itemId);

    if (!item) {

        toast('Item not found.', false);

        return;

    }

    showItemModal(item);

}


// ───── ADD / EDIT MODAL ─────

function showItemModal(item = null) {

    $('modal-box').innerHTML = `

    <h3 style="font-size:17px;font-weight:700;margin:0 0 20px">

        ${item ? 'Edit' : 'Add'} Food Item

    </h3>


    <div style="display:flex;flex-direction:column;gap:14px">


        <!-- NAME AND CATEGORY -->

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">

            <div>

                <label>Item Name*</label>

                <input
                    id="f-name"
                    value="${inventoryEscape(item?.name || '')}"
                >

            </div>


            <div>

                <label>Category*</label>

                <select id="f-cat">

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

        </div>


        <!-- QUANTITY AND UNIT -->

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">

            <div>

                <label>Quantity*</label>

                <input
                    id="f-qty"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value="${item?.qty ?? ''}"
                >

            </div>


            <div>

                <label>Unit</label>

                <select id="f-unit">

                    <option>kg</option>
                    <option>litres</option>
                    <option>loaves</option>
                    <option>packets</option>
                    <option>pieces</option>
                    <option>boxes</option>

                </select>

            </div>

        </div>


        <!-- DATES -->

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">

            <div>

                <label>Purchase Date*</label>

                <input
                    id="f-pur"
                    type="date"
                    value="${item?.pur || D(0)}"
                >

            </div>


            <div>

                <label>Expiry Date*</label>

                <input
                    id="f-exp"
                    type="date"
                    value="${item?.exp || D(30)}"
                >

            </div>

        </div>


        <!-- COST -->

        <div>

            <label>Cost per Unit (₹)</label>

            <input
                id="f-cost"
                type="number"
                min="0"
                step="0.01"
                value="${item?.cost ?? ''}"
            >

        </div>


        <!-- FOOD IMAGE -->

        <div>

            <label>Food Photograph</label>

            <input
                id="f-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
            >

            <small style="color:var(--tx2)">
                JPG, PNG or WEBP. Maximum 5 MB.
            </small>


            ${item?.imageUrl ? `

                <div style="margin-top:10px">

                    <p style="font-size:12px;color:var(--tx2)">
                        Currently saved image:
                    </p>

                    <a
                        href="${inventoryEscape(item.imageUrl)}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >

                        <img
                            src="${inventoryEscape(item.imageUrl)}"
                            alt="Current food image"
                            style="
                                width:90px;
                                height:90px;
                                object-fit:cover;
                                border-radius:8px;
                            "
                        >

                    </a>

                </div>

            ` : ''}

        </div>


        <!-- PURCHASE RECEIPT -->

        <div>

            <label>Purchase Receipt</label>

            <input
                id="f-receipt"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
            >

            <small style="color:var(--tx2)">
                Image or PDF. Maximum 5 MB.
            </small>


            ${item?.receiptUrl ? `

                <div style="margin-top:8px">

                    <a
                        href="${inventoryEscape(item.receiptUrl)}"
                        target="_blank"
                        rel="noopener noreferrer"
                        style="
                            color:#16a34a;
                            font-size:13px;
                            font-weight:600;
                            text-decoration:none;
                        "
                    >

                        ${svgIcon('file')} View Existing Receipt

                    </a>

                </div>

            ` : ''}

        </div>


        <!-- BUTTONS -->

        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:4px">

            <button class="btn-ghost" onclick="closeModal()">
                Cancel
            </button>

            <button
                class="btn-primary"
                onclick="saveItem('${item?.id || ''}')"
            >
                Save Item
            </button>

        </div>


    </div>

    `;


    if (item) {

        $('f-cat').value = item.cat;

        $('f-unit').value = item.unit;

    }


    $('modal').style.display = 'flex';

}


// ───── SAVE INVENTORY ITEM WITH FILES ─────

async function saveItem(editId) {

    const name = $('f-name').value.trim();

    const category = $('f-cat').value;

    const quantity = Number($('f-qty').value);

    const unit = $('f-unit').value;

    const purchaseDate = $('f-pur').value;

    const expiryDate = $('f-exp').value;

    const cost = Number($('f-cost').value || 0);


    const imageFile = $('f-image').files[0];

    const receiptFile = $('f-receipt').files[0];


    // VALIDATION

    if (
        !name ||
        !purchaseDate ||
        !expiryDate ||
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        !Number.isFinite(cost) ||
        cost < 0
    ) {

        toast('Please enter valid item details.', false);

        return;

    }


    if (purchaseDate > expiryDate) {

        toast('Expiry date cannot be before purchase date.', false);

        return;

    }


    const existingItem = editId
        ? inventoryCache.find(i => i.id === editId)
        : null;


    const uploadedPaths = [];

    let databaseSaved = false;


    try {


        // GET CURRENT USER

        const { data: authData, error: authError } =
            await window.supabaseClient.auth.getUser();

        if (authError) throw authError;

        const user = authData.user;

        if (!user) {

            throw new Error('Please log in again.');

        }


        // UPLOAD FOOD IMAGE

        let imagePath = existingItem?.imagePath || null;

        if (imageFile) {

            imagePath = await uploadFoodTrackFile(
                imageFile,
                'image'
            );

            uploadedPaths.push(imagePath);

        }


        // UPLOAD PURCHASE RECEIPT

        let receiptPath = existingItem?.receiptPath || null;

        if (receiptFile) {

            receiptPath = await uploadFoodTrackFile(
                receiptFile,
                'receipt'
            );

            uploadedPaths.push(receiptPath);

        }


        // DATABASE PAYLOAD

        const payload = {

            name,
            category,
            quantity,
            unit,

            purchase_date: purchaseDate,
            expiry_date: expiryDate,

            cost_per_unit: cost,

            added_by: user.id,

            image_path: imagePath,
            receipt_path: receiptPath

        };


        // INSERT OR UPDATE

        if (editId) {

            const { error } = await window.supabaseClient
                .from('food_items')
                .update(payload)
                .eq('id', editId)
                .select()
                .single();

            if (error) throw error;

        } else {

            const { error } = await window.supabaseClient
                .from('food_items')
                .insert([payload])
                .select()
                .single();

            if (error) throw error;

        }


        databaseSaved = true;


        // CLEAN UP REPLACED IMAGE

        if (imageFile && existingItem?.imagePath) {

            try {

                await deleteFoodTrackFile(existingItem.imagePath);

            } catch (error) {

                console.warn('Old image cleanup failed:', error);

            }

        }


        // CLEAN UP REPLACED RECEIPT

        if (receiptFile && existingItem?.receiptPath) {

            try {

                await deleteFoodTrackFile(existingItem.receiptPath);

            } catch (error) {

                console.warn('Old receipt cleanup failed:', error);

            }

        }


        toast(editId
            ? 'Item updated successfully!'
            : 'Item added successfully!'
        );


        closeModal();

        await renderInventory();


    } catch (error) {

        console.error('Save inventory error:', error);


        // CLEAN UP NEW FILES IF DATABASE SAVE FAILED

        if (!databaseSaved) {

            for (const path of uploadedPaths) {

                try {

                    await deleteFoodTrackFile(path);

                } catch (cleanupError) {

                    console.warn('File cleanup failed:', cleanupError);

                }

            }

        }


        toast(error.message || 'Unable to save item.', false);

    }

}


// ───── DELETE INVENTORY ITEM ─────

async function delItem(itemId) {

    const currentUser = DB.get('cur_user', null);


    if (currentUser?.role !== 'warden') {

        toast('Only Wardens can delete inventory items.', false);

        return;

    }


    if (!confirm('Are you sure you want to delete this item?')) {

        return;

    }


    try {

        // Find existing attachment paths before deleting the row

        const item = inventoryCache.find(i => i.id === itemId);


        // Delete database record

        const { error } = await window.supabaseClient
            .from('food_items')
            .delete()
            .eq('id', itemId);

        if (error) throw error;


        // Clean up attached files

        if (item?.imagePath) {

            try {

                await deleteFoodTrackFile(item.imagePath);

            } catch (error) {

                console.warn('Image cleanup failed:', error);

            }

        }


        if (item?.receiptPath) {

            try {

                await deleteFoodTrackFile(item.receiptPath);

            } catch (error) {

                console.warn('Receipt cleanup failed:', error);

            }

        }


        toast('Item deleted successfully!');

        await renderInventory();


    } catch (error) {

        console.error('Delete inventory error:', error);

        toast(error.message || 'Unable to delete item.', false);

    }

}
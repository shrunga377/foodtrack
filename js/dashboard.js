// ==========================================
// FOODTRACK - SUPABASE DASHBOARD
// ==========================================


// ───── HTML ESCAPING ─────

function dashboardEscape(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);
}


// ───── FETCH DASHBOARD DATA ─────

async function renderDashboard() {

    $('page').innerHTML = `
        <div class="card empty">Loading dashboard...</div>
    `;

    try {

        // Fetch inventory and waste records together
        const [inventoryResult, wasteResult] = await Promise.all([

            window.supabaseClient
                .from('food_items')
                .select('*')
                .order('expiry_date', { ascending: true }),

            window.supabaseClient
                .from('waste_logs')
                .select('estimated_cost')

        ]);

        if (inventoryResult.error) {
            throw inventoryResult.error;
        }

        if (wasteResult.error) {
            throw wasteResult.error;
        }


        // Convert database columns to frontend format
        const items = (inventoryResult.data || []).map(item => ({
            id: item.id,
            name: item.name,
            cat: item.category,
            qty: Number(item.quantity),
            unit: item.unit,
            pur: item.purchase_date,
            exp: item.expiry_date,
            cost: Number(item.cost_per_unit)
        }));


        const waste = wasteResult.data || [];


        // ───── CALCULATE STATISTICS ─────

        const expired = items.filter(
            item => daysLeft(item.exp) < 0
        ).length;


        const critical = items.filter(item => {

            const days = daysLeft(item.exp);

            return days >= 0 && days <= 3;

        }).length;


        const totalCost = waste.reduce(
            (sum, record) =>
                sum + Number(record.estimated_cost || 0),
            0
        );


        // Sort items by nearest expiry date
        const sorted = [...items].sort(
            (a, b) => daysLeft(a.exp) - daysLeft(b.exp)
        );


        // ───── RENDER DASHBOARD ─────

        $('page').innerHTML = `

        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">

            <div>

                <h2 style="font-size:22px;font-weight:700;margin:0">
                    Dashboard
                </h2>

                <p style="color:var(--tx2);font-size:14px;margin:4px 0 0">
                    ${new Date().toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </p>

            </div>

        </div>


        <!-- STATISTICS -->

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:16px;margin-bottom:28px">


            <div class="stat-card">
                <span style="font-size:28px">📦</span>

                <span style="font-size:28px;font-weight:700">
                    ${items.length}
                </span>

                <span style="font-size:13px;color:var(--tx2)">
                    Total Items
                </span>
            </div>


            <div class="stat-card">
                <span style="font-size:28px">🔴</span>

                <span style="font-size:28px;font-weight:700;color:#dc2626">
                    ${expired}
                </span>

                <span style="font-size:13px;color:var(--tx2)">
                    Expired
                </span>
            </div>


            <div class="stat-card">
                <span style="font-size:28px">⚠️</span>

                <span style="font-size:28px;font-weight:700;color:#ea580c">
                    ${critical}
                </span>

                <span style="font-size:13px;color:var(--tx2)">
                    Expiring ≤3 Days
                </span>
            </div>


            <div class="stat-card">
                <span style="font-size:28px">💸</span>

                <span style="font-size:28px;font-weight:700;color:#dc2626">
                    ₹${totalCost.toLocaleString('en-IN')}
                </span>

                <span style="font-size:13px;color:var(--tx2)">
                    Waste Cost (All Time)
                </span>
            </div>

        </div>


        <!-- EXPIRY ALERT -->

        ${expired + critical > 0 ? `

            <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 18px;margin-bottom:20px;font-size:14px;color:#991b1b;font-weight:500">

                ⚠️ ${expired} item(s) expired and ${critical} expiring within 3 days — take action!

            </div>

        ` : ''}


        <!-- INVENTORY TABLE -->

        <div class="card">

            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">

                <h3 style="font-size:16px;font-weight:600;margin:0">
                    All Items — Sorted by Expiry
                </h3>

                <button
                    class="btn-primary"
                    style="font-size:13px;padding:7px 14px"
                    onclick="nav('inventory')">

                    + Add Item

                </button>

            </div>


            <div style="overflow-x:auto">

                <table>

                    <thead>

                        <tr>
                            <th>Item</th>
                            <th>Category</th>
                            <th>Qty</th>
                            <th>Expiry Date</th>
                            <th>Status</th>
                        </tr>

                    </thead>


                    <tbody>

                        ${sorted.map(item => `

                            <tr>

                                <td style="font-weight:500">
                                    ${dashboardEscape(item.name)}
                                </td>

                                <td>
                                    ${dashboardEscape(item.cat)}
                                </td>

                                <td>
                                    ${item.qty} ${dashboardEscape(item.unit)}
                                </td>

                                <td>
                                    ${fmt(item.exp)}
                                </td>

                                <td>
                                    ${badge(item.exp)}
                                </td>

                            </tr>

                        `).join('')}


                        ${items.length === 0 ? `

                            <tr>

                                <td colspan="5" class="empty">

                                    No items yet.

                                    <a href="#"
                                       onclick="nav('inventory');return false;"
                                       style="color:#16a34a">

                                        Add some →

                                    </a>

                                </td>

                            </tr>

                        ` : ''}

                    </tbody>

                </table>

            </div>

        </div>

        `;


    } catch (error) {

        console.error('Dashboard loading error:', error);

        $('page').innerHTML = `

            <div class="card">

                <h3 style="color:#dc2626">
                    Unable to load dashboard
                </h3>

                <p>
                    ${dashboardEscape(error.message)}
                </p>

                <button class="btn-primary" onclick="renderDashboard()">
                    Retry
                </button>

            </div>

        `;

    }

}
// ==========================================
// FOODTRACK - SUPABASE REPORTS
// ==========================================


// ───── HTML ESCAPING ─────

function reportsEscape(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);
}


// ───── CURRENCY FORMATTING ─────

function formatReportCost(value) {
    return Number(value || 0).toLocaleString('en-IN', {
        maximumFractionDigits: 2
    });
}


// ───── FETCH AND DISPLAY REPORTS ─────

async function renderReports() {

    $('page').innerHTML = `
        <div class="card empty">Loading reports...</div>
    `;

    try {

        // Fetch actual waste records from Supabase
        const { data, error } = await window.supabaseClient
            .from('waste_logs')
            .select('category, estimated_cost, date_logged')
            .order('date_logged', { ascending: true });

        if (error) throw error;

        const waste = data || [];


        // ───── CATEGORY-WISE WASTE COST ─────

        const catMap = {};

        waste.forEach(record => {

            const category = record.category || 'Other';

            catMap[category] =
                (catMap[category] || 0) +
                Number(record.estimated_cost || 0);

        });


        // Sort categories by highest cost
        const categoryRows = Object.keys(catMap)
            .map(category => ({
                category,
                cost: catMap[category]
            }))
            .sort((a, b) => b.cost - a.cost);


        const cats = categoryRows.map(item => item.category);
        const vals = categoryRows.map(item => item.cost);


        const totalCost = waste.reduce(
            (sum, record) =>
                sum + Number(record.estimated_cost || 0),
            0
        );


        // ───── MONTHLY WASTE TREND ─────

        const monthMap = {};

        waste.forEach(record => {

            if (!record.date_logged) return;

            const month = record.date_logged.slice(0, 7);

            monthMap[month] =
                (monthMap[month] || 0) +
                Number(record.estimated_cost || 0);

        });


        const months = Object.keys(monthMap).sort();

        const monthLabels = months.map(month => {

            const [year, monthNumber] = month.split('-').map(Number);

            return new Date(year, monthNumber - 1, 1)
                .toLocaleDateString('en-IN', {
                    month: 'short',
                    year: 'numeric'
                });

        });


        const mVals = months.map(month => monthMap[month]);


        // ───── RENDER REPORTS PAGE ─────

        $('page').innerHTML = `

        <h2 style="font-size:22px;font-weight:700;margin:0 0 24px">
            Waste Reports
        </h2>


        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px">


            <!-- CATEGORY CHART -->

            <div class="card">

                <h3 style="font-size:15px;font-weight:600;margin:0 0 16px">
                    Waste Cost by Category (₹)
                </h3>

                <canvas id="cat-chart" height="230"></canvas>

            </div>


            <!-- MONTHLY CHART -->

            <div class="card">

                <h3 style="font-size:15px;font-weight:600;margin:0 0 16px">
                    Monthly Waste Trend (₹)
                </h3>

                <canvas id="month-chart" height="230"></canvas>

            </div>


        </div>


        <!-- CATEGORY SUMMARY TABLE -->

        <div class="card" style="margin-top:20px">

            <h3 style="font-size:15px;font-weight:600;margin:0 0 16px">
                Waste Summary by Category
            </h3>


            <table>

                <thead>

                    <tr>
                        <th>Category</th>
                        <th>Total Cost (₹)</th>
                        <th>% of Total</th>
                    </tr>

                </thead>


                <tbody>

                    ${categoryRows.length === 0 ? `

                        <tr>
                            <td colspan="3" class="empty">
                                No waste data yet.
                            </td>
                        </tr>

                    ` : categoryRows.map(item => {

                        const percentage = totalCost
                            ? Math.round(item.cost / totalCost * 100)
                            : 0;

                        return `

                            <tr>

                                <td>
                                    ${reportsEscape(item.category)}
                                </td>

                                <td style="font-weight:600">
                                    ₹${formatReportCost(item.cost)}
                                </td>

                                <td>

                                    <div style="display:flex;align-items:center;gap:8px">

                                        <div style="
                                            height:8px;
                                            width:${percentage * 1.5}px;
                                            background:#16a34a;
                                            border-radius:4px;
                                            min-width:4px;
                                        "></div>

                                        ${percentage}%

                                    </div>

                                </td>

                            </tr>

                        `;

                    }).join('')}

                </tbody>

            </table>

        </div>

        `;


        // ───── CREATE CHARTS ─────

        // Wait until the report elements are rendered
        setTimeout(() => {

            const mode = window.matchMedia(
                '(prefers-color-scheme:dark)'
            ).matches ? 'dark' : 'light';

            const gridColor = mode === 'dark'
                ? 'rgba(255,255,255,.12)'
                : 'rgba(0,0,0,.08)';

            const textColor = mode === 'dark'
                ? '#9ca3af'
                : '#6b7280';


            const palette = [
                '#16a34a',
                '#15803d',
                '#166534',
                '#4ade80',
                '#86efac',
                '#bbf7d0',
                '#059669',
                '#047857'
            ];


            // Destroy previous charts before recreating
            if (chartInstances.cat) {
                chartInstances.cat.destroy();
            }

            if (chartInstances.month) {
                chartInstances.month.destroy();
            }


            // CATEGORY BAR CHART

            if (cats.length) {

                chartInstances.cat = new Chart(
                    $('cat-chart'),
                    {
                        type: 'bar',

                        data: {
                            labels: cats,

                            datasets: [{
                                data: vals,

                                backgroundColor: cats.map(
                                    (_, index) =>
                                        palette[index % palette.length]
                                ),

                                borderRadius: 6
                            }]
                        },

                        options: {

                            responsive: true,

                            plugins: {
                                legend: {
                                    display: false
                                }
                            },

                            scales: {

                                x: {
                                    grid: {
                                        color: gridColor
                                    },

                                    ticks: {
                                        color: textColor
                                    }
                                },

                                y: {
                                    beginAtZero: true,

                                    grid: {
                                        color: gridColor
                                    },

                                    ticks: {
                                        color: textColor,

                                        callback: value =>
                                            '₹' + value
                                    }
                                }

                            }

                        }

                    }
                );

            }


            // MONTHLY LINE CHART

            if (months.length) {

                chartInstances.month = new Chart(
                    $('month-chart'),
                    {
                        type: 'line',

                        data: {
                            labels: monthLabels,

                            datasets: [{
                                data: mVals,

                                borderColor: '#16a34a',

                                backgroundColor: 'rgba(22,163,74,.1)',

                                tension: 0.4,

                                fill: true,

                                pointBackgroundColor: '#16a34a'
                            }]
                        },

                        options: {

                            responsive: true,

                            plugins: {
                                legend: {
                                    display: false
                                }
                            },

                            scales: {

                                x: {
                                    grid: {
                                        color: gridColor
                                    },

                                    ticks: {
                                        color: textColor
                                    }
                                },

                                y: {
                                    beginAtZero: true,

                                    grid: {
                                        color: gridColor
                                    },

                                    ticks: {
                                        color: textColor,

                                        callback: value =>
                                            '₹' + value
                                    }
                                }

                            }

                        }

                    }
                );

            }

        }, 50);


    } catch (error) {

        console.error('Reports loading error:', error);

        $('page').innerHTML = `

            <div class="card">

                <h3 style="color:#dc2626">
                    Unable to load reports
                </h3>

                <p>
                    ${reportsEscape(error.message)}
                </p>

                <button class="btn-primary" onclick="renderReports()">
                    Retry
                </button>

            </div>

        `;

    }

}
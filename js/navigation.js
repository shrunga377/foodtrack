// FoodTrack frontend prototype. Backend integration will be added in the next phase.

// ───── Navigation ─────
function nav(page){
  document.querySelectorAll('.sidebar a[id^=nav-]').forEach(a=>a.classList.remove('active'));
  const el=$('nav-'+page); if(el) el.classList.add('active');
  Object.values(chartInstances).forEach(c=>{try{c.destroy()}catch{}});
  chartInstances={};
  renderPage(page);
}

function renderPage(p){
  const pages={dashboard:renderDashboard,inventory:renderInventory,wastelog:renderWastelog,reports:renderReports,donation:renderDonation};
  (pages[p]||renderDashboard)();
}

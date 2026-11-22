// FoodTrack frontend prototype. Backend integration will be added in the next phase.

// ───── Navigation ─────
function nav(page){
  document.querySelectorAll('.sidebar a[id^=nav-]').forEach(a=>a.classList.remove('active'));
  const el=$('nav-'+page); if(el) el.classList.add('active');
  toggleSidebar(false);
  Object.values(chartInstances).forEach(c=>{try{c.destroy()}catch{}});
  chartInstances={};
  renderPage(page);
}

function toggleSidebar(open){
  const sidebar=$('sidebar');
  const scrim=$('sidebar-scrim');
  const shouldOpen=typeof open==='boolean'?open:!sidebar.classList.contains('open');
  sidebar.classList.toggle('open',shouldOpen);
  scrim.classList.toggle('open',shouldOpen);
}

function renderPage(p){
  const pages={dashboard:renderDashboard,inventory:renderInventory,wastelog:renderWastelog,reports:renderReports,donation:renderDonation};
  (pages[p]||renderDashboard)();
}

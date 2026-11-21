// FoodTrack frontend prototype. Backend integration will be added in the next phase.

// ───── Modal ─────
function closeModal(){$('modal').style.display='none';}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

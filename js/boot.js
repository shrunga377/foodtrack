// FoodTrack frontend prototype. Backend integration will be added in the next phase.

// ───── Boot ─────
(function boot(){
  const u=DB.get('cur_user',null);
  if(u){
    $('login-screen').style.display='none';
    $('app').style.display='block';
    $('user-label').textContent=u.role;
    nav('dashboard');
  }
})();

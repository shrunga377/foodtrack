// FoodTrack frontend prototype. Backend integration will be added in the next phase.

// ───── Auth ─────
const USERS=[{email:'admin@mess.edu',pass:'hostel123',name:'Admin (Warden)',role:'Warden'},{email:'staff@mess.edu',pass:'staff123',name:'Ramesh (Mess)',role:'Staff'}];
function doLogin(){
  const e=$('l-email').value.trim(), p=$('l-pass').value;
  const u=USERS.find(x=>x.email===e&&x.pass===p);
  if(!u){toast('Invalid credentials',false);return;}
  DB.set('cur_user',u);
  $('login-screen').style.display='none';
  $('app').style.display='block';
  $('user-label').textContent=u.role;
  nav('dashboard');
}
function doLogout(){DB.set('cur_user',null);location.reload();}

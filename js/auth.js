// ==========================================
// FOODTRACK - SUPABASE AUTHENTICATION
// ==========================================

let authActionInProgress = false;


// ───── GET USER PROFILE ─────

async function getFoodTrackUser(authUser) {

    const { data: profile, error } = await window.supabaseClient
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('id', authUser.id)
        .single();

    if (error) throw error;

    if (!profile) {
        throw new Error('FoodTrack profile not found.');
    }

    return {
        id: profile.id,
        email: profile.email || authUser.email,
        name: profile.full_name?.trim() || authUser.email,
        role: profile.role,
        roleLabel: profile.role === 'warden' ? 'Warden' : 'Staff'
    };
}


// ───── SHOW APPLICATION ─────

function showAuthenticatedApp(user) {

    DB.set('cur_user', user);

    $('login-screen').style.display = 'none';
    $('app').style.display = 'block';

    $('user-label').textContent = user.roleLabel;

    nav('dashboard');
}


// ───── SHOW LOGIN SCREEN ─────

function showLoginScreen() {

    DB.set('cur_user', null);

    $('app').style.display = 'none';
    $('login-screen').style.display = 'flex';
}


// ───── LOGIN ─────

async function doLogin() {

    if (authActionInProgress) return;

    const email = $('l-email').value.trim().toLowerCase();
    const password = $('l-pass').value;

    if (!email || !password) {
        toast('Please enter email and password.', false);
        return;
    }

    authActionInProgress = true;

    let authUser = null;

    try {

        const { data, error } =
            await window.supabaseClient.auth.signInWithPassword({
                email,
                password
            });

        if (error) throw error;

        authUser = data.user;

        const appUser = await getFoodTrackUser(authUser);

        showAuthenticatedApp(appUser);

        toast('Login successful!');

    } catch (error) {

        console.error('Login error:', error);

        if (authUser) {
            await window.supabaseClient.auth.signOut();
        }

        toast(error.message || 'Login failed.', false);

    } finally {

        authActionInProgress = false;

    }
}


// ───── LOGOUT ─────

async function doLogout() {

    try {

        const { error } =
            await window.supabaseClient.auth.signOut();

        if (error) throw error;

        showLoginScreen();

        $('l-pass').value = '';

        toast('Logged out successfully.');

    } catch (error) {

        console.error('Logout error:', error);

        toast('Unable to log out. Please try again.', false);

    }

}


// ───── RESTORE EXISTING SESSION ─────

async function restoreAuthSession() {

    try {

        const { data, error } =
            await window.supabaseClient.auth.getSession();

        if (error) throw error;

        if (!data.session) {

            showLoginScreen();
            return;

        }

        const appUser = await getFoodTrackUser(data.session.user);

        showAuthenticatedApp(appUser);

    } catch (error) {

        console.error('Session restoration error:', error);

        await window.supabaseClient.auth.signOut();

        showLoginScreen();

    }

}// ==========================================
// FOODTRACK - USER REGISTRATION
// ==========================================

// Switch between Login and Registration
function switchAuthView(view) {

    if (view === 'register') {
        $('login-form').style.display = 'none';
        $('register-form').style.display = 'flex';
    } else {
        $('register-form').style.display = 'none';
        $('login-form').style.display = 'flex';
    }

}


// Register a new Staff account
async function doRegister() {

    if (authActionInProgress) return;

    const name = $('r-name').value.trim();
    const email = $('r-email').value.trim().toLowerCase();
    const password = $('r-pass').value;
    const confirmPassword = $('r-confirm').value;

    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
        toast('Please fill in all fields.', false);
        return;
    }

    if (password.length < 8) {
        toast('Password must contain at least 8 characters.', false);
        return;
    }

    if (password !== confirmPassword) {
        toast('Passwords do not match.', false);
        return;
    }

    authActionInProgress = true;

    try {

        const { data, error } =
            await window.supabaseClient.auth.signUp({

                email: email,
                password: password,

                options: {
                    data: {
                        full_name: name
                    }
                }

            });

        if (error) throw error;

        // Supabase creates the profile automatically
        // through our database trigger.

        if (data.session && data.user) {

            const appUser = await getFoodTrackUser(data.user);

            showAuthenticatedApp(appUser);

            toast('Account created successfully!');

        } else {

            toast('Account created! Please sign in.');

            switchAuthView('login');

        }

        // Clear registration fields
        $('r-name').value = '';
        $('r-email').value = '';
        $('r-pass').value = '';
        $('r-confirm').value = '';

    } catch (error) {

        console.error('Registration error:', error);

        toast(error.message || 'Registration failed.', false);

    } finally {

        authActionInProgress = false;

    }

}
// Supabase Configuration

const SUPABASE_URL = "https://rtjwhtiznwttlpyvwqsj.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_EFSa7aOEIU6tdwcfF_ldGw_l_Ti5UxL";

// Initialize Supabase client
window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

console.log("FoodTrack: Supabase connected successfully!");
// ==========================================
// FOODTRACK - APPLICATION INITIALIZATION
// ==========================================

(async function boot() {

    console.log("FoodTrack: Initializing application...");

    // Restore Supabase authentication session
    await restoreAuthSession();

    console.log("FoodTrack: Application initialized!");

})();
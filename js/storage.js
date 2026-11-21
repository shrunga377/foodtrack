// ==========================================
// FOODTRACK - SUPABASE STORAGE
// ==========================================

const FOODTRACK_BUCKET = 'foodtrack-files';


// ───── UPLOAD FILE ─────

async function uploadFoodTrackFile(file, type) {

    if (!file) return null;

    // Check file size (maximum 5 MB)
    if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must not exceed 5 MB.');
    }

    // Allowed file types
    const imageTypes = [
        'image/jpeg',
        'image/png',
        'image/webp'
    ];

    const receiptTypes = [
        ...imageTypes,
        'application/pdf'
    ];

    const allowedTypes = type === 'image'
        ? imageTypes
        : receiptTypes;

    if (!allowedTypes.includes(file.type)) {
        throw new Error('Unsupported file format.');
    }

    // Get logged-in user
    const { data, error: authError } =
        await window.supabaseClient.auth.getUser();

    if (authError) throw authError;

    const user = data.user;

    if (!user) {
        throw new Error('Please log in again.');
    }

    // Create a safe, unique file name
    const safeName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, '_');

    const uniqueId = crypto.randomUUID();

    const folder = type === 'image'
        ? 'food-images'
        : 'receipts';

    // User-specific storage path
    const filePath =
        `${user.id}/${folder}/${uniqueId}-${safeName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error } =
        await window.supabaseClient.storage
            .from(FOODTRACK_BUCKET)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type
            });

    if (error) throw error;

    return uploadData.path;
}


// ───── GENERATE SIGNED URL ─────

async function getFoodTrackFileUrl(filePath) {

    if (!filePath) return null;

    const { data, error } =
        await window.supabaseClient.storage
            .from(FOODTRACK_BUCKET)
            .createSignedUrl(filePath, 300);

    if (error) throw error;

    return data.signedUrl;
}


// ───── DELETE STORED FILE ─────

async function deleteFoodTrackFile(filePath) {

    if (!filePath) return;

    const { error } =
        await window.supabaseClient.storage
            .from(FOODTRACK_BUCKET)
            .remove([filePath]);

    if (error) throw error;
}

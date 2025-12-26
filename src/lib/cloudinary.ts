// Cloudinary Configuration
// Update these values with your Cloudinary account details

export const CLOUDINARY_CONFIG = {
    cloudName: 'dvoackbfs', // Replace with your Cloudinary cloud name
    uploadPreset: 'nirantara-koperasi', // Replace with your upload preset name
};

// Create upload preset in Cloudinary dashboard:
// 1. Go to Settings > Upload
// 2. Scroll to "Upload presets"
// 3. Click "Add upload preset"
// 4. Set "Signing Mode" to "Unsigned"
// 5. Name it "koperasi_uploads" (or choose your own name)
// 6. Configure folder, transformations, etc. as needed
// 7. Save

export async function uploadImageToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const error = await response.json();
            const errorMessage = error.error?.message || 'Upload failed';

            // Provide helpful error messages
            if (errorMessage.includes('Upload preset not found')) {
                throw new Error(
                    `Upload preset '${CLOUDINARY_CONFIG.uploadPreset}' belum dibuat. ` +
                    `Silakan buat upload preset di Cloudinary dashboard:\n` +
                    `1. Buka https://cloudinary.com/console/settings/upload\n` +
                    `2. Scroll ke "Upload presets"\n` +
                    `3. Klik "Add upload preset"\n` +
                    `4. Isi Preset name: ${CLOUDINARY_CONFIG.uploadPreset}\n` +
                    `5. Set "Signing Mode" ke "Unsigned"\n` +
                    `6. Simpan`
                );
            }

            throw new Error(errorMessage);
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
}

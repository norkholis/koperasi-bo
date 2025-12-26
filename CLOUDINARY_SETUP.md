# Cloudinary Setup Guide

This application uses Cloudinary for image uploads (transfer receipts/bukti transfer).

## Setup Instructions

### 1. Create a Cloudinary Account
1. Go to [https://cloudinary.com/](https://cloudinary.com/)
2. Sign up for a free account
3. After signing in, you'll see your dashboard with your Cloud Name

### 2. Create an Upload Preset
1. In Cloudinary dashboard, go to **Settings** (gear icon) > **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure the preset:
   - **Preset name**: `koperasi_uploads` (or choose your own)
   - **Signing Mode**: Select **Unsigned** (important!)
   - **Folder**: (optional) e.g., `koperasi/bukti-transfer`
   - **Allowed formats**: jpg, png, gif (recommended)
   - **Max file size**: 5MB (recommended)
5. Click **Save**

### 3. Update Configuration
1. Open `/src/lib/cloudinary.ts`
2. Update the following values:
   ```typescript
   export const CLOUDINARY_CONFIG = {
       cloudName: 'YOUR_CLOUD_NAME',    // Replace with your cloud name from dashboard
       uploadPreset: 'koperasi_uploads', // Replace if you used a different name
   };
   ```

### 4. Test the Upload
1. Go to the Wadiah (Simpanan) page
2. Click "Top-Up" button
3. In the modal, click "📤 Upload File" tab
4. Select an image file
5. The image should upload and display the URL

## Features

### For Top-Up Requests
Users have two options for providing transfer proof:
1. **Upload File**: Upload an image directly (max 5MB)
2. **Input URL Manual**: Paste a URL to an existing image

### File Validation
- **Allowed formats**: JPG, PNG, GIF
- **Max file size**: 5MB
- Files are validated before upload

### User Experience
- Real-time upload progress indicator
- Success/error notifications
- Preview of uploaded image URL
- Option to switch between upload methods

## Troubleshooting

### Upload fails with CORS error
- Ensure the upload preset is set to **Unsigned**
- Check that your Cloud Name is correct

### Upload fails with 400 error
- Verify the upload preset name matches exactly
- Check that the preset exists and is active

### File size too large
- Images larger than 5MB will be rejected
- Ask users to compress images before upload

## Security Notes

- Upload preset is **unsigned** for client-side uploads
- Consider adding backend validation for security
- You can configure upload restrictions in Cloudinary preset settings
- Use Cloudinary's moderation features if needed

## Cost Considerations

Cloudinary free tier includes:
- 25 GB storage
- 25 GB monthly bandwidth
- 25,000 transformations/month

Monitor your usage in the Cloudinary dashboard if you have many users.

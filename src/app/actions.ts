'use server';

import { createAdminClient } from '@/lib/supabase/server';

/**
 * Securely uploads a file to a specified Supabase Storage bucket.
 * This function runs on the server and uses the service_role key to bypass RLS.
 *
 * @param bucketName The name of the storage bucket.
 * @param userId The ID of the user/project, used to create a folder path.
 * @param formData The FormData object containing the file to upload.
 * @returns An object with either the publicUrl or an error message.
 */
export async function uploadFile(
  bucketName: 'avatars' | 'identity_documents' | 'property_images' | 'project_images' | 'developer_logos' | 'documents',
  userId: string,
  formData: FormData
): Promise<{ publicUrl: string } | { error: string }> {
  try {
    const file = formData.get('file') as File;
    if (!file || file.size === 0) {
      return { error: 'No file provided or file is empty.' };
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { error: 'File size must be less than 10MB.' };
    }

    // Validate file type based on bucket
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const documentTypes = ['application/pdf', ...imageTypes];
    const logoTypes = [...imageTypes, 'image/svg+xml'];

    if (bucketName === 'identity_documents' || bucketName === 'property_images' || bucketName === 'project_images') {
      if (!imageTypes.includes(file.type)) {
        return { error: 'Only JPEG, PNG, and WebP images are allowed for images.' };
      }
    } else if (bucketName === 'developer_logos') {
      if (!logoTypes.includes(file.type)) {
        return { error: 'Only JPEG, PNG, WebP, and SVG images are allowed for logos.' };
      }
    } else if (bucketName === 'documents') {
      if (!documentTypes.includes(file.type)) {
        return { error: 'Only PDF and image files are allowed for documents.' };
      }
    }

    const supabase = createAdminClient();
    const filePath = `${userId}/${Date.now()}_${file.name}`;

    console.log(`Uploading file to bucket: ${bucketName}, path: ${filePath}`);

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (uploadError) {
      console.error('Server-side Upload Error:', uploadError);
      
      // Provide more specific error messages
      if (uploadError.message.includes('Bucket not found')) {
        return { error: `Storage bucket '${bucketName}' not found. Please contact support.` };
      }
      if (uploadError.message.includes('The resource already exists')) {
        return { error: 'A file with this name already exists. Please try again.' };
      }
      
      return { error: `Failed to upload file: ${uploadError.message}` };
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    console.log(`File uploaded successfully: ${data.publicUrl}`);
    
    return { publicUrl: data.publicUrl };
  } catch (error: any) {
    console.error('Unexpected error in uploadFile:', error);
    return { error: 'An unexpected error occurred during file upload. Please try again.' };
  }
}
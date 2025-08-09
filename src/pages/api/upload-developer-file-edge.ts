import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/app/actions';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return new NextResponse(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const formData = await req.formData();
    const userId = formData.get('userId');
    const file = formData.get('file');
    const bucket = formData.get('bucket');
    if (!userId || !file || !bucket) {
      return new NextResponse(JSON.stringify({ error: 'Missing userId, file, or bucket' }), { status: 400 });
    }
    // Call the server action
    // Validar bucket permitido
    const allowedBuckets = [
      'avatars',
      'identity_documents',
      'property_images',
      'project_images',
      'developer_logos',
      'documents',
    ];
    if (!allowedBuckets.includes(bucket.toString())) {
      return new NextResponse(JSON.stringify({ error: 'Invalid bucket' }), { status: 400 });
    }
    const result = await uploadFile(bucket.toString() as any, userId.toString(), formData);
    if ('error' in result) {
      return new NextResponse(JSON.stringify({ error: result.error }), { status: 400 });
    }
    return new NextResponse(JSON.stringify({ publicUrl: result.publicUrl }), { status: 200 });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: error.message || 'Internal server error' }), { status: 500 });
  }
}

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
    if (!userId || !file) {
      return new NextResponse(JSON.stringify({ error: 'Missing userId or file' }), { status: 400 });
    }
    // Call the server action
    const result = await uploadFile('avatars', userId.toString(), formData);
    if ('error' in result) {
      return new NextResponse(JSON.stringify({ error: result.error }), { status: 400 });
    }
    return new NextResponse(JSON.stringify({ publicUrl: result.publicUrl }), { status: 200 });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: error.message || 'Internal server error' }), { status: 500 });
  }
}

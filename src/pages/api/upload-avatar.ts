import type { NextApiRequest, NextApiResponse } from 'next';
import { uploadFile } from '@/app/actions';

export const config = {
  api: {
    bodyParser: false, // We'll handle FormData manually
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse FormData
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk as Buffer);
    }
    const buffer = Buffer.concat(chunks);
    const boundary = req.headers['content-type']?.split('boundary=')[1];
    if (!boundary) return res.status(400).json({ error: 'No boundary found in content-type' });

    // Use form-data-parse or busboy for production, but for now:
    const formData = new FormData();
    // Not implemented: parsing multipart/form-data in Node.js (needs formidable, busboy, or similar)
    // For now, return error if not running in edge runtime
    return res.status(501).json({ error: 'FormData parsing not implemented. Use edge runtime or add formidable/busboy.' });

    // Example (pseudo):
    // const file = ...;
    // const userId = ...;
    // const result = await uploadFile('avatars', userId, formData);
    // if ('error' in result) return res.status(400).json({ error: result.error });
    // return res.status(200).json({ publicUrl: result.publicUrl });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

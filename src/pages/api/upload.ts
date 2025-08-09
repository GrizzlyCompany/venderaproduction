
import { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '@/lib/supabase/server';
import type formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const bucket = req.query.bucket as string;
    const userId = req.query.userId as string;
    if (!bucket || !userId) {
      return res.status(400).json({ error: 'Missing bucket or userId' });
    }

    // Parse file from form-data
    const formidable = (await import('formidable')).default;
    const form = new formidable.IncomingForm();
  (form as any).maxFileSize = 10 * 1024 * 1024; // 10MB

    form.parse(req, async (err: any, fields: formidable.Fields, files: formidable.Files) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      const fileField = files.file;
      let typedFile: formidable.File | undefined;
      if (Array.isArray(fileField)) {
        typedFile = fileField[0];
      } else if (fileField) {
        typedFile = fileField;
      }
      if (!typedFile) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const fs = await import('fs/promises');
      const fileBuffer = await fs.readFile(typedFile.filepath);
      const supabase = createAdminClient();
      const filePath = `${userId}/${Date.now()}_${typedFile.originalFilename}`;
      const { error } = await supabase.storage.from(bucket).upload(filePath, fileBuffer, {
        contentType: typedFile.mimetype || undefined,
        upsert: false,
      });
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return res.status(200).json({ publicUrl: data.publicUrl });
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Unexpected error' });
  }
}

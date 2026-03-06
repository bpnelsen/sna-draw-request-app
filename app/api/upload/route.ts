import { NextRequest, NextResponse } from 'next/server';
import { processSNAExcel } from '@/lib/excel-processor';
import { promises as fs } from 'fs';
import { join } from 'path';
import os from 'os';

/**
 * POST /api/upload
 * Accepts Excel file and processes it directly (no VPS backend needed!)
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Only Excel files (.xlsx, .xls) are supported' },
        { status: 400 }
      );
    }

    console.log(`📥 Processing file: ${file.name}`);

    try {
      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Process the Excel file
      const processedBuffer = await processSNAExcel(buffer, file.name);

      // Generate output filename
      const timestamp = Date.now();
      const outputFileName = `organized_${timestamp}_${file.name}`;
      const processedBase64 = processedBuffer.toString('base64');

      console.log(`✅ File processed successfully: ${outputFileName}`);

      // Save processed file to temp directory for download
      try {
        const tempDir = join(os.tmpdir(), 'sna-uploads');
        await fs.mkdir(tempDir, { recursive: true });
        const tempFilePath = join(tempDir, outputFileName);
        await fs.writeFile(tempFilePath, processedBuffer);
        console.log(`💾 Saved to temp: ${tempFilePath}`);

        // Schedule cleanup after 1 hour
        setTimeout(async () => {
          try {
            await fs.unlink(tempFilePath);
            console.log(`🧹 Cleaned up temp file: ${tempFilePath}`);
          } catch (e) {
            console.warn('Failed to cleanup temp file:', e);
          }
        }, 3600000); // 1 hour
      } catch (saveErr) {
        console.warn('Failed to save temp file:', saveErr);
      }

      // Save to history
      try {
        await fetch(new URL('/api/history', req.url), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: outputFileName,
            originalFileName: file.name,
            status: 'completed',
            downloadUrl: `/api/download/${encodeURIComponent(outputFileName)}`,
            processedAt: new Date().toISOString(),
          }),
        });
      } catch (historyErr) {
        console.warn('Failed to save history:', historyErr);
      }

      return NextResponse.json({
        success: true,
        fileName: outputFileName,
        downloadUrl: `/api/download/${encodeURIComponent(outputFileName)}`,
        message: 'File processed successfully!',
        processedData: processedBase64,
      });
    } catch (processingErr) {
      console.error('Processing error:', processingErr);
      return NextResponse.json(
        {
          error: 'Processing failed',
          details: processingErr instanceof Error ? processingErr.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

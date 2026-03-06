import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';
import { existsSync } from 'fs';
import os from 'os';

/**
 * GET /api/download/[fileName]
 * Download processed Excel file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { fileName: string } }
) {
  try {
    const { fileName } = params;

    // Security: Only allow downloading files matching our naming pattern
    if (!fileName.startsWith('organized_') || (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls'))) {
      return NextResponse.json(
        { error: 'Invalid file name' },
        { status: 400 }
      );
    }

    // Try to read from temp directory (where upload API saves files)
    const tempDir = join(os.tmpdir(), 'sna-uploads');
    const filePath = join(tempDir, fileName);

    try {
      const fileBuffer = await fs.readFile(filePath);

      // Return as binary Excel file
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    } catch (fileErr) {
      console.error('File not found in temp dir:', filePath);
      return NextResponse.json(
        { error: 'File not found or expired', details: 'Processed files are kept for 1 hour' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  }
}

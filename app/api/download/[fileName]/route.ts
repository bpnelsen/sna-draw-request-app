import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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

    // For production: Download from VPS or cloud storage
    // For MVP: Return placeholder
    return NextResponse.json(
      {
        message: 'File download',
        fileName,
        note: 'Processed file is available on your VPS at /results/' + fileName,
        instructions: 'Download from VPS: scp user@vps-ip:/results/' + fileName + ' .',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  }
}

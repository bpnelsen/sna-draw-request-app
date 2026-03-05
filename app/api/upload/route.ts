import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/upload
 * Accepts Excel file upload and queues it to VPS backend for processing
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

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileData = buffer.toString('base64');

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;

    // Get VPS backend URL and API key from environment
    const vpsBackendUrl = process.env.VPS_BACKEND_URL || 'http://localhost:3001';
    const apiKey = process.env.SNA_API_KEY || 'default-key';

    // Queue file to VPS backend
    const callbackUrl = `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/process-complete`;

    try {
      const response = await fetch(`${vpsBackendUrl}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({
          fileName,
          fileData,
          callbackUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { error: result.error || 'Processing failed' },
          { status: 500 }
        );
      }

      // Save to history
      await fetch(new URL('/api/history', req.url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          originalFileName: file.name,
          status: 'completed',
          downloadUrl: `/api/download/${result.fileName}`,
        }),
      }).catch((err) => console.warn('Failed to save history:', err));

      return NextResponse.json({
        success: true,
        fileName: result.fileName,
        downloadUrl: `/api/download/${result.fileName}`,
        message: 'File processed successfully!',
        processedData: result.fileData, // Base64 encoded processed file
      });
    } catch (backendErr) {
      console.error('VPS backend error:', backendErr);

      // Fallback: Return file for local processing
      return NextResponse.json({
        success: false,
        error: 'VPS backend unavailable',
        message: 'VPS backend is not responding. Please ensure the server is running.',
        fileName,
        fileData, // Return file data for debugging
        note: 'Run the VPS server: node /path/to/server.js',
      }, { status: 503 });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

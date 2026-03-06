import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execFileAsync = promisify(execFile);

/**
 * POST /api/upload
 * Processes Excel file directly (no VPS backend needed!)
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

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filenames
    const timestamp = Date.now();
    const inputFileName = `${timestamp}_${file.name}`;
    const outputFileName = `organized_${inputFileName}`;

    // Use /tmp for temporary files (works in serverless)
    const inputPath = `/tmp/${inputFileName}`;
    const outputPath = `/tmp/${outputFileName}`;

    try {
      // Write input file
      fs.writeFileSync(inputPath, buffer);
      console.log(`✅ File saved: ${inputPath}`);

      // Check if Python script exists
      const scriptPath = '/data/.openclaw/workspace/sna-script/reorganize_sna_draw_request.py';
      if (!fs.existsSync(scriptPath)) {
        return NextResponse.json(
          { error: 'Python processor not found' },
          { status: 500 }
        );
      }

      // Run Python processor
      console.log(`⏳ Processing: python3 ${scriptPath} "${inputPath}" "${outputPath}"`);
      
      try {
        await execFileAsync('python3', [scriptPath, inputPath, outputPath], {
          timeout: 30000, // 30 second timeout
        });
        
        console.log(`✅ Processing complete: ${outputPath}`);

        // Read processed file
        const processedBuffer = fs.readFileSync(outputPath);
        const processedBase64 = processedBuffer.toString('base64');

        // Save to history
        try {
          await fetch(new URL('/api/history', req.url), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: outputFileName,
              originalFileName: file.name,
              status: 'completed',
              downloadUrl: `/api/download/${outputFileName}`,
            }),
          });
        } catch (historyErr) {
          console.warn('Failed to save history:', historyErr);
        }

        // Clean up temp files
        setTimeout(() => {
          try {
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
          } catch (e) {
            console.warn('Failed to cleanup temp files:', e);
          }
        }, 5000);

        return NextResponse.json({
          success: true,
          fileName: outputFileName,
          downloadUrl: `/api/download/${outputFileName}`,
          message: 'File processed successfully!',
          processedData: processedBase64,
        });
      } catch (pythonErr: any) {
        console.error('Python execution error:', pythonErr);
        return NextResponse.json(
          { 
            error: 'Processing failed',
            details: pythonErr.message,
            stderr: pythonErr.stderr,
          },
          { status: 500 }
        );
      }
    } catch (fileErr) {
      console.error('File operation error:', fileErr);
      return NextResponse.json(
        { error: 'File processing error' },
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

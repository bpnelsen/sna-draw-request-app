import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

    // Create uploads directory
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    const resultsDir = join(process.cwd(), 'public', 'results');
    
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    if (!existsSync(resultsDir)) {
      await mkdir(resultsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const inputFileName = `${timestamp}_${file.name}`;
    const outputFileName = `${timestamp}_organized_${file.name}`;
    const inputPath = join(uploadsDir, inputFileName);
    const outputPath = join(resultsDir, outputFileName);

    // Save uploaded file
    await writeFile(inputPath, buffer);

    // Call Python script on VPS
    try {
      // This would call the Python script via SSH or HTTP endpoint on your VPS
      // For now, we'll simulate it
      const pythonScriptPath = '/data/.openclaw/workspace/sna-script/reorganize_sna_draw_request.py';
      
      // Execute Python script
      await execAsync(`python3 ${pythonScriptPath} "${inputPath}" "${outputPath}"`);

      // Return download URL
      return NextResponse.json({
        success: true,
        fileName: outputFileName,
        downloadUrl: `/results/${outputFileName}`,
        message: 'File processed successfully',
      });
    } catch (pythonError) {
      console.error('Python script error:', pythonError);
      
      // Return more helpful error message
      return NextResponse.json(
        { error: 'Failed to process file. Ensure the Excel file has the correct format.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

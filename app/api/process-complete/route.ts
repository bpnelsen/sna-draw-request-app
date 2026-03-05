import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const HISTORY_FILE = join(process.cwd(), 'data', 'history.json');

async function ensureHistoryFile() {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true });
  }
  if (!existsSync(HISTORY_FILE)) {
    await writeFile(HISTORY_FILE, JSON.stringify({ uploads: [] }));
  }
}

async function readHistory() {
  await ensureHistoryFile();
  const content = await readFile(HISTORY_FILE, 'utf-8');
  return JSON.parse(content);
}

async function writeHistory(data: any) {
  await ensureHistoryFile();
  await writeFile(HISTORY_FILE, JSON.stringify(data, null, 2));
}

/**
 * POST /api/process-complete
 * Webhook called by VPS backend when processing is complete
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, status, timestamp } = body;

    if (!fileName) {
      return NextResponse.json(
        { error: 'fileName required' },
        { status: 400 }
      );
    }

    // Update history with completion status
    const history = await readHistory();
    
    const existingIndex = history.uploads.findIndex(
      (u: any) => u.fileName === fileName
    );

    if (existingIndex >= 0) {
      history.uploads[existingIndex].status = status || 'completed';
      history.uploads[existingIndex].processedAt = timestamp || new Date().toISOString();
      history.uploads[existingIndex].downloadUrl = `/api/download/${fileName}`;
    }

    await writeHistory(history);

    console.log(`✅ Processing complete webhook received: ${fileName}`);

    return NextResponse.json({
      message: 'Webhook received',
      fileName,
      status,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

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

export async function GET(req: NextRequest) {
  try {
    const history = await readHistory();
    return NextResponse.json(history);
  } catch (error) {
    console.error('Failed to read history:', error);
    return NextResponse.json(
      { uploads: [] },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const history = await readHistory();

    const newRecord = {
      id: Date.now().toString(),
      fileName: body.fileName,
      originalFileName: body.originalFileName,
      uploadDate: new Date().toISOString(),
      status: body.status,
      downloadUrl: body.downloadUrl || null,
      errorMessage: body.errorMessage || null,
    };

    history.uploads.unshift(newRecord);
    await writeHistory(history);

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error('Failed to save history:', error);
    return NextResponse.json(
      { error: 'Failed to save history' },
      { status: 500 }
    );
  }
}

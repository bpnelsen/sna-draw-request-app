import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir, unlink } from 'fs/promises';
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const history = await readHistory();
    const recordIndex = history.uploads.findIndex((u: any) => u.id === params.id);

    if (recordIndex === -1) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    const record = history.uploads[recordIndex];

    // Delete the file if it exists
    if (record.downloadUrl) {
      const filePath = join(process.cwd(), 'public', record.downloadUrl);
      try {
        if (existsSync(filePath)) {
          await unlink(filePath);
        }
      } catch (err) {
        console.error('Failed to delete file:', err);
      }
    }

    // Remove from history
    history.uploads.splice(recordIndex, 1);
    await writeHistory(history);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete record:', error);
    return NextResponse.json(
      { error: 'Failed to delete record' },
      { status: 500 }
    );
  }
}

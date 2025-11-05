import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const promptPath = join(process.cwd(), 'src', 'lib', 'prompt', 'v3.md');
    const content = await readFile(promptPath, 'utf-8');

    return NextResponse.json({
      success: true,
      content,
    });
  } catch (error) {
    console.error('Error reading prompt file:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to read prompt file',
      },
      { status: 500 }
    );
  }
}


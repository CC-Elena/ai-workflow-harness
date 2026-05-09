import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';

import { assets } from '../../../workflow-data';

const allowedPaths = new Set(assets.map((asset) => asset.path));
const repoRoot = process.cwd();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedPath = url.searchParams.get('path') ?? '';

  if (!allowedPaths.has(requestedPath)) {
    return Response.json({ error: 'File not found or not allowed' }, { status: 404 });
  }

  try {
    const absolutePath = path.join(repoRoot, requestedPath);
    const realRoot = await realpath(repoRoot);
    const realFile = await realpath(absolutePath);

    if (!realFile.startsWith(realRoot + path.sep)) {
      return Response.json({ error: 'File not found or not allowed' }, { status: 404 });
    }

    const content = await readFile(realFile, 'utf8');

    return Response.json({
      path: requestedPath,
      content,
      size: Buffer.byteLength(content, 'utf8')
    });
  } catch {
    return Response.json({ error: 'File not found or not allowed' }, { status: 404 });
  }
}

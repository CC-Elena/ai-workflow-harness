import { readFile } from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const specsDir = path.join(repoRoot, 'specs');

const textExtensions = new Set([
  '.md',
  '.log',
  '.txt',
  '.json',
  '.csv',
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.css',
  '.yml',
  '.yaml'
]);

const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']);

const imageContentType: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

/** 校验请求路径必须落在 specs/ 目录内，防止路径穿越。 */
function resolveEvidencePath(requestedPath: string): string {
  const normalized = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, '');
  const absolute = path.resolve(repoRoot, normalized);
  const specsRoot = path.resolve(specsDir);
  if (absolute !== specsRoot && !absolute.startsWith(specsRoot + path.sep)) {
    throw new Error('Evidence path not allowed');
  }
  return absolute;
}

export type EvidenceResult =
  | { kind: 'text'; path: string; content: string; size: number }
  | { kind: 'image'; path: string; contentType: string; data: Buffer }
  | { kind: 'unsupported'; path: string };

/** 安全读取 specs/ 下的证据文件（文本或图片）。 */
export async function readEvidence(requestedPath: string): Promise<EvidenceResult> {
  const absolute = resolveEvidencePath(requestedPath);
  const ext = path.extname(absolute).toLowerCase();

  if (textExtensions.has(ext)) {
    const content = await readFile(absolute, 'utf8');
    return { kind: 'text', path: requestedPath, content, size: Buffer.byteLength(content, 'utf8') };
  }

  if (imageExtensions.has(ext)) {
    const data = await readFile(absolute);
    return { kind: 'image', path: requestedPath, contentType: imageContentType[ext], data };
  }

  return { kind: 'unsupported', path: requestedPath };
}

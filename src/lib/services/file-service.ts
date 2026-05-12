import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';

import { assets } from '../data/workflow-data';

const allowedPaths = new Set(assets.map((asset) => asset.path));
const repoRoot = process.cwd();

/**
 * 安全读取仓库资产文件的内容
 * 
 * 校验请求的文件路径是否在 allowedPaths 中，并防止路径穿越攻击 (Path Traversal)。
 * 如果文件合法，读取 UTF-8 文本并返回基本信息。
 * 
 * @param {string} requestedPath - 请求读取的相对文件路径
 * @returns {Promise<{path: string, content: string, size: number}>} 文件内容及元数据
 * @throws {Error} 如果路径不被允许或文件不存在时抛出
 */
export async function getFileContent(requestedPath: string) {
  if (!allowedPaths.has(requestedPath)) {
    throw new Error('File not found or not allowed');
  }

  const absolutePath = path.join(repoRoot, requestedPath);
  const realRoot = await realpath(repoRoot);
  const realFile = await realpath(absolutePath);

  if (!realFile.startsWith(realRoot + path.sep)) {
    throw new Error('File not found or not allowed');
  }

  const content = await readFile(realFile, 'utf8');

  return {
    path: requestedPath,
    content,
    size: Buffer.byteLength(content, 'utf8')
  };
}

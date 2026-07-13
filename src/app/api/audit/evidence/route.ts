import { readEvidence } from '../../../../lib/services/audit-evidence-service';

/**
 * 证据文件读取 API
 *
 * 接收 `?path=` 查询参数，安全读取 `specs/` 目录下的证据文件。
 * 文本文件返回 JSON 内容；图片默认返回元数据，带 `?raw=1` 时返回原始字节。
 *
 * @param {Request} request - 传入请求
 * @returns {Promise<Response>} 证据内容或图片响应
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedPath = url.searchParams.get('path') ?? '';
  const raw = url.searchParams.get('raw') === '1';

  try {
    const result = await readEvidence(requestedPath);

    if (result.kind === 'image') {
      if (raw) {
        return new Response(new Uint8Array(result.data), {
          headers: { 'Content-Type': result.contentType, 'Cache-Control': 'no-store' }
        });
      }
      return Response.json({ kind: 'image', path: result.path });
    }

    if (result.kind === 'unsupported') {
      return Response.json({ kind: 'unsupported', path: result.path });
    }

    return Response.json({
      kind: 'text',
      path: result.path,
      content: result.content,
      size: result.size
    });
  } catch (error) {
    console.warn('Failed to read evidence file.', error);
    return Response.json({ error: 'Evidence not found or not allowed' }, { status: 404 });
  }
}

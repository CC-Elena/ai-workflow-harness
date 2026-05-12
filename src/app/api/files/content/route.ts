import { getFileContent } from '../../../../lib/services/file-service';

/**
 * 获取资产文件内容的 API 路由
 * 
 * 接收 `?path=` 查询参数，调用后端 Service 层读取文件内容并返回。
 * 如果发生错误（如越权访问或文件不存在），返回 404 状态码。
 * 
 * @param {Request} request - 传入的 Next.js API 请求对象
 * @returns {Promise<Response>} 包含文件内容信息的 JSON 响应
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedPath = url.searchParams.get('path') ?? '';

  try {
    const fileData = await getFileContent(requestedPath);
    return Response.json(fileData);
  } catch {
    return Response.json({ error: 'File not found or not allowed' }, { status: 404 });
  }
}

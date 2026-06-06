/* ========================================
   Cloudflare Pages Function — 图片服务 API
   路由: /api/image/:id
   公开读取，返回图片二进制数据
   ======================================== */

export async function onRequest(context) {
  const { request, env, params } = context;
  const id = params.id;

  // 仅允许 GET
  if (request.method !== 'GET' && request.method !== 'OPTIONS') {
    return new Response('Method not allowed', { status: 405 });
  }

  // CORS 预检
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  try {
    const value = await env.CLASS39_DATA.get('class39_' + id);

    if (!value) {
      return new Response('Image not found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 解析 data URL：data:image/jpeg;base64,xxxxx
    let mimeType = 'image/jpeg';
    let base64Data = value;

    const match = value.match(/^data:(image\/\w+);base64,(.+)$/);
    if (match) {
      mimeType = match[1];
      base64Data = match[2];
    }

    // Base64 → 二进制（先清洗数据，atob 对格式要求严格）
    // 移除所有空白字符和非 base64 字符
    base64Data = base64Data.replace(/[^A-Za-z0-9+/=]/g, '');
    // 确保长度是 4 的倍数（标准 base64 要求）
    while (base64Data.length % 4 !== 0) {
      base64Data += '=';
    }
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    return new Response(bytes, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (e) {
    console.error('[Image] 读取失败: ' + id + ' - ' + (e.message || ''));
    return new Response('Error serving image: ' + (e.message || 'unknown'), {
      status: 500,
      headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

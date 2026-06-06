/* ========================================
   Cloudflare Pages Function — 图片上传 API
   路由: /api/upload
   需管理员密码，接受 base64 图片数据
   ======================================== */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
  'Content-Type': 'application/json; charset=utf-8'
};

const ADMIN_PASSWORD = '39ban2024';
const MAX_SIZE_MB = 3;

export async function onRequest(context) {
  const { request, env } = context;

  // CORS 预检
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  // 仅允许 POST
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: '仅支持 POST 方法' }), { status: 405, headers: CORS });
  }

  // 权限验证
  const pw = request.headers.get('X-Admin-Password') || '';
  if (pw !== ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: '密码错误，无权限上传图片' }), { status: 401, headers: CORS });
  }

  try {
    const body = await request.json();
    const imageData = (body.data || '').trim();

    if (!imageData || !imageData.startsWith('data:image/')) {
      return new Response(JSON.stringify({ error: '无效的图片数据，请使用 JPEG/PNG/WebP 格式' }), { status: 400, headers: CORS });
    }

    // 大小检查（base64 编码膨胀约 4/3，取 0.75 系数估算原始大小）
    const estimatedMB = (imageData.length * 0.75) / (1024 * 1024);
    if (estimatedMB > MAX_SIZE_MB) {
      return new Response(JSON.stringify({ error: '图片过大（约' + estimatedMB.toFixed(1) + 'MB），请压缩到 ' + MAX_SIZE_MB + 'MB 以内' }), { status: 413, headers: CORS });
    }

    // 生成唯一 ID
    const id = 'img_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);

    // 存入 KV（key: class39_img_xxx）
    await env.CLASS39_DATA.put('class39_' + id, imageData);

    console.log('[Upload] 图片已存储: ' + id + ' 大小约' + estimatedMB.toFixed(2) + 'MB');

    return new Response(JSON.stringify({
      success: true,
      url: '/api/image/' + id
    }), { headers: CORS });

  } catch (e) {
    console.error('[Upload] 失败: ' + (e.message || '未知'));
    return new Response(JSON.stringify({ error: '上传失败：' + (e.message || '服务器内部错误') }), { status: 500, headers: CORS });
  }
}

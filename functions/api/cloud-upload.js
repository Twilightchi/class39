/* ========================================
   Cloudflare Pages Function — 云相册公开图片上传
   路由: /api/cloud-upload
   公开访问，无需管理员密码
   ======================================== */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json; charset=utf-8'
};

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: '仅支持 POST' }), { status: 405, headers: CORS });
  }

  try {
    const body = await request.json();
    const imageData = (body.data || '').trim();

    if (!imageData || !imageData.startsWith('data:image/')) {
      return new Response(JSON.stringify({ error: '无效的图片数据' }), { status: 400, headers: CORS });
    }

    // 检查 MIME 类型
    const mimeMatch = imageData.match(/^data:(image\/\w+);/);
    if (!mimeMatch || !ALLOWED_TYPES.includes(mimeMatch[1])) {
      return new Response(JSON.stringify({ error: '仅支持 JPEG、PNG、WebP、GIF 格式' }), { status: 400, headers: CORS });
    }

    // 大小检查
    const estimatedMB = (imageData.length * 0.75) / (1024 * 1024);
    if (estimatedMB > MAX_SIZE_MB) {
      return new Response(JSON.stringify({ error: '图片过大（约' + estimatedMB.toFixed(1) + 'MB），请压缩到 ' + MAX_SIZE_MB + 'MB 以内' }), { status: 413, headers: CORS });
    }

    const id = 'cimg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
    await env.CLASS39_DATA.put('class39_' + id, imageData);

    console.log('[CloudUpload] 公开上传: ' + id + ' 大小约' + estimatedMB.toFixed(2) + 'MB');

    return new Response(JSON.stringify({
      success: true,
      url: '/api/image/' + id
    }), { headers: CORS });

  } catch (e) {
    console.error('[CloudUpload] 失败: ' + (e.message || ''));
    return new Response(JSON.stringify({ error: '上传失败：' + (e.message || '服务器错误') }), { status: 500, headers: CORS });
  }
}

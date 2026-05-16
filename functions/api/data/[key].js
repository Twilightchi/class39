/* ========================================
   Cloudflare Pages Function — 班级数据 API
   路由: /api/data/:key
   ======================================== */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store, no-cache, must-revalidate'
};

const ADMIN_PASSWORD = '39ban2024';

const ALLOWED_KEYS = ['notices', 'honors', 'gallery', 'hero_bg', 'messages', 'banned_words'];

export async function onRequest(context) {
  const { request, env, params } = context;
  const key = params.key;

  if (!ALLOWED_KEYS.includes(key)) {
    return new Response(JSON.stringify({ error: '无效的数据类型' }), { status: 400, headers: CORS });
  }

  // CORS 预检
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  // GET — 公开读取
  if (request.method === 'GET') {
    try {
      const value = await env.CLASS39_DATA.get('class39_' + key);
      if (value) {
        return new Response(value, { headers: CORS });
      }
      return new Response('null', { headers: CORS });
    } catch (e) {
      return new Response(JSON.stringify({ error: '读取失败' }), { status: 500, headers: CORS });
    }
  }

  // PUT — 写入（留言公开写入，其他需要管理员密码）
  if (request.method === 'PUT') {
    if (key !== 'messages') {
      const pw = request.headers.get('X-Admin-Password') || '';
      if (pw !== ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ error: '密码错误，无权限修改' }), { status: 401, headers: CORS });
      }
    }

    try {
      const body = await request.text();
      await env.CLASS39_DATA.put('class39_' + key, body);
      return new Response(JSON.stringify({ success: true }), { headers: CORS });
    } catch (e) {
      return new Response(JSON.stringify({ error: '写入失败：' + (e.message || '未知') }), { status: 500, headers: CORS });
    }
  }

  return new Response(JSON.stringify({ error: '不支持的请求方法' }), { status: 405, headers: CORS });
}

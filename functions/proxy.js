/**
 * Cloudflare Pages Function - CORS 代理服务
 * 用途：解决前端跨域问题
 * 部署平台：Cloudflare Pages Functions
 * 优化：添加响应缓存头，减少重复请求
 */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // 获取要代理的目标 URL
  const targetUrl = url.searchParams.get("url");

  // 处理 OPTIONS 预检请求
  if (request.method === "OPTIONS") {
    return handleCORS();
  }

  // 验证目标 URL
  if (!targetUrl) {
    return new Response("缺少 URL 参数", {
      status: 400,
      headers: getCORSHeaders(),
    });
  }

  try {
    // 解码目标 URL
    const decodedUrl = decodeURIComponent(targetUrl);

    // 构建代理请求选项
    const proxyRequestInit = {
      method: request.method,
      headers: {},
    };

    // 复制请求头（排除 Host 等敏感头）
    const excludeHeaders = ["host", "origin", "referer", "cookie"];
    for (const [key, value] of request.headers) {
      const lowerKey = key.toLowerCase();
      if (!excludeHeaders.includes(lowerKey)) {
        proxyRequestInit.headers[key] = value;
      }
    }

    // 处理请求体（POST/PUT/PATCH）
    if (["POST", "PUT", "PATCH"].includes(request.method)) {
      proxyRequestInit.body = await request.text();
    }

    // 发起代理请求（添加超时控制）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
    
    try {
      const response = await fetch(decodedUrl, {
        ...proxyRequestInit,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      // 复制响应头并添加 CORS 头
      const responseHeaders = new Headers(response.headers);
      const corsHeaders = getCORSHeaders();

      for (const [key, value] of Object.entries(corsHeaders)) {
        responseHeaders.set(key, value);
      }

      // 添加不缓存策略（确保实时性）
      responseHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate");
      responseHeaders.set("Pragma", "no-cache");
      responseHeaders.set("Expires", "0");

      // 返回代理响应
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return new Response("请求超时", {
          status: 504,
          headers: getCORSHeaders(),
        });
      }
      throw fetchError;
    }
  } catch (error) {
    return new Response(`代理请求失败: ${error.message}`, {
      status: 500,
      headers: getCORSHeaders(),
    });
  }
}

/**
 * 处理 CORS 预检请求
 */
function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: getCORSHeaders(),
  });
}

/**
 * 获取 CORS 响应头
 */
function getCORSHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Max-Age": "86400",
    "Access-Control-Expose-Headers": "*",
  };
}

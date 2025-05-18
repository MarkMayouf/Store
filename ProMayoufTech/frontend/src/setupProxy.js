const {
  createProxyMiddleware
} = require('http-proxy-middleware');

const PORT = process.env.BACKEND_PORT || 5000;
const TARGET = process.env.BACKEND_URL || `http://localhost:${PORT}`;

// Create React App expects CommonJS module syntax
module.exports = function (app) {
  const proxyConfig = {
    target: TARGET,
    changeOrigin: true,
    secure: false,
    ws: true,
    xfwd: true,

    onProxyReq: (proxyReq, req, res) => {
      console.log(`[ProxyReq] ${req.method} ${req.url} → ${TARGET}${req.url}`);
      proxyReq.setHeader('X-Forwarded-For', req.connection.remoteAddress);
    },

    onProxyRes: (proxyRes, req, res) => {
      console.log(`[ProxyRes] ${proxyRes.statusCode} ← ${req.method} ${req.url}`);
      
      // Log detailed information for non-200 responses
      if (proxyRes.statusCode >= 400) {
        console.error(`[ProxyError] ${proxyRes.statusCode} response for ${req.method} ${req.url}`);
        let responseBody = '';
        
        proxyRes.on('data', function(data) {
          responseBody += data.toString('utf8');
        });
        
        proxyRes.on('end', function() {
          try {
            const parsedBody = JSON.parse(responseBody);
            console.error('[ProxyError] Response body:', parsedBody);
          } catch (e) {
            console.error('[ProxyError] Response body (raw):', responseBody);
          }
        });
      }
    },

    onError: (err, req, res) => {
      console.error('[ProxyError]', err.message);
      
      if (!res.headersSent && res.writeHead) {
        try {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            message: 'Proxy Error',
            error: err.message,
            code: err.code
          }));
        } catch (writeErr) {
          console.error('[ProxyError] Failed to send error response:', writeErr);
        }
      }
    }
  };

  // API routes proxy
  app.use('/api', createProxyMiddleware(proxyConfig));

  // WebSocket proxy
  app.use('/ws', createProxyMiddleware({ ...proxyConfig, ws: true }));

  app.use(
    '/images',
    createProxyMiddleware(proxyConfig)
  );

  app.use(
    '/uploads',
    createProxyMiddleware(proxyConfig)
  );
}
#!/usr/bin/env node
const https = require('https');

const apiOrigin = process.env.API_ORIGIN || 'https://revive-api.telente.site';
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'https://revive-root-essentials.telente.site';

const request = (path, method = 'GET', extraHeaders = {}) => new Promise((resolve, reject) => {
  const url = new URL(path, apiOrigin);
  const req = https.request(url, {
    method,
    headers: {
      Origin: frontendOrigin,
      ...extraHeaders,
    },
  }, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => resolve({
      statusCode: res.statusCode,
      headers: res.headers,
      body,
    }));
  });
  req.on('error', reject);
  req.end();
});

const main = async () => {
  const checks = [
    ['GET /health', '/health', 'GET', {}],
    ['GET /api/version', '/api/version', 'GET', {}],
    [
      'OPTIONS /api/products/featured',
      '/api/products/featured',
      'OPTIONS',
      {
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization,x-csrf-token,x-currency,content-type',
      },
    ],
  ];

  let hasFailure = false;
  for (const [label, path, method, headers] of checks) {
    try {
      const result = await request(path, method, headers);
      const allowOrigin = result.headers['access-control-allow-origin'] || '';
      console.log(`${label}: ${result.statusCode} allow-origin=${allowOrigin || 'missing'}`);
      if (result.statusCode >= 500 || (method === 'OPTIONS' && !allowOrigin)) {
        hasFailure = true;
      }
    } catch (error) {
      hasFailure = true;
      console.error(`${label}: request failed`, error.message);
    }
  }

  if (hasFailure) {
    console.error('Deployment CORS/availability check failed.');
    process.exit(1);
  }
};

main();

const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
const { handleAuth } = require('./routes/auth');
const { handleProducts } = require('./routes/products');
const { authenticate } = require('./middleware/auth');

dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://b22dat093:123@cluster0.lwdopjb.mongodb.net/?appName=Cluster0';

mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;

function sendJson(res, status, data) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  };
  res.writeHead(status, headers);
  res.end(JSON.stringify(data));
}

function sendText(res, status, text) {
  const headers = {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  };
  res.writeHead(status, headers);
  res.end(text);
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function normalizePath(path) {
  return path.replace(/\/\/+$/, '') || '/';
}

const server = http.createServer(async (req, res) => {
  const reqUrl = req.url || '/';
  const pathname = normalizePath(reqUrl.split('?')[0]);
  const method = req.method || 'GET';

  if (method === 'OPTIONS') {
    sendText(res, 204, '');
    return;
  }

  if (pathname === '/' && method === 'GET') {
    sendText(res, 200, 'Product management API is running');
    return;
  }

  let body = {};
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      body = await parseJsonBody(req);
    } catch (error) {
      sendJson(res, 400, { message: 'Invalid JSON body.' });
      return;
    }
  }

  if (pathname.startsWith('/api/auth')) {
    return handleAuth(req, res, pathname, method, body, sendJson);
  }

  if (pathname.startsWith('/api/products')) {
    const user = authenticate(req, res, sendJson);
    if (!user) return;
    return handleProducts(req, res, pathname, method, body, sendJson);
  }

  sendJson(res, 404, { message: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

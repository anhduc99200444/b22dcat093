const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'verysecretdefault';

function sendUnauthorized(res, message = 'Không được phép truy cập.') {
  res.writeHead(401, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  });
  res.end(JSON.stringify({ message }));
}

function authenticate(req, res) {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    sendUnauthorized(res, 'Thiếu token đăng nhập.');
    return null;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    return decoded;
  } catch (error) {
    sendUnauthorized(res, 'Token không hợp lệ hoặc đã hết hạn.');
    return null;
  }
}

module.exports = { authenticate };
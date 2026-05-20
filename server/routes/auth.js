const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const jwtSecret = process.env.JWT_SECRET || 'verysecretdefault';

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  });
  res.end(JSON.stringify(data));
}

async function handleAuth(req, res, pathname, method, body, sendJsonFn = sendJson) {
  if (method === 'POST' && pathname === '/api/auth/login') {
    try {
      const { email, password } = body || {};
      console.log('LOGIN BODY:', body);

      if (!email || !password) {
        return sendJsonFn(res, 400, { message: 'Email và mật khẩu bắt buộc.' });
      }

      const user = await User.findOne({ email });
      console.log('FOUND USER:', user);

      if (!user) {
        return sendJsonFn(res, 401, { message: 'Email hoặc mật khẩu không đúng.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      console.log('PASSWORD MATCH:', isMatch);

      if (!isMatch) {
        return sendJsonFn(res, 401, { message: 'Email hoặc mật khẩu không đúng.' });
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email },
        jwtSecret,
        { expiresIn: '1d' }
      );

      return sendJsonFn(res, 200, {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error('LOGIN ERROR:', error);
      return sendJsonFn(res, 500, {
        message: 'Không thể đăng nhập.',
        error: error.message,
      });
    }
  }

  return sendJsonFn(res, 404, { message: 'Route not found' });
}

module.exports = { handleAuth };
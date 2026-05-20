const Product = require('../models/Product');

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  });
  res.end(JSON.stringify(data));
}

function getProductId(pathname) {
  const segments = pathname.replace(/\/\/+$/, '').split('/');
  return segments.length === 4 ? segments[3] : null;
}

async function handleProducts(req, res, pathname, method, body, sendJsonFn = sendJson) {
  const productId = getProductId(pathname);

  if (method === 'GET' && pathname === '/api/products') {
    try {
      const products = await Product.find().sort({ createdAt: -1 });
      return sendJsonFn(res, 200, products);
    } catch (error) {
      return sendJsonFn(res, 500, { message: 'Unable to fetch products', error: error.message });
    }
  }

  if (method === 'GET' && productId) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        return sendJsonFn(res, 404, { message: 'Product not found' });
      }
      return sendJsonFn(res, 200, product);
    } catch (error) {
      return sendJsonFn(res, 500, { message: 'Unable to fetch product', error: error.message });
    }
  }

  if (method === 'POST' && pathname === '/api/products') {
    try {
      const newProduct = new Product(body);
      const savedProduct = await newProduct.save();
      return sendJsonFn(res, 201, savedProduct);
    } catch (error) {
      return sendJsonFn(res, 400, { message: 'Unable to create product', error: error.message });
    }
  }

  if (method === 'PUT' && productId) {
    try {
      const updatedProduct = await Product.findByIdAndUpdate(productId, body, {
        new: true,
        runValidators: true,
      });
      if (!updatedProduct) {
        return sendJsonFn(res, 404, { message: 'Product not found' });
      }
      return sendJsonFn(res, 200, updatedProduct);
    } catch (error) {
      return sendJsonFn(res, 400, { message: 'Unable to update product', error: error.message });
    }
  }

  if (method === 'DELETE' && productId) {
    try {
      const deletedProduct = await Product.findByIdAndDelete(productId);
      if (!deletedProduct) {
        return sendJsonFn(res, 404, { message: 'Product not found' });
      }
      return sendJsonFn(res, 200, { message: 'Product deleted' });
    } catch (error) {
      return sendJsonFn(res, 500, { message: 'Unable to delete product', error: error.message });
    }
  }

  return sendJsonFn(res, 404, { message: 'Route not found' });
}

module.exports = { handleProducts };

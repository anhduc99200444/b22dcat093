# Product Management Web App

Ứng dụng quản lý sản phẩm full-stack sử dụng Node.js + Express + MongoDB và React + Vite.

## Cấu trúc dự án

- `server/` - backend Express + Mongoose
- `client/` - frontend React + Vite

## Cài đặt

1. Mở terminal ở thư mục `server` và cài đặt:
   ```bash
   cd server
   npm install
   ```

2. Mở terminal ở thư mục `client` và cài đặt:
   ```bash
   cd client
   npm install
   ```

3. Tạo file `.env` trong `server/` nếu muốn tùy chỉnh URI MongoDB:
   ```bash
   cp .env.example .env
   ```

## Chạy ứng dụng

- Chạy backend:
  ```bash
  cd server
  npm run dev
  ```

- Chạy frontend:
  ```bash
  cd client
  npm run dev
  ```

## API

Backend cung cấp endpoint:

- `GET /api/products` - lấy danh sách sản phẩm
- `GET /api/products/:id` - lấy một sản phẩm
- `POST /api/products` - tạo sản phẩm mới
- `PUT /api/products/:id` - cập nhật sản phẩm
- `DELETE /api/products/:id` - xóa sản phẩm

## Ghi chú

- Frontend mặc định kết nối tới `http://localhost:5000/api/products`.
- URL MongoDB mặc định đã đặt trong `server/.env.example`.

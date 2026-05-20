import { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:5000/api';
const PRODUCT_URL = `${API_BASE}/products`;
const LOGIN_URL = `${API_BASE}/auth/login`;

const initialForm = {
  name: '',
  description: '',
  category: '',
  price: 0,
  quantity: 0,
};

const categories = [
  'Smartphone',
  'Laptop',
  'Headphones',
  'Tablet',
  'Smartwatch',
  'Gaming Console',
  'Smart Home Device',
  'Other',
];

const initialAuthForm = {
  email: '',
  password: '',
};

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authForm, setAuthForm] = useState(initialAuthForm);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  useEffect(() => {
    if (token) {
      loadProducts();
    }
  }, [token]);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(PRODUCT_URL, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      });

      if (response.status === 401) {
        handleLogout();
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        return;
      }

      const data = await response.json();
      setProducts(data);
      setError('');
    } catch (err) {
      setError('Không thể tải sản phẩm.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'quantity' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${PRODUCT_URL}/${editingId}` : PRODUCT_URL;
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(form),
      });

      if (response.status === 401) {
        handleLogout();
        setError('Không được phép. Vui lòng đăng nhập lại.');
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Không thể lưu sản phẩm.');
      }

      setForm(initialForm);
      setEditingId(null);
      loadProducts();
      setError('');
    } catch (err) {
      setError(err.message || 'Không thể lưu sản phẩm.');
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      price: product.price || 0,
      quantity: product.quantity || 0,
    });
    setEditingId(product._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

    try {
      const response = await fetch(`${PRODUCT_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      });

      if (response.status === 401) {
        handleLogout();
        setError('Không được phép. Vui lòng đăng nhập lại.');
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Không thể xóa sản phẩm.');
      }

      loadProducts();
      setError('');
    } catch (err) {
      setError(err.message || 'Không thể xóa sản phẩm.');
    }
  };

  const handleCancel = () => {
    setForm(initialForm);
    setEditingId(null);
    setError('');
  };

  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    setAuthForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Tài khoản hoặc mật khẩu không đúng.');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuthForm(initialAuthForm);
      setError('');
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại.');
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    setProducts([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (!token) {
    return (
      <div className="app-shell">
        <header>
          <h1>Đăng nhập</h1>
        </header>

        <section className="form-card">
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleAuthSubmit}>
            <label>
              Tài khoản
              <input name="email" value={authForm.email} onChange={handleAuthChange} required />
            </label>
            <label>
              Mật khẩu
              <input name="password" type="password" value={authForm.password} onChange={handleAuthChange} required />
            </label>
            <div className="button-row">
              <button type="submit">Đăng nhập</button>
            </div>
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header>
        <div className="header-row">
          <h1>Quản lý sản phẩm</h1>
          <div>
            <span>Xin chào, {user?.name}</span>
            <button className="secondary" onClick={handleLogout}>Đăng xuất</button>
          </div>
        </div>
      </header>

      <section className="form-card">
        <h2>{editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>
            Tên sản phẩm
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Mô tả
            <textarea name="description" value={form.description} onChange={handleChange} />
          </label>
          <label>
            Loại
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="">Chọn loại</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>
          <div className="row">
            <label>
              Giá
              <input name="price" type="number" min="0" value={form.price} onChange={handleChange} required />
            </label>
            <label>
              Số lượng
              <input name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} required />
            </label>
          </div>
          <div className="button-row">
            <button type="submit">{editingId ? 'Cập nhật' : 'Thêm'}</button>
            {editingId && <button type="button" className="secondary" onClick={handleCancel}>Hủy</button>}
          </div>
        </form>
      </section>

      <section className="table-card">
        <h2>Danh sách sản phẩm</h2>
        {loading ? (
          <div>Đang tải...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Tên</th>
                <th>Loại</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan="5">Không có sản phẩm nào.</td>
                </tr>
              )}
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.price.toLocaleString()}</td>
                  <td>{product.quantity}</td>
                  <td>
                    <button onClick={() => handleEdit(product)}>Sửa</button>
                    <button className="danger" onClick={() => handleDelete(product._id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default App;
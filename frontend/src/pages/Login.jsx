import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Activity } from 'lucide-react';

const Login = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center" style={{ minHeight: '80vh', justifyContent: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '450px' }}>
        <div className="text-center mb-4">
          <Activity color="var(--accent-neon)" size={48} style={{ margin: '0 auto' }} />
          <h2 className="gradient-text mt-4">Welcome Back</h2>
          <p>Login to continue your fitness journey</p>
        </div>

        {error && <div className="glass-panel" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', marginBottom: '1rem', padding: '12px' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="grid">
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="neon@fitness.com" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary mt-4" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Processing...' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p>Don't have an account? <Link to="/register" style={{ color: 'var(--accent-neon)', textDecoration: 'none' }}>Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;

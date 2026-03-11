import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { UserPlus } from 'lucide-react';

const Register = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred during registration');
    }
  };

  return (
    <div className="flex items-center" style={{ minHeight: '80vh', justifyContent: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '450px' }}>
        <div className="text-center mb-4">
          <UserPlus color="var(--accent-purple)" size={48} style={{ margin: '0 auto' }} />
          <h2 className="gradient-text mt-4">Join FitTrack</h2>
          <p>Create your account & unlock your potential</p>
        </div>

        {error && <div className="glass-panel" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', marginBottom: '1rem', padding: '12px' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="grid">
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required placeholder="fit_legend" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="neon@fitness.com" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" minLength="6" />
          </div>
          <button type="submit" className="btn btn-primary mt-4" style={{ width: '100%', background: 'linear-gradient(135deg, var(--accent-purple), #ff33bb)'}}>Sign Up</button>
        </form>

        <div className="text-center mt-4">
          <p>Already have an account? <Link to="/login" style={{ color: 'var(--accent-purple)', textDecoration: 'none' }}>Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;

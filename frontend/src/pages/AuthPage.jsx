import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }
    
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email: formData.email, password: formData.password } : formData;
      const res = await axios.post(`http://localhost:5000/api${endpoint}`, payload);
      login(res.data.token);
      toast.success(isLogin ? "Welcome back to the Grind!" : "Account created successfully!");
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.msg || `An error occurred during ${isLogin ? 'login' : 'registration'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '90vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', position: 'relative', overflow: 'hidden' }}>
        
        {loading && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(18,18,18,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <div className="spinner"></div>
            <style>{`.spinner { width: 40px; height: 40px; border: 4px solid rgba(0,229,255,0.3); border-top-color: #00E5FF; border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        <div className="text-center mb-4">
          <Activity color={isLogin ? 'var(--accent-neon)' : 'var(--accent-purple)'} size={48} style={{ margin: '0 auto' }} />
          <h2 className="gradient-text mt-4">
            {isLogin ? "Welcome Back" : "Join the Grind"}
          </h2>
          <p>{isLogin ? "Login to access your command center" : "Create an account to start tracking"}</p>
        </div>

        <form onSubmit={handleSubmit} className="grid">
          {!isLogin && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} required placeholder="fit_legend" />
            </div>
          )}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="neon@fitness.com" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" minLength="8" />
          </div>
          
          <button type="submit" className={`btn ${isLogin ? 'btn-primary' : 'btn-secondary'} mt-4`} style={{ width: '100%' }} disabled={loading}>
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-4 pt-4" style={{ borderTop: '1px solid var(--glass-border)' }}>
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              onClick={() => setIsLogin(!isLogin)} 
              style={{ color: isLogin ? '#00E5FF' : '#FF1744', cursor: 'pointer', fontWeight: 600 }}
            >
              {isLogin ? "Sign Up" : "Login"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

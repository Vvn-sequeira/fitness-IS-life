import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Management from './pages/Management';
import Gallery from './pages/Gallery';
import { AuthContext } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';

function App() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <>
      {isAuthenticated && <Navbar />}
      <div className="main-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/auth" />} />
          <Route path="/auth" element={isAuthenticated ? <Navigate to="/dashboard" /> : <AuthPage />} />
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />} />
          <Route path="/manage" element={isAuthenticated ? <Management /> : <Navigate to="/auth" />} />
          <Route path="/gallery" element={isAuthenticated ? <Gallery /> : <Navigate to="/auth" />} />
        </Routes>
      </div>
      <ToastContainer position="bottom-right" theme="dark" />
    </>
  );
}

export default App;

import { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { ImagePlus, Activity, Camera } from 'lucide-react';
import { isThisWeek, subMonths, isAfter, parseISO } from 'date-fns';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('All'); // All, This Week, Last Month, Older
  
  // Upload Modal States
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadWeight, setUploadWeight] = useState('');
  const [uploadDetails, setUploadDetails] = useState('');
  const [uploadDate, setUploadDate] = useState('');

  // WebRTC Camera States
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await api.get('/gallery');
      setImages(res.data);
    } catch (err) {
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadWeight('');
    setUploadDetails('');
    setUploadDate(new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().substring(0, 16));
    setShowModal(true);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      setShowCamera(true);
    } catch (err) {
      toast.error('Camera access denied or unavailable');
    }
  };

  useEffect(() => {
    if (showCamera && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [showCamera, stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setUploadWeight('');
        setUploadDetails('');
        setUploadDate(new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().substring(0, 16));
        stopCamera();
        setShowModal(true);
      }, "image/jpeg");
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    if (uploadWeight) formData.append('weight', uploadWeight);
    if (uploadDetails) formData.append('details', uploadDetails);
    if (uploadDate) formData.append('date', uploadDate);

    try {
      const res = await api.post('/gallery/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImages([res.data, ...images]);
      toast.success('Photo added to gallery!');
      setShowModal(false);
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      setSelectedFile(null);
      setPreviewUrl('');
    }
  };

  const closeUploadModal = () => {
    setShowModal(false);
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/gallery/${id}`);
      setImages(images.filter(img => img._id !== id));
      toast.success("Image removed.");
    } catch (err) {
      toast.error("Failed to delete image");
    }
  };

  if (loading) return <div className="flex items-center justify-center p-8"><Activity className="animate-fade-in" color="var(--accent-neon)" size={48} /></div>;

  const filteredImages = images.filter(img => {
    if (filter === 'All') return true;
    const date = new Date(img.date);
    const oneMonthAgo = subMonths(new Date(), 1);
    
    if (filter === 'This Week') return isThisWeek(date);
    if (filter === 'Last Month') return isAfter(date, oneMonthAgo);
    return !isThisWeek(date) && !isAfter(date, oneMonthAgo);
  });

  return (
    <div className="grid">
      <div className="glass-panel flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <h2 className="gradient-text" style={{ margin: 0 }}>Progress Gallery</h2>
        
        <div className="flex items-center" style={{ gap: '12px', flexWrap: 'wrap', width: '100%', justifyContent: 'flex-end' }}>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)} 
            style={{ width: 'auto', padding: '10px', minWidth: '120px', flex: '1 1 auto' }}
          >
            <option value="All">All Time</option>
            <option value="This Week">This Week</option>
            <option value="Last Month">Last Month</option>
            <option value="Older">Older</option>
          </select>
          
          <div className="flex" style={{ gap: '12px', flex: '1 1 auto', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary m-0" onClick={startCamera} style={{ cursor: 'pointer', opacity: uploading ? 0.6 : 1, padding: '10px', flex: 1 }} disabled={uploading}>
              <Camera size={20} />
              <span className="hide-mobile" style={{ marginLeft: '8px' }}>Take Photo</span>
            </button>
            <label className="btn btn-primary m-0" style={{ cursor: 'pointer', opacity: uploading ? 0.6 : 1, padding: '10px', flex: 1 }}>
              <ImagePlus size={20} />
              <span className="hide-mobile" style={{ marginLeft: '8px' }}>Upload</span>
              <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} disabled={uploading} />
            </label>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', alignItems: 'start' }}>
        {filteredImages.length === 0 ? <p className="text-secondary p-4 w-100">No photos found for this filter.</p> : null}
        
        {filteredImages.map(img => (
          <div key={img._id} className="glass-panel p-0 overflow-hidden card" style={{ position: 'relative', padding: 0 }}>
            <img src={img.imageUrl} alt="Progress" style={{ width: '100%', height: '300px', objectFit: 'cover', display: 'block', borderRadius: '16px 16px 0 0' }} />
            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.4)', borderRadius: '0 0 16px 16px' }} className="flex justify-between items-center">
                <small className="text-secondary">{new Date(img.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</small>
                {img.details && <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem', marginLeft: '8px' }}>{img.details}</span>}
                {img.weight ? <span style={{ color: '#00E676', fontWeight: 'bold', marginLeft: 'auto' }}>{img.weight} lbs</span> : null}
                <button 
                  onClick={() => handleDelete(img._id)} 
                  style={{ background: 'transparent', border: 'none', color: '#FF1744', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  Delete
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '90%', maxWidth: '500px', background: 'var(--bg-color)', border: '2px solid var(--accent-neon)' }}>
            <h3 className="mb-4 gradient-text">Photo Details</h3>
            
            {previewUrl && (
              <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                <img src={previewUrl} alt="Preview" style={{ maxHeight: '200px', borderRadius: '8px', objectFit: 'cover' }} />
              </div>
            )}

            <form onSubmit={handleUploadSubmit}>
              <div className="flex" style={{ gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Weight (lbs/kg)</label>
                  <input type="number" step="0.1" value={uploadWeight} onChange={(e) => setUploadWeight(e.target.value)} placeholder="e.g. 180.5" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Date & Time</label>
                  <input type="datetime-local" value={uploadDate} onChange={(e) => setUploadDate(e.target.value)} />
                </div>
              </div>
              
              <div className="mb-4">
                <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Caption / Details (Optional)</label>
                <input type="text" value={uploadDetails} onChange={(e) => setUploadDetails(e.target.value)} placeholder="e.g. End of 1st week! Feeling great." />
              </div>
              
              <div className="flex" style={{ gap: '16px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={closeUploadModal} disabled={uploading}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Save Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WebRTC Camera Modal */}
      {showCamera && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.95)', zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '16px', backgroundColor: '#000' }}></video>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
            
            <div style={{ marginTop: '24px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={stopCamera}>Cancel</button>
              <button className="btn btn-primary" onClick={capturePhoto}>
                <Camera size={20} /> Snapshot
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Gallery;

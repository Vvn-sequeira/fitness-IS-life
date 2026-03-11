import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Confetti from 'react-confetti';
import { toast } from 'react-toastify';
import { Activity, Dumbbell, Utensils, TrendingUp, Clock, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const [entries, setEntries] = useState([]);
  const [logs, setLogs] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().substring(0, 10));
  const [currentTime, setCurrentTime] = useState(new Date());
  
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('workout');
  const [title, setTitle] = useState('');
  const [grams, setGrams] = useState('');
  const [timing, setTiming] = useState('morning');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('');

  const [windowDimensions, setWindowDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [entriesRes, logsRes, userRes] = await Promise.all([
        api.get('/entries'),
        api.get('/logs'),
        api.get('/auth/me')
      ]);
      setEntries(entriesRes.data);
      setUserProfile(userRes.data);
      
      const sortedLogs = logsRes.data
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(log => ({
          name: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          weight: log.weight
        }));
      setLogs(sortedLogs);
    } catch (err) {
      toast.error('Failed to command center data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const handleResize = () => setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    
    // Live clock for fasting
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(timer);
    };
  }, []);

  const handleToggleEntry = async (id, currentStatus) => {
    try {
      const res = await api.put(`/entries/${id}`, { status: !currentStatus });
      setEntries(entries.map(e => e._id === id ? res.data : e));
      if (!currentStatus) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } catch (err) {
      toast.error('Failed to update entry');
    }
  };

  const handleDeleteEntry = async (id) => {
    try {
      await api.delete(`/entries/${id}`);
      setEntries(entries.filter(e => e._id !== id));
      toast.success('Entry removed.');
    } catch (err) {
      toast.error('Failed to delete entry');
    }
  };

  const handleDeleteFasting = async () => {
    try {
      if (!window.confirm('Are you sure you want to delete your fasting plan?')) return;
      const res = await api.put('/auth/fasting', { type: 'None', isActive: false, startTime: '', endTime: '' });
      setUserProfile((prev) => ({ ...prev, fastingPlan: res.data }));
      toast.success('Fasting plan removed.');
    } catch (err) {
      toast.error('Failed to delete fasting plan');
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setTitle('');
    setGrams('');
    setReps('');
    setSets('');
    setTiming('morning');
    setShowModal(true);
  };

  const submitQuickLog = async (e) => {
    e.preventDefault();
    if (!title) return;
    try {
      const payload = { 
        title, 
        type: modalType, 
        status: true, 
        date: new Date(),
        isDirectLog: true,
        ...(modalType === 'diet' && { grams, timing }),
        ...(modalType === 'workout' && { reps, sets })
      };
      const res = await api.post('/entries', payload);
      setEntries([res.data, ...entries]);
      toast.success(`${modalType === 'workout' ? 'Workout' : 'Meal'} Logged!`);
      setShowModal(false);
    } catch (err) {
      toast.error('Failed to quick log');
    }
  };

  if (loading) return <div className="flex items-center justify-center p-8"><Activity className="animate-fade-in" color="var(--accent-neon)" size={48} /></div>;

  const workouts = entries.filter(e => e.type === 'workout' && !e.isDirectLog);
  const diets = entries.filter(e => e.type === 'diet' && !e.isDirectLog);
  
  const workoutsCompleted = entries.filter(e => e.type === 'workout' && e.status && new Date(e.date).toISOString().substring(0, 10) === selectedDate);
  const dietsCompleted = entries.filter(e => e.type === 'diet' && e.status && new Date(e.date).toISOString().substring(0, 10) === selectedDate);

  return (
    <div className="grid">
      {showConfetti && <Confetti width={windowDimensions.width} height={windowDimensions.height} recycle={false} />}
      
      {/* Header Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        
        <div className="glass-panel flex items-center justify-between">
          <div>
            <p className="mb-0">Completed Workouts</p>
            <h2 className="gradient-text">{workoutsCompleted.length}</h2>
          </div>
          <div style={{ background: 'rgba(57, 255, 20, 0.1)', padding: '16px', borderRadius: '50%' }}>
            <Dumbbell color="var(--accent-neon)" size={32} />
          </div>
        </div>

        <div className="glass-panel flex items-center justify-between">
          <div>
             <p className="mb-0">Logged Meals</p>
             <h2 className="gradient-text">{dietsCompleted.length}</h2>
          </div>
          <div style={{ background: 'rgba(176, 38, 255, 0.1)', padding: '16px', borderRadius: '50%' }}>
            <Utensils color="var(--accent-purple)" size={32} />
          </div>
        </div>

        <div className="glass-panel flex items-center justify-between">
          <div>
            <p className="mb-0">Current Weight</p>
            <h2 className="gradient-text">
              {logs.length > 0 ? `${logs[logs.length - 1].weight} lbs` : '—'}
            </h2>
          </div>
          <div style={{ background: 'rgba(57, 255, 20, 0.1)', padding: '16px', borderRadius: '50%' }}>
            <TrendingUp color="var(--accent-neon)" size={32} />
          </div>
        </div>
      </div>

      {userProfile?.fastingPlan?.isActive && userProfile.fastingPlan.type !== 'None' && (
      <div className="glass-panel fasting-active-card">
         <div className="flex justify-between items-center" style={{ gap: '16px' }}>
             <div className="flex items-center" style={{ gap: '16px' }}>
                 <Clock size={32} color="var(--accent-purple)" />
                 <div>
                    <h3 className="gradient-text mb-0">Fasting Plan: {userProfile.fastingPlan.type}</h3>
                    <p style={{ margin: 0 }}>Starts: {userProfile.fastingPlan.startTime} • Ends: {userProfile.fastingPlan.endTime}</p>
                 </div>
             </div>
             <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <button onClick={handleDeleteFasting} className="delete-todo-btn" style={{ padding: '4px' }} title="Remove Fasting Plan">
                    <Trash2 size={18} />
                </button>
                <div>
                   <p className="text-secondary mb-0" style={{ fontSize: '0.85rem' }}>Current Time</p>
                   <h3 style={{ margin: 0, color: 'var(--accent-purple)' }}>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</h3>
                </div>
             </div>
         </div>
      </div>
      )}

      {/* Grid for Active Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Today's Grind */}
        <div className="glass-panel">
          <h2 className="mb-4">Today's Grind (Todos)</h2>
          <div className="grid" style={{ gap: '16px' }}>
            {workouts.length === 0 ? <p className="text-secondary p-4 bg-black bg-opacity-20 rounded">No workouts planned!</p> : null}
            {workouts.map(workout => (
              <div key={workout._id} className="glass-panel flex justify-between items-center" style={{ background: workout.status ? 'rgba(57, 255, 20, 0.1)' : 'rgba(0,0,0,0.3)', borderLeft: `4px solid ${workout.status ? 'var(--success)' : 'var(--accent-neon)'}` }}>
                <div style={{ wordBreak: 'break-word', paddingRight: '12px', flex: 1 }}>
                  <h4 style={{ margin: 0, textDecoration: workout.status ? 'line-through' : 'none', color: workout.status ? 'var(--text-secondary)' : '#fff' }}>{workout.title}</h4>
                  <small className="text-secondary">{new Date(workout.date).toLocaleDateString()} {workout.sets ? `• ${workout.sets} sets` : ''} {workout.reps ? `x ${workout.reps} reps` : ''}</small>
                </div>
                <div className="flex items-center" style={{ gap: '12px' }}>
                  <button onClick={() => handleDeleteEntry(workout._id)} className="delete-todo-btn" title="Delete Todo">
                    <Trash2 size={18} />
                  </button>
                  <input type="checkbox" className="checkbox-custom" checked={workout.status} onChange={() => handleToggleEntry(workout._id, workout.status)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fuel Log Todos */}
        <div className="glass-panel">
          <h2 className="mb-4">Fuel Goals (Todos)</h2>
          <div className="grid" style={{ gap: '16px' }}>
            {diets.length === 0 ? <p className="text-secondary p-4 bg-black bg-opacity-20 rounded">No meals planned!</p> : null}
            {diets.map(diet => (
              <div key={diet._id} className="glass-panel flex justify-between items-center" style={{ background: diet.status ? 'rgba(176, 38, 255, 0.1)' : 'rgba(0,0,0,0.3)', borderLeft: `4px solid ${diet.status ? 'var(--success)' : 'var(--accent-purple)'}` }}>
                <div style={{ wordBreak: 'break-word', paddingRight: '12px', flex: 1 }}>
                  <h4 style={{ margin: 0, textDecoration: diet.status ? 'line-through' : 'none', color: diet.status ? 'var(--text-secondary)' : '#fff' }}>{diet.title}</h4>
                  <small className="text-secondary">{new Date(diet.date).toLocaleDateString()} • {diet.grams ? `${diet.grams}g` : ''} ({diet.timing})</small>
                </div>
                <div className="flex items-center" style={{ gap: '12px' }}>
                  <button onClick={() => handleDeleteEntry(diet._id)} className="delete-todo-btn" title="Delete Todo">
                    <Trash2 size={18} />
                  </button>
                  <input type="checkbox" className="checkbox-custom" checked={diet.status} onChange={() => handleToggleEntry(diet._id, diet.status)} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Historical Completed Logs */}
      <div className="flex justify-between items-center mt-4 mb-2">
        <h2 className="mb-0">Daily Logs</h2>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ width: 'auto', padding: '8px 16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '8px' }} />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Workout Log */}
        <div className="glass-panel">
          <div className="flex justify-between items-center mb-4">
            <h3 className="gradient-text" style={{ margin: 0 }}>Workout Log</h3>
            <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.85rem' }} onClick={() => openModal('workout')}>+ Add Log</button>
          </div>
          <div className="grid" style={{ gap: '8px' }}>
            {workoutsCompleted.length === 0 ? <p className="text-secondary">No complete workouts tracked.</p> : null}
            {workoutsCompleted.slice(0, 10).map(workout => (
              <div key={`log-${workout._id}`} className="flex justify-between items-center" style={{ padding: '8px 12px', borderBottom: '1px solid var(--glass-border)' }}>
                <div>
                  <h4 style={{ margin: 0, wordBreak: 'break-word' }}>{workout.title}</h4>
                  <small className="text-secondary">{new Date(workout.date).toLocaleDateString()} {workout.sets ? `• ${workout.sets} sets` : ''} {workout.reps ? `x ${workout.reps} reps` : ''}</small>
                </div>
                <button 
                  onClick={() => handleDeleteEntry(workout._id)} 
                  className="delete-todo-btn"
                  title="Delete Log"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Meal Log */}
        <div className="glass-panel">
          <div className="flex justify-between items-center mb-4">
            <h3 className="gradient-text" style={{ margin: 0 }}>Meal Log</h3>
            <button className="btn" style={{ padding: '4px 12px', fontSize: '0.85rem', background: 'var(--accent-purple)', color: '#fff', border: 'none', borderRadius: '8px' }} onClick={() => openModal('diet')}>+ Add Log</button>
          </div>
          <div className="grid" style={{ gap: '8px' }}>
            {dietsCompleted.length === 0 ? <p className="text-secondary">No complete meals tracked.</p> : null}
            {dietsCompleted.slice(0, 10).map(diet => (
              <div key={`log-${diet._id}`} className="flex justify-between items-center" style={{ padding: '8px 12px', borderBottom: '1px solid var(--glass-border)' }}>
                <div>
                  <h4 style={{ margin: 0, wordBreak: 'break-word' }}>{diet.title}</h4>
                  <small className="text-secondary">{new Date(diet.date).toLocaleDateString()} • {diet.grams ? `${diet.grams}g` : ''} ({diet.timing})</small>
                </div>
                <button 
                  onClick={() => handleDeleteEntry(diet._id)} 
                  className="delete-todo-btn"
                  title="Delete Log"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Analytics */}
      <div className="glass-panel mt-4">
        <h3 className="mb-4">Weight Tracker</h3>
        {logs.length > 0 ? (
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={logs}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-neon)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--accent-purple)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                <YAxis domain={['auto', 'auto']} stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--accent-neon)' }}
                />
                <Area type="monotone" dataKey="weight" stroke="var(--accent-neon)" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" activeDot={{ r: 8, fill: 'var(--accent-neon)' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
           <div className="text-center p-8 bg-black bg-opacity-30 rounded-lg">
              <p>No weigh-ins. Log your weight to see your progress graph!</p>
           </div>
        )}
      </div>

      {/* Custom Modal overlay */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '90%', maxWidth: '500px', background: 'var(--bg-color)', border: `2px solid ${modalType === 'workout' ? 'var(--accent-neon)' : 'var(--accent-purple)'}` }}>
            <h3 className="mb-4 gradient-text">{modalType === 'workout' ? 'Log Workout' : 'Log Meal'}</h3>
            <form onSubmit={submitQuickLog}>
              <div className="mb-4">
                <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  {modalType === 'workout' ? 'Workout Details / Routine' : 'Meal Details'}
                </label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder={modalType === 'workout' ? 'e.g. Back & Biceps - 5 exercises' : 'e.g. Chicken breast & rice'} />
              </div>
              
              {modalType === 'diet' && (
                <div className="flex mb-4" style={{ gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Grams (optional)</label>
                    <input type="number" value={grams} onChange={(e) => setGrams(e.target.value)} placeholder="e.g. 200" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Timing</label>
                    <select value={timing} onChange={(e) => setTiming(e.target.value)} required>
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="night">Night</option>
                      <option value="snacks">Snacks</option>
                    </select>
                  </div>
                </div>
              )}

              {modalType === 'workout' && (
                <div className="flex mb-4" style={{ gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Sets</label>
                    <input type="number" value={sets} onChange={(e) => setSets(e.target.value)} placeholder="e.g. 3" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Reps</label>
                    <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="e.g. 10" />
                  </div>
                </div>
              )}
              
              <div className="flex" style={{ gap: '16px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, background: modalType === 'workout' ? 'var(--accent-neon)' : 'var(--accent-purple)', color: '#000' }}>Save Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;

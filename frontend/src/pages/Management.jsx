import { useState } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';

const Management = () => {
  const [activeTab, setActiveTab] = useState('workout'); // workout, diet, log, fasting

  // Workouts & Diet common
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  
  // Specific Workout fields
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('');
  
  // Specific Diet fields
  const [grams, setGrams] = useState('');
  const [timing, setTiming] = useState('morning');
  
  // Weight Log
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  // Fasting Log
  const [fastingType, setFastingType] = useState('16:8');
  const [startTime, setStartTime] = useState('20:00');
  const [endTime, setEndTime] = useState('12:00');
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeTab === 'log') {
        const payload = { weight, date, notes };
        await api.post('/logs', payload);
        toast.success("Weight Logged successfully!");
        setWeight('');
        setNotes('');
      } else if (activeTab === 'fasting') {
        const payload = { type: fastingType, startTime, endTime, isActive };
        await api.put('/auth/fasting', payload);
        toast.success("Fasting Plan Updated!");
      } else {
        const payload = { 
          title, 
          type: activeTab, 
          date,
          ...(activeTab === 'diet' && { grams, timing }),
          ...(activeTab === 'workout' && { reps, sets })
        };
        await api.post('/entries', payload);
        toast.success(`${activeTab === 'workout' ? 'Workout' : 'Diet Meal'} added to Today's Grind!`);
        setTitle('');
        setGrams('');
        setReps('');
        setSets('');
      }
    } catch (err) {
      toast.error('Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px' }}>
        <h2 className="text-center mb-4 gradient-text">Input Hub</h2>
        
        {/* Tabs */}
        <div className="flex justify-between mb-4" style={{ gap: '8px', flexWrap: 'wrap' }}>
          {['workout', 'diet', 'log', 'fasting'].map((tab) => (
            <button 
              key={tab}
              className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`} 
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.9rem', color: activeTab === tab ? '#000' : 'var(--text-primary)' }}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <form onSubmit={handleSubmit} className="grid mt-4">
          
          {(activeTab === 'workout' || activeTab === 'diet') && (
            <>
              <div>
                <label className="mb-2" style={{ display: 'block', color: 'var(--text-secondary)' }}>
                  {activeTab === 'workout' ? 'Workout Name / Sets / Reps' : 'Diet Meal Name / Calories'}
                </label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder={activeTab === 'workout' ? 'e.g., Bench Press 3x10' : 'e.g., Chicken Salad - 400 kcal'} />
              </div>
            </>
          )}

          {activeTab === 'diet' && (
            <div className="flex" style={{ gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label className="mb-2" style={{ display: 'block', color: 'var(--text-secondary)' }}>Serving (Grams)</label>
                <input type="number" value={grams} onChange={(e) => setGrams(e.target.value)} placeholder="e.g. 250" required />
              </div>
              <div style={{ flex: 1 }}>
                <label className="mb-2" style={{ display: 'block', color: 'var(--text-secondary)' }}>Timing</label>
                <select value={timing} onChange={(e) => setTiming(e.target.value)} required>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="night">Night</option>
                  <option value="snacks">Snacks</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'workout' && (
            <div className="flex" style={{ gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label className="mb-2" style={{ display: 'block', color: 'var(--text-secondary)' }}>Sets</label>
                <input type="number" value={sets} onChange={(e) => setSets(e.target.value)} placeholder="e.g. 3" />
              </div>
              <div style={{ flex: 1 }}>
                <label className="mb-2" style={{ display: 'block', color: 'var(--text-secondary)' }}>Reps</label>
                <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="e.g. 10" />
              </div>
            </div>
          )}

          {activeTab === 'log' && (
            <>
              <div>
                <label className="mb-2" style={{ display: 'block', color: 'var(--text-secondary)' }}>Current Weight (in lbs/kg)</label>
                <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} required placeholder="180.5" />
              </div>
              <div>
                <label className="mb-2" style={{ display: 'block', color: 'var(--text-secondary)' }}>Notes (Optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Feeling huge today..." rows="3"></textarea>
              </div>
            </>
          )}

          {activeTab === 'fasting' && (
            <>
              <div>
                <label className="mb-2" style={{ display: 'block', color: 'var(--text-secondary)' }}>Plan Type</label>
                <select value={fastingType} onChange={(e) => setFastingType(e.target.value)} required>
                  <option value="16:8">16:8 (LeanGains)</option>
                  <option value="14:10">14:10 (Beginner)</option>
                  <option value="18:6">18:6 (Advanced)</option>
                  <option value="20:4">20:4 (Warrior Diet)</option>
                  <option value="None">None</option>
                </select>
              </div>
              <div className="flex" style={{ gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label className="mb-2" style={{ display: 'block', color: 'var(--text-secondary)' }}>Start Fasting</label>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="mb-2" style={{ display: 'block', color: 'var(--text-secondary)' }}>Break Fast</label>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                </div>
              </div>
              <div className="flex items-center" style={{ gap: '12px', marginTop: '8px' }}>
                 <input type="checkbox" className="checkbox-custom" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} id="active-fast" />
                 <label htmlFor="active-fast" style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>Enable Fasting Timer / Sync</label>
              </div>
            </>
          )}
          
          {activeTab !== 'fasting' && (
            <div>
              <label className="mb-2" style={{ display: 'block', color: 'var(--text-secondary)' }}>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary mt-4" 
            style={{ width: '100%' }} 
            disabled={loading}
          >
            {loading ? 'Processing...' : `Save ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Management;

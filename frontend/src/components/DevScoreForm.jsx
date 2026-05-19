import { useState } from 'react';
import { Search, Loader2, User, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

function DevScoreForm({ onAnalyze, loading }) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    targetRole: 'Frontend',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.username.trim() === '') return;
    onAnalyze(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group">
        <label htmlFor="username" className="input-label">GitHub Username *</label>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            id="username"
            name="username"
            className="text-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="e.g. torvalds"
            value={formData.username}
            onChange={handleChange}
            required
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </div>

      <div className="input-group">
        <label htmlFor="targetRole" className="input-label">Target Role</label>
        <div style={{ position: 'relative' }}>
          <Briefcase size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <select
            id="targetRole"
            name="targetRole"
            className="text-input"
            style={{ paddingLeft: '2.5rem' }}
            value={formData.targetRole}
            onChange={handleChange}
          >
            <option value="Frontend Engineer">Frontend Engineer</option>
            <option value="Backend Engineer">Backend Engineer</option>
            <option value="Full Stack Engineer">Full Stack Engineer</option>
            <option value="DevOps Engineer">DevOps Engineer</option>
            <option value="Data Scientist">Data Scientist</option>
            <option value="Machine Learning Engineer">Machine Learning Engineer</option>
            <option value="Mobile Developer">Mobile Developer (iOS/Android)</option>
            <option value="Cloud Architect">Cloud Architect</option>
            <option value="Blockchain Developer">Blockchain Developer</option>
            <option value="Game Developer">Game Developer</option>
            <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
            <option value="UI/UX Engineer">UI/UX Engineer</option>
            <option value="Developer Advocate">Developer Advocate (DevRel)</option>
          </select>
        </div>
      </div>
      
      <div className="input-group" style={{ marginBottom: '2rem' }}>
        <label htmlFor="name" className="input-label">Display Name <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span></label>
        <div style={{ position: 'relative' }}>
          <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            id="name"
            name="name"
            className="text-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="How should we call you?"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
      </div>

      <motion.button 
        type="submit" 
        className="btn-primary" 
        disabled={loading || !formData.username}
        whileTap={!loading && formData.username ? { scale: 0.98 } : {}}
      >
        {loading ? (
          <>
            <Loader2 className="loader-circle" size={18} />
            <span>Analyzing Repositories...</span>
          </>
        ) : (
          <span>Generate DevScore</span>
        )}
      </motion.button>
    </form>
  );
}

export default DevScoreForm;

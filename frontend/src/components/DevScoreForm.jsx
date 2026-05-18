import { useState } from 'react';

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
      <div className="form-group">
        <label htmlFor="name">Your Name (Optional)</label>
        <input
          type="text"
          id="name"
          name="name"
          className="form-control"
          placeholder="e.g. Jane Doe"
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="username">GitHub Username *</label>
        <input
          type="text"
          id="username"
          name="username"
          className="form-control"
          placeholder="e.g. octocat"
          value={formData.username}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="targetRole">Target Role</label>
        <select
          id="targetRole"
          name="targetRole"
          className="form-control"
          value={formData.targetRole}
          onChange={handleChange}
        >
          <option value="Frontend">Frontend Developer</option>
          <option value="Backend">Backend Developer</option>
          <option value="Full Stack">Full Stack Developer</option>
        </select>
      </div>

      <button type="submit" className="btn" disabled={loading || !formData.username}>
        {loading ? (
          <>
            <span className="spinner"></span>
            Analyzing Profile...
          </>
        ) : (
          'Get My DevScore'
        )}
      </button>
    </form>
  );
}

export default DevScoreForm;

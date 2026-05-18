function DevScoreResult({ result, onReset }) {
  const { name, avatar_url, bio, targetRole, score, strengths, missingSkills, suggestions, languagesBreakdown } = result;

  // Calculate rotation for conic-gradient based on score (max 360deg)
  const scoreDeg = (score / 100) * 360;

  return (
    <div className="results-container">
      <div className="results-header">
        {avatar_url && <img src={avatar_url} alt="Profile" className="profile-avatar" />}
        <h2 style={{ marginBottom: bio ? '0.5rem' : '1.5rem' }}>
          {name ? `${name}'s` : 'Your'} {targetRole} Profile
        </h2>
        {bio && <p className="profile-bio">{bio}</p>}
        
        <div className="score-circle-wrapper">
          <div 
            className="score-circle" 
            style={{ '--score-deg': `${scoreDeg}deg` }}
          >
            <span className="score-value">{score}</span>
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>DevScore out of 100</p>
      </div>

      {languagesBreakdown && languagesBreakdown.length > 0 && (
        <div className="section">
          <h3 className="section-title">Top Languages</h3>
          <div className="lang-bars">
            {languagesBreakdown.slice(0, 4).map((lang, i) => (
              <div key={i} className="lang-bar-container">
                <span className="lang-name">{lang.name}</span>
                <div className="lang-track">
                  <div 
                    className="lang-fill" 
                    style={{ width: `${lang.percentage}%` }}
                  ></div>
                </div>
                <span className="lang-percent">{lang.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {strengths && strengths.length > 0 && (
        <div className="section">
          <h3 className="section-title">Strengths</h3>
          <div className="pill-list">
            {strengths.map((s, i) => (
              <span key={i} className="pill strength">{s}</span>
            ))}
          </div>
        </div>
      )}

      {missingSkills && missingSkills.length > 0 && (
        <div className="section">
          <h3 className="section-title">Missing Skills</h3>
          <div className="pill-list">
            {missingSkills.map((s, i) => (
              <span key={i} className="pill weakness">{s}</span>
            ))}
          </div>
        </div>
      )}

      {suggestions && suggestions.length > 0 && (
        <div className="section">
          <h3 className="section-title">Improvement Suggestions</h3>
          <ul className="suggestions-list">
            {suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={onReset} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
        Analyze Another Profile
      </button>
    </div>
  );
}

export default DevScoreResult;

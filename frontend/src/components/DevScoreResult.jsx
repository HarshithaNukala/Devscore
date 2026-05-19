import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Code, Target, Lightbulb, TrendingUp, GitBranch, ShieldCheck, Zap, User } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

function DevScoreResult({ result, onReset }) {
  const { name, avatar_url, bio, targetRole, score, strengths, missingSkills, suggestions, languagesBreakdown, publicRepos, followers, repoAnalysis } = result;
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animate score value from 0 to actual score
  useEffect(() => {
    let start = 0;
    const duration = 1500; // 1.5s
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutExpo)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setAnimatedScore(Math.floor(easeProgress * score));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [score]);

  const scoreCircumference = 2 * Math.PI * 72; // r=72
  const scoreDashoffset = scoreCircumference - (score / 100) * scoreCircumference;

  // Determine grade based on score
  let grade = { letter: 'C', color: 'var(--warning-text)' };
  if (score >= 80) grade = { letter: 'A', color: 'var(--success-text)' };
  else if (score >= 60) grade = { letter: 'B', color: 'var(--accent-blue)' };
  else if (score < 40) grade = { letter: 'D', color: 'var(--danger-text)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <button onClick={onReset} className="btn-secondary" style={{ alignSelf: 'flex-start' }}>
        <ArrowLeft size={16} /> Back to Search
      </button>

      <div className="profile-hero">
        {avatar_url && (
          <motion.img 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            src={avatar_url} 
            alt="Profile" 
            className="profile-avatar-lg" 
          />
        )}
        <div className="profile-info">
          <h2>{name ? name : 'Developer Profile'}</h2>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge blue"><Target size={12} style={{marginRight:'4px'}}/> {targetRole}</span>
            {publicRepos !== undefined && (
              <span className="badge"><GitBranch size={12} style={{marginRight:'4px'}}/> {publicRepos} Repos</span>
            )}
            {followers !== undefined && (
              <span className="badge"><User size={12} style={{marginRight:'4px'}}/> {followers} Followers</span>
            )}
          </div>
          {bio && <p style={{ marginTop: '0.75rem' }}>{bio}</p>}
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="dashboard-grid"
      >
        {/* Main Score Card */}
        <motion.div variants={itemVariants} className="col-span-12 glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem' }}>
          <div className="score-chart-container">
            <svg className="score-chart-svg" viewBox="0 0 160 160">
              <circle className="score-chart-bg" cx="80" cy="80" r="72" />
              <motion.circle 
                className="score-chart-progress" 
                cx="80" cy="80" r="72"
                initial={{ strokeDasharray: scoreCircumference, strokeDashoffset: scoreCircumference }}
                animate={{ strokeDashoffset: scoreDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{ stroke: grade.color }}
              />
            </svg>
            <div className="score-chart-text">
              <span className="score-value-large">{animatedScore}</span>
              <span className="score-label">DevScore</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', padding: '0.5rem 1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Archetype Grade:</span>
            <span style={{ fontWeight: 700, color: grade.color }}>{grade.letter}</span>
          </div>
        </motion.div>

        {/* Languages Breakdown */}
        {languagesBreakdown && languagesBreakdown.length > 0 && (
          <motion.div variants={itemVariants} className="col-span-8 glass-card">
            <div className="card-header">
              <Code size={18} style={{ color: 'var(--text-muted)' }} />
              <h3 className="card-title">Language DNA</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {languagesBreakdown.slice(0, 5).map((lang, i) => (
                <div key={i} className="progress-item">
                  <div className="progress-header">
                    <span className="progress-name">{lang.name}</span>
                    <span className="progress-value">{lang.percentage}%</span>
                  </div>
                  <div className="progress-track">
                    <motion.div 
                      className="progress-fill" 
                      initial={{ width: 0 }}
                      animate={{ width: `${lang.percentage}%` }}
                      transition={{ duration: 1, delay: i * 0.1 + 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Strengths & Weaknesses */}
        <motion.div variants={itemVariants} className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ flex: 1 }}>
            <div className="card-header" style={{ marginBottom: '1rem', paddingBottom: '0.75rem' }}>
              <ShieldCheck size={18} style={{ color: 'var(--success-text)' }} />
              <h3 className="card-title">Strengths</h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {strengths && strengths.length > 0 ? (
                strengths.map((s, i) => (
                  <span key={i} className="badge success">{s}</span>
                ))
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No specific strengths detected.</span>
              )}
            </div>
          </div>

          <div className="glass-card" style={{ flex: 1 }}>
            <div className="card-header" style={{ marginBottom: '1rem', paddingBottom: '0.75rem' }}>
              <Zap size={18} style={{ color: 'var(--warning-text)' }} />
              <h3 className="card-title">Missing Skills</h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {missingSkills && missingSkills.length > 0 ? (
                missingSkills.map((s, i) => (
                  <span key={i} className="badge warning">{s}</span>
                ))
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>You meet all expected requirements!</span>
              )}
            </div>
          </div>

        </motion.div>

        {/* AI Actionable Insights */}
        {suggestions && suggestions.length > 0 && (
          <motion.div variants={itemVariants} className="col-span-12 glass-card">
            <div className="card-header">
              <Lightbulb size={18} style={{ color: 'var(--accent-blue)' }} />
              <h3 className="card-title">Actionable Insights</h3>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {suggestions.map((s, i) => (
                <motion.li 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + (i * 0.1) }}
                  style={{ 
                    padding: '1.25rem', 
                    background: 'var(--bg-elevated)', 
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem'
                  }}
                >
                  <TrendingUp size={18} style={{ color: 'var(--accent-blue)', marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.95rem' }}>{s}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Repository Breakdown */}
        {repoAnalysis && repoAnalysis.length > 0 && (
          <motion.div variants={itemVariants} className="col-span-12 glass-card">
            <div className="card-header" style={{ marginBottom: '1.5rem' }}>
              <Code size={18} style={{ color: 'var(--accent-blue)' }} />
              <h3 className="card-title">Repository Career Alignment</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {repoAnalysis.map((repo, i) => {
                let repoGradeColor = 'var(--text-muted)';
                if (repo.score >= 80) repoGradeColor = 'var(--success-text)';
                else if (repo.score >= 50) repoGradeColor = 'var(--accent-blue)';
                else if (repo.score < 30) repoGradeColor = 'var(--danger-text)';

                return (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + (i * 0.05) }}
                    style={{ 
                      padding: '1.25rem', 
                      background: 'var(--bg-elevated)', 
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1.5rem',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, minWidth: '250px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{repo.name}</span>
                      </div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.4 }}>{repo.summary}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.875rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fit Score</span>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: repoGradeColor }}>{repo.score}%</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
}

export default DevScoreResult;

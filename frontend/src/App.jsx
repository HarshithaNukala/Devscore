import { useState, useEffect } from 'react';
import { Moon, Sun, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DevScoreForm from './components/DevScoreForm';
import DevScoreResult from './components/DevScoreResult';
import './index.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('dark');

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('devscore-theme');
    if (savedTheme === 'light') {
      setTheme('light');
      document.body.classList.add('light-mode');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
      document.body.classList.add('light-mode');
      localStorage.setItem('devscore-theme', 'light');
    } else {
      setTheme('dark');
      document.body.classList.remove('light-mode');
      localStorage.setItem('devscore-theme', 'dark');
    }
  };

  const handleAnalyze = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.DEV 
        ? 'http://localhost:3001/api/analyze' 
        : '/api/analyze';
        
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="app-layout">
      <nav className="navbar">
        <div className="nav-brand">
          <Code2 size={24} />
          <span>DevScore</span>
        </div>
        <button 
          className="theme-toggle-btn" 
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </nav>

      <main className="main-content">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              style={{ width: '100%', maxWidth: '480px' }}
            >
              <h1 className="hero-title">Discover your<br/>engineering archetype.</h1>
              <p className="hero-subtitle">
                AI-powered analysis of your GitHub profile. See how you stack up against industry-standard roles.
              </p>
              
              <div className="glass-card">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    className="error-banner"
                  >
                    <span>{error}</span>
                  </motion.div>
                )}
                <DevScoreForm onAnalyze={handleAnalyze} loading={loading} />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{ width: '100%' }}
            >
              <DevScoreResult result={result} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <footer className="footer">
        <p>© {new Date().getFullYear()} DevScore. Built for the modern developer.</p>
      </footer>
    </div>
  );
}

export default App;

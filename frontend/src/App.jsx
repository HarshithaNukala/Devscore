import { useState, useEffect } from 'react';
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
    <div className="app-container">
      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <div className="header">
        <h1>DevScore</h1>
        <p>Analyze your GitHub profile against your dream role</p>
      </div>

      <div className="card">
        {error && <div className="error-message">{error}</div>}
        
        {!result ? (
          <DevScoreForm onAnalyze={handleAnalyze} loading={loading} />
        ) : (
          <DevScoreResult result={result} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}

export default App;

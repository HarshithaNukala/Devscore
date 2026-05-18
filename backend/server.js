const express = require('express');
const cors = require('cors');
const { fetchGithubData } = require('./src/services/githubService');
const { calculateScore } = require('./src/services/scoringService');
const { analyzeGap } = require('./src/services/gapAnalysisService');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Route for analysis
app.post('/api/analyze', async (req, res) => {
  const { name, username, targetRole } = req.body;

  if (!username || !targetRole) {
    return res.status(400).json({ error: 'Username and Target Role are required.' });
  }

  try {
    // 1. Fetch data from GitHub
    const githubData = await fetchGithubData(username);

    // 2. Calculate score
    const score = calculateScore(githubData);

    // 3. Role-based gap analysis
    const gapAnalysis = analyzeGap(githubData.languages, targetRole);

    // Return the response
    res.json({
      name: name || githubData.name,
      username,
      avatar_url: githubData.avatar_url,
      bio: githubData.bio,
      languagesBreakdown: githubData.languagesBreakdown,
      targetRole,
      score,
      ...gapAnalysis
    });
  } catch (error) {
    console.error('Analysis error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to analyze GitHub profile.' });
  }
});

// Start the server if not running in a serverless environment
if (process.env.NODE_ENV !== 'production' || process.env.LOCAL_DEV) {
  app.listen(PORT, () => {
    console.log(`DevScore Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;

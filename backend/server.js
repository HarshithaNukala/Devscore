require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { fetchGithubData } = require('./src/services/githubService');
const { getMentorAnalysis } = require('./src/services/aiMentorService');

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
    // 1. Fetch data from GitHub (including rich repo context)
    const githubData = await fetchGithubData(username);

    // 2. Perform AI Mentor analysis using Google Gemini
    const aiAnalysis = await getMentorAnalysis(githubData, targetRole);

    // Return the response matching the frontend dashboard expectations
    res.json({
      name: name || githubData.name,
      username,
      avatar_url: githubData.avatar_url,
      bio: githubData.bio,
      languagesBreakdown: githubData.languagesBreakdown,
      targetRole,
      publicRepos: githubData.publicRepos,
      followers: githubData.followers,
      score: aiAnalysis.score,
      strengths: aiAnalysis.strengths,
      missingSkills: aiAnalysis.missingSkills,
      suggestions: aiAnalysis.suggestions,
      repoAnalysis: aiAnalysis.repoAnalysis
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

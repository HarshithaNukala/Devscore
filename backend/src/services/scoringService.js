/**
 * Calculate a simple developer score (0-100) based on GitHub metrics.
 * 
 * Criteria:
 * - Project Count (max 40 pts)
 * - Language Diversity (max 30 pts)
 * - Recent Activity (max 30 pts)
 */
function calculateScore(githubData) {
  let score = 0;

  // 1. Project Count (40 points max)
  // ~4 points per repo, maxing out at 10+ repos
  const repoScore = Math.min(githubData.publicRepos * 4, 40);
  score += repoScore;

  // 2. Language Diversity (30 points max)
  // ~5 points per language, maxing out at 6+ languages
  const languageScore = Math.min(githubData.languages.length * 5, 30);
  score += languageScore;

  // 3. Recent Activity (30 points max)
  // Max points if updated within the last 30 days
  // Scales down to 0 if no updates in the last year
  let activityScore = 0;
  if (githubData.lastActivity) {
    const lastActivityDate = new Date(githubData.lastActivity);
    const daysSinceActive = (new Date() - lastActivityDate) / (1000 * 60 * 60 * 24);
    
    if (daysSinceActive <= 30) {
      activityScore = 30;
    } else if (daysSinceActive <= 365) {
      // Linear scale from 30 days to 365 days
      activityScore = Math.floor(30 - ((daysSinceActive - 30) / 335) * 30);
    }
  }
  score += activityScore;

  return Math.round(score);
}

module.exports = {
  calculateScore
};

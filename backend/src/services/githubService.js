const axios = require('axios');

const GITHUB_API_BASE = 'https://api.github.com/users';

/**
 * Fetch user profile and repositories from GitHub
 * @param {string} username - GitHub username
 */
async function fetchGithubData(username) {
  try {
    const profileResponse = await axios.get(`${GITHUB_API_BASE}/${username}`);
    // Fetch up to 100 recent repos to get a good sense of activity
    const reposResponse = await axios.get(`${GITHUB_API_BASE}/${username}/repos?per_page=100&sort=updated`);

    const profile = profileResponse.data;
    const repos = reposResponse.data;

    // Extract stats and language byte counts
    let totalStars = 0;
    const languageCounts = {};
    
    // Extract repositories list with rich metadata for Gemini analysis
    const repositories = repos.map(repo => {
      totalStars += repo.stargazers_count;
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
      return {
        name: repo.name,
        description: repo.description || 'No description provided',
        language: repo.language || 'None',
        stars: repo.stargazers_count,
        topics: repo.topics || []
      };
    });

    // Calculate language percentages based on count
    const totalReposWithLang = Object.values(languageCounts).reduce((a, b) => a + b, 0);
    const languagesBreakdown = Object.entries(languageCounts)
      .map(([lang, count]) => ({
        name: lang,
        percentage: totalReposWithLang > 0 ? Math.round((count / totalReposWithLang) * 100) : 0
      }))
      .sort((a, b) => b.percentage - a.percentage);

    const languages = Object.keys(languageCounts);

    const lastActivity = repos.length > 0 ? repos[0].updated_at : profile.updated_at;

    return {
      name: profile.name || username,
      avatar_url: profile.avatar_url,
      bio: profile.bio || 'No bio provided',
      publicRepos: profile.public_repos,
      totalStars,
      languages: languages,
      languagesBreakdown,
      repositories: repositories.slice(0, 30), // Limit to 30 most active repos to keep prompt size efficient
      lastActivity,
      followers: profile.followers
    };
  } catch (error) {
    console.error('Error fetching GitHub data:', error.message);
    throw new Error('Failed to fetch data from GitHub. Ensure the username is correct and API limits are not exceeded.');
  }
}

module.exports = {
  fetchGithubData
};

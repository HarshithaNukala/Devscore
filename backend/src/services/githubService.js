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
    
    // We fetch repos, but language stats per repo are just primary language.
    // GitHub API doesn't give byte breakdown in /repos, so we'll use a simple count of primary languages
    repos.forEach(repo => {
      totalStars += repo.stargazers_count;
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
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
      bio: profile.bio,
      publicRepos: profile.public_repos,
      totalStars,
      languages: languages,
      languagesBreakdown,
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

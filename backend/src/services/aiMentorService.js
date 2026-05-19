const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Perform a deep, mentor-level analysis of the user's GitHub profile and repositories against their target role
 * @param {Object} githubData - Rich GitHub profile and repository metadata
 * @param {string} targetRole - Target role selected by the user
 */
async function getMentorAnalysis(githubData, targetRole) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    throw new Error('Gemini API key is not configured. Locally, add GEMINI_API_KEY to your backend/.env file. In production, add it as a Vercel Environment Variable under Project Settings.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json"
    }
  });

  const prompt = `
You are an expert GitHub profile auditor and elite software engineering career mentor. 
Your goal is to inspect a developer's GitHub profile and repository list, and assess how well prepared they are for the target role: "${targetRole}".

Be extremely realistic, objective, and constructive. Do not give false praise, but do highlight genuine strengths.

Here is the developer's GitHub data:
- Name/Username: ${githubData.name}
- Bio: ${githubData.bio}
- Total Public Repos: ${githubData.publicRepos}
- Total Stars: ${githubData.totalStars}
- Followers: ${githubData.followers}
- Languages: ${JSON.stringify(githubData.languagesBreakdown)}
- Top Repositories (with descriptions, primary languages, stars, and topics):
${JSON.stringify(githubData.repositories, null, 2)}

Analyze their profile against the expectations of a professional "${targetRole}". Consider:
1. Tech Stack Fit: Do their repositories show active use of technologies, frameworks, and tools expected for a "${targetRole}"?
2. Depth of Projects: Are their repositories high-quality, complex projects, or just forks, quick tutorials, and boilerplate templates?
3. Individual Repository Score: Grade each repository from 0 to 100 on how relevant and valuable it is for the "${targetRole}" career track.

Provide your analysis in the following strict JSON format:
{
  "score": <number between 0 and 100 representing their overall readiness for the role>,
  "strengths": [<array of 3-5 specific, professional strengths based strictly on their actual repos and languages>],
  "missingSkills": [<array of 3-5 critical skills, libraries, frameworks, or methodologies they need to learn to be competitive as a ${targetRole}>],
  "suggestions": [<array of 3 specific, highly actionable, mentor-style suggestions on how to improve their profile>],
  "repoAnalysis": [
    {
      "name": "<exact name of the repository>",
      "summary": "<a one-sentence, sharp summary of the repo's purpose and its relevance to a ${targetRole}>",
      "score": <number between 0 and 100 representing the repository's value/quality for the "${targetRole}" role>
    }
    // Repeat for each repository provided in the data (up to the top 15 repositories)
  ]
}

Your response must be valid JSON matching this schema exactly.
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(`Failed to analyze profile with Gemini AI: ${error.message || error}`);
  }
}

module.exports = {
  getMentorAnalysis
};

/**
 * Basic role definitions defining expected languages/skills.
 * Using lowercase for easier comparison.
 */
const ROLE_REQUIREMENTS = {
  frontend: ['javascript', 'typescript', 'html', 'css', 'vue', 'react', 'angular', 'svelte'],
  backend: ['javascript', 'typescript', 'python', 'java', 'c#', 'go', 'ruby', 'php', 'rust', 'c++'],
  fullstack: ['javascript', 'typescript', 'python', 'java', 'html', 'css', 'go', 'ruby']
};

/**
 * Compare user's languages with role requirements.
 * @param {Array<string>} userLanguages 
 * @param {string} role - 'Frontend', 'Backend', or 'Full Stack'
 */
function analyzeGap(userLanguages, role) {
  // Normalize inputs
  const normalizedRole = role.toLowerCase().replace(/\s+/g, '');
  const normalizedUserLangs = userLanguages.map(l => l.toLowerCase());
  
  const expectedSkills = ROLE_REQUIREMENTS[normalizedRole] || ROLE_REQUIREMENTS['fullstack'];

  const strengths = [];
  const missingSkills = [];

  // Very simple matching
  expectedSkills.forEach(skill => {
    if (normalizedUserLangs.some(ul => ul.includes(skill))) {
      strengths.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  // If user knows things NOT in the expected list, consider them as extra strengths
  normalizedUserLangs.forEach(lang => {
    if (!expectedSkills.some(skill => lang.includes(skill)) && !strengths.includes(lang)) {
      strengths.push(lang);
    }
  });

  // Generate some simple suggestions based on missing skills
  const suggestions = [];
  if (missingSkills.length > 0) {
    // take up to 2 missing skills
    const toLearn = missingSkills.slice(0, 2);
    suggestions.push(`Consider building projects using ${toLearn.join(' or ')} to strengthen your ${role} profile.`);
  }

  if (strengths.length < 3) {
    suggestions.push(`Try to branch out and learn new frameworks or languages to broaden your skill set.`);
  } else {
    suggestions.push(`Keep up the good work! You have a solid base in ${strengths.slice(0, 2).join(' and ')}.`);
  }

  if (normalizedUserLangs.length === 0) {
    suggestions.push(`We couldn't detect any languages in your public repositories. Make sure your projects aren't empty!`);
  }

  // Capitalize output strings to look nicer
  const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

  return {
    strengths: strengths.map(capitalize),
    missingSkills: missingSkills.map(capitalize),
    suggestions
  };
}

module.exports = {
  analyzeGap
};

// backend/services/semanticMatcher.js

class SemanticSkillMatcher {
  
  // Common skill synonyms and variations
  static SKILL_SYNONYMS = {
    'nodejs': ['node.js', 'node', 'express.js', 'express'],
    'reactjs': ['react', 'react.js', 'react native'],
    'machine learning': ['ml', 'statistical modeling', 'predictive analytics'],
    'deep learning': ['dl', 'neural networks', 'neural nets', 'cnn', 'rnn'],
    'artificial intelligence': ['ai', 'intelligent systems'],
    'natural language processing': ['nlp', 'text processing', 'language models'],
    'computer vision': ['cv', 'image processing', 'object detection'],
    'docker': ['containerization', 'containers'],
    'kubernetes': ['k8s', 'container orchestration'],
    'ci/cd': ['continuous integration', 'continuous deployment', 'devops pipeline']
  };

  static matchSkills(resumeSkills, jobSkills, jobContext) {
    const matches = [];
    const missing = [];
    const partial = [];
    
    // Normalize skills
    const normalizedResumeSkills = resumeSkills.map(s => this.normalizeSkill(s));
    
    jobSkills.forEach(jobSkill => {
      const normalizedJobSkill = this.normalizeSkill(jobSkill);
      const context = jobContext.get(jobSkill) || {};
      
      // Check for exact match
      const exactMatch = normalizedResumeSkills.some(rs => rs === normalizedJobSkill);
      
      // Check for synonym match
      const synonymMatch = this.findSynonymMatch(normalizedJobSkill, normalizedResumeSkills);
      
      // Check for partial/semantic match
      const partialMatch = this.findPartialMatch(normalizedJobSkill, normalizedResumeSkills);
      
      if (exactMatch || synonymMatch) {
        matches.push({
          skill: jobSkill,
          matchType: exactMatch ? 'exact' : 'synonym',
          importance: context.importance || 'medium',
          experienceRequired: context.experienceRequired
        });
      } else if (partialMatch) {
        partial.push({
          skill: jobSkill,
          relatedSkill: partialMatch,
          matchType: 'partial',
          importance: context.importance || 'medium'
        });
      } else {
        missing.push({
          skill: jobSkill,
          category: context.category,
          importance: context.importance || 'medium',
          priority: context.priority || 3,
          inferredFrom: context.inferredFrom
        });
      }
    });
    
    return {
      matches,
      partial,
      missing,
      matchPercentage: this.calculateWeightedMatch(matches, partial, jobSkills.length),
      detailedAnalysis: this.generateDetailedAnalysis(matches, partial, missing)
    };
  }

  static normalizeSkill(skill) {
    return skill.toLowerCase()
      .trim()
      .replace(/[^a-z0-9+#\s]/g, '')
      .replace(/\s+/g, ' ');
  }

  static findSynonymMatch(jobSkill, resumeSkills) {
    const synonyms = this.getSynonyms(jobSkill);
    return resumeSkills.some(rs => synonyms.includes(rs));
  }

  static getSynonyms(skill) {
    const normalized = this.normalizeSkill(skill);
    
    // Check if skill is a key
    if (this.SKILL_SYNONYMS[normalized]) {
      return [normalized, ...this.SKILL_SYNONYMS[normalized]];
    }
    
    // Check if skill is a synonym value
    for (const [key, synonyms] of Object.entries(this.SKILL_SYNONYMS)) {
      if (synonyms.includes(normalized)) {
        return [key, ...synonyms];
      }
    }
    
    return [normalized];
  }

  static findPartialMatch(jobSkill, resumeSkills) {
    // Check if any resume skill contains or is contained by job skill
    for (const rs of resumeSkills) {
      if (rs.includes(jobSkill) || jobSkill.includes(rs)) {
        if (Math.abs(rs.length - jobSkill.length) / Math.max(rs.length, jobSkill.length) < 0.5) {
          return rs;
        }
      }
    }
    return null;
  }

  static calculateWeightedMatch(matches, partial, totalJobSkills) {
    if (totalJobSkills === 0) return 0;
    
    const exactWeight = 1.0;
    const partialWeight = 0.5;
    
    const score = (matches.length * exactWeight) + (partial.length * partialWeight);
    return Math.round((score / totalJobSkills) * 100);
  }

  static generateDetailedAnalysis(matches, partial, missing) {
    // Sort missing by priority (high importance first)
    const criticalMissing = missing.filter(m => m.importance === 'high');
    const mediumMissing = missing.filter(m => m.importance === 'medium');
    const lowMissing = missing.filter(m => m.importance === 'low');
    
    return {
      summary: `Matched ${matches.length} skills exactly, ${partial.length} partially. Missing ${missing.length} skills.`,
      criticalGaps: criticalMissing.map(m => m.skill),
      mediumGaps: mediumMissing.map(m => m.skill),
      optionalGaps: lowMissing.map(m => m.skill),
      strengths: matches.filter(m => m.importance === 'high').map(m => m.skill)
    };
  }
}

module.exports = SemanticSkillMatcher;

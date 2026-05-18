const { THRUST_AREAS } = require('../config/constants');
const { logger } = require('../utils/logger');

class AIService {
  // Smart goal suggestions based on title and context
  generateGoalSuggestions(title, thrustArea, role) {
    const suggestions = this.buildSuggestions(title, thrustArea);
    return suggestions;
  }

  buildSuggestions(title, thrustArea) {
    const titleLower = (title || '').toLowerCase();
    const suggestions = [];

    // Pattern matching for common goal types
    const patterns = [
      {
        keywords: ['revenue', 'sales', 'income', 'profit'],
        uom_type: 'MIN',
        suggestions: [
          { target: '10%', description: 'Conservative growth target' },
          { target: '20%', description: 'Moderate growth target' },
          { target: '30%', description: 'Aggressive growth target' }
        ],
        thrust_area: 'Revenue Growth',
        smarter_title: this.makeSmarter(title, 'revenue')
      },
      {
        keywords: ['customer', 'satisfaction', 'csat', 'nps', 'feedback'],
        uom_type: 'MIN',
        suggestions: [
          { target: '85%', description: 'Good baseline score' },
          { target: '90%', description: 'Industry benchmark' },
          { target: '95%', description: 'Excellence target' }
        ],
        thrust_area: 'Customer Satisfaction',
        smarter_title: this.makeSmarter(title, 'satisfaction')
      },
      {
        keywords: ['cost', 'reduce', 'cut', 'expense', 'saving', 'budget'],
        uom_type: 'MAX',
        suggestions: [
          { target: '5%', description: 'Baseline reduction' },
          { target: '10%', description: 'Standard reduction target' },
          { target: '20%', description: 'Aggressive reduction' }
        ],
        thrust_area: 'Cost Optimization',
        smarter_title: this.makeSmarter(title, 'cost')
      },
      {
        keywords: ['incident', 'accident', 'safety', 'error', 'defect', 'complaint'],
        uom_type: 'ZERO',
        suggestions: [
          { target: '0', description: 'Zero tolerance target' }
        ],
        thrust_area: 'Quality Improvement',
        smarter_title: this.makeSmarter(title, 'zero')
      },
      {
        keywords: ['launch', 'deploy', 'complete', 'deliver', 'implement', 'finish'],
        uom_type: 'TIMELINE',
        suggestions: [
          { target: '', description: 'Set a specific deadline' }
        ],
        thrust_area: 'Operational Excellence',
        smarter_title: this.makeSmarter(title, 'timeline')
      },
      {
        keywords: ['team', 'training', 'skill', 'develop', 'hire', 'retention'],
        uom_type: 'MIN',
        suggestions: [
          { target: '80%', description: 'Team development score' },
          { target: '90%', description: 'High performance target' }
        ],
        thrust_area: 'Team Development',
        smarter_title: this.makeSmarter(title, 'team')
      }
    ];

    // Find matching pattern
    let matched = null;
    for (const pattern of patterns) {
      if (pattern.keywords.some(kw => titleLower.includes(kw))) {
        matched = pattern;
        break;
      }
    }

    if (matched) {
      suggestions.push({
        type: 'uom_suggestion',
        recommended_uom: matched.uom_type,
        explanation: this.getUomExplanation(matched.uom_type),
        target_suggestions: matched.suggestions,
        recommended_thrust_area: matched.thrust_area,
        smarter_title: matched.smarter_title
      });
    }

    // Weightage suggestion based on thrust area
    suggestions.push({
      type: 'weightage_suggestion',
      recommended_weightage: this.getRecommendedWeightage(thrustArea),
      explanation: 'Recommended based on thrust area priority'
    });

    // SMART criteria check
    const smartCheck = this.checkSMARTCriteria(title);
    suggestions.push({
      type: 'smart_check',
      score: smartCheck.score,
      feedback: smartCheck.feedback,
      improvements: smartCheck.improvements
    });

    return suggestions;
  }

  makeSmarter(title, type) {
    if (!title) return '';

    const improvements = {
      revenue: `Achieve ${title} with measurable quarterly milestones`,
      satisfaction: `Improve ${title} measured through quarterly surveys`,
      cost: `Reduce ${title} through process optimization and monitoring`,
      zero: `Maintain zero ${title} through proactive prevention measures`,
      timeline: `Complete ${title} with defined milestones and deliverables`,
      team: `Enhance ${title} with structured programs and KPIs`
    };

    return improvements[type] || title;
  }

  getUomExplanation(uomType) {
    const explanations = {
      MIN: 'Higher values mean better performance (e.g., Revenue, Satisfaction %)',
      MAX: 'Lower values mean better performance (e.g., Cost, TAT, Error Rate)',
      TIMELINE: 'Success measured by meeting a specific date/deadline',
      ZERO: 'Zero is the target (e.g., Zero incidents, Zero complaints)'
    };
    return explanations[uomType] || '';
  }

  getRecommendedWeightage(thrustArea) {
    const weightageMap = {
      'Revenue Growth': 30,
      'Customer Satisfaction': 25,
      'Operational Excellence': 20,
      'Cost Optimization': 15,
      'Innovation': 15,
      'Team Development': 10,
      'Quality Improvement': 15,
      'Market Expansion': 20
    };
    return weightageMap[thrustArea] || 15;
  }

  checkSMARTCriteria(title) {
    if (!title) return { score: 0, feedback: [], improvements: [] };

    const feedback = [];
    const improvements = [];
    let score = 0;

    // S - Specific
    if (title.length > 20) {
      score += 20;
      feedback.push({ criterion: 'Specific', passed: true, note: 'Goal has sufficient detail' });
    } else {
      feedback.push({ criterion: 'Specific', passed: false, note: 'Add more specific details' });
      improvements.push('Make the goal more specific with clear context');
    }

    // M - Measurable (has numbers or %)
    if (/\d+/.test(title) || title.toLowerCase().includes('%')) {
      score += 20;
      feedback.push({ criterion: 'Measurable', passed: true, note: 'Contains measurable target' });
    } else {
      feedback.push({ criterion: 'Measurable', passed: false, note: 'Add a numeric target' });
      improvements.push('Include a specific number or percentage target');
    }

    // A - Achievable (no extreme words)
    const unrealisticWords = ['100x', '1000%', 'impossible', 'unlimited'];
    const hasUnrealistic = unrealisticWords.some(w => title.toLowerCase().includes(w));
    if (!hasUnrealistic) {
      score += 20;
      feedback.push({ criterion: 'Achievable', passed: true, note: 'Goal appears achievable' });
    } else {
      feedback.push({ criterion: 'Achievable', passed: false, note: 'Target seems unrealistic' });
    }

    // R - Relevant (has action verb)
    const actionVerbs = ['increase', 'improve', 'reduce', 'achieve', 'complete', 'deliver', 'launch', 'maintain', 'grow', 'develop'];
    const hasActionVerb = actionVerbs.some(v => title.toLowerCase().includes(v));
    if (hasActionVerb) {
      score += 20;
      feedback.push({ criterion: 'Relevant', passed: true, note: 'Contains action-oriented language' });
    } else {
      feedback.push({ criterion: 'Relevant', passed: false, note: 'Start with an action verb' });
      improvements.push('Start with an action verb like "Increase", "Improve", "Reduce"');
    }

    // T - Time-bound
    const timeWords = ['q1', 'q2', 'q3', 'q4', 'month', 'quarter', 'year', 'by', 'annual', 'fy'];
    const hasTimeRef = timeWords.some(w => title.toLowerCase().includes(w));
    if (hasTimeRef) {
      score += 20;
      feedback.push({ criterion: 'Time-bound', passed: true, note: 'Has time reference' });
    } else {
      feedback.push({ criterion: 'Time-bound', passed: false, note: 'Add time frame' });
      improvements.push('Add a specific time frame (e.g., "by Q2", "for FY 2025")');
    }

    return { score, feedback, improvements };
  }

  predictYearEndAchievement(achievements, goals) {
    if (!achievements || achievements.length === 0) {
      return null;
    }

    const predictions = [];

    goals.forEach(goal => {
      const goalAchievements = achievements.filter(a => a.goal_id === goal.id);

      if (goalAchievements.length === 0) return;

      const scores = goalAchievements.map(a => a.progress_score || 0);
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

      // Simple linear trend calculation
      let trend = 0;
      if (scores.length >= 2) {
        trend = scores[scores.length - 1] - scores[0];
      }

      const predictedFinalScore = Math.min(150, Math.max(0, avgScore + trend));

      predictions.push({
        goal_id: goal.id,
        goal_title: goal.title,
        current_avg: parseFloat(avgScore.toFixed(2)),
        trend: parseFloat(trend.toFixed(2)),
        predicted_final: parseFloat(predictedFinalScore.toFixed(2)),
        confidence: this.calculateConfidence(scores.length, scores),
        message: this.getPredictionMessage(predictedFinalScore, trend)
      });
    });

    return predictions;
  }

  calculateConfidence(dataPoints, scores) {
    if (dataPoints === 0) return 'Low';
    if (dataPoints === 1) return 'Low';

    const variance = this.calculateVariance(scores);
    if (dataPoints >= 3 && variance < 100) return 'High';
    if (dataPoints >= 2 && variance < 200) return 'Medium';
    return 'Low';
  }

  calculateVariance(values) {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  getPredictionMessage(score, trend) {
    if (score >= 100 && trend >= 0) return '🟢 On track to exceed target';
    if (score >= 100) return '🟢 On track to meet target';
    if (score >= 80 && trend >= 0) return '🟡 Good progress, push for completion';
    if (score >= 80) return '🟡 Needs improvement to reach target';
    if (score >= 60) return '🟠 At risk - requires attention';
    return '🔴 Critical - immediate action needed';
  }

  calculateGoalHealthScore(goal, achievements, checkIns) {
    let score = 0;
    const breakdown = [];

    // 1. Has achievements been updated (25 points)
    const hasAchievements = achievements.length > 0;
    if (hasAchievements) {
      score += 25;
      breakdown.push({ factor: 'Achievement Updates', score: 25, max: 25, status: 'good' });
    } else {
      breakdown.push({ factor: 'Achievement Updates', score: 0, max: 25, status: 'missing' });
    }

    // 2. Check-in completion (25 points)
    const hasCheckIns = checkIns.length > 0;
    if (hasCheckIns) {
      score += 25;
      breakdown.push({ factor: 'Manager Check-ins', score: 25, max: 25, status: 'good' });
    } else {
      breakdown.push({ factor: 'Manager Check-ins', score: 0, max: 25, status: 'missing' });
    }

    // 3. Progress trend (25 points)
    if (achievements.length >= 2) {
      const latestScore = achievements[achievements.length - 1].progress_score || 0;
      const previousScore = achievements[achievements.length - 2].progress_score || 0;

      if (latestScore >= previousScore) {
        score += 25;
        breakdown.push({ factor: 'Progress Trend', score: 25, max: 25, status: 'improving' });
      } else {
        score += 10;
        breakdown.push({ factor: 'Progress Trend', score: 10, max: 25, status: 'declining' });
      }
    } else if (achievements.length === 1) {
      const currentScore = achievements[0].progress_score || 0;
      const points = Math.min(25, Math.round(currentScore * 0.25));
      score += points;
      breakdown.push({ factor: 'Progress Trend', score: points, max: 25, status: 'insufficient_data' });
    } else {
      breakdown.push({ factor: 'Progress Trend', score: 0, max: 25, status: 'no_data' });
    }

    // 4. Current achievement level (25 points)
    const latestAchievement = achievements[achievements.length - 1];
    if (latestAchievement) {
      const achievementScore = latestAchievement.progress_score || 0;
      const points = Math.min(25, Math.round(achievementScore * 0.25));
      score += points;
      breakdown.push({ factor: 'Achievement Level', score: points, max: 25, status: achievementScore >= 70 ? 'good' : 'needs_attention' });
    } else {
      breakdown.push({ factor: 'Achievement Level', score: 0, max: 25, status: 'no_data' });
    }

    return {
      score: Math.min(100, score),
      breakdown,
      label: score >= 80 ? 'Healthy' : score >= 60 ? 'Fair' : score >= 40 ? 'At Risk' : 'Critical',
      color: score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger'
    };
  }
}

module.exports = new AIService();
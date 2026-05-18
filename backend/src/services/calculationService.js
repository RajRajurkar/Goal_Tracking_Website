const { UOM_TYPES } = require('../config/constants');

class CalculationService {
  calculateProgressScore(uomType, target, achievement) {
    if (!achievement || achievement === '' || achievement === null) {
      return 0;
    }

    let score = 0;

    switch (uomType) {
      case UOM_TYPES.MIN:
        // Higher is better (e.g., Revenue, Sales)
        score = (parseFloat(achievement) / parseFloat(target)) * 100;
        break;

      case UOM_TYPES.MAX:
        // Lower is better (e.g., TAT, Cost)
        if (parseFloat(achievement) === 0) {
          score = 100;
        } else {
          score = (parseFloat(target) / parseFloat(achievement)) * 100;
        }
        break;

      case UOM_TYPES.TIMELINE:
        // Date-based completion
        const targetDate = new Date(target);
        const achievementDate = new Date(achievement);
        
        if (achievementDate <= targetDate) {
          score = 100;
        } else {
          // Calculate days late
          const daysLate = Math.ceil((achievementDate - targetDate) / (1000 * 60 * 60 * 24));
          score = Math.max(0, 100 - (daysLate * 5)); // 5% penalty per day late
        }
        break;

      case UOM_TYPES.ZERO:
        // Zero is success (e.g., Safety incidents, Errors)
        score = parseFloat(achievement) === 0 ? 100 : 0;
        break;

      default:
        score = 0;
    }

    // Cap score at 150% to allow for over-achievement
    return Math.min(150, Math.max(0, parseFloat(score.toFixed(2))));
  }

  calculateOverallScore(achievements, goals) {
    if (!achievements || achievements.length === 0) {
      return 0;
    }

    let totalWeightedScore = 0;
    let totalWeightage = 0;

    achievements.forEach(achievement => {
      const goal = goals.find(g => g.id === achievement.goal_id);
      if (goal && achievement.progress_score) {
        totalWeightedScore += achievement.progress_score * (goal.weightage / 100);
        totalWeightage += goal.weightage;
      }
    });

    if (totalWeightage === 0) {
      return 0;
    }

    return parseFloat((totalWeightedScore).toFixed(2));
  }

  determineAchievementStatus(progressScore) {
    if (progressScore === 0) {
      return 'NOT_STARTED';
    } else if (progressScore >= 100) {
      return 'COMPLETED';
    } else if (progressScore >= 70) {
      return 'ON_TRACK';
    } else {
      return 'AT_RISK';
    }
  }
}

module.exports = new CalculationService();
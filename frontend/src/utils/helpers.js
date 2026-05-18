import { format } from 'date-fns';

export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '-';
  return format(new Date(date), formatStr);
};

export const calculateProgress = (uomType, target, achievement) => {
  if (!achievement || achievement === '') return 0;

  let score = 0;

  switch (uomType) {
    case 'MIN':
      score = (parseFloat(achievement) / parseFloat(target)) * 100;
      break;
    case 'MAX':
      score = parseFloat(achievement) === 0 ? 100 : (parseFloat(target) / parseFloat(achievement)) * 100;
      break;
    case 'TIMELINE':
      const targetDate = new Date(target);
      const achievementDate = new Date(achievement);
      score = achievementDate <= targetDate ? 100 : 0;
      break;
    case 'ZERO':
      score = parseFloat(achievement) === 0 ? 100 : 0;
      break;
    default:
      score = 0;
  }

  return Math.min(150, Math.max(0, score));
};

export const getProgressColor = (score) => {
  if (score >= 100) return 'success';
  if (score >= 70) return 'warning';
  return 'danger';
};

export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
import axios from './axiosConfig';

export const checkinApi = {
  updateAchievement: (goalId, data) => 
    axios.post(`/checkins/goals/${goalId}/achievement`, data),
  
  conductCheckIn: (goalId, data) => 
    axios.post(`/checkins/goals/${goalId}/checkin`, data),
  
  getMyAchievements: (cycleId, quarter) => 
    axios.get('/checkins/my-achievements', { params: { cycle_id: cycleId, quarter } }),
  
  getTeamAchievements: (cycleId, quarter) => 
    axios.get('/checkins/team-achievements', { params: { cycle_id: cycleId, quarter } }),
  
  getCheckInStatus: (cycleId, quarter) => 
    axios.get('/checkins/status', { params: { cycle_id: cycleId, quarter } }),
};
import axios from './axiosConfig';

export const goalApi = {
  createGoal: (goalData) => axios.post('/goals', goalData),
  
  getMyGoals: (cycleId) => axios.get('/goals/my-goals', { params: { cycle_id: cycleId } }),
  
  getGoalById: (id) => axios.get(`/goals/${id}`),
  
  updateGoal: (id, updates) => axios.put(`/goals/${id}`, updates),
  
  deleteGoal: (id) => axios.delete(`/goals/${id}`),
  
  submitForApproval: (id) => axios.post(`/goals/${id}/submit`),
  
  getTeamGoals: (cycleId) => axios.get('/goals/team/goals', { params: { cycle_id: cycleId } }),
  
  createSharedGoal: (goalData) => axios.post('/goals/shared', goalData),
};
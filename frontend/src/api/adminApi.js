import axios from './axiosConfig';

export const adminApi = {
  // User management
  getAllUsers: (params) => axios.get('/admin/users', { params }),
  createUser: (userData) => axios.post('/admin/users', userData),
  updateUser: (id, updates) => axios.put(`/admin/users/${id}`, updates),
  deleteUser: (id) => axios.delete(`/admin/users/${id}`),
  
  // Goal management
  unlockGoal: (goalId) => axios.post(`/admin/goals/${goalId}/unlock`),
  
  // Audit logs
  getAuditLogs: (params) => axios.get('/admin/audit-logs', { params }),
  
  // Analytics
  getAnalytics: (cycleId, type) => 
    axios.get('/admin/analytics', { params: { cycle_id: cycleId, type } }),
  
  getSystemStats: () => axios.get('/admin/stats'),
  
  // Escalations
  getEscalations: (params) => axios.get('/admin/escalations', { params }),
  resolveEscalation: (id, notes) => 
    axios.post(`/admin/escalations/${id}/resolve`, { notes }),
  triggerEscalation: (type) => 
    axios.post('/admin/escalations/trigger', { type }),
};
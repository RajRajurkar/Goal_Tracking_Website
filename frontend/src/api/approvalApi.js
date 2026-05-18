import axios from './axiosConfig';

export const approvalApi = {
  getPendingApprovals: () => axios.get('/approvals/pending'),
  
  approveGoal: (goalId, data) => axios.post(`/approvals/${goalId}/approve`, data),
  
  rejectGoal: (goalId, comment) => axios.post(`/approvals/${goalId}/reject`, { comment }),
  
  returnForRework: (goalId, comment) => axios.post(`/approvals/${goalId}/return`, { comment }),
  
  getApprovalHistory: (goalId) => axios.get(`/approvals/${goalId}/history`),
  
  getMyApprovals: () => axios.get('/approvals/my-approvals'),
};
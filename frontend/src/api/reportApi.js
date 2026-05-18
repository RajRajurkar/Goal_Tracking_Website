import axios from './axiosConfig';

export const reportApi = {
  getAchievementReport: (params) => 
    axios.get('/reports/achievement', { params }),
  
  exportCSV: (params) => 
    axios.get('/reports/achievement/csv', { params, responseType: 'blob' }),
  
  exportExcel: (params) => 
    axios.get('/reports/achievement/excel', { params, responseType: 'blob' }),
  
  getCompletionDashboard: (cycleId) => 
    axios.get('/reports/completion-dashboard', { params: { cycle_id: cycleId } }),
  
  getEmployeeReport: (employeeId, cycleId) => 
    axios.get(`/reports/employee/${employeeId}`, { params: { cycle_id: cycleId } }),
};
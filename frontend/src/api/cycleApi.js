import axios from './axiosConfig';

export const cycleApi = {
  getAllCycles: () => axios.get('/cycles'),

  getActiveCycle: () => axios.get('/cycles/active'),

  getCurrentQuarter: (cycleId) =>
    axios.get('/cycles/current-quarter', {
      params: cycleId ? { cycle_id: cycleId } : {}
    }),

  getCycleById: (id) => axios.get(`/cycles/${id}`),

  createCycle: (cycleData) => axios.post('/cycles', cycleData),

  updateCycle: (id, updates) => axios.put(`/cycles/${id}`, updates),

  setActiveCycle: (id) => axios.post(`/cycles/${id}/activate`),
};
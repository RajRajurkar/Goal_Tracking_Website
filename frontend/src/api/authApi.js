import axios from './axiosConfig';

export const authApi = {
  login: (credentials) => axios.post('/auth/login', credentials),
  
  register: (userData) => axios.post('/auth/register', userData),
  
  changePassword: (passwords) => axios.post('/auth/change-password', passwords),
  
  getProfile: () => axios.get('/auth/profile'),
};
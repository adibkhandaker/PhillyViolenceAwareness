import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data, error.message);
    return Promise.reject(error);
  }
);

export const incidentAPI = {
  // Get all incidents
  getAllIncidents: () => api.get('/api/incidents'),
  
  // Get individual incident by ID
  getIncidentById: (id) => api.get(`/api/incidents/${id}`),
  
  // Get incident statistics (both method names for compatibility)
  getStats: () => api.get('/api/incidents/stats'),
  getStatistics: () => api.get('/api/incidents/stats'),
  
  // Get incidents by crime type
  getIncidentsByCrimeType: (ucrGeneral) => api.get(`/api/incidents/crime-type/${ucrGeneral}`),
  
  // Get incidents by address
  getIncidentsByAddress: (address) => api.get(`/api/incidents/address/${encodeURIComponent(address)}`),
  
  // Get incidents by year
  getIncidentsByYear: (year) => api.get(`/api/incidents/by-year/${year}`),
  
  // Get incidents sorted by year
  getIncidentsSortedByYear: () => api.get('/api/incidents/sorted-by-year'),
  
  // Refresh incident data
  refreshData: () => api.post('/api/incidents/refresh'),
};

export const authAPI = {
  // Register new user
  register: (userData) => {
    console.log('API: Registering user with data:', { ...userData, password: '***' });
    return api.post('/main/register', userData);
  },
  
  // Login user (placeholder for when login endpoint is implemented)
  login: (credentials) => api.post('/main/login', credentials),
};

export default api; 
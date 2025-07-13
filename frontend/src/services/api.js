import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const incidentAPI = {
  // Get all incidents
  getAllIncidents: () => api.get('/incidents'),
  
  // Get incident statistics (both method names for compatibility)
  getStats: () => api.get('/incidents/stats'),
  getStatistics: () => api.get('/incidents/stats'),
  
  // Get incidents by crime type
  getIncidentsByCrimeType: (ucrGeneral) => api.get(`/incidents/crime-type/${ucrGeneral}`),
  
  // Get incidents by address
  getIncidentsByAddress: (address) => api.get(`/incidents/address/${encodeURIComponent(address)}`),
  
  // Get incidents by year
  getIncidentsByYear: (year) => api.get(`/incidents/by-year/${year}`),
  
  // Get incidents sorted by year
  getIncidentsSortedByYear: () => api.get('/incidents/sorted-by-year'),
  
  // Refresh incident data
  refreshData: () => api.post('/incidents/refresh'),
};

export default api; 
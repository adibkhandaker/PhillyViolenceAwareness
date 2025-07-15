import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Container,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  Map as MapIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { incidentAPI } from '../services/api';

// Fix for default Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom red marker for crime locations
const crimeMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const Dashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Filter states
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedCrimeType, setSelectedCrimeType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [addressSearchTerm, setAddressSearchTerm] = useState('');
  const [addressSearchResults, setAddressSearchResults] = useState([]);
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);
  const [useAddressSearch, setUseAddressSearch] = useState(false);

  // Year Analysis State
  const [availableYears, setAvailableYears] = useState([]);

  // Incident Detail Modal State
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentDetailOpen, setIncidentDetailOpen] = useState(false);
  const [incidentDetailLoading, setIncidentDetailLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterIncidents();
  }, [incidents, selectedYear, searchTerm, selectedCrimeType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsResponse, incidentsResponse] = await Promise.all([
        incidentAPI.getStatistics(),
        incidentAPI.getAllIncidents()
      ]);
      
      setStats(statsResponse.data);
      setIncidents(incidentsResponse.data);
      
      // Extract available years - use dispatchDateTime first, fallback to dispatchDate
      const years = [...new Set(incidentsResponse.data.map(incident => {
        // Try dispatchDateTime first (more reliable), then fallback to dispatchDate
        let date = null;
        if (incident.dispatchDateTime) {
          date = new Date(incident.dispatchDateTime);
        } else if (incident.dispatchDate) {
          date = new Date(incident.dispatchDate);
        }
        
        // Only include valid dates
        if (date && !isNaN(date.getTime())) {
          return date.getFullYear();
        }
        return null;
      }).filter(year => year !== null))].sort((a, b) => b - a);
      setAvailableYears(years);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await incidentAPI.refreshData();
      await fetchData();
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const filterIncidents = () => {
    let filtered = incidents;

    // Filter by year
    if (selectedYear !== 'all') {
      filtered = filtered.filter(incident => {
        // Try dispatchDateTime first (more reliable), then fallback to dispatchDate
        let date = null;
        if (incident.dispatchDateTime) {
          date = new Date(incident.dispatchDateTime);
        } else if (incident.dispatchDate) {
          date = new Date(incident.dispatchDate);
        }
        
        // Only include valid dates that match the selected year
        if (date && !isNaN(date.getTime())) {
          return date.getFullYear() === parseInt(selectedYear);
        }
        return false;
      });
    }

    // Filter by crime type
    if (selectedCrimeType !== 'all') {
      const crimeTypeRanges = {
        'homicide': [100, 199],
        'rape': [200, 299],
        'robbery': [300, 399],
        'assault': [400, 499],
      };
      const [min, max] = crimeTypeRanges[selectedCrimeType];
      filtered = filtered.filter(incident => 
        incident.ucrGeneral >= min && incident.ucrGeneral <= max
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(incident =>
        incident.locationBlock?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.textGeneralCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.dcDistrict?.toString().includes(searchTerm)
      );
    }

    return filtered;
  };

  // Address search functionality
  const handleAddressSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setAddressSearchResults([]);
      setUseAddressSearch(false);
      return;
    }

    setAddressSearchLoading(true);
    try {
      const results = await incidentAPI.getIncidentsByAddress(searchQuery);
      setAddressSearchResults(results);
      setUseAddressSearch(true);
      setPage(0); // Reset pagination
    } catch (err) {
      console.error('Address search failed:', err);
      setError('Failed to search by address. Please try again.');
      setAddressSearchResults([]);
      setUseAddressSearch(false);
    } finally {
      setAddressSearchLoading(false);
    }
  };

  const clearAddressSearch = () => {
    setAddressSearchTerm('');
    setAddressSearchResults([]);
    setUseAddressSearch(false);
    setPage(0);
  };

  // Handle Enter key press for address search
  const handleAddressSearchKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleAddressSearch(addressSearchTerm);
    }
  };

  // Handle manual search button click
  const handleSearchButtonClick = () => {
    handleAddressSearch(addressSearchTerm);
  };

  // Handle incident row click to show details
  const handleIncidentClick = async (incident) => {
    setIncidentDetailLoading(true);
    setIncidentDetailOpen(true);
    
    try {
      // Fetch detailed incident data by ID
      const response = await incidentAPI.getIncidentById(incident.id);
      setSelectedIncident(response.data);
    } catch (err) {
      console.error('Error fetching incident details:', err);
      setSelectedIncident(incident); // Fallback to the data we already have
    } finally {
      setIncidentDetailLoading(false);
    }
  };

  // Handle closing the incident detail modal
  const handleCloseIncidentDetail = () => {
    setIncidentDetailOpen(false);
    setSelectedIncident(null);
    setIncidentDetailLoading(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getCrimeTypeLabel = (ucrGeneral) => {
    if (ucrGeneral >= 100 && ucrGeneral < 200) return 'Homicide';
    if (ucrGeneral >= 200 && ucrGeneral < 300) return 'Sexual Assault';
    if (ucrGeneral >= 300 && ucrGeneral < 400) return 'Robbery';
    if (ucrGeneral >= 400 && ucrGeneral < 500) return 'Aggravated Assault';
    return 'Other';
  };

  const getCrimeTypeColor = (ucrGeneral) => {
    if (ucrGeneral >= 100 && ucrGeneral < 200) return 'error';
    if (ucrGeneral >= 200 && ucrGeneral < 300) return 'error';
    if (ucrGeneral >= 300 && ucrGeneral < 400) return 'warning';
    if (ucrGeneral >= 400 && ucrGeneral < 500) return 'warning';
    return 'default';
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={60} thickness={4} sx={{ mb: 4 }} />
          <Typography variant="h6" color="text.secondary">
            Loading dashboard data...
          </Typography>
        </Box>
      </Container>
    );
  }

  const displayData = useAddressSearch ? addressSearchResults : filterIncidents();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h3" component="h1" sx={{ color: 'primary.main', fontWeight: 700 }}>
              Crime Analytics Dashboard
            </Typography>
            <Button
              variant="outlined"
              startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{ minWidth: 120 }}
            >
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Comprehensive analysis of Philadelphia violent crime data from 2006-2025
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Detailed Crime Records */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h2" sx={{ mb: 3, color: 'primary.main' }}>
            Crime Records
          </Typography>
          
          {/* Filter Controls */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Year</InputLabel>
                <Select
                  value={selectedYear}
                  label="Year"
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <MenuItem value="all">All Years</MenuItem>
                  {availableYears.map(year => (
                    <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Crime Type</InputLabel>
                <Select
                  value={selectedCrimeType}
                  label="Crime Type"
                  onChange={(e) => setSelectedCrimeType(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="homicide">Homicide</MenuItem>
                  <MenuItem value="rape">Sexual Assault</MenuItem>
                  <MenuItem value="robbery">Robbery</MenuItem>
                  <MenuItem value="assault">Aggravated Assault</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search Description or General Location"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search in crime descriptions..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterListIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          {/* Loading indicator for address search */}
          {addressSearchLoading && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Searching for incidents at this location...
              </Typography>
            </Box>
          )}

          {/* Search Results Summary */}
          {useAddressSearch && addressSearchResults.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Found {addressSearchResults.length} incidents matching "{addressSearchTerm}"
              </Alert>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ bgcolor: 'rgba(44, 62, 80, 0.05)', textAlign: 'center', p: 2 }}>
                    <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 700 }}>
                      {addressSearchResults.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Total Found</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ bgcolor: 'rgba(192, 57, 43, 0.05)', textAlign: 'center', p: 2 }}>
                    <Typography variant="h5" sx={{ color: 'error.main', fontWeight: 700 }}>
                      {addressSearchResults.filter(i => i.ucrGeneral === '100').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Homicides</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ bgcolor: 'rgba(214, 137, 16, 0.05)', textAlign: 'center', p: 2 }}>
                    <Typography variant="h5" sx={{ color: 'warning.main', fontWeight: 700 }}>
                      {addressSearchResults.filter(i => i.ucrGeneral === '300').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Robberies</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ bgcolor: 'rgba(214, 137, 16, 0.08)', textAlign: 'center', p: 2 }}>
                    <Typography variant="h5" sx={{ color: 'warning.dark', fontWeight: 700 }}>
                      {addressSearchResults.filter(i => i.ucrGeneral === '400').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Assaults</Typography>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Results Table */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              💡 Click on any row to view detailed incident information
            </Typography>
          </Box>
          <Paper elevation={0} sx={{ border: '1px solid rgba(44, 62, 80, 0.08)' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(44, 62, 80, 0.04)' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Crime Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>District</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((incident, index) => (
                      <TableRow 
                        key={incident.id || index} 
                        hover 
                        onClick={() => handleIncidentClick(incident)}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'rgba(44, 62, 80, 0.04)'
                          }
                        }}
                      >
                        <TableCell>
                          {incident.dispatchDateTime ? 
                            new Date(incident.dispatchDateTime).toLocaleDateString() : 
                            incident.dispatchDate || 'Unknown'
                          }
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getCrimeTypeLabel(incident.ucrGeneral)}
                            color={getCrimeTypeColor(incident.ucrGeneral)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>
                          <Typography variant="body2" noWrap title={incident.locationBlock}>
                            {incident.locationBlock || 'Unknown Location'}
                          </Typography>
                        </TableCell>
                        <TableCell>{incident.dcDistrict || 'Unknown'}</TableCell>
                        <TableCell>{incident.dispatchTime || 'Unknown'}</TableCell>
                        <TableCell sx={{ maxWidth: 150 }}>
                          <Typography variant="body2" noWrap title={incident.textGeneralCode}>
                            {incident.textGeneralCode || 'N/A'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={displayData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </Box>
      </motion.div>

      {/* Incident Detail Modal */}
      <Dialog
        open={incidentDetailOpen}
        onClose={handleCloseIncidentDetail}
        maxWidth="lg"
        fullWidth
        TransitionComponent={motion.div}
        disableScrollLock
      >
        <DialogTitle>
          {selectedIncident ? `Incident Details: ${selectedIncident.textGeneralCode || selectedIncident.locationBlock}` : 'Incident Details'}
          <IconButton
            onClick={handleCloseIncidentDetail}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent 
          dividers
          sx={{ 
            maxHeight: '70vh', 
            overflowY: 'auto',
            overflowX: 'hidden',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#c1c1c1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#a8a8a8',
            },
          }}
        >
          {incidentDetailLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Loading incident details...
              </Typography>
            </Box>
          ) : selectedIncident ? (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" sx={{ color: 'primary.main' }}>
                    Basic Information
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">
                    <strong>ID:</strong> {selectedIncident.id}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Date:</strong> {selectedIncident.dispatchDateTime ? new Date(selectedIncident.dispatchDateTime).toLocaleDateString() : selectedIncident.dispatchDate || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Time:</strong> {selectedIncident.dispatchTime || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Crime Type:</strong> {getCrimeTypeLabel(selectedIncident.ucrGeneral)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Location:</strong> {selectedIncident.locationBlock || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>District:</strong> {selectedIncident.dcDistrict || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Description:</strong> {selectedIncident.textGeneralCode || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" sx={{ color: 'primary.main' }}>
                    Additional Details
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">
                    <strong>UCR General Code:</strong> {selectedIncident.ucrGeneral}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Block:</strong> {selectedIncident.locationBlock}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Latitude:</strong> {selectedIncident.latitude || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Longitude:</strong> {selectedIncident.longitude || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Dispatch Type:</strong> {selectedIncident.dispatchType || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Beat:</strong> {selectedIncident.beat || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Neighborhood:</strong> {selectedIncident.neighborhood || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
              
              {/* Location Map */}
              {selectedIncident.latitude && selectedIncident.longitude && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MapIcon />
                    Crime Location
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box 
                    sx={{ 
                      height: 300, 
                      width: '100%', 
                      borderRadius: 1, 
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <MapContainer 
                      center={[selectedIncident.latitude, selectedIncident.longitude]} 
                      zoom={16} 
                      style={{ height: '100%', width: '100%' }}
                      zoomControl={true}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker 
                        position={[selectedIncident.latitude, selectedIncident.longitude]}
                        icon={crimeMarkerIcon}
                      >
                        <Popup>
                          <Box sx={{ minWidth: 200 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                              {getCrimeTypeLabel(selectedIncident.ucrGeneral)}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              <LocationOnIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                              {selectedIncident.locationBlock}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Date:</strong> {selectedIncident.dispatchDateTime ? new Date(selectedIncident.dispatchDateTime).toLocaleDateString() : selectedIncident.dispatchDate}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Time:</strong> {selectedIncident.dispatchTime || 'N/A'}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                              Lat: {selectedIncident.latitude.toFixed(6)}, Lng: {selectedIncident.longitude.toFixed(6)}
                            </Typography>
                          </Box>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </Box>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary', textAlign: 'center' }}>
                    📍 Exact location: {selectedIncident.latitude.toFixed(6)}, {selectedIncident.longitude.toFixed(6)}
                  </Typography>
                </Box>
              )}
              
              {/* No Location Data Message */}
              {(!selectedIncident.latitude || !selectedIncident.longitude) && (
                <Box sx={{ mt: 3, textAlign: 'center', py: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <MapIcon sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Location coordinates are not available for this incident
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Select an incident from the table to view its details.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseIncidentDetail} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard; 
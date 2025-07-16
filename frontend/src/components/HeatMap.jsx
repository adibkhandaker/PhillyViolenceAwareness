import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
} from '@mui/material';
import { 
  Map as MapIcon,
  TuneRounded as TuneIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  LocationOn as LocationOnIcon,
  Whatshot as WhatshotIcon,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
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

// Custom HeatmapLayer component using leaflet.heat
const HeatmapLayer = ({ points }) => {
  const map = useMap();

  React.useEffect(() => {
    if (!points || points.length === 0) return;

    // Create heatmap layer
    const heatLayer = L.heatLayer(points, {
      radius: 20,
      blur: 15,
      maxZoom: 17,
      gradient: {
        0.1: 'blue',
        0.2: 'cyan',
        0.4: 'lime',
        0.6: 'yellow',
        0.8: 'orange',
        1.0: 'red'
      }
    }).addTo(map);

    // Cleanup function
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
};

const HeatMap = () => {
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCrimeType, setSelectedCrimeType] = useState('all');
  const [availableYears, setAvailableYears] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [showMarkers, setShowMarkers] = useState(false);
  const [markerLimit, setMarkerLimit] = useState(500);
  const [showAllMarkers, setShowAllMarkers] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(true);
  
  // Incident Detail Modal State
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentDetailOpen, setIncidentDetailOpen] = useState(false);
  const [incidentDetailLoading, setIncidentDetailLoading] = useState(false);

  // Philadelphia center coordinates
  const PHILLY_CENTER = [39.9526, -75.1652];

  useEffect(() => {
    fetchAvailableYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchIncidentsByYear();
    } else {
      setFilteredIncidents([]);
      setHeatmapData([]);
    }
  }, [selectedYear, selectedCrimeType]);

  const fetchAvailableYears = async () => {
    try {
      setLoading(true);
      const response = await incidentAPI.getAllIncidents();
      
      // Extract unique years from the data
      const years = [...new Set(response.data.map(incident => {
        let date = null;
        if (incident.dispatchDateTime) {
          date = new Date(incident.dispatchDateTime);
        } else if (incident.dispatchDate) {
          date = new Date(incident.dispatchDate);
        }
        
        if (date && !isNaN(date.getTime())) {
          return date.getFullYear();
        }
        return null;
      }).filter(year => year !== null))].sort((a, b) => b - a);
      
      setAvailableYears(years);
      setError(null);
    } catch (err) {
      console.error('Error fetching years:', err);
      setError('Failed to fetch available years. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchIncidentsByYear = async () => {
    try {
      setLoading(true);
      let response;
      
      // Fetch data based on filters
      if (selectedCrimeType === 'all') {
        response = await incidentAPI.getIncidentsByYear(parseInt(selectedYear));
      } else {
        // First get by year, then filter by crime type
        const yearResponse = await incidentAPI.getIncidentsByYear(parseInt(selectedYear));
        response = {
          data: yearResponse.data.filter(incident => incident.ucrGeneral === selectedCrimeType)
        };
      }
      
      // Filter incidents with valid coordinates
      const validIncidents = response.data.filter(incident => 
        incident.latitude && incident.longitude &&
        !isNaN(incident.latitude) && !isNaN(incident.longitude)
      );
      
      setIncidents(response.data);
      setFilteredIncidents(validIncidents);
      
      // Convert to heatmap format [lat, lng, intensity]
      // Adjust intensity based on crime type severity
      const heatData = validIncidents.map(incident => {
        let intensity = 1;
        // Higher intensity for more severe crimes
        switch (incident.ucrGeneral) {
          case '100': intensity = 3; break; // Homicide - highest
          case '200': intensity = 2.5; break; // Rape - high
          case '300': intensity = 2; break; // Robbery - medium-high
          case '400': intensity = 1.5; break; // Assault - medium
          default: intensity = 1; break;
        }
        
        return [
          incident.latitude,
          incident.longitude,
          intensity
        ];
      });
      
      setHeatmapData(heatData);
      setError(null);
    } catch (err) {
      console.error('Error fetching incidents:', err);
      setError('Failed to fetch incident data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleIncidentClick = async (incident) => {
    try {
      setIncidentDetailLoading(true);
      setSelectedIncident(incident);
      setIncidentDetailOpen(true);
      
      // Fetch detailed incident data
      const response = await incidentAPI.getIncidentById(incident.id);
      setSelectedIncident(response.data);
    } catch (err) {
      console.error('Error fetching incident details:', err);
      setError('Failed to fetch incident details. Please try again.');
    } finally {
      setIncidentDetailLoading(false);
    }
  };

  const handleCloseIncidentDetail = () => {
    setIncidentDetailOpen(false);
    setSelectedIncident(null);
    setIncidentDetailLoading(false);
  };

  const getCrimeTypeLabel = (ucrGeneral) => {
    const crimeTypes = {
      '100': 'Homicide',
      '200': 'Rape',
      '300': 'Robbery', 
      '400': 'Aggravated Assault'
    };
    return crimeTypes[ucrGeneral] || 'Unknown';
  };

  const getCrimeTypeColor = (ucrGeneral) => {
    const colors = {
      '100': '#d32f2f', // Red for Homicide
      '200': '#7b1fa2', // Purple for Rape
      '300': '#f57c00', // Orange for Robbery
      '400': '#1976d2'  // Blue for Aggravated Assault
    };
    return colors[ucrGeneral] || '#666666';
  };

  const getStatsForYear = () => {
    if (!filteredIncidents.length) return null;
    
    const totalCrimes = filteredIncidents.length;
    const homicides = filteredIncidents.filter(i => i.ucrGeneral === '100').length;
    const rapes = filteredIncidents.filter(i => i.ucrGeneral === '200').length;
    const robberies = filteredIncidents.filter(i => i.ucrGeneral === '300').length;
    const assaults = filteredIncidents.filter(i => i.ucrGeneral === '400').length;
    
    return { totalCrimes, homicides, rapes, robberies, assaults };
  };

  const getDisplayedMarkerCount = () => {
    if (!showMarkers) return 0;
    return showAllMarkers ? filteredIncidents.length : Math.min(markerLimit, filteredIncidents.length);
  };

  const shouldShowPerformanceWarning = () => {
    return showMarkers && getDisplayedMarkerCount() > 1000;
  };

  const getOptimizedMarkers = () => {
    if (!showMarkers || !filteredIncidents.length) return [];
    
    let markers = filteredIncidents;
    
    // Performance mode optimizations
    if (performanceMode) {
      // Sort by most recent first, then limit
      markers = markers.sort((a, b) => {
        const dateA = new Date(a.dispatchDateTime || a.dispatchDate || 0);
        const dateB = new Date(b.dispatchDateTime || b.dispatchDate || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      // Apply limit unless showing all
      if (!showAllMarkers) {
        markers = markers.slice(0, markerLimit);
      }
    }
    
    return markers;
  };

  const stats = getStatsForYear();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700, 
              mb: 2, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              color: 'primary.main' 
            }}
          >
            <WhatshotIcon sx={{ fontSize: 48 }} />
            Crime Heat Map
          </Typography>
                     <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
             Visualize crime density across Philadelphia by year and type. Select filters to see the distribution of violent crimes as an interactive heat map with customizable intensity levels.
           </Typography>
        </Box>

        {/* Controls */}
                 <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
           <CardContent>
             <Grid container spacing={3} alignItems="center">
               <Grid item xs={12} sm={6} md={6}>
                 <FormControl fullWidth sx={{ minWidth: 200 }}>
                   <InputLabel>Year</InputLabel>
                   <Select
                     value={selectedYear}
                     label="Year"
                     onChange={(e) => setSelectedYear(e.target.value)}
                     disabled={loading}
                   >
                     <MenuItem value="">
                       <em>Select...</em>
                     </MenuItem>
                     {availableYears.map((year) => (
                       <MenuItem key={year} value={year}>
                         {year}
                       </MenuItem>
                     ))}
                   </Select>
                 </FormControl>
               </Grid>
               
               <Grid item xs={12} sm={6} md={6}>
                 <FormControl fullWidth>
                   <InputLabel>Crime Type</InputLabel>
                   <Select
                     value={selectedCrimeType}
                     label="Crime Type"
                     onChange={(e) => setSelectedCrimeType(e.target.value)}
                     disabled={loading || !selectedYear}
                   >
                     <MenuItem value="all">All Crime Types</MenuItem>
                     <MenuItem value="100">Homicide</MenuItem>
                     <MenuItem value="200">Rape</MenuItem>
                     <MenuItem value="300">Robbery</MenuItem>
                     <MenuItem value="400">Aggravated Assault</MenuItem>
                   </Select>
                 </FormControl>
               </Grid>
               
                              {selectedYear && filteredIncidents.length > 0 && (
                 <Grid item xs={12} sm={6} md={4}>
                   <Button
                     variant="outlined"
                     startIcon={<TuneIcon />}
                     onClick={() => setShowMarkers(!showMarkers)}
                     sx={{ height: 56 }}
                   >
                     {showMarkers ? 'Hide Markers' : 'Show Markers'}
                   </Button>
                 </Grid>
               )}
               
               {showMarkers && selectedYear && filteredIncidents.length > 0 && (
                 <Grid item xs={12} sm={6} md={4}>
                   <FormControl fullWidth>
                     <InputLabel>Marker Limit</InputLabel>
                     <Select
                       value={showAllMarkers ? 'all' : markerLimit}
                       label="Marker Limit"
                       onChange={(e) => {
                         if (e.target.value === 'all') {
                           setShowAllMarkers(true);
                         } else {
                           setShowAllMarkers(false);
                           setMarkerLimit(e.target.value);
                         }
                       }}
                     >
                       <MenuItem value={100}>100 Markers</MenuItem>
                       <MenuItem value={250}>250 Markers</MenuItem>
                       <MenuItem value={500}>500 Markers</MenuItem>
                       <MenuItem value={1000}>1,000 Markers</MenuItem>
                       <MenuItem value={2000}>2,000 Markers</MenuItem>
                       <MenuItem value="all">All Markers ({filteredIncidents.length})</MenuItem>
                     </Select>
                   </FormControl>
                 </Grid>
               )}
               
               {selectedYear && filteredIncidents.length > 0 && (
                 <Grid item xs={12} sm={6} md={4}>
                   <Button
                     variant={performanceMode ? "contained" : "outlined"}
                     onClick={() => setPerformanceMode(!performanceMode)}
                     sx={{ height: 56 }}
                     color={performanceMode ? "success" : "primary"}
                   >
                     {performanceMode ? "Performance Mode ON" : "Performance Mode OFF"}
                   </Button>
                 </Grid>
               )}
               
               <Grid item xs={12}>
                 {stats && (
                   <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                     <Chip 
                       label={`Total: ${stats.totalCrimes}`} 
                       sx={{ 
                         bgcolor: selectedCrimeType === 'all' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.10)', 
                         color: 'white',
                         fontFamily: theme => theme.typography.fontFamily,
                         height: 40,
                         borderRadius: 2,
                         px: 2
                       }}
                     />
                     <Chip 
                       label={`Homicides: ${stats.homicides}`} 
                       sx={{ 
                         bgcolor: selectedCrimeType === '100' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.10)', 
                         color: 'white',
                         fontFamily: theme => theme.typography.fontFamily,
                         height: 40,
                         borderRadius: 2,
                         px: 2
                       }}
                     />
                     <Chip 
                       label={`Rapes: ${stats.rapes}`} 
                       sx={{ 
                         bgcolor: selectedCrimeType === '200' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.10)', 
                         color: 'white',
                         fontFamily: theme => theme.typography.fontFamily,
                         height: 40,
                         borderRadius: 2,
                         px: 2
                       }}
                     />
                     <Chip 
                       label={`Robberies: ${stats.robberies}`} 
                       sx={{ 
                         bgcolor: selectedCrimeType === '300' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.10)', 
                         color: 'white',
                         fontFamily: theme => theme.typography.fontFamily,
                         height: 40,
                         borderRadius: 2,
                         px: 2
                       }}
                     />
                     <Chip 
                       label={`Assaults: ${stats.assaults}`} 
                       sx={{ 
                         bgcolor: selectedCrimeType === '400' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.10)', 
                         color: 'white',
                         fontFamily: theme => theme.typography.fontFamily,
                         height: 40,
                         borderRadius: 2,
                         px: 2
                       }}
                     />
                     {showMarkers && (
                       <Chip 
                         label={`Showing: ${getDisplayedMarkerCount().toLocaleString()} markers`} 
                         sx={{ bgcolor: 'grey.600', color: 'white' }}
                       />
                     )}
                   </Box>
                 )}
               </Grid>
            </Grid>
          </CardContent>
        </Card>

                 {/* Error Display */}
         {error && (
           <Alert severity="error" sx={{ mb: 3 }}>
             {error}
           </Alert>
         )}

         {/* Performance Warning */}
         {shouldShowPerformanceWarning() && (
           <Alert severity="warning" sx={{ mb: 3 }}>
             <Typography variant="body2">
               <strong>Performance Notice:</strong> Displaying {getDisplayedMarkerCount().toLocaleString()} markers may slow down the map. 
               Consider reducing the marker limit for better performance.
             </Typography>
           </Alert>
         )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={50} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Loading heat map data...
            </Typography>
          </Box>
        )}

        {/* Map Container */}
        {!loading && (
          <Card sx={{ borderRadius: 2, overflow: 'hidden', height: 600 }}>
            {selectedYear && heatmapData.length > 0 ? (
              <MapContainer 
                center={PHILLY_CENTER} 
                zoom={11} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                                 {/* Heat Map Layer */}
                 <HeatmapLayer points={heatmapData} />
                
                                 {/* Individual Markers (optional) */}
                 {getOptimizedMarkers().map((incident, index) => (
                  <Marker 
                    key={incident.id || index}
                    position={[incident.latitude, incident.longitude]}
                    icon={crimeMarkerIcon}
                    eventHandlers={{
                      click: () => handleIncidentClick(incident)
                    }}
                  >
                    <Popup>
                      <Box sx={{ minWidth: 200 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: getCrimeTypeColor(incident.ucrGeneral) }}>
                          {getCrimeTypeLabel(incident.ucrGeneral)}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <LocationOnIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                          {incident.locationBlock}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Date:</strong> {incident.dispatchDateTime ? new Date(incident.dispatchDateTime).toLocaleDateString() : incident.dispatchDate}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Time:</strong> {incident.dispatchTime || 'N/A'}
                        </Typography>
                        <Button 
                          size="small" 
                          onClick={() => handleIncidentClick(incident)}
                          sx={{ mt: 1 }}
                        >
                          View Details
                        </Button>
                      </Box>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : !selectedYear ? (
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: 'grey.50',
                color: 'text.secondary'
              }}>
                <WhatshotIcon sx={{ fontSize: 80, mb: 2, color: 'grey.400' }} />
                                 <Typography variant="h5" sx={{ mb: 1 }}>
                   Select Filters to View Heat Map
                 </Typography>
                 <Typography variant="body1">
                   Choose a year and optionally filter by crime type to visualize density patterns
                 </Typography>
              </Box>
            ) : (
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: 'grey.50',
                color: 'text.secondary'
              }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  No location data available for {selectedYear}
                </Alert>
              </Box>
            )}
          </Card>
        )}
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
                    <strong>Latitude:</strong> {selectedIncident.latitude || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Longitude:</strong> {selectedIncident.longitude || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Select an incident to view its details.
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

export default HeatMap; 
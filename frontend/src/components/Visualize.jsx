import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tabs,
  Tab,
  Paper,
  Switch,
  FormControlLabel,
  Slider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { motion } from 'framer-motion';
import { incidentAPI } from '../services/api';

const Visualize = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCrimeType, setSelectedCrimeType] = useState('all');
  const [availableYears, setAvailableYears] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [activeView, setActiveView] = useState('charts'); // 'charts' or 'heatmap'

  // Chart data states
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [seasonalData, setSeasonalData] = useState([]);
  const [dayOfWeekData, setDayOfWeekData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  // Heatmap states
  const [heatmapData, setHeatmapData] = useState([]);
  const [showMarkers, setShowMarkers] = useState(false);
  const [markerLimit, setMarkerLimit] = useState(500);
  const [showAllMarkers, setShowAllMarkers] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(true);
  
  // Incident Detail Modal State
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentDetailOpen, setIncidentDetailOpen] = useState(false);
  const [incidentDetailLoading, setIncidentDetailLoading] = useState(false);

  const COLORS = ['#ff4444', '#ffaa00', '#4caf50', '#2196f3', '#9c27b0', '#ff9800', '#795548'];

  // Philadelphia center coordinates
  const PHILLY_CENTER = [39.9526, -75.1652];

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

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (incidents.length > 0) {
      processData();
    }
  }, [incidents, selectedYear, selectedCrimeType]);



  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await incidentAPI.getAllIncidents();
      setIncidents(response.data);
      
      // Extract available years
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
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const processData = () => {
    let filteredIncidents = incidents;

    // Filter by year
    if (selectedYear !== '' && selectedYear !== 'all') {
      filteredIncidents = filteredIncidents.filter(incident => {
        let date = null;
        if (incident.dispatchDateTime) {
          date = new Date(incident.dispatchDateTime);
        } else if (incident.dispatchDate) {
          date = new Date(incident.dispatchDate);
        }
        
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
      filteredIncidents = filteredIncidents.filter(incident => 
        incident.ucrGeneral >= min && incident.ucrGeneral <= max
      );
    }

    // Process monthly data
    const monthlyStats = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    filteredIncidents.forEach(incident => {
      let date = null;
      if (incident.dispatchDateTime) {
        date = new Date(incident.dispatchDateTime);
      } else if (incident.dispatchDate) {
        date = new Date(incident.dispatchDate);
      }
      
      if (date && !isNaN(date.getTime())) {
        const month = date.getMonth();
        monthlyStats[month] = (monthlyStats[month] || 0) + 1;
      }
    });

    const monthlyChartData = monthNames.map((name, index) => ({
      month: name,
      incidents: monthlyStats[index] || 0
    }));
    setMonthlyData(monthlyChartData);

    // Process weekly data (last 12 weeks)
    const weeklyStats = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (now.getDay() + 7 * i));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekKey = `Week ${12 - i}`;
      weeklyStats[weekKey] = 0;
      
      filteredIncidents.forEach(incident => {
        let date = null;
        if (incident.dispatchDateTime) {
          date = new Date(incident.dispatchDateTime);
        } else if (incident.dispatchDate) {
          date = new Date(incident.dispatchDate);
        }
        
        if (date && date >= weekStart && date <= weekEnd) {
          weeklyStats[weekKey]++;
        }
      });
    }

    const weeklyChartData = Object.keys(weeklyStats).map(week => ({
      week,
      incidents: weeklyStats[week]
    }));
    setWeeklyData(weeklyChartData);

    // Process daily data (last 30 days)
    const dailyStats = {};
    for (let i = 29; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      day.setHours(0, 0, 0, 0);
      
      const dayKey = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyStats[dayKey] = 0;
      
      filteredIncidents.forEach(incident => {
        let date = null;
        if (incident.dispatchDateTime) {
          date = new Date(incident.dispatchDateTime);
        } else if (incident.dispatchDate) {
          date = new Date(incident.dispatchDate);
        }
        
        if (date) {
          const incidentDay = new Date(date);
          incidentDay.setHours(0, 0, 0, 0);
          
          if (incidentDay.getTime() === day.getTime()) {
            dailyStats[dayKey]++;
          }
        }
      });
    }

    const dailyChartData = Object.keys(dailyStats).map(day => ({
      day,
      incidents: dailyStats[day]
    }));
    setDailyData(dailyChartData);

    // Process seasonal data
    const seasonalStats = {
      'Spring': 0, // Mar, Apr, May
      'Summer': 0, // Jun, Jul, Aug
      'Fall': 0,   // Sep, Oct, Nov
      'Winter': 0  // Dec, Jan, Feb
    };

    filteredIncidents.forEach(incident => {
      let date = null;
      if (incident.dispatchDateTime) {
        date = new Date(incident.dispatchDateTime);
      } else if (incident.dispatchDate) {
        date = new Date(incident.dispatchDate);
      }
      
      if (date && !isNaN(date.getTime())) {
        const month = date.getMonth();
        if (month >= 2 && month <= 4) seasonalStats['Spring']++;
        else if (month >= 5 && month <= 7) seasonalStats['Summer']++;
        else if (month >= 8 && month <= 10) seasonalStats['Fall']++;
        else seasonalStats['Winter']++;
      }
    });

    const seasonalChartData = Object.keys(seasonalStats).map(season => ({
      season,
      incidents: seasonalStats[season]
    }));
    setSeasonalData(seasonalChartData);

    // Process day of week data
    const dayStats = {
      'Sunday': 0, 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0,
      'Thursday': 0, 'Friday': 0, 'Saturday': 0
    };

    filteredIncidents.forEach(incident => {
      let date = null;
      if (incident.dispatchDateTime) {
        date = new Date(incident.dispatchDateTime);
      } else if (incident.dispatchDate) {
        date = new Date(incident.dispatchDate);
      }
      
      if (date && !isNaN(date.getTime())) {
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        dayStats[dayName]++;
      }
    });

    const dayOfWeekChartData = Object.keys(dayStats).map(day => ({
      day,
      incidents: dayStats[day]
    }));
    setDayOfWeekData(dayOfWeekChartData);

    // Process hourly data
    const hourlyStats = {};
    for (let i = 0; i < 24; i++) {
      hourlyStats[i] = 0;
    }

    filteredIncidents.forEach(incident => {
      let date = null;
      if (incident.dispatchDateTime) {
        date = new Date(incident.dispatchDateTime);
      } else if (incident.dispatchDate) {
        date = new Date(incident.dispatchDate);
      }
      
      if (date && !isNaN(date.getTime())) {
        const hour = date.getHours();
        hourlyStats[hour]++;
      }
    });

    const hourlyChartData = Object.keys(hourlyStats).map(hour => ({
      hour: `${hour}:00`,
      incidents: hourlyStats[hour]
    }));
    setHourlyData(hourlyChartData);

    // Process trend data (by year)
    const trendStats = {};
    availableYears.forEach(year => {
      trendStats[year] = 0;
    });

    incidents.forEach(incident => {
      let date = null;
      if (incident.dispatchDateTime) {
        date = new Date(incident.dispatchDateTime);
      } else if (incident.dispatchDate) {
        date = new Date(incident.dispatchDate);
      }
      
      if (date && !isNaN(date.getTime())) {
        const year = date.getFullYear();
        if (trendStats.hasOwnProperty(year)) {
          trendStats[year]++;
        }
      }
    });

    const trendChartData = Object.keys(trendStats).map(year => ({
      year: year.toString(),
      incidents: trendStats[year]
    }));
    setTrendData(trendChartData);

    // Process heatmap data
    const validIncidents = filteredIncidents.filter(incident => 
      incident.latitude && incident.longitude &&
      !isNaN(incident.latitude) && !isNaN(incident.longitude)
    );

    // Convert to heatmap format [lat, lng, intensity]
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
  };



  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewChange = (view) => {
    setActiveView(view);
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
    if (ucrGeneral >= 100 && ucrGeneral <= 199) return 'Homicide';
    if (ucrGeneral >= 200 && ucrGeneral <= 299) return 'Rape';
    if (ucrGeneral >= 300 && ucrGeneral <= 399) return 'Robbery';
    if (ucrGeneral >= 400 && ucrGeneral <= 499) return 'Assault';
    return 'Other';
  };

  const getCrimeTypeColor = (ucrGeneral) => {
    if (ucrGeneral >= 100 && ucrGeneral <= 199) return '#ff4444';
    if (ucrGeneral >= 200 && ucrGeneral <= 299) return '#ffaa00';
    if (ucrGeneral >= 300 && ucrGeneral <= 399) return '#4caf50';
    if (ucrGeneral >= 400 && ucrGeneral <= 499) return '#2196f3';
    return '#9e9e9e';
  };

  const getOptimizedMarkers = () => {
    if (!showMarkers) return [];
    
    let filteredIncidents = incidents;

    // Filter by year
    if (selectedYear !== '' && selectedYear !== 'all') {
      filteredIncidents = filteredIncidents.filter(incident => {
        let date = null;
        if (incident.dispatchDateTime) {
          date = new Date(incident.dispatchDateTime);
        } else if (incident.dispatchDate) {
          date = new Date(incident.dispatchDate);
        }
        
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
      filteredIncidents = filteredIncidents.filter(incident => 
        incident.ucrGeneral >= min && incident.ucrGeneral <= max
      );
    }
    
    const validIncidents = filteredIncidents.filter(incident => 
      incident.latitude && incident.longitude &&
      !isNaN(incident.latitude) && !isNaN(incident.longitude)
    );

    if (showAllMarkers) {
      return validIncidents;
    }

    return validIncidents.slice(0, markerLimit);
  };

  const getDisplayedMarkerCount = () => {
    let filteredIncidents = incidents;

    // Filter by year
    if (selectedYear !== '' && selectedYear !== 'all') {
      filteredIncidents = filteredIncidents.filter(incident => {
        let date = null;
        if (incident.dispatchDateTime) {
          date = new Date(incident.dispatchDateTime);
        } else if (incident.dispatchDate) {
          date = new Date(incident.dispatchDate);
        }
        
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
      filteredIncidents = filteredIncidents.filter(incident => 
        incident.ucrGeneral >= min && incident.ucrGeneral <= max
      );
    }
    
    const validIncidents = filteredIncidents.filter(incident => 
      incident.latitude && incident.longitude &&
      !isNaN(incident.latitude) && !isNaN(incident.longitude)
    );
    
    if (showAllMarkers) return validIncidents.length;
    return Math.min(validIncidents.length, markerLimit);
  };

  const shouldShowPerformanceWarning = () => {
    let filteredIncidents = incidents;

    // Filter by year
    if (selectedYear !== '' && selectedYear !== 'all') {
      filteredIncidents = filteredIncidents.filter(incident => {
        let date = null;
        if (incident.dispatchDateTime) {
          date = new Date(incident.dispatchDateTime);
        } else if (incident.dispatchDate) {
          date = new Date(incident.dispatchDate);
        }
        
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
      filteredIncidents = filteredIncidents.filter(incident => 
        incident.ucrGeneral >= min && incident.ucrGeneral <= max
      );
    }
    
    const validIncidents = filteredIncidents.filter(incident => 
      incident.latitude && incident.longitude &&
      !isNaN(incident.latitude) && !isNaN(incident.longitude)
    );
    return validIncidents.length > 1000 && !performanceMode;
  };

  const renderMonthlyChart = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Monthly Crime Patterns
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="incidents" fill="#ff4444" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderWeeklyChart = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Weekly Crime Trends (Last 12 Weeks)
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="incidents" stroke="#ff4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderDailyChart = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Daily Crime Patterns (Last 30 Days)
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="incidents" fill="#ff4444" fillOpacity={0.6} stroke="#ff4444" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderSeasonalChart = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Seasonal Crime Distribution
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={seasonalData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ season, percent }) => `${season} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="incidents"
            >
              {seasonalData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderDayOfWeekChart = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Day of Week Crime Patterns
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dayOfWeekData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="incidents" fill="#ffaa00" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderHourlyChart = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Hourly Crime Distribution
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="incidents" stroke="#4caf50" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderTrendChart = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Yearly Crime Trends
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="incidents" stroke="#2196f3" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h3" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
          Crime Analytics & Trends
        </Typography>

        {/* Filters */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth sx={{ minWidth: 140 }}>
                  <InputLabel shrink>Year</InputLabel>
                  <Select
                    value={selectedYear}
                    label="Year"
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    <MenuItem value="">All Years</MenuItem>
                    {availableYears.map(year => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Crime Type</InputLabel>
                  <Select
                    value={selectedCrimeType}
                    label="Crime Type"
                    onChange={(e) => setSelectedCrimeType(e.target.value)}
                  >
                    <MenuItem value="all">All Crimes</MenuItem>
                    <MenuItem value="homicide">Homicide</MenuItem>
                    <MenuItem value="rape">Rape</MenuItem>
                    <MenuItem value="robbery">Robbery</MenuItem>
                    <MenuItem value="assault">Assault</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip 
                    label={`Total Incidents: ${incidents.length}`} 
                    color="primary" 
                    variant="outlined" 
                  />
                  {selectedYear !== 'all' && (
                    <Chip 
                      label={`Year: ${selectedYear}`} 
                      color="secondary" 
                      variant="outlined" 
                    />
                  )}
                  {selectedCrimeType !== 'all' && (
                    <Chip 
                      label={`Type: ${selectedCrimeType.charAt(0).toUpperCase() + selectedCrimeType.slice(1)}`} 
                      color="info" 
                      variant="outlined" 
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* View Toggle */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant={activeView === 'charts' ? 'contained' : 'outlined'}
                onClick={() => handleViewChange('charts')}
                sx={{ 
                  minWidth: 200,
                  color: activeView === 'charts' ? '#000000' : 'text.primary',
                  backgroundColor: activeView === 'charts' ? '#ffffff' : 'transparent',
                  '&:hover': {
                    backgroundColor: activeView === 'charts' ? '#f0f0f0' : 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Statistical Charts
              </Button>
              <Button
                variant={activeView === 'heatmap' ? 'contained' : 'outlined'}
                onClick={() => handleViewChange('heatmap')}
                sx={{ 
                  minWidth: 200,
                  color: activeView === 'heatmap' ? '#000000' : 'text.primary',
                  backgroundColor: activeView === 'heatmap' ? '#ffffff' : 'transparent',
                  '&:hover': {
                    backgroundColor: activeView === 'heatmap' ? '#f0f0f0' : 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Interactive Heatmap
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Content Based on Active View */}
        {activeView === 'charts' && (
          <>
            {/* Chart Tabs */}
            <Paper sx={{ mb: 4 }}>
              <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                <Tab label="Monthly Patterns" />
                <Tab label="Weekly Trends" />
                <Tab label="Daily Patterns" />
                <Tab label="Seasonal Analysis" />
                <Tab label="Day of Week" />
                <Tab label="Hourly Distribution" />
                <Tab label="Yearly Trends" />
              </Tabs>
            </Paper>

            {/* Chart Content */}
            <Box sx={{ mt: 2 }}>
              {activeTab === 0 && renderMonthlyChart()}
              {activeTab === 1 && renderWeeklyChart()}
              {activeTab === 2 && renderDailyChart()}
              {activeTab === 3 && renderSeasonalChart()}
              {activeTab === 4 && renderDayOfWeekChart()}
              {activeTab === 5 && renderHourlyChart()}
              {activeTab === 6 && renderTrendChart()}
            </Box>
          </>
        )}

        {activeView === 'heatmap' && (
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Interactive Heatmap
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Visualize crime density and patterns across Philadelphia
              </Typography>
              
              {/* Heatmap Controls */}
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showMarkers}
                          onChange={(e) => setShowMarkers(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Show Individual Markers"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={performanceMode}
                          onChange={(e) => setPerformanceMode(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Performance Mode"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showAllMarkers}
                          onChange={(e) => setShowAllMarkers(e.target.checked)}
                          color="primary"
                          disabled={!showMarkers}
                        />
                      }
                      label="Show All Markers"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Marker Limit: {markerLimit}
                      </Typography>
                      <Slider
                        value={markerLimit}
                        onChange={(e, value) => setMarkerLimit(value)}
                        min={100}
                        max={2000}
                        step={100}
                        disabled={showAllMarkers || !showMarkers}
                        sx={{ width: '100%' }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Heatmap Stats */}
              <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={`Heatmap Points: ${heatmapData.length}`}
                  color="primary"
                  variant="outlined"
                />
                <Chip 
                  label={`Markers: ${getDisplayedMarkerCount()}`}
                  color="secondary"
                  variant="outlined"
                />
                {shouldShowPerformanceWarning() && (
                  <Chip 
                    label="Performance Warning: Many markers may slow down the map"
                    color="warning"
                    variant="outlined"
                  />
                )}
              </Box>

              {/* Map Container */}
              <Box sx={{ height: 600, width: '100%', borderRadius: 2, overflow: 'hidden' }}>
                <MapContainer
                  center={PHILLY_CENTER}
                  zoom={12}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {/* Heatmap Layer */}
                  <HeatmapLayer points={heatmapData} />
                  
                  {/* Individual Markers */}
                  {getOptimizedMarkers().map((incident, index) => (
                    <Marker
                      key={index}
                      position={[incident.latitude, incident.longitude]}
                      icon={crimeMarkerIcon}
                    >
                      <Popup>
                        <Box sx={{ minWidth: 200 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            {getCrimeTypeLabel(incident.ucrGeneral)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Location: {incident.locationBlock || 'Unknown'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Date: {incident.dispatchDateTime ? 
                              new Date(incident.dispatchDateTime).toLocaleDateString() : 
                              'Unknown'
                            }
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            District: {incident.dcDistrict || 'Unknown'}
                          </Typography>
                          <Button 
                            size="small" 
                            variant="outlined"
                            onClick={() => handleIncidentClick(incident)}
                            sx={{ mt: 1, width: '100%' }}
                          >
                            More Details
                          </Button>
                        </Box>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </Box>
            </CardContent>
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
                  <Typography variant="body2">
                    <strong>Text General Code:</strong> {selectedIncident.textGeneralCode || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Text General Code Description:</strong> {selectedIncident.textGeneralCodeDescription || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Dispatch Date:</strong> {selectedIncident.dispatchDate || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Dispatch Date Time:</strong> {selectedIncident.dispatchDateTime ? new Date(selectedIncident.dispatchDateTime).toLocaleString() : 'N/A'}
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

export default Visualize; 
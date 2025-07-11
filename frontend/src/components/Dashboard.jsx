import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  IconButton,
  Tooltip,
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
  Tabs,
  Tab,
  LinearProgress,
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  LocationOn as LocationOnIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  GetApp as ExportIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { incidentAPI } from '../services/api';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  // Year Analysis State
  const [selectedYear, setSelectedYear] = useState('all');
  const [availableYears, setAvailableYears] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrimeType, setSelectedCrimeType] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
      
      // Extract available years
      const years = [...new Set(incidentsResponse.data.map(incident => 
        new Date(incident.dispatchDateTime).getFullYear()
      ))].sort((a, b) => b - a);
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
      filtered = filtered.filter(incident => 
        new Date(incident.dispatchDateTime).getFullYear() === parseInt(selectedYear)
      );
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

    setFilteredIncidents(filtered);
    setPage(0); // Reset to first page when filters change
  };

  const getFilteredStats = () => {
    if (!filteredIncidents.length) {
      return {
        total: 0,
        homicide: 0,
        rape: 0,
        robbery: 0,
        assault: 0,
      };
    }

    return filteredIncidents.reduce((acc, incident) => {
      const ucr = incident.ucrGeneral;
      acc.total++;
      if (ucr >= 100 && ucr < 200) acc.homicide++;
      else if (ucr >= 200 && ucr < 300) acc.rape++;
      else if (ucr >= 300 && ucr < 400) acc.robbery++;
      else if (ucr >= 400 && ucr < 500) acc.assault++;
      return acc;
    }, { total: 0, homicide: 0, rape: 0, robbery: 0, assault: 0 });
  };

  const filteredStats = getFilteredStats();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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

        {/* Navigation Tabs */}
        <Paper elevation={0} sx={{ mb: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                py: 2,
              },
            }}
          >
            <Tab 
              label="Overview Statistics" 
              icon={<AssessmentIcon />}
              iconPosition="start"
            />
            <Tab 
              label="Year-by-Year Analysis" 
              icon={<CalendarIcon />}
              iconPosition="start"
            />
            <Tab 
              label="Detailed Records" 
              icon={<FilterListIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Overview Statistics Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Overall Statistics Cards */}
            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card sx={{ 
                  bgcolor: 'rgba(192, 57, 43, 0.05)',
                  border: '1px solid rgba(192, 57, 43, 0.2)',
                  '&:hover': { transform: 'translateY(-4px)' },
                  transition: 'all 0.3s ease',
                }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <SecurityIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
                    <Typography variant="h3" component="div" sx={{ color: 'error.main', fontWeight: 700, mb: 1 }}>
                      <CountUp end={stats?.totalIncidents || 0} duration={2.5} separator="," />
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
                      Total Incidents
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      All violent crimes recorded
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card sx={{ 
                  bgcolor: 'rgba(192, 57, 43, 0.08)',
                  border: '1px solid rgba(192, 57, 43, 0.3)',
                  '&:hover': { transform: 'translateY(-4px)' },
                  transition: 'all 0.3s ease',
                }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <TrendingUpIcon sx={{ fontSize: 48, color: 'error.dark', mb: 2 }} />
                    <Typography variant="h3" component="div" sx={{ color: 'error.dark', fontWeight: 700, mb: 1 }}>
                      <CountUp end={stats?.homicides || 0} duration={2.5} separator="," />
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
                      Homicides
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Most serious violent crimes
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card sx={{ 
                  bgcolor: 'rgba(214, 137, 16, 0.05)',
                  border: '1px solid rgba(214, 137, 16, 0.2)',
                  '&:hover': { transform: 'translateY(-4px)' },
                  transition: 'all 0.3s ease',
                }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <LocationOnIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                    <Typography variant="h3" component="div" sx={{ color: 'warning.main', fontWeight: 700, mb: 1 }}>
                      <CountUp end={stats?.robberies || 0} duration={2.5} separator="," />
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
                      Robberies
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Property crimes with force
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card sx={{ 
                  bgcolor: 'rgba(214, 137, 16, 0.08)',
                  border: '1px solid rgba(214, 137, 16, 0.3)',
                  '&:hover': { transform: 'translateY(-4px)' },
                  transition: 'all 0.3s ease',
                }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <AssessmentIcon sx={{ fontSize: 48, color: 'warning.dark', mb: 2 }} />
                    <Typography variant="h3" component="div" sx={{ color: 'warning.dark', fontWeight: 700, mb: 1 }}>
                      <CountUp end={stats?.assaults || 0} duration={2.5} separator="," />
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
                      Assaults
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Aggravated assault cases
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Year-by-Year Analysis Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" sx={{ mb: 3, color: 'primary.main' }}>
              Year-by-Year Analysis
            </Typography>
            
            {/* Filter Controls */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
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
              
              <Grid item xs={12} sm={6} md={3}>
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
              
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  fullWidth
                  label="Search Location or Description"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            {/* Filtered Statistics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'rgba(44, 62, 80, 0.05)', textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700 }}>
                    <CountUp end={filteredStats.total} duration={1.5} separator="," />
                  </Typography>
                  <Typography variant="body1" color="text.secondary">Total Filtered</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'rgba(192, 57, 43, 0.05)', textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" sx={{ color: 'error.main', fontWeight: 700 }}>
                    <CountUp end={filteredStats.homicide} duration={1.5} separator="," />
                  </Typography>
                  <Typography variant="body1" color="text.secondary">Homicides</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'rgba(214, 137, 16, 0.05)', textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 700 }}>
                    <CountUp end={filteredStats.robbery} duration={1.5} separator="," />
                  </Typography>
                  <Typography variant="body1" color="text.secondary">Robberies</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'rgba(214, 137, 16, 0.08)', textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" sx={{ color: 'warning.dark', fontWeight: 700 }}>
                    <CountUp end={filteredStats.assault} duration={1.5} separator="," />
                  </Typography>
                  <Typography variant="body1" color="text.secondary">Assaults</Typography>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Detailed Records Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" sx={{ mb: 3, color: 'primary.main' }}>
              Detailed Crime Records
            </Typography>
            
            <Paper elevation={0} sx={{ border: '1px solid rgba(44, 62, 80, 0.08)' }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'rgba(44, 62, 80, 0.04)' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Crime Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>District</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredIncidents
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((incident, index) => (
                        <TableRow key={incident.id || index} hover>
                          <TableCell>
                            {new Date(incident.dispatchDateTime).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getCrimeTypeLabel(incident.ucrGeneral)}
                              color={getCrimeTypeColor(incident.ucrGeneral)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{incident.locationBlock || 'N/A'}</TableCell>
                          <TableCell>{incident.dcDistrict || 'N/A'}</TableCell>
                          <TableCell>{incident.textGeneralCode || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={filteredIncidents.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          </Box>
        </TabPanel>
      </motion.div>
    </Container>
  );
};

export default Dashboard; 
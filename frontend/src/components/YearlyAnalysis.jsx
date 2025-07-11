import React, { useState, useEffect } from 'react';
import {
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
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  CalendarToday as CalendarIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material';
import { incidentAPI } from '../services/api';

const YearlyAnalysis = () => {
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [availableYears, setAvailableYears] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let response;
      
      if (selectedYear === 'all') {
        response = await incidentAPI.getIncidentsSortedByYear();
      } else {
        response = await incidentAPI.getIncidentsByYear(parseInt(selectedYear));
      }
      
      setIncidents(response.data);
      setFilteredIncidents(response.data);
      setError(null);
      
      // Extract unique years from the data
      const years = [...new Set(response.data.map(incident => {
        const date = new Date(incident.dispatchDate);
        return date.getFullYear();
      }))].sort((a, b) => b - a);
      
      setAvailableYears(years);
      
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  useEffect(() => {
    // Filter incidents based on search term
    if (searchTerm) {
      const filtered = incidents.filter(incident =>
        incident.textGeneralCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.locationBlock?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.dcDistrict?.toString().includes(searchTerm)
      );
      setFilteredIncidents(filtered);
    } else {
      setFilteredIncidents(incidents);
    }
    setPage(0); // Reset to first page when filtering
  }, [searchTerm, incidents]);

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getCrimeTypeColor = (ucrCode) => {
    switch (ucrCode) {
      case '100': return '#d32f2f'; // Homicide
      case '200': return '#7b1fa2'; // Rape
      case '300': return '#f57c00'; // Robbery
      case '400': return '#388e3c'; // Aggravated Assault
      default: return '#1565c0';
    }
  };

  const getYearlyStats = () => {
    const stats = {
      total: filteredIncidents.length,
      homicides: filteredIncidents.filter(i => i.ucrGeneral === '100').length,
      rapes: filteredIncidents.filter(i => i.ucrGeneral === '200').length,
      robberies: filteredIncidents.filter(i => i.ucrGeneral === '300').length,
      assaults: filteredIncidents.filter(i => i.ucrGeneral === '400').length,
    };
    return stats;
  };

  const yearlyStats = getYearlyStats();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading yearly data...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ color: 'primary.main', fontWeight: 700, mb: 1 }}>
          Yearly Crime Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Analyze crime trends and patterns by year
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Controls Section */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Select Year</InputLabel>
              <Select
                value={selectedYear}
                onChange={handleYearChange}
                label="Select Year"
                startAdornment={<CalendarIcon sx={{ color: 'action.active', mr: 1 }} />}
              >
                <MenuItem value="all">All Years</MenuItem>
                {availableYears.map(year => (
                  <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search incidents"
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
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon sx={{ color: 'primary.main' }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {filteredIncidents.length} incidents found
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={2.4}>
          <Card sx={{ 
            height: '100%', 
            background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {yearlyStats.total}
              </Typography>
              <Typography variant="body2">Total Crimes</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {[
          { label: 'Homicides', value: yearlyStats.homicides, color: '#d32f2f' },
          { label: 'Rapes', value: yearlyStats.rapes, color: '#7b1fa2' },
          { label: 'Robberies', value: yearlyStats.robberies, color: '#f57c00' },
          { label: 'Assaults', value: yearlyStats.assaults, color: '#388e3c' }
        ].map((stat, index) => (
          <Grid item xs={12} md={6} lg={2.4} key={index}>
            <Card sx={{ 
              height: '100%', 
              borderRadius: 2,
              border: `2px solid ${stat.color}`,
              boxShadow: `0 4px 20px ${stat.color}20`
            }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: stat.color }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Data Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Incident Details {selectedYear !== 'all' && `- ${selectedYear}`}
          </Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Crime Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>District</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>UCR Code</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredIncidents
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((incident, index) => (
                  <TableRow 
                    key={incident.id || index}
                    sx={{ 
                      '&:hover': { bgcolor: 'grey.50' },
                      '&:nth-of-type(odd)': { bgcolor: 'grey.25' }
                    }}
                  >
                    <TableCell>{incident.dispatchDate}</TableCell>
                    <TableCell>{incident.dispatchTime}</TableCell>
                    <TableCell>
                      <Chip 
                        label={incident.textGeneralCode || 'Unknown'}
                        size="small"
                        sx={{
                          bgcolor: getCrimeTypeColor(incident.ucrGeneral) + '20',
                          color: getCrimeTypeColor(incident.ucrGeneral),
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOnIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" noWrap>
                          {incident.locationBlock || 'Not specified'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{incident.dcDistrict || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={incident.ucrGeneral || 'N/A'}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredIncidents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default YearlyAnalysis; 
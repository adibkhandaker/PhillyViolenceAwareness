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
  Tooltip
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  LocationOn as LocationOnIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { incidentAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsResponse, incidentsResponse] = await Promise.all([
        incidentAPI.getStats(),
        incidentAPI.getAllIncidents()
      ]);
      
      setStats(statsResponse.data);
      setIncidents(incidentsResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await incidentAPI.refreshData();
      await fetchData();
    } catch (err) {
      setError('Failed to refresh data: ' + err.message);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCrimeTypeColor = (type) => {
    switch (type) {
      case 'homicides': return '#d32f2f';
      case 'rapes': return '#7b1fa2';
      case 'robberies': return '#f57c00';
      case 'assaults': return '#388e3c';
      default: return '#1565c0';
    }
  };

  const getCrimeTypeIcon = (type) => {
    switch (type) {
      case 'homicides': return <SecurityIcon />;
      case 'rapes': return <SecurityIcon />;
      case 'robberies': return <TrendingUpIcon />;
      case 'assaults': return <SecurityIcon />;
      default: return <AssessmentIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading crime data...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ color: 'primary.main', fontWeight: 700 }}>
            Crime Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time Philadelphia violent crime statistics
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            label={`${incidents.length} incidents loaded`} 
            color="primary" 
            variant="outlined"
            icon={<AssessmentIcon />}
          />
          <Tooltip title="Refresh data">
            <IconButton 
              onClick={handleRefresh}
              disabled={refreshing}
              color="primary"
              sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
            >
              <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Total Crimes */}
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ 
              height: '100%', 
              background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(21, 101, 192, 0.3)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AssessmentIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                    {stats.totalViolentCrimes}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Total Violent Crimes
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Individual Crime Types */}
          {[
            { key: 'homicides', label: 'Homicides', value: stats.homicides, type: 'homicides' },
            { key: 'robberies', label: 'Robberies', value: stats.robberies, type: 'robberies' },
            { key: 'assaults', label: 'Aggravated Assaults', value: stats.assaults, type: 'assaults' }
          ].map((crime) => (
            <Grid item xs={12} md={6} lg={3} key={crime.key}>
              <Card sx={{ 
                height: '100%', 
                borderRadius: 3,
                border: `2px solid ${getCrimeTypeColor(crime.type)}`,
                boxShadow: `0 4px 20px ${getCrimeTypeColor(crime.type)}20`
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ color: getCrimeTypeColor(crime.type), mr: 2 }}>
                      {getCrimeTypeIcon(crime.type)}
                    </Box>
                    <Typography variant="h4" component="div" sx={{ 
                      fontWeight: 700,
                      color: getCrimeTypeColor(crime.type)
                    }}>
                      {crime.value}
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {crime.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Recent Incidents Section */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <LocationOnIcon sx={{ color: 'primary.main', mr: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Recent Incidents
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={2}>
            {incidents.slice(0, 6).map((incident, index) => (
              <Grid item xs={12} md={6} key={incident.id || index}>
                <Card variant="outlined" sx={{ 
                  borderRadius: 2, 
                  '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
                  transition: 'all 0.3s ease'
                }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Chip 
                        label={incident.textGeneralCode || 'Unknown'} 
                        size="small"
                        sx={{ 
                          bgcolor: getCrimeTypeColor('default') + '20',
                          color: getCrimeTypeColor('default'),
                          fontWeight: 600
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {incident.dispatchDate}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      {incident.locationBlock || 'Location not specified'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {incident.dispatchTime} • District {incident.dcDistrict || 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* CSS for rotation animation */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
};

export default Dashboard; 
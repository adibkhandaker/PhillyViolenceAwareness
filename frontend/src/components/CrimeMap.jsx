import React, { useState } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper
} from '@mui/material';
import { 
  Map as MapIcon,
  Construction as ConstructionIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material';
import AddressSearch from './AddressSearch';

const CrimeMap = () => {
  const [mapSearchResults, setMapSearchResults] = useState([]);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ color: 'primary.main', fontWeight: 700, mb: 1 }}>
          Crime Map
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Interactive map visualization of crime incidents
        </Typography>
      </Box>

      {/* Address Search for Map */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <LocationOnIcon sx={{ mr: 1 }} />
          Search Crime Incidents by Location
        </Typography>
        <AddressSearch 
          onResultsChange={setMapSearchResults}
          placeholder="Search for incidents near an address..."
          showResults={false}
        />
      </Paper>

      {/* Map Results Summary */}
      {mapSearchResults.length > 0 && (
        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Search Results: {mapSearchResults.length} incidents found
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Card sx={{ bgcolor: 'rgba(192, 57, 43, 0.05)', textAlign: 'center', p: 2 }}>
                <Typography variant="h5" sx={{ color: 'error.main', fontWeight: 700 }}>
                  {mapSearchResults.filter(i => i.ucrGeneral === '100').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Homicides</Typography>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ bgcolor: 'rgba(123, 31, 162, 0.05)', textAlign: 'center', p: 2 }}>
                <Typography variant="h5" sx={{ color: 'secondary.main', fontWeight: 700 }}>
                  {mapSearchResults.filter(i => i.ucrGeneral === '200').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Rapes</Typography>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ bgcolor: 'rgba(214, 137, 16, 0.05)', textAlign: 'center', p: 2 }}>
                <Typography variant="h5" sx={{ color: 'warning.main', fontWeight: 700 }}>
                  {mapSearchResults.filter(i => i.ucrGeneral === '300').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Robberies</Typography>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ bgcolor: 'rgba(25, 118, 210, 0.05)', textAlign: 'center', p: 2 }}>
                <Typography variant="h5" sx={{ color: 'info.main', fontWeight: 700 }}>
                  {mapSearchResults.filter(i => i.ucrGeneral === '400').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Assaults</Typography>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Card sx={{ 
        minHeight: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: 3,
        border: '2px dashed #1565c0',
        bgcolor: 'primary.main',
        color: 'white'
      }}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <MapIcon sx={{ fontSize: 80, mb: 2, opacity: 0.8 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Interactive Crime Map
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            Geographic visualization of crime incidents with interactive markers, 
            heat maps, and filtering capabilities.
          </Typography>
          <Chip 
            icon={<ConstructionIcon />}
            label="Coming Soon" 
            sx={{ 
              bgcolor: 'white', 
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '1rem',
              py: 1,
              px: 2
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default CrimeMap; 
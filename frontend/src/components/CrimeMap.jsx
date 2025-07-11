import React from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { 
  Map as MapIcon,
  Construction as ConstructionIcon
} from '@mui/icons-material';

const CrimeMap = () => {
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
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  LinearProgress,
  Alert,
  AlertTitle,
  Grid,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { incidentAPI } from '../services/api';

const AwarenessLanding = ({ onNavigateToDashboard }) => {
  const [stats, setStats] = useState(null);
  const [current2025Data, setCurrent2025Data] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCurrentYearData();
  }, []);

  const fetchCurrentYearData = async () => {
    try {
      setLoading(true);
      const [statsResponse, incidents2025] = await Promise.all([
        incidentAPI.getStatistics(),
        incidentAPI.getIncidentsByYear(2025)
      ]);
      
      setStats(statsResponse.data);
      setCurrent2025Data(incidents2025.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Unable to fetch current crime data');
    } finally {
      setLoading(false);
    }
  };

  const get2025Stats = () => {
    if (!current2025Data || current2025Data.length === 0) {
      return {
        total: 0,
        homicide: 0,
        robbery: 0,
        assault: 0,
        rape: 0,
        avgPerDay: 0,
        avgPerWeek: 0,
      };
    }

    const crimeTypes = current2025Data.reduce((acc, incident) => {
      const ucr = incident.ucrGeneral;
      if (ucr >= 100 && ucr < 200) acc.homicide++;
      else if (ucr >= 200 && ucr < 300) acc.rape++;
      else if (ucr >= 300 && ucr < 400) acc.robbery++;
      else if (ucr >= 400 && ucr < 500) acc.assault++;
      return acc;
    }, { homicide: 0, rape: 0, robbery: 0, assault: 0 });

    const daysSinceStart = Math.max(1, Math.floor((new Date() - new Date('2025-01-01')) / (1000 * 60 * 60 * 24)));
    
    return {
      total: current2025Data.length,
      ...crimeTypes,
      avgPerDay: Math.round((current2025Data.length / daysSinceStart) * 10) / 10,
      avgPerWeek: Math.round((current2025Data.length / daysSinceStart) * 7 * 10) / 10,
    };
  };

  const current2025Stats = get2025Stats();

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: 'background.default'
      }}>
        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
          <LinearProgress sx={{ mb: 4, borderRadius: 2, height: 6 }} />
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 300 }}>
            Loading Philadelphia crime data...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section - Apple Style */}
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 8,
      }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Main Headline */}
            <Typography 
              variant="h1" 
              component="h1" 
              sx={{ 
                fontSize: { xs: '3rem', sm: '4rem', md: '5rem', lg: '6rem' },
                fontWeight: 700,
                lineHeight: 0.9,
                mb: 2,
                color: 'text.primary',
                letterSpacing: '-0.03em',
              }}
            >
              Philadelphia
            </Typography>
            
            <Typography 
              variant="h1" 
              component="h1" 
              sx={{ 
                fontSize: { xs: '3rem', sm: '4rem', md: '5rem', lg: '6rem' },
                fontWeight: 700,
                lineHeight: 0.9,
                mb: 6,
                color: 'text.primary',
                letterSpacing: '-0.03em',
              }}
            >
              Violence Awareness
            </Typography>

            {/* Error Alert */}
            {error && (
              <Alert severity="warning" sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}>
                <AlertTitle>Data Notice</AlertTitle>
                {error}. Displaying historical data for awareness.
              </Alert>
            )}
          </motion.div>
        </Container>
      </Box>

      {/* Large Statistics Section - Apple Style */}
      <Box sx={{ py: 12, bgcolor: 'background.paper' }}>
        <Container maxWidth="xl">
          {/* 2025 Total Crimes - Hero Number */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Box sx={{ textAlign: 'center', mb: 16 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 400,
                  mb: 4,
                  fontSize: { xs: '1.2rem', md: '1.5rem' },
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Violent Crimes in Philadelphia 2025
              </Typography>
              
              <Typography 
                variant="h1" 
                component="div"
                sx={{ 
                  fontSize: { xs: '8rem', sm: '12rem', md: '16rem', lg: '20rem' },
                  fontWeight: 800,
                  lineHeight: 0.8,
                  color: 'error.main',
                  mb: 4,
                  letterSpacing: '-0.04em',
                }}
              >
                <CountUp 
                  end={current2025Stats.total} 
                  duration={3}
                  delay={0.5}
                  enableScrollSpy
                  scrollSpyOnce
                />
              </Typography>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 300,
                  maxWidth: 600,
                  mx: 'auto',
                  lineHeight: 1.4,
                }}
              >
                incidents reported so far this year
              </Typography>
            </Box>
          </motion.div>

          {/* Breakdown Statistics */}
          <Grid container spacing={8}>
            {/* Homicides */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="h1" 
                    component="div"
                    sx={{ 
                      fontSize: { xs: '4rem', sm: '6rem', md: '8rem', lg: '10rem' },
                      fontWeight: 800,
                      lineHeight: 0.8,
                      color: 'error.dark',
                      mb: 2,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    <CountUp 
                      end={current2025Stats.homicide} 
                      duration={2.5}
                      delay={1}
                      enableScrollSpy
                      scrollSpyOnce
                    />
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      color: 'text.primary',
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    Homicides
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'text.secondary',
                      fontWeight: 300,
                      fontSize: '1.1rem',
                    }}
                  >
                    Lives lost to violence
                  </Typography>
                </Box>
              </motion.div>
            </Grid>

            {/* Robberies */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="h1" 
                    component="div"
                    sx={{ 
                      fontSize: { xs: '4rem', sm: '6rem', md: '8rem', lg: '10rem' },
                      fontWeight: 800,
                      lineHeight: 0.8,
                      color: 'warning.main',
                      mb: 2,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    <CountUp 
                      end={current2025Stats.robbery} 
                      duration={2.5}
                      delay={1.2}
                      enableScrollSpy
                      scrollSpyOnce
                    />
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      color: 'text.primary',
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    Robberies
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'text.secondary',
                      fontWeight: 300,
                      fontSize: '1.1rem',
                    }}
                  >
                    Theft with force or threat
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Daily Impact Section */}
      <Box sx={{ py: 12, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 400,
                  mb: 4,
                  fontSize: { xs: '1.2rem', md: '1.5rem' },
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Daily Impact
              </Typography>
              
              <Typography 
                variant="h1" 
                component="div"
                sx={{ 
                  fontSize: { xs: '6rem', sm: '8rem', md: '12rem', lg: '16rem' },
                  fontWeight: 800,
                  lineHeight: 0.8,
                  color: 'primary.main',
                  mb: 4,
                  letterSpacing: '-0.04em',
                }}
              >
                <CountUp 
                  end={current2025Stats.avgPerDay} 
                  duration={3}
                  delay={0.5}
                  decimals={1}
                  enableScrollSpy
                  scrollSpyOnce
                />
              </Typography>
              
              <Typography 
                variant="h4" 
                sx={{ 
                  color: 'text.primary',
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                violent crimes per day
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 300,
                  fontSize: '1.2rem',
                  maxWidth: 600,
                  mx: 'auto',
                }}
              >
                Average daily rate in Philadelphia for 2025
              </Typography>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Historical Context */}
      <Box sx={{ py: 12, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 400,
                  mb: 4,
                  fontSize: { xs: '1.2rem', md: '1.5rem' },
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Historical Data 2006-2025
              </Typography>
              
              <Typography 
                variant="h1" 
                component="div"
                sx={{ 
                  fontSize: { xs: '6rem', sm: '8rem', md: '12rem', lg: '16rem' },
                  fontWeight: 800,
                  lineHeight: 0.8,
                  color: 'text.primary',
                  mb: 4,
                  letterSpacing: '-0.04em',
                }}
              >
                <CountUp 
                  end={stats?.totalViolentCrimes || 0} 
                  duration={3}
                  delay={0.5}
                  separator=","
                  enableScrollSpy
                  scrollSpyOnce
                />
              </Typography>
              
              <Typography 
                variant="h4" 
                sx={{ 
                  color: 'text.primary',
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                total violent crimes
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 300,
                  fontSize: '1.2rem',
                  maxWidth: 600,
                  mx: 'auto',
                }}
              >
                Complete dataset spanning nearly two decades
              </Typography>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box sx={{ py: 12, bgcolor: 'background.default' }}>
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h3" 
                component="h2" 
                sx={{ 
                  mb: 4,
                  fontWeight: 600,
                  color: 'text.primary',
                  fontSize: { xs: '2rem', md: '3rem' },
                }}
              >
                Explore the Data
              </Typography>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 6,
                  color: 'text.secondary',
                  fontWeight: 300,
                  lineHeight: 1.6,
                  fontSize: '1.3rem',
                }}
              >
                Dive deeper into Philadelphia's crime statistics with comprehensive analytics, 
                historical trends, and detailed breakdowns.
              </Typography>
              
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={onNavigateToDashboard}
                sx={{
                  py: 3,
                  px: 6,
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  borderRadius: 6,
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 32px rgba(44, 62, 80, 0.3)',
                }}
              >
                View Dashboard
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Awareness Footer */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Alert 
              severity="info" 
              sx={{ 
                bgcolor: 'transparent',
                border: 'none',
                '& .MuiAlert-message': {
                  width: '100%',
                  textAlign: 'center',
                }
              }}
            >
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 300,
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                }}
              >
                This platform provides transparent access to Philadelphia's violent crime data to promote 
                community awareness and support evidence-based solutions for creating safer neighborhoods.
              </Typography>
            </Alert>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default AwarenessLanding; 
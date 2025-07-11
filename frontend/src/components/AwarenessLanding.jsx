import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Alert,
  AlertTitle,
  IconButton,
  Tooltip,
  Fade,
  Slide,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  LocationOn as LocationOnIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon,
  Timeline as TimelineIcon,
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

  const statCards = [
    {
      title: 'Total Violent Crimes',
      value: current2025Stats.total,
      subtitle: 'in 2025 so far',
      icon: <WarningIcon sx={{ fontSize: 40, color: 'error.main' }} />,
      color: 'error.main',
      bgColor: 'rgba(192, 57, 43, 0.05)',
      description: 'Homicides, Sexual Assaults, Robberies, and Aggravated Assaults',
    },
    {
      title: 'Homicides',
      value: current2025Stats.homicide,
      subtitle: 'lives lost',
      icon: <SecurityIcon sx={{ fontSize: 40, color: 'error.dark' }} />,
      color: 'error.dark',
      bgColor: 'rgba(192, 57, 43, 0.08)',
      description: 'The most serious violent crime category',
    },
    {
      title: 'Robberies',
      value: current2025Stats.robbery,
      subtitle: 'property crimes',
      icon: <LocationOnIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning.main',
      bgColor: 'rgba(214, 137, 16, 0.05)',
      description: 'Theft involving force or threat of force',
    },
    {
      title: 'Aggravated Assaults',
      value: current2025Stats.assault,
      subtitle: 'serious injuries',
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.dark' }} />,
      color: 'warning.dark',
      bgColor: 'rgba(214, 137, 16, 0.08)',
      description: 'Attacks intended to cause serious bodily harm',
    },
  ];

  const impactStats = [
    {
      label: 'Daily Average',
      value: current2025Stats.avgPerDay,
      suffix: ' crimes/day',
      description: 'Average violent crimes per day in 2025',
    },
    {
      label: 'Weekly Average',
      value: current2025Stats.avgPerWeek,
      suffix: ' crimes/week',
      description: 'Average violent crimes per week in 2025',
    },
    {
      label: 'Historical Data',
      value: stats?.totalIncidents || 0,
      suffix: ' total records',
      description: 'Complete dataset from 2006-2025',
    },
  ];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <LinearProgress sx={{ mb: 4, borderRadius: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading current crime awareness data...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h1" 
              component="h1" 
              sx={{ 
                mb: 3,
                background: 'linear-gradient(135deg, #2c3e50 0%, #7f8c8d 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontWeight: 800,
              }}
            >
              Philadelphia Violence Awareness
            </Typography>
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                mb: 4, 
                color: 'text.secondary',
                fontWeight: 400,
                maxWidth: 800,
                mx: 'auto',
                lineHeight: 1.5,
              }}
            >
              Understanding the current state of violent crime in Philadelphia through data-driven insights and community awareness
            </Typography>
            
            {error && (
              <Alert severity="warning" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                <AlertTitle>Data Notice</AlertTitle>
                {error}. Displaying sample data for demonstration.
              </Alert>
            )}
          </Box>
        </motion.div>

        {/* 2025 Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Box sx={{ mb: 6 }}>
            <Typography variant="h3" component="h2" sx={{ mb: 1, textAlign: 'center', color: 'primary.main' }}>
              2025 Current Status
            </Typography>
            <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 4 }}>
              Real-time data showing violent crime incidents in Philadelphia this year
            </Typography>
            
            <Grid container spacing={3}>
              {statCards.map((card, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                  >
                    <Card 
                      sx={{ 
                        height: '100%',
                        bgcolor: card.bgColor,
                        border: `1px solid ${card.color}20`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 8px 24px ${card.color}15`,
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <Box sx={{ mb: 2 }}>
                          {card.icon}
                        </Box>
                        <Typography variant="h3" component="div" sx={{ 
                          color: card.color, 
                          fontWeight: 700,
                          mb: 1,
                        }}>
                          <CountUp 
                            end={card.value} 
                            duration={2.5}
                            delay={0.5 + index * 0.2}
                            enableScrollSpy
                            scrollSpyOnce
                          />
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'text.primary', mb: 1, fontWeight: 600 }}>
                          {card.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                          {card.subtitle}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                          {card.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        </motion.div>

        {/* Impact Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card sx={{ mb: 6, bgcolor: 'rgba(44, 62, 80, 0.02)', border: '1px solid rgba(44, 62, 80, 0.08)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" component="h3" sx={{ mb: 3, textAlign: 'center', color: 'primary.main' }}>
                Impact Analysis
              </Typography>
              <Grid container spacing={4}>
                {impactStats.map((stat, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" component="div" sx={{ 
                        color: 'primary.main', 
                        fontWeight: 700,
                        mb: 1,
                      }}>
                        <CountUp 
                          end={stat.value} 
                          duration={3}
                          delay={1 + index * 0.3}
                          decimals={stat.suffix.includes('day') || stat.suffix.includes('week') ? 1 : 0}
                          suffix={stat.suffix}
                          enableScrollSpy
                          scrollSpyOnce
                        />
                      </Typography>
                      <Typography variant="h6" sx={{ color: 'text.primary', mb: 1, fontWeight: 600 }}>
                        {stat.label}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {stat.description}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h4" component="h3" sx={{ mb: 3, color: 'primary.main' }}>
              Explore Detailed Analytics
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
              Dive deeper into Philadelphia's crime data with our comprehensive dashboard featuring historical trends, 
              year-by-year analysis, and detailed breakdowns by crime type and location.
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={onNavigateToDashboard}
              sx={{
                py: 2,
                px: 4,
                fontSize: '1.1rem',
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              View Dashboard
            </Button>
          </Box>
        </motion.div>

        {/* Awareness Message */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Alert 
            severity="info" 
            sx={{ 
              mt: 6,
              bgcolor: 'rgba(93, 173, 226, 0.08)',
              border: '1px solid rgba(93, 173, 226, 0.2)',
              borderRadius: 3,
            }}
          >
            <AlertTitle sx={{ color: 'info.main', fontWeight: 600 }}>
              Community Awareness Initiative
            </AlertTitle>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              This platform provides transparent access to Philadelphia's violent crime data to promote community awareness, 
              support evidence-based policy decisions, and encourage collaborative efforts toward creating safer neighborhoods. 
              Data is sourced from the Philadelphia Police Department and updated regularly.
            </Typography>
          </Alert>
        </motion.div>
      </Container>
    </Box>
  );
};

export default AwarenessLanding; 
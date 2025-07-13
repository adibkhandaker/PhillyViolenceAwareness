import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  LinearProgress,
  Alert,
  AlertTitle,
  Grid,
  Paper,
  Chip,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  Warning as WarningIcon,
  LocalPolice as LocalPoliceIcon,
  Gavel as GavelIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { motion, useScroll, useTransform } from 'framer-motion';
import CountUp from 'react-countup';
import Particles from '@tsparticles/react';
import { loadStarsPreset } from '@tsparticles/preset-stars';
import { incidentAPI } from '../services/api';
import philadelphiaImage from '../assets/philadelphia.jpg';
import crimeSceneImage from '../assets/crimescene.jpg';

const AwarenessLanding = ({ onNavigateToDashboard }) => {
  const [stats, setStats] = useState(null);
  const [currentYearData, setCurrentYearData] = useState([]);
  const [displayYear, setDisplayYear] = useState(2025);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  useEffect(() => {
    fetchCurrentYearData();
  }, []);

  const fetchCurrentYearData = async () => {
    try {
      setLoading(true);
      
      // First get all incidents to determine the most recent year with data
      const [statsResponse, allIncidents] = await Promise.all([
        incidentAPI.getStatistics(),
        incidentAPI.getIncidentsSortedByYear()
      ]);
      
      setStats(statsResponse.data);
      
      // Find the most recent year with data
      const yearsWithData = [...new Set(allIncidents.data.map(incident => {
        const date = new Date(incident.dispatchDate);
        return date.getFullYear();
      }))].sort((a, b) => b - a);
      
      // Use the most recent year with data, fallback to 2025
      const mostRecentYear = yearsWithData.length > 0 ? yearsWithData[0] : 2025;
      setDisplayYear(mostRecentYear);
      
      // Get data for the most recent year
      const currentYearIncidents = allIncidents.data.filter(incident => {
        const date = new Date(incident.dispatchDate);
        return date.getFullYear() === mostRecentYear;
      });
      
      setCurrentYearData(currentYearIncidents);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Unable to fetch current crime data');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentYearStats = () => {
    if (!currentYearData || currentYearData.length === 0) {
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

    const crimeTypes = currentYearData.reduce((acc, incident) => {
      const ucr = incident.ucrGeneral;
      if (ucr >= 100 && ucr < 200) acc.homicide++;
      else if (ucr >= 200 && ucr < 300) acc.rape++;
      else if (ucr >= 300 && ucr < 400) acc.robbery++;
      else if (ucr >= 400 && ucr < 500) acc.assault++;
      return acc;
    }, { homicide: 0, rape: 0, robbery: 0, assault: 0 });

    const yearStart = new Date(`${displayYear}-01-01`);
    const daysSinceStart = Math.max(1, Math.floor((new Date() - yearStart) / (1000 * 60 * 60 * 24)));
    
    return {
      total: currentYearData.length,
      ...crimeTypes,
      avgPerDay: Math.round((currentYearData.length / daysSinceStart) * 10) / 10,
      avgPerWeek: Math.round((currentYearData.length / daysSinceStart) * 7 * 10) / 10,
    };
  };

  const currentYearStats = getCurrentYearStats();

  const particlesInit = useCallback(async (engine) => {
    await loadStarsPreset(engine);
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#000000',
        position: 'relative',
      }}>
        <Box sx={{ textAlign: 'center', maxWidth: 400, zIndex: 2 }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <LinearProgress 
              sx={{ 
                mb: 4, 
                borderRadius: 2, 
                height: 8,
                background: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: '#ffffff',
                }
              }} 
            />
            <Typography 
              variant="body2" 
              color="text.primary" 
              sx={{ 
                fontWeight: 300,
                fontFamily: '"Crimson Text", "Georgia", "Times New Roman", serif',
                fontSize: '1.2rem',
              }}
            >
              Loading Philadelphia crime data...
            </Typography>
          </motion.div>
        </Box>
        
        {/* Minimal Particles Background */}
        <Particles
          id="loadingParticles"
          init={particlesInit}
          options={{
            preset: "stars",
            background: {
              opacity: 0
            },
            particles: {
              number: {
                value: 30
              },
              color: {
                value: "#ffffff"
              },
              opacity: {
                value: 0.2
              }
            }
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1
          }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#000000', position: 'relative', overflow: 'hidden' }}>
      {/* Minimal Particles Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          preset: "stars",
          background: {
            opacity: 0
          },
          particles: {
            number: {
              value: 50
            },
            color: {
              value: "#ffffff"
            },
            opacity: {
              value: 0.3,
              animation: {
                enable: true,
                speed: 0.3,
                minimumValue: 0.1
              }
            },
            size: {
              value: 1,
              random: true,
              animation: {
                enable: true,
                speed: 1,
                minimumValue: 0.3
              }
            },
            move: {
              enable: true,
              speed: 0.5,
              direction: "none",
              outModes: {
                default: "bounce"
              }
            }
          }
        }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1
        }}
      />

      {/* Hero Section with Philadelphia Skyline Background */}
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2,
        // Using the Philadelphia image from assets
        backgroundImage: `
          linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.85)),
          url(${philadelphiaImage})
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse at center, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.7) 100%)
          `,
          zIndex: -1,
        }
      }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            {/* Main Title - Bold Display Font (Oswald) */}
            <Typography 
              variant="h1" 
              component="h1" 
              sx={{ 
                fontSize: { xs: '3rem', sm: '4rem', md: '6rem', lg: '8rem' },
                fontFamily: '"Oswald", "Arial Black", "Helvetica", sans-serif',
                fontWeight: 700,
                lineHeight: 0.9,
                mb: 2,
                color: '#ffffff',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.6)',
              }}
            >
              PHILADELPHIA
            </Typography>
            
            {/* Crisis Text - Dramatic Serif (Playfair Display) */}
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '5rem', lg: '7rem' },
                fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif',
                fontWeight: 900,
                fontStyle: 'italic',
                lineHeight: 0.9,
                mb: 6,
                color: '#ff4444',
                letterSpacing: '-0.02em',
                textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.6)',
              }}
            >
              Violence Crisis
            </Typography>

            {/* Error Alert */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 6, 
                  maxWidth: 600, 
                  mx: 'auto',
                  background: 'rgba(255, 68, 68, 0.15)',
                  border: '1px solid rgba(255, 68, 68, 0.4)',
                  backdropFilter: 'blur(15px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                }}
              >
                <AlertTitle sx={{ fontFamily: '"Roboto Condensed", "Arial Narrow", "Helvetica", sans-serif' }}>
                  Data Alert
                </AlertTitle>
                <Typography sx={{ fontFamily: '"Crimson Text", "Georgia", "Times New Roman", serif' }}>
                  {error}. Displaying historical data for awareness.
                </Typography>
              </Alert>
            )}
          </motion.div>
        </Container>
      </Box>

      {/* Main Statistics Section */}
      <Box sx={{ 
        py: 16, 
        position: 'relative',
        zIndex: 2,
        // Using the crime scene image from assets
        backgroundImage: `
          linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.85)),
          url(${crimeSceneImage})
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse at center, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.7) 100%)
          `,
          zIndex: -1,
        }
      }}>
        <Container maxWidth="xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <Box sx={{ textAlign: 'center', mb: 12 }}>
              {/* Section Header - Condensed Sans-serif */}
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'text.secondary',
                  fontFamily: '"Roboto Condensed", "Arial Narrow", "Helvetica", sans-serif',
                  fontWeight: 400,
                  mb: 6,
                  fontSize: { xs: '1.2rem', md: '1.8rem' },
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  opacity: 0.8,
                }}
              >
                {displayYear} Statistics
              </Typography>
              
              {/* Massive Statistics Number - Display Font */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <Typography 
                  component="div"
                  sx={{ 
                    fontSize: { xs: '6rem', sm: '10rem', md: '16rem', lg: '20rem' },
                    fontFamily: '"Oswald", "Arial Black", "Helvetica", sans-serif',
                    fontWeight: 700,
                    lineHeight: 0.9,
                    mb: 6,
                    color: '#ffffff',
                    letterSpacing: '0.02em',
                  }}
                >
                  <CountUp 
                    end={currentYearStats.total} 
                    duration={4}
                    delay={0.5}
                    enableScrollSpy
                    scrollSpyOnce
                  />
                </Typography>
              </motion.div>
              
              {/* Main Label - Condensed Bold */}
              <Typography 
                variant="h3" 
                sx={{ 
                  color: 'text.primary',
                  fontFamily: '"Roboto Condensed", "Arial Narrow", "Helvetica", sans-serif',
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '2rem', md: '3rem' },
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Violent Crimes This Year
              </Typography>
              
              {/* Subtitle - Elegant Serif */}
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary',
                  fontFamily: '"Crimson Text", "Georgia", "Times New Roman", serif',
                  fontWeight: 400,
                  maxWidth: 600,
                  mx: 'auto',
                  fontSize: '1.6rem',
                  fontStyle: 'italic',
                  opacity: 0.9,
                }}
              >
                Lives shattered. Families destroyed. Communities in crisis.
              </Typography>
            </Box>
          </motion.div>

          {/* Crime Type Breakdown */}
          <Grid container spacing={6} sx={{ mb: 12, justifyContent: 'center' }}>
            {/* Homicides Card */}
            <Grid item xs={12} md={5}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Paper sx={{ 
                  p: 6, 
                  textAlign: 'center',
                  background: `
                    linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)),
                    linear-gradient(135deg, 
                      rgba(255, 68, 68, 0.08) 0%, 
                      transparent 50%, 
                      rgba(255, 68, 68, 0.08) 100%
                    )
                  `,
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(255, 68, 68, 0.2)',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}>
                  <SecurityIcon sx={{ fontSize: 60, color: '#ff4444', mb: 3, opacity: 0.8 }} />
                  
                  {/* Crime Number - Display Font */}
                  <Typography 
                    component="div"
                    sx={{ 
                      fontSize: { xs: '4rem', sm: '6rem', md: '8rem' },
                      fontFamily: '"Oswald", "Arial Black", "Helvetica", sans-serif',
                      fontWeight: 700,
                      lineHeight: 0.8,
                      color: '#ff4444',
                      mb: 2,
                      letterSpacing: '0.02em',
                    }}
                  >
                    <CountUp 
                      end={currentYearStats.homicide} 
                      duration={3}
                      delay={1}
                      enableScrollSpy
                      scrollSpyOnce
                    />
                  </Typography>
                  
                  {/* Crime Type - Condensed Bold */}
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      color: 'text.primary',
                      fontFamily: '"Roboto Condensed", "Arial Narrow", "Helvetica", sans-serif',
                      fontWeight: 700,
                      mb: 2,
                      fontSize: { xs: '1.8rem', md: '2.5rem' },
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Homicides
                  </Typography>
                  
                  {/* Description - Serif Italic */}
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'text.secondary',
                      fontFamily: '"Crimson Text", "Georgia", "Times New Roman", serif',
                      fontWeight: 400,
                      fontSize: '1.2rem',
                      fontStyle: 'italic',
                      opacity: 0.9,
                    }}
                  >
                    Lives lost forever
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>

            {/* Robberies Card */}
            <Grid item xs={12} md={5}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <Paper sx={{ 
                  p: 6, 
                  textAlign: 'center',
                  background: `
                    linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)),
                    linear-gradient(135deg, 
                      rgba(255, 255, 255, 0.05) 0%, 
                      transparent 50%, 
                      rgba(255, 255, 255, 0.05) 100%
                    )
                  `,
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}>
                  <GavelIcon sx={{ fontSize: 60, color: '#ffffff', mb: 3, opacity: 0.8 }} />
                  
                  {/* Crime Number - Display Font */}
                  <Typography 
                    component="div"
                    sx={{ 
                      fontSize: { xs: '4rem', sm: '6rem', md: '8rem' },
                      fontFamily: '"Oswald", "Arial Black", "Helvetica", sans-serif',
                      fontWeight: 700,
                      lineHeight: 0.8,
                      color: '#ffffff',
                      mb: 2,
                      letterSpacing: '0.02em',
                    }}
                  >
                    <CountUp 
                      end={currentYearStats.robbery} 
                      duration={3}
                      delay={1.2}
                      enableScrollSpy
                      scrollSpyOnce
                    />
                  </Typography>
                  
                  {/* Crime Type - Condensed Bold */}
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      color: 'text.primary',
                      fontFamily: '"Roboto Condensed", "Arial Narrow", "Helvetica", sans-serif',
                      fontWeight: 700,
                      mb: 2,
                      fontSize: { xs: '1.8rem', md: '2.5rem' },
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Robberies
                  </Typography>
                  
                  {/* Description - Serif Italic */}
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'text.secondary',
                      fontFamily: '"Crimson Text", "Georgia", "Times New Roman", serif',
                      fontWeight: 400,
                      fontSize: '1.2rem',
                      fontStyle: 'italic',
                      opacity: 0.9,
                    }}
                  >
                    Terror on the streets
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Daily Impact Section */}
      <Box sx={{ 
        py: 16, 
        position: 'relative',
        zIndex: 2,
        background: `
          linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.95)),
          linear-gradient(45deg, 
            transparent 0%, 
            rgba(255, 255, 255, 0.01) 25%, 
            transparent 50%, 
            rgba(255, 255, 255, 0.01) 75%, 
            transparent 100%
          )
        `,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse at 80% 20%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
            linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.01) 50%, transparent 100%)
          `,
          zIndex: -1,
        }
      }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true }}
          >
            <Box sx={{ textAlign: 'center' }}>
              {/* Section Header - Condensed */}
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'text.secondary',
                  fontFamily: '"Roboto Condensed", "Arial Narrow", "Helvetica", sans-serif',
                  fontWeight: 400,
                  mb: 6,
                  fontSize: { xs: '1.2rem', md: '1.8rem' },
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  opacity: 0.8,
                }}
              >
                Daily Impact
              </Typography>
              
              {/* Daily Number - Massive Display Font */}
              <motion.div
                animate={{ 
                  scale: [1, 1.01, 1],
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Typography 
                  component="div"
                  sx={{ 
                    fontSize: { xs: '6rem', sm: '10rem', md: '16rem', lg: '24rem' },
                    fontFamily: '"Oswald", "Arial Black", "Helvetica", sans-serif',
                    fontWeight: 700,
                    lineHeight: 0.8,
                    mb: 4,
                    color: '#ffffff',
                    letterSpacing: '0.02em',
                  }}
                >
                  <CountUp 
                    end={currentYearStats.avgPerDay} 
                    duration={4}
                    delay={0.5}
                    decimals={1}
                    enableScrollSpy
                    scrollSpyOnce
                  />
                </Typography>
              </motion.div>
              
              {/* Label - Condensed Bold */}
              <Typography 
                variant="h3" 
                sx={{ 
                  color: 'text.primary',
                  fontFamily: '"Roboto Condensed", "Arial Narrow", "Helvetica", sans-serif',
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: '2rem', md: '3.5rem' },
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Crimes Per Day
              </Typography>
              
              {/* Subtitle - Elegant Serif Italic */}
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary',
                  fontFamily: '"Crimson Text", "Georgia", "Times New Roman", serif',
                  fontWeight: 400,
                  fontSize: '1.8rem',
                  maxWidth: 600,
                  mx: 'auto',
                  fontStyle: 'italic',
                }}
              >
                Every day, more victims. Every day, more pain.
              </Typography>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box sx={{ 
        py: 16, 
        position: 'relative',
        zIndex: 2,
        background: '#000000',
      }}>
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <Box sx={{ textAlign: 'center' }}>
              {/* CTA Header - Elegant Serif */}
              <Typography 
                variant="h2" 
                component="h2" 
                sx={{ 
                  mb: 6,
                  fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif',
                  fontWeight: 700,
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  color: '#ffffff',
                  letterSpacing: '-0.01em',
                }}
              >
                Take Action Now
              </Typography>
              
              {/* CTA Description - Readable Serif */}
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 8,
                  color: 'text.secondary',
                  fontFamily: '"Crimson Text", "Georgia", "Times New Roman", serif',
                  fontWeight: 400,
                  lineHeight: 1.6,
                  fontSize: '1.8rem',
                  maxWidth: 700,
                  mx: 'auto',
                }}
              >
                Explore the data. Understand the crisis. Be part of the solution.
              </Typography>
              
              {/* CTA Button - Condensed Bold */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={onNavigateToDashboard}
                  sx={{
                    py: 4,
                    px: 8,
                    fontSize: '1.6rem',
                    fontFamily: '"Roboto Condensed", "Arial Narrow", "Helvetica", sans-serif',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    borderRadius: 8,
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    boxShadow: '0 12px 40px rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                      boxShadow: '0 16px 60px rgba(255, 255, 255, 0.3)',
                      transform: 'translateY(-4px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Explore The Data
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default AwarenessLanding; 
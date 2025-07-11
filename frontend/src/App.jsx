import React, { useState } from 'react';
import { 
  ThemeProvider, 
  createTheme,
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Fade,
  Slide
} from '@mui/material';
import { motion } from 'framer-motion';
import AwarenessLanding from './components/AwarenessLanding';
import Dashboard from './components/Dashboard';

// Modern, subtle color theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2c3e50',      // Deep slate blue
      light: '#34495e',     // Lighter slate
      dark: '#1a252f',      // Darker slate
    },
    secondary: {
      main: '#7f8c8d',      // Muted gray
      light: '#95a5a6',     // Light gray
      dark: '#6c7b7d',      // Darker gray
    },
    background: {
      default: '#f8f9fa',   // Very light gray
      paper: '#ffffff',     // Pure white
    },
    text: {
      primary: '#2c3e50',   // Dark slate for main text
      secondary: '#7f8c8d', // Muted gray for secondary text
    },
    error: {
      main: '#c0392b',      // Muted red
      light: '#e74c3c',     // Slightly brighter red
    },
    warning: {
      main: '#d68910',      // Muted orange
      light: '#f39c12',     // Slightly brighter orange
    },
    info: {
      main: '#5dade2',      // Soft blue
      light: '#85c1e9',     // Light blue
    },
    success: {
      main: '#27ae60',      // Muted green
      light: '#2ecc71',     // Slightly brighter green
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2.5rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(44, 62, 80, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
          border: '1px solid rgba(44, 62, 80, 0.06)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 4px rgba(44, 62, 80, 0.1)',
          backgroundColor: 'rgba(248, 249, 250, 0.95)',
          backdropFilter: 'blur(8px)',
        },
      },
    },
  },
});

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' or 'dashboard'

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Navigation Bar */}
        <AppBar position="fixed" elevation={0} sx={{ 
          bgcolor: 'rgba(248, 249, 250, 0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(44, 62, 80, 0.06)'
        }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  color: 'primary.main',
                  fontWeight: 700,
                  letterSpacing: '-0.01em'
                }}
              >
                Philadelphia Violence Awareness
              </Typography>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant={currentView === 'landing' ? 'contained' : 'text'}
                  onClick={() => handleViewChange('landing')}
                  sx={{ 
                    color: currentView === 'landing' ? 'white' : 'primary.main',
                    bgcolor: currentView === 'landing' ? 'primary.main' : 'transparent',
                    '&:hover': {
                      bgcolor: currentView === 'landing' ? 'primary.dark' : 'rgba(44, 62, 80, 0.04)',
                    }
                  }}
                >
                  Home
                </Button>
                <Button
                  variant={currentView === 'dashboard' ? 'contained' : 'text'}
                  onClick={() => handleViewChange('dashboard')}
                  sx={{ 
                    color: currentView === 'dashboard' ? 'white' : 'primary.main',
                    bgcolor: currentView === 'dashboard' ? 'primary.main' : 'transparent',
                    '&:hover': {
                      bgcolor: currentView === 'dashboard' ? 'primary.dark' : 'rgba(44, 62, 80, 0.04)',
                    }
                  }}
                >
                  Dashboard
                </Button>
              </Box>
            </motion.div>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box sx={{ pt: 8 }}>
          {currentView === 'landing' && (
            <Fade in={currentView === 'landing'} timeout={500}>
              <div>
                <AwarenessLanding onNavigateToDashboard={() => handleViewChange('dashboard')} />
              </div>
            </Fade>
          )}
          
          {currentView === 'dashboard' && (
            <Fade in={currentView === 'dashboard'} timeout={500}>
              <div>
                <Dashboard />
              </div>
            </Fade>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;

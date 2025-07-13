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

// Import fonts
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/playfair-display/900.css';
import '@fontsource/oswald/300.css';
import '@fontsource/oswald/400.css';
import '@fontsource/oswald/700.css';
import '@fontsource/roboto-condensed/300.css';
import '@fontsource/roboto-condensed/400.css';
import '@fontsource/roboto-condensed/700.css';
import '@fontsource/crimson-text/400.css';
import '@fontsource/crimson-text/600.css';

// Diverse typography theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff',      // Pure white
      light: '#f5f5f5',     // Light gray
      dark: '#e0e0e0',      // Medium gray
    },
    secondary: {
      main: '#9e9e9e',      // Medium gray
      light: '#bdbdbd',     // Light gray
      dark: '#757575',      // Dark gray
    },
    background: {
      default: '#000000',   // Pure black
      paper: '#0a0a0a',     // Very dark gray
    },
    text: {
      primary: '#ffffff',   // White text
      secondary: '#b0b0b0', // Light gray for secondary text
    },
    error: {
      main: '#ff4444',      // Subtle red
      light: '#ff6666',     // Light red
      dark: '#cc0000',      // Dark red
    },
    warning: {
      main: '#ffaa00',      // Subtle orange
      light: '#ffcc44',     // Light orange
      dark: '#cc8800',      // Dark orange
    },
    info: {
      main: '#ffffff',      // White for info
      light: '#f5f5f5',     // Light gray
      dark: '#e0e0e0',      // Medium gray
    },
    success: {
      main: '#4caf50',      // Subtle green
      light: '#66bb6a',     // Light green
      dark: '#388e3c',      // Dark green
    },
  },
  typography: {
    // Main headlines - Bold, impactful display font
    h1: {
      fontFamily: '"Oswald", "Arial Black", "Helvetica", sans-serif',
      fontWeight: 700,
      fontSize: '3.5rem',
      lineHeight: 1.0,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
    },
    // Secondary headlines - Elegant serif
    h2: {
      fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif',
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    // Section headers - Condensed sans-serif
    h3: {
      fontFamily: '"Roboto Condensed", "Arial Narrow", "Helvetica", sans-serif',
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
      letterSpacing: '0.01em',
      textTransform: 'uppercase',
    },
    // Subsection headers - Clean sans-serif
    h4: {
      fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    // Statistics numbers - Bold display
    h5: {
      fontFamily: '"Oswald", "Arial Black", "Helvetica", sans-serif',
      fontWeight: 700,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      letterSpacing: '0.02em',
    },
    // Small headers - Condensed
    h6: {
      fontFamily: '"Roboto Condensed", "Arial Narrow", "Helvetica", sans-serif',
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
    // Body text - Readable serif
    body1: {
      fontFamily: '"Crimson Text", "Georgia", "Times New Roman", serif',
      fontSize: '1.1rem',
      lineHeight: 1.6,
      fontWeight: 400,
    },
    // Secondary body text - Clean sans-serif
    body2: {
      fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
      fontSize: '0.95rem',
      lineHeight: 1.5,
      fontWeight: 300,
    },
    // Buttons and UI elements
    button: {
      fontFamily: '"Roboto Condensed", "Arial Narrow", "Helvetica", sans-serif',
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'uppercase',
          fontFamily: '"Roboto Condensed", "Arial Narrow", "Helvetica", sans-serif',
          fontWeight: 700,
          padding: '14px 28px',
          boxShadow: 'none',
          backgroundColor: '#ffffff',
          color: '#000000',
          letterSpacing: '0.05em',
          '&:hover': {
            backgroundColor: '#f0f0f0',
            boxShadow: '0 8px 32px rgba(255, 255, 255, 0.2)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
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
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
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
                  fontFamily: '"Roboto Condensed", "Arial Narrow", "Helvetica", sans-serif',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
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
                    color: currentView === 'landing' ? '#000000' : 'text.primary',
                    backgroundColor: currentView === 'landing' ? '#ffffff' : 'transparent',
                    '&:hover': {
                      backgroundColor: currentView === 'landing' ? '#f0f0f0' : 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  Home
                </Button>
                <Button
                  variant={currentView === 'dashboard' ? 'contained' : 'text'}
                  onClick={() => handleViewChange('dashboard')}
                  sx={{ 
                    color: currentView === 'dashboard' ? '#000000' : 'text.primary',
                    backgroundColor: currentView === 'dashboard' ? '#ffffff' : 'transparent',
                    '&:hover': {
                      backgroundColor: currentView === 'dashboard' ? '#f0f0f0' : 'rgba(255, 255, 255, 0.1)',
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

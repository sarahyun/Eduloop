import React, { useState } from 'react';
import { AppBar, Box, Button, Container, CssBaseline, Grid, IconButton, InputBase, Paper, Toolbar, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const theme = createTheme({
  typography: {
    fontFamily: 'Lexend, Noto Sans, sans-serif',
  },
});

const LandingPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleGetStarted = () => {
    navigate(`/signup?email=${encodeURIComponent(email)}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Box display="flex" alignItems="center" flexGrow={1}>
            <IconButton edge="start" color="inherit" aria-label="logo">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                <path
                  d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z"
                  fill="currentColor"
                />
              </svg>
            </IconButton>
            <Typography variant="h6" color="textPrimary" sx={{ fontWeight: 'bold' }}>
              CollegeNavigate
            </Typography>
          </Box>

          <Box display="flex" gap={1} ml={2}>
            <Button variant="contained" color="primary" sx={{ 
              textTransform: 'none', 
              backgroundColor: '#359EFF',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#2a8de0',
              }
            }} onClick={handleLogin}>Log in</Button>
            <Button variant="outlined" color="primary" sx={{ 
              textTransform: 'none', 
              borderColor: '#359EFF',
              color: '#359EFF',
              boxShadow: 'none',
              '&:hover': {
                borderColor: '#2a8de0',
                color: '#2a8de0',
              }
            }} onClick={handleSignUp}>Sign Up</Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Paper
          sx={{
            p: 4,
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.4)), url("https://cdn.usegalileo.ai/sdxl10/16134264-b264-4fa7-82dc-9179f6016f11.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
            minHeight: '480px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            borderRadius: '24px',
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
            Get the college application insights you need.
          </Typography>
          <Typography variant="h6" sx={{ mb: 3 }}>
          Get started with our free college matching tool. We'll help you find best-fit schools, based on your unique profile. We'll give personalized insights to help you stand out. 
          </Typography>
          <Box display="flex" alignItems="center" sx={{ bgcolor: 'white', borderRadius: 1, p: 1, maxWidth: '50%' }}>
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Enter your email"
              inputProps={{ 'aria-label': 'enter your email' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
              <SearchIcon />
            </IconButton>
            <Button variant="contained" color="primary" sx={{ 
              ml: 1, 
              textTransform: 'none', 
              backgroundColor: '#359EFF',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#2a8de0',
              }
            }} onClick={handleGetStarted}>
              Get started
            </Button>
          </Box>
        </Paper>

        <Box sx={{ py: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
            How we help you succeed
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, maxWidth: '720px', color: '#0d141c' }}>
            Applying to college is more competitive, expensive, and stressful than ever. 
            Gain a competitive edge with actionable insights and personalized guidance for a standout application.
          </Typography>
          <Grid container spacing={3} sx={{ p: 0 }}>
            {[
                            {
                              title: 'Self-Reflection Guidance',
                              description: 'Engage with guided questionnaires that help you uncover personal strengths, passions, and areas for growth, informing your college and career path.',
                              icon: (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                                  <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                                </svg>
                              ),
                            },

              {
                title: 'School Recommendations',
                description: 'Receive tailored school suggestions that match your interests, goals, and values, streamlining your search process.',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M176,232a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,232Zm40-128a87.55,87.55,0,0,1-33.64,69.21A16.24,16.24,0,0,0,176,186v6a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16v-6a16,16,0,0,0-6.23-12.66A87.59,87.59,0,0,1,40,104.49C39.74,56.83,78.26,17.14,125.88,16A88,88,0,0,1,216,104Zm-16,0a72,72,0,0,0-73.74-72c-39,.92-70.47,33.39-70.26,72.39a71.65,71.65,0,0,0,27.64,56.3A32,32,0,0,1,96,186v6h64v-6a32.15,32.15,0,0,1,12.47-25.35A71.65,71.65,0,0,0,200,104Zm-16.11-9.34a57.6,57.6,0,0,0-46.56-46.55,8,8,0,0,0-2.66,15.78c16.57,2.79,30.63,16.85,33.44,33.45A8,8,0,0,0,176,104a9,9,0,0,0,1.35-.11A8,8,0,0,0,183.89,94.66Z"></path>
                  </svg>
                ),
              },
              {
                title: 'Find Your Unique Angle',
                description: 'Access strategic advice on identifying the approach to showcase your unique profile effectively.',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm71.87,53.27L136,114.14V40.37A88,88,0,0,1,199.87,77.27ZM120,40.37v83l-71.89,41.5A88,88,0,0,1,120,40.37ZM128,216a88,88,0,0,1-71.87-37.27L207.89,91.12A88,88,0,0,1,128,216Z"></path>
                  </svg>
                ),
              },
              {
                title: 'Interests Mapping',
                description: 'Explore potential majors, extracurriculars, and resources that align with your interests and career aspirations, helping you explore your interests deeply.',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M132,24A100.11,100.11,0,0,0,32,124v84.33A15.69,15.69,0,0,0,47.67,224H132a100,100,0,0,0,0-200Zm0,184H48V124a84,84,0,1,1,84,84Zm12-80a12,12,0,1,1-12-12A12,12,0,0,1,144,128Zm-44,0a12,12,0,1,1-12-12A12,12,0,0,1,100,128Zm88,0a12,12,0,1,1-12-12A12,12,0,0,1,188,128Z"></path>
                  </svg>
                ),
              },
              {
                title: 'Strengths and Weaknesses',
                description: "Get a detailed breakdown of what you're doing well and where you need to improve through personalized insights and data analysis.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0V156.69l50.34-50.35a8,8,0,0,1,11.32,0L128,132.69,180.69,80H160a8,8,0,0,1,0-16h40a8,8,0,0,1,8,8v40a8,8,0,0,1-16,0V91.31l-58.34,58.35a8,8,0,0,1-11.32,0L96,123.31l-56,56V200H224A8,8,0,0,1,232,208Z"></path>
                  </svg>
                ),
              },

              {
                title: 'Real-Time Progress Tracking',
                description: 'Monitor your application milestones, reflection completions, and goal achievements in one easy-to-use dashboard.',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M132,24A100.11,100.11,0,0,0,32,124v84.33A15.69,15.69,0,0,0,47.67,224H132a100,100,0,0,0,0-200Zm0,184H48V124a84,84,0,1,1,84,84Zm12-80a12,12,0,1,1-12-12A12,12,0,0,1,144,128Zm-44,0a12,12,0,1,1-12-12A12,12,0,0,1,100,128Zm88,0a12,12,0,1,1-12-12A12,12,0,0,1,188,128Z"></path>
                  </svg>
                ),
              },

            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper sx={{ 
                  p: 4, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 2, 
                  border: '1px solid #cedbe8', 
                  bgcolor: 'slate.50', 
                  borderRadius: '8px',
                  height: '250px'
                }}>
                  <Box sx={{ color: '#0d141c' }}>
                    {feature.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0d141c' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#49719c' }}>
                      {feature.description}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default LandingPage;
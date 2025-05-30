import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/form-wizard'); // Navigate to the FormWizard component
  };

  return (
    <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'top', backgroundColor: '#ffffff', padding: '0rem' }}>
      <Box sx={{ width: '100%', textAlign: 'left', padding: '0rem', backgroundColor: '#ffffff', borderRadius: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0e161b', marginBottom: 2 }}>
          Welcome!
        </Typography>
        <Typography variant="body1" sx={{ color: '#0e161b', marginBottom: 3 }}>
        You're about to embark on a journey that will help you discover the best colleges for you to thrive in. 

        </Typography>
        <Typography variant="body1" sx={{ color: '#0e161b', marginBottom: 3 }}>
        To get started, we want to understand who you are and what you’re looking for in a college. We’ll ask to think deeply to self-reflect when answering the questions. You don’t have to answer everything now, and you can update your responses later. 
        <br/>
        <br/>
        However, the better we can get to know you, the better your personalized recommendations and insights will be. 

        </Typography>

      </Box>
    </Container>
  );
};

export default WelcomePage; 
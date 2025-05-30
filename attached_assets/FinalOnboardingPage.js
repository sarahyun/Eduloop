import React, { useState } from 'react';
import { Box, Button, Container, Typography, Paper, Divider, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Assuming you have an AuthContext for user info
import config from '../config';


function FinalOnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get the current user
  const [feedback, setFeedback] = useState('');
  const [submissionMessage, setSubmissionMessage] = useState(''); // New state for submission message

  const handleSubmitFeedback = async () => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const response = await axios.post(`${config.API_BASE_URL}/feedback`, {
        user_id: user.uid,
        feedback: feedback,
      });
      console.log(response.data.message);
      setFeedback(''); // Clear feedback after submission
      setSubmissionMessage('Submitted! Thanks for your valuable feedback!'); // Set the submission message
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <Box
      sx={{
        // minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Lexend, "Noto Sans", sans-serif',
        bgcolor: 'white',
      }}
    >
      <Container maxWidth="md" sx={{ flexGrow: 1, pt: 5 }}>
        <Paper 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 2,
            border: '1px solid #ccc',
            boxShadow: 'none'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Typography variant="h6" color="textPrimary" sx={{ fontWeight: 'bold' }}>
                Discover colleges for you
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Explore recommended schools to find the right fit for you.
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              sx={{ 
                backgroundColor: '#2a8de0', 
                color: 'white', 
                textTransform: 'none',
                whiteSpace: 'nowrap'
              }} 
              onClick={() => navigate('/schools')}
            >
              Recommend Schools
            </Button>
          </Box>
        </Paper>
        <Paper 
          sx={{ 
            p: 3, 
            borderRadius: 2,
            border: '1px solid #ccc',
            boxShadow: 'none'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Typography variant="h6" color="textPrimary" sx={{ fontWeight: 'bold' }}>
                Get personalized insights
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Discover your strengths, areas for improvement, application strategies, and more.
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              sx={{ 
                backgroundColor: '#2a8de0', 
                color: 'white', 
                textTransform: 'none',
                whiteSpace: 'nowrap'
              }} 
              onClick={() => navigate('/student-dashboard')}
            >
              See Insights
            </Button>
          </Box>
        </Paper>
      </Container>
      <Box sx={{ px: 4, py: 5, bgcolor: 'white' }}>
        <Typography variant="h6" color="#111418" sx={{ fontWeight: 'bold', px: 4, pb: 1, pt: 2 }}>
          Help Us Improve!
        </Typography>
        <Typography variant="body1" color="#111418" sx={{ pb: 1, pt: 1, px: 4 }}>
          How was your onboarding experience? What could we have done better? Tell us how you're feeling.
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', gap: 2, maxWidth: 480, px: 4, py: 1 }}>
          <TextField
            placeholder="Your feedback here"
            multiline
            minRows={4}
            variant="outlined"
            fullWidth
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            sx={{
              bgcolor: 'white',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  border: '1px solid #ccc',
                },
                '&:hover fieldset': {
                  border: '1px solid #ccc',
                },
                '&.Mui-focused fieldset': {
                  border: '1px solid #ccc',
                },
              },
              '& .MuiInputBase-input': {
                color: '#111418',
              },
              '&::placeholder': {
                color: '#60758a',
              },
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', px: 4, py: 2 }}>
          <Button
            variant="contained"
            sx={{
              minWidth: 84,
              maxWidth: 480,
              bgcolor: '#2a8de0',
              color: 'white',
              fontWeight: 'bold',
              flex: 1,
              height: 48,
              borderRadius: 2,
              textTransform: 'none',
            }}
            onClick={handleSubmitFeedback}
          >
            Submit Feedback
          </Button>
        </Box>
        {submissionMessage && (
          <Typography variant="body1" color="green" sx={{ px: 4, py: 1 }}>
            {submissionMessage}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default FinalOnboardingPage; 
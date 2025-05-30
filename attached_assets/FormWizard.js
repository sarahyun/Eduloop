import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, LinearProgress } from '@mui/material';
import FormPage from './FormDetail';
import { formsList } from './forms/FormsData';
import AcademicRecordPage from './AcademicRecordPage';
import FinalOnboardingPage from './FinalOnboardingPage';
import WelcomePage from './WelcomePage';
import LoadingScreen from '../components/LoadingScreen';
import axios from 'axios';
import config from '../config';
import { useAuth } from '../context/AuthContext';

// Create different Axios instances
const axiosSchool = axios.create({
  baseURL: config.API_BASE_URL,
  // ... other custom configurations for school recommendations
});

const axiosDashboard = axios.create({
  baseURL: config.API_BASE_URL,
  // ... other custom configurations for student dashboard
});

const FormWizard = () => {
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const handleNext = async () => {
    if (currentFormIndex === formsList.length - 2) {
      setLoading(true);
      const userId = user.uid;

      try {
        console.log('Generating recommendations...');
        const response = await axios.post(`${config.API_BASE_URL}/recommendations/generate-school-recommendations/${userId}`);
        const response2 = await axios.post(`${config.API_BASE_URL}/recommendations/generate-student-dashboard/${userId}`);
        const response3 = await axios.post(`${config.API_BASE_URL}/recommendations/student-profile-counselor-view/${userId}`);
        setCurrentFormIndex(currentFormIndex + 1);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentFormIndex(currentFormIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentFormIndex > 0) {
      setCurrentFormIndex(currentFormIndex - 1);
    }
  };

  const currentForm = formsList[currentFormIndex];
  const progress = ((currentFormIndex + 1) / formsList.length) * 100;

  const renderPage = () => {
    if (currentForm.type === 'form') {
      return (
        <Box sx={{p: 3, borderRadius: 2, boxShadow:0}}>
          <FormPage 
            formData={currentForm.data} 
            formTitle={currentForm.title} 
            formId={currentForm.id} 
          />
        </Box>
      );
    } else if (currentForm.type === 'welcome') {
        return (
          <Box sx={{p: 0, borderRadius: 0, boxShadow:0}}>
            <WelcomePage />
          </Box>
        );
      
    } else if (currentForm.type === 'academic') {
      return (
        <Box sx={{p: 0, borderRadius: 0, boxShadow:0}}>
          <AcademicRecordPage />
        </Box>
      );
    } else if (currentForm.type === 'congrats') {
        return (
          <Box sx={{p: 0, borderRadius: 0, boxShadow:0}}>
            <FinalOnboardingPage />
          </Box>
        );
    } else {
      return (
        <Box sx={{p: 3, borderRadius: 2, boxShadow:0}}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
            {currentForm.title}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {currentForm.content}
          </Typography>
        </Box>
      );
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Box sx={{ maxWidth: '800px', margin: '0 auto', padding: 4 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Onboarding
      </Typography>
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: '#DBE1E6',
          '& .MuiLinearProgress-bar': { backgroundColor: '#359EFF' },
          mb: 2
        }} 
      />
      <Typography variant="body2" sx={{ mb: 5 }}>
        Step {currentFormIndex + 1} of {formsList.length}
      </Typography>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
        {currentForm.heading}
      </Typography>
      <Typography variant="body1" sx={{ mb: 0 }}>
        {currentForm.subheading}
      </Typography>
      {renderPage()}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button 
          variant="contained" 
          sx={{ backgroundColor: '#DBE1E6', color: 'black', textTransform: 'none' }} 
          onClick={handlePrevious} 
          disabled={currentFormIndex === 0}
        >
          Back
        </Button>
        {currentFormIndex < formsList.length - 1 && (
          <Button 
            variant="contained" 
            sx={{ backgroundColor: '#2a8de0', color: 'white', textTransform: 'none' }} 
            onClick={handleNext}
          >
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default FormWizard; 
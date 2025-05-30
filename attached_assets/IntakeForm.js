import React, { useState, useEffect } from 'react';
import { Paper, List, ListItem, ListItemText, Typography, Box, LinearProgress, Button } from '@mui/material';
import { CheckCircle, RadioButtonUnchecked, ArrowForward } from '@mui/icons-material';
import FormPage from './FormDetail';
import { formsListForFormsPage } from './forms/FormsData';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import config from '../config';
import { useNavigate } from 'react-router-dom';
import AcademicRecordPage from './AcademicRecordPage';

const FormsList = () => {
  const [selectedForm, setSelectedForm] = useState(formsListForFormsPage.find(form => form.id === 'junior_questionnaire') || null);
  const [formCompletionStatus, setFormCompletionStatus] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  const countTotalQuestions = (formData) => {
    if (!Array.isArray(formData)) {
      return 0; // Return 0 if formData is not an array
    }
  
    return formData.reduce((totalCount, section) => {
      // Check if section.questions is an array
      const sectionQuestionsCount = Array.isArray(section.questions) ? section.questions.length : 0;
      return totalCount + sectionQuestionsCount;
    }, 0);
  }; 

  useEffect(() => {
    if (user) {
      const userId = user.uid;
      formsListForFormsPage.forEach(form => {
        const totalQuestions = countTotalQuestions(form.data);
        axios.get(`${config.API_BASE_URL}/responses/responses/${userId}/${form.id}`)
          .then(response => {
            const responseData = response.data[0];
            if (responseData && responseData.responses) {
              const totalResponses = responseData.responses.length;
              const completionPercentage = Math.round((totalResponses / totalQuestions) * 100);
              const savedResponses = responseData.responses.reduce((acc, { question_id }) => {
                acc[question_id] = true;
                return acc;
              }, {});

              const isCompleted = form.data.every(section =>
                section.questions.every(question => savedResponses[question.id])
              );

              setFormCompletionStatus(prevStatus => ({
                ...prevStatus,
                [form.id]: { isCompleted, completionPercentage }
              }));
            }
          })
          .catch(error => {
            console.error('Error fetching form responses:', error);
          });
      });
    }
  }, [user]);

  const handleFormClick = (form) => {
    setSelectedForm(form);
  };

  const handleGetRecommendations = async () => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    const userId = user.uid;
    try {
      console.log('Generating recommendations...');
      const response = await axios.post(`${config.API_BASE_URL}/recommendations/generate-school-recommendations/${userId}`);
      const response2 = await axios.post(`${config.API_BASE_URL}/recommendations/generate-student-dashboard/${userId}`);
      const response3 = await axios.post(`${config.API_BASE_URL}/recommendations/student-profile-counselor-view/${userId}`);
      console.log('response3', response3)
      const recommendations = response.data.recommendations;

      // Assuming you want to display the recommendations in some way
      console.log('Recommendations:', recommendations);
      // You can update the state to display recommendations in the UI
      // setRecommendations(recommendations); // Uncomment if you have a state for recommendations

      // Navigate to the Schools page after getting recommendations
      navigate('/schools');
    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
  };

  const allFormsCompleted = Object.values(formCompletionStatus).every(status => status);
  const completedFormsCount = Object.values(formCompletionStatus).filter(status => status).length;
  const progress = (completedFormsCount / formsListForFormsPage.length) * 100;

  return (
    <Box sx={{ maxWidth: '960px', margin: '0 auto', fontFamily: 'Lexend, "Noto Sans", sans-serif', backgroundColor: '#ffffff', padding: 4, minHeight: '100vh' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#141414', fontWeight: 'bold', mb: 1 }}>
          Progress
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: '#DBE1E6',
            '& .MuiLinearProgress-bar': { backgroundColor: '#359EFF' }
          }}
        />
        <Typography variant="body2" sx={{ color: '#3E4D5B', mt: 1 }}>
          Self-Reflection
        </Typography>
      </Box>

      {formsListForFormsPage.map((form) => (
          <ListItem
            button
            key={form.id}
            onClick={() => handleFormClick(form)}
            sx={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {formCompletionStatus[form.id]?.isCompleted ? (
              <CheckCircle sx={{ color: '#4CAF50' }} />
            ) : (
              <RadioButtonUnchecked sx={{ color: '#B0BEC5' }} />
            )}
            <Box>
              <Typography sx={{ color: '#141414', fontSize: '1rem', fontWeight: 'bold' }}>
                {form.title}
              </Typography>
              <Typography sx={{ color: '#3E4D5B', fontSize: '0.875rem' }}>
                {form.description || 'Form Description'}
                <Typography sx={{ color: '#3E4D5B', fontSize: '0.875rem'}}>
              {form.id !== 'academic_info' && (formCompletionStatus[form.id]?.completionPercentage ? `${formCompletionStatus[form.id]?.completionPercentage}% done` : '0% done')}
            </Typography>
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ArrowForward sx={{ color: '#141414' }} />
          </Box>
          </ListItem>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="contained"
          onClick={handleGetRecommendations}
          sx={{
            textTransform: 'none',
            fontWeight: 'bold',
            backgroundColor: '#359EFF',
            color: '#FFFFFF',
            borderRadius: '20px',
            '&:hover': {
              backgroundColor: '#1E88E5',
            },
          }}
        >
          Update my recommendations
        </Button>
      </Box>

      {selectedForm && selectedForm.type === 'form' && (
        <FormPage 
          formData={selectedForm.data} 
          formTitle={selectedForm.title} 
          formId={selectedForm.id} 
        />
      )}

      {selectedForm && selectedForm.type === 'academic' && (
        <Paper
          sx={{
            mt: 4,
            p: 8,
            mb: 4,
            backgroundColor: '#ffffff',
            borderRadius: 2,
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              {"Academic Information"}
            </Typography>
            <Typography variant="body2" sx={{ color: 'gray' }}>
              Responses are autosaved.
            </Typography>
          </Box>
          <AcademicRecordPage />
        </Paper>
      )}
    </Box>
  );
};

export default FormsList;

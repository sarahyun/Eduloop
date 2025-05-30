import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, TextField, Paper } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import debounce from 'lodash.debounce';
import config from '../config';

const FormPage = ({ formData, formTitle, formId, userId: propUserId = null }) => {
  const [formResponses, setFormResponses] = useState({});
  const { user } = useAuth();
  const userId = propUserId || user?.uid;

  useEffect(() => {
    if (userId) {
      axios.get(`${config.API_BASE_URL}/responses/responses/${userId}/${formId}`)
        .then(response => {
          const responseData = response.data[0];
          if (responseData && responseData.responses) {
            const savedResponses = responseData.responses.reduce((acc, { question_id, answer }) => {
              acc[question_id] = answer;
              return acc;
            }, {});
            setFormResponses(savedResponses);
          }
        })
        .catch(error => {
          console.error('Error fetching form responses:', error);
        });
    }
  }, [userId, formId]);

  const debouncedSaveAllResponses = useCallback(
    debounce((responses) => {
      if (user && Object.keys(responses).length > 0) {
        const userId = user.uid;

        // Filter responses to include only those displayed on the screen
        const displayedResponses = Object.entries(responses).filter(([questionId]) => 
          formData.flatMap(section => section.questions).some(question => question.id === questionId)
        );

        const responsePayload = {
          response_id: `${userId}-${formId}`,
          user_id: userId,
          form_id: formId,
          submitted_at: new Date().toISOString(),
          responses: displayedResponses.map(([questionId, answer]) => {
            const questionText = formData
              .flatMap(section => section.questions)
              .find(question => question.id === questionId)?.question || '';

            return {
              question_id: questionId,
              question_text: questionText,
              answer: answer
            };
          })
        };

        axios.post(`${config.API_BASE_URL}/responses/responses`, responsePayload)
          .then(() => {
            console.log('All responses saved successfully');
          })
          .catch(error => {
            console.error('Error saving all responses:', error);
          });
      }
    }, 1000),
    [user, formId, formData]
  );

  const handleResponseChange = (questionId, value) => {
    setFormResponses(prevResponses => {
      const updatedResponses = {
        ...prevResponses,
        [questionId]: value
      };
      debouncedSaveAllResponses(updatedResponses);
      return updatedResponses;
    });
  };

  return (
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
          {formTitle}
        </Typography>
        <Typography variant="body2" sx={{ color: 'gray' }}>
          Responses are autosaved.
        </Typography>
      </Box>
      
      {formData.map((section, sectionIndex) => (
        <div key={sectionIndex} style={{ marginBottom: '50px' }}>
          <Typography variant="body2" mt={3} sx={{ fontWeight: 'medium', color: 'gray' }}>
            {section.section}
          </Typography>
          {section.questions.map((question) => (
            <div key={question.id} style={{ marginBottom: '20px' }}>
              <Box mt={2}>
                <Typography sx={{ mb: 1, fontWeight: 'medium' }}>{question.question}</Typography>
                <TextField
                  fullWidth
                  multiline={question.type === "textarea"}
                  rows={4}
                  variant="outlined"
                  placeholder="Type here..."
                  value={formResponses[question.id] || ''}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                />
              </Box>
            </div>
          ))}
        </div>
      ))}
    </Paper>
  );
};

export default FormPage;

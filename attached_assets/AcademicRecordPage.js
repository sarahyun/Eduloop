import React, { useState, useEffect, useCallback } from 'react';
import { Container, Box, Typography, TextField, Button, Paper } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import debounce from 'lodash.debounce';
import config from '../config';

const AcademicRecordPage = ({ userId: propUserId = null }) => {
  const [academicRecord, setAcademicRecord] = useState({
    weighted_gpa: '',
    unweighted_gpa: '',
    class_rank: '',
    act_score: '',
    sat_score: '',
    transcript_file: '',
    resume_file: ''
  });
  const { user } = useAuth();
  const userId = propUserId || user?.uid;

  useEffect(() => {
    if (userId) {
      axios.get(`${config.API_BASE_URL}/academic-records/${userId}`)
        .then(response => {
          setAcademicRecord(response.data);
        })
        .catch(error => {
          console.error('Error fetching academic record:', error);
        });
    }
  }, [userId]);

  const debouncedSaveRecord = useCallback(
    debounce((record) => {
      if (userId) {
        axios.post(`${config.API_BASE_URL}/academic-records`, { ...record, user_id: userId })
          .then(() => {
            console.log('Academic record saved successfully');
          })
          .catch(error => {
            console.error('Error saving academic record:', error);
          });
      }
    }, 1000),
    [userId]
  );

  const handleInputChange = (field, value) => {
    setAcademicRecord(prevRecord => {
      let parsedValue = value;



      const updatedRecord = { ...prevRecord, [field]: parsedValue };
      debouncedSaveRecord(updatedRecord);
      return updatedRecord;
    });
  };

  return (
    <Container sx={{ minHeight: '100vh', px: 3, flexDirection: 'column', alignItems: 'left'}}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
        <Typography variant="body2" color="#507a95">
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, px: 2, }}>
        <Typography variant="body1" color="#0e161b" fontWeight="medium">
          Weighted GPA
        </Typography>
        <TextField
          id="weighted-gpa-input"
          placeholder="Enter your GPA"
          variant="outlined"
          sx={{ width: '50%' }}
          value={academicRecord.weighted_gpa}
          onChange={(e) => handleInputChange('weighted_gpa', e.target.value)}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, px: 2, py: 1 }}>
        <Typography variant="body1" color="#0e161b" fontWeight="medium">
          Unweighted GPA
        </Typography>
        <TextField
          id="unweighted-gpa-input"
          placeholder="Enter your GPA"
          variant="outlined"
          sx={{ width: '50%' }}
          value={academicRecord.unweighted_gpa}
          onChange={(e) => handleInputChange('unweighted_gpa', e.target.value)}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, px: 2, py: 1 }}>
        <Typography variant="body1" color="#0e161b" fontWeight="medium">
          Class rank
        </Typography>
        <TextField
          id="class-rank-input"
          placeholder="eg. 54 out of 300"
          variant="outlined"
          sx={{ width: '50%' }}
          value={academicRecord.class_rank}
          onChange={(e) => handleInputChange('class_rank', e.target.value)}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, px: 2, py: 1 }}>
        <Typography variant="body1" color="#0e161b" fontWeight="medium">
          ACT score
        </Typography>
        <TextField
          id="act-score-input"
          placeholder="Enter your ACT score"
          variant="outlined"
          sx={{ width: '50%' }}
          value={academicRecord.act_score}
          onChange={(e) => handleInputChange('act_score', e.target.value)}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, px: 2, py: 1 }}>
        <Typography variant="body1" color="#0e161b" fontWeight="medium">
          SAT score
        </Typography>
        <TextField
          id="sat-score-input"
          placeholder="Enter your SAT score"
          variant="outlined"
          sx={{ width: '50%' }}
          value={academicRecord.sat_score}
          onChange={(e) => handleInputChange('sat_score', e.target.value)}
        />
      </Box>

      {/* <Typography variant="h6" color="#0e161b" fontWeight="medium" sx={{ px: 2, pb: 1, pt: 2 }}>
        Upload your transcript
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderStyle: 'dashed', borderColor: '#d1dde6', mb: 4 }}>
        <Typography variant="h6" color="#0e161b" fontWeight="medium">
          Upload your transcript
        </Typography>
        <Typography variant="body2" color="#0e161b">
          PDF, PNG, JPG or JPEG file only. Maximum size is 10MB.
        </Typography>
        <Button variant="contained" sx={{ mt: 2, bgcolor: '#e8eef3', color: '#0e161b' }} onClick={() => document.getElementById('transcript-upload').click()}>
          Upload file
        </Button>
        <input type="file" id="transcript-upload" style={{ display: 'none' }} />
      </Paper> */}

      <Typography variant="h6" color="#0e161b" fontWeight="medium" sx={{ px: 2, pb: 1, pt: 2 }}>
        Paste your resume/activities list
      </Typography>
      <TextField
        id="resume-activities-input"
        placeholder="Paste your resume or activities list here"
        variant="outlined"
        multiline
        rows={10}
        sx={{ width: '100%', p: 2, borderColor: '#d1dde6', borderStyle: 'dashed' }}
        value={academicRecord.resume_file}
        onChange={(e) => handleInputChange('resume_file', e.target.value)}
      />
    </Container>
  );
};

export default AcademicRecordPage; 
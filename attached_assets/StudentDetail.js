import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Tabs, Tab, Button, ListItem, Paper } from '@mui/material';
import axios from 'axios';
import config from '../config';
import { styled } from '@mui/material/styles';
import { formsListForFormsPage } from './forms/FormsData';
import FormPage from './FormDetail';
import AcademicRecordPage from './AcademicRecordPage';
import { ArrowForward } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import SchoolList from './SchoolList';



const BackToStudentListButton = () => {
  const navigate = useNavigate();
  return (
  <Button
  variant="contained"
  sx={{
    minWidth: '84px',
    maxWidth: '480px',
    textTransform: 'none',
    backgroundColor: '#F0F2F5',
    color: '#141414',
    fontWeight: 'bold',
    borderRadius: '9999px',
    '&:hover': {
      backgroundColor: '#e0e2e5',
    },
  }}
  onClick={() => {
    navigate('/students');
  }}
>
  Back to student list
</Button>
  );
};

// Custom styles for Tabs and Tab
const CustomTabs = styled(Tabs)({
  borderBottom: '3px solid transparent',
  '& .MuiTabs-indicator': {
    display: 'none',
  },
});

const CustomTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightBold,
  fontSize: theme.typography.pxToRem(14),
  color: '#4e7397',
  '&.Mui-selected': {
    color: '#0e141b',
    borderBottom: '3px solid #1980e6',
  },
  '&:hover': {
    color: '#0e141b',
  },
}));

// Custom styled button
const ToggleButton = styled(Button)({
  minWidth: '84px',
  maxWidth: '480px',
  height: '40px',
  padding: '0 16px',
  backgroundColor: '#359EFF',
  color: '#FFFFFF',
  fontWeight: 'bold',
  fontSize: '0.875rem',
  lineHeight: 'normal',
  textTransform: 'none',
  borderRadius: '9999px',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: '#2a8be0',
  },
});

function StudentDetail() {
  const { studentId } = useParams();
  const [studentName, setStudentName] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState(null);
  const [isCounselorView, setIsCounselorView] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [formResponses, setFormResponses] = useState({});
  const { user } = useAuth();
  const [isProfileEmpty, setIsProfileEmpty] = useState(false);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const response = await axios.get(`${config.API_BASE_URL}/users/${studentId}`);
        setStudentName(response.data.name);
        setStudentGrade(response.data.grade);

        const dashboardResponse = await axios.get(`${config.API_BASE_URL}/recommendations/student-dashboard/${studentId}`);
        const counselorResponse = await axios.get(`${config.API_BASE_URL}/recommendations/student-profile-counselor-view/${studentId}`);
        setDashboard({
          studentView: dashboardResponse.data.dashboard.studentDashboard,
          counselorView: counselorResponse.data.profile.studentProfile
        });
      } catch (err) {
        setIsProfileEmpty(true);
        console.error('Error:', err);
      }
    };

    fetchStudentDetails();
  }, [studentId]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const toggleView = () => {
    setIsCounselorView((prev) => !prev);
  };

  const handleFormClick = (form) => {
    setSelectedForm(form);
    if (form.type === 'form') {
      <FormPage 
        formData={form.data} 
        formTitle={form.title} 
        formId={form.id} 
        studentId={studentId}
      />
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (isProfileEmpty) {
    return (
      <Container sx={{ py: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
            {studentName ? studentName : 'Student Detail'}
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {studentGrade ? `Grade: ${studentGrade}` : 'Grade not available'}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
            border: '2px dashed #DBE1E6',
            textAlign: 'center',
            padding: '20px',
            mt: 3,
            borderRadius: '16px',
          }}
        >
          <Box sx={{ maxWidth: '480px', textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: '#141414', fontWeight: 'bold', mb: 2 }}>
              This student has not started their profile yet.
            </Typography>
            <Typography variant="body1" sx={{ color: '#141414', mb: 4 }}>
              Encourage them to begin their college navigate journey.
            </Typography>
            <BackToStudentListButton />
          </Box>
        </Box>
      </Container>
    );
  }

  if (!dashboard) {
    return <div>Loading...</div>;
  }

  return (
    <Container sx={{ py: 5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
          {studentName ? studentName : 'Student Detail'}
        </Typography>
       {!isProfileEmpty && <BackToStudentListButton />}
      </Box>
      {studentGrade && (
        <Typography variant="h6" sx={{ mb: 2 }}>
          Grade: {studentGrade}
        </Typography>
      )}
      <CustomTabs value={activeTab} onChange={handleTabChange}>
        <CustomTab label="Dashboard" />
        <CustomTab label="Forms" />
        <CustomTab label="School Recs" />
      </CustomTabs>
      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && (
          <Box>
            <ToggleButton onClick={toggleView}>
              {isCounselorView ? 'View as Student' : 'View as Counselor'}
            </ToggleButton>
            {isCounselorView ? (
              console.log(dashboard.counselorView),
              console.log(dashboard.studentView),
              <Box sx={{ mt: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">Academic Overview</Typography>
                  <Typography>{dashboard.counselorView.academicOverview}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">Extracurricular Activities</Typography>
                  <Typography>{dashboard.counselorView.extracurricularActivities}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">Personality & Soft Skills</Typography>
                  <Typography>{dashboard.counselorView.personalitySoftSkills}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">Academic Trajectory</Typography>
                  <Typography>{dashboard.counselorView.academicTrajectory}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">Career & Major Exploration</Typography>
                  <Typography>{dashboard.counselorView.careerMajorExploration}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">Social & Emotional Support</Typography>
                  <Typography>{dashboard.counselorView.socialEmotionalSupport}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">Family & Financial Context</Typography>
                  <Typography>{dashboard.counselorView.familyFinancialContext}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">College Fit</Typography>
                  <Typography>{dashboard.counselorView.collegeFit}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">Potential Challenges</Typography>
                  <Typography>{dashboard.counselorView.potentialChallenges}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">Next Steps</Typography>
                  <Typography>{dashboard.counselorView.nextSteps}</Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ mt: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">Profile Summary</Typography>
                  <Typography>{dashboard.studentView.profileSummary}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">Strengths</Typography>
                  <div>
                    <ul>
                      {dashboard.studentView.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">Growth Areas</Typography>
                  <div>
                    <ul>
                      {dashboard.studentView.growthAreas.map((area, index) => (
                        <li key={index}>{area}</li>
                      ))}
                    </ul>
                  </div>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">Stand Out Factor & Brag List</Typography>
                  <Typography>
                    <ul>
                      {dashboard.studentView.standOutFactorBragList.map((factor, index) => (
                        <li key={index}>{factor}</li>
                      ))}
                    </ul>
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">Application Strategy Tips</Typography>
                  <Typography>
                    <ul>
                      {dashboard.studentView.applicationStrategyTips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">Interest & Major Mapping</Typography>
                  <Typography>{dashboard.studentView.interestMajorMapping}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">Potential Extracurriculars</Typography>
                  <Typography>
                    <ul>
                      {dashboard.studentView.potentialExtracurriculars.map((activity, index) => (
                        <li key={index}>{activity}</li>
                      ))}
                    </ul>
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">Things To Do This Summer</Typography>
                  <Typography>
                    <ul>
                      {dashboard.studentView.thingsToDoThisSummer.map((thing, index) => (
                        <li key={index}>{thing}</li>
                      ))}
                    </ul>
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">Recommended Reading & Resources</Typography>
                  <Typography>
                    <ul>
                      {dashboard.studentView.recommendedReadingAndResources.map((resource, index) => (
                        <li key={index}>{resource}</li>
                      ))}
                    </ul>
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        )}
        {activeTab === 1 && (
          <Box>
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
                  <Typography sx={{ color: '#141414', fontSize: '1rem', fontWeight: 'bold' }}>
                    {form.title}
                  </Typography>
                  <Typography sx={{ color: '#3E4D5B', fontSize: '0.875rem' }}>
                    {form.description || 'Form Description'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ArrowForward sx={{ color: '#141414' }} />
                </Box>
              </ListItem>
            ))}

            {selectedForm && selectedForm.type === 'form' && (
              <FormPage 
                formData={selectedForm.data} 
                formTitle={selectedForm.title} 
                formId={selectedForm.id} 
                userId={studentId}
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
                <AcademicRecordPage userId={studentId} />
              </Paper>
            )}
          </Box>
        )}
        {activeTab === 2 && (
          <SchoolList userId={studentId} />
        )}
      </Box>
    </Container>
  );
}

export default StudentDetail; 
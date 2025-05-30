import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Box,
  Collapse,
} from '@mui/material';
import config from '../config';
import { useAuth } from '../context/AuthContext';


function SchoolList({ userId: propUserId = null }) {
  const { user } = useAuth();
  const userId = propUserId || user?.uid;
  const [tabValue, setTabValue] = useState(0);
  const [expanded, setExpanded] = useState({});
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        if (userId) {
          const response = await axios.get(`${config.API_BASE_URL}/recommendations/recommendations/${userId}`);
          setRecommendations(response.data.recommendations);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
    };

    fetchRecommendations();
  }, [userId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleExpandClick = (schoolName) => {
    setExpanded((prev) => ({
      ...prev,
      [schoolName]: !prev[schoolName],
    }));
  };

  // Group schools by type (Reach, Match, Safety)
  const groupedData = recommendations.reduce((acc, school) => {
    if (!acc[school.type]) acc[school.type] = [];
    acc[school.type].push(school);
    return acc;
  }, {});

  const categories = Object.keys(groupedData);

  return (
    <Container maxWidth="md" sx={{ paddingTop: 4, paddingX: { xs: 0, md: 0  } }}>
      <Typography
        variant="h3"
        gutterBottom
        align="left"
        sx={{
          fontWeight: 'bold',
          fontSize: '3rem',
          marginBottom: 1,
        }}
      >
        Schools we recommend for you
      </Typography>
      <Typography
        variant="h7"
        align="left"
        color="text.secondary"
        sx={{
          marginBottom: 4,
          fontWeight: 'normal',
        }}
      >
        You're in the driver's seat when it comes to your college list. Use this list as a starting point and start exploring.
      </Typography>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{
          marginTop: 4,
          marginBottom: 1,
          '& .MuiTabs-indicator': {
            height: '3px',
            backgroundColor: '#359EFF',
          },
          '& .MuiTabs-flexContainer': {
            justifyContent: 'space-between',
            width: '100%',
          },
          borderBottom: '1px solid #e0e0e0',
          width: '100%',
        }}
      >
        {categories.map((category, index) => (
          <Tab
            label={category}
            key={index}
            sx={{
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '1rem',
              color: tabValue === index ? '#141414' : '#666',
              '&.Mui-selected': {
                color: '#141414',
                '& .MuiTabs-indicator': {
                  backgroundColor: '#359EFF',
                },
              },
              flex: 1,
              maxWidth: 'none',
            }}
          />
        ))}
      </Tabs>

      <Box>
        {categories.map((category, index) => (
          tabValue === index && (
            <Grid container spacing={.5} sx={{ marginY: 0 }} key={index}>
              {groupedData[category].map((school, idx) => (
                <Grid item xs={12} key={idx}>
                  <Card
                    sx={{
                      display: 'flex',
                      borderRadius: 2,
                      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
                      overflow: 'hidden',
                      margin: 2,
                    }}
                  >
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                      padding: 4,
                    }}>
                      <CardContent sx={{ flex: '1 0 auto', padding: 0 }}>
                        <Typography
                          variant="h5"
                          component="div"
                          sx={{
                            fontWeight: 'bold',
                            marginBottom: 1,
                          }}
                        >
                          {school.name}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: 'text.secondary',
                            marginBottom: 2,
                          }}
                        >
                          {school.info.why}
                        </Typography>
                        <Collapse in={expanded[school.name]}>
                          <Box sx={{ marginTop: 2 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 'bold',
                                marginBottom: 1,
                              }}
                            >
                              Points of Interest:
                            </Typography >
                            <ul style={{ color: 'text.secondary', fontFamily: 'Lexend' }}>
                              {school.info.points_of_interest.map((point, id) => (
                                <li key={id}>{point}</li>
                              ))}
                            </ul>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 'bold',
                                marginTop: 2,
                                marginBottom: 1,
                              }}
                            >
                              Next Steps:
                            </Typography>
                            <ul style={{ color: 'text.secondary', fontFamily: 'Lexend' }}>
                              {school.info.next_steps.map((step, id) => (
                                <li key={id}>{step}</li>
                              ))}
                            </ul>
                          </Box>
                        </Collapse>
                      </CardContent>
                      <Box sx={{ marginTop: 2 }}>
                        <Button
                          onClick={() => handleExpandClick(school.name)}
                          sx={{
                            borderRadius: '20px',
                            backgroundColor: '#F5F5F5',
                            color: '#141414',
                            textTransform: 'none',
                            fontWeight: 'normal',
                            padding: '6px 16px',
                            '&:hover': {
                              backgroundColor: '#E8E8E8',
                            },
                          }}
                        >
                          {expanded[school.name] ? 'Show Less → ' : 'Show More → '}
                        </Button>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        maxWidth: 200,
                        maxHeight: 150,
                        position: 'relative',
                        padding: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Box
                        component="img"
                        src={school.info.logo_url}
                        alt={school.name}
                        onError={(e) => {
                        }}
                        onLoad={() => {
                        }}
                        sx={{
                          maxWidth: '100%',
                          height: 'auto',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          backgroundColor: '#f5f5f5',
                          maxHeight: '150px',
                          ...(school.name.includes('Georgia Tech') && {
                            width: '100%',
                            display: 'block',
                            visibility: 'visible',
                            opacity: 1,
                          }),
                        }}
                      />
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )
        ))}
      </Box>
    </Container>
  );
}

export default SchoolList;

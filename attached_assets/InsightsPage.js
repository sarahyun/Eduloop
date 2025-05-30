import React from 'react';
import { Container, Box, Typography, Button, Grid, Paper } from '@mui/material';
import { Diamond } from '@mui/icons-material';

const InsightsPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box display="flex" alignItems="center" mb={6}>
        <Diamond style={{ fontSize: '24px', marginRight: '8px' }} /> 

      </Box>
      <Box mb={8}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Sarah, you've completed all of your tasks!
        </Typography>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          But we can still lorem ipsum.
        </Typography>
        <Typography variant="body1" color="textSecondary">
          In hac habitasse platea dictumst. Curabitur varius commodo ante vel sollicitudin.
        </Typography>
      </Box>

      {/* Recommended Section */}
      <Box mb={8}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight="bold">
            RECOMMENDED FOR YOU
          </Typography>
          <Button variant="contained" color="primary" sx={{ borderRadius: '50px' }}>
            See all
          </Button>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ height: 0, paddingTop: '75%', backgroundColor: 'grey.200', borderRadius: 2 }} elevation={1} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ height: 0, paddingTop: '75%', backgroundColor: 'grey.200', borderRadius: 2 }} elevation={1} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ height: 0, paddingTop: '75%', backgroundColor: 'grey.200', borderRadius: 2 }} elevation={1} />
          </Grid>
        </Grid>
      </Box>

      {/* Insights Section */}
      <Box>
        <Typography variant="h6" fontWeight="bold" mb={3}>
          INSIGHTS
        </Typography>

        {/* Profile Summary */}
        <Box mb={4}>
          <Typography variant="h6" fontWeight="bold" mb={1}>
            Profile Summary
          </Typography>
          <Paper sx={{ padding: 2, backgroundColor: 'grey.100' }} elevation={1}>
            <Typography variant="body1" color="textSecondary">
              Your profile summary goes here...
            </Typography>
          </Paper>
        </Box>

        {/* Strengths */}
        <Box mb={4}>
          <Typography variant="h6" fontWeight="bold" mb={1}>
            Strengths
          </Typography>
          <Paper sx={{ padding: 2, backgroundColor: 'grey.100' }} elevation={1}>
            <ul>
              <li>Strength 1</li>
              <li>Strength 2</li>
              <li>Strength 3</li>
            </ul>
          </Paper>
        </Box>

        {/* Growth Areas */}
        <Box mb={4}>
          <Typography variant="h6" fontWeight="bold" mb={1}>
            Growth Areas
          </Typography>
          <Paper sx={{ padding: 2, backgroundColor: 'grey.100' }} elevation={1}>
            <ul>
              <li>Growth Area 1</li>
              <li>Growth Area 2</li>
              <li>Growth Area 3</li>
            </ul>
          </Paper>
        </Box>

        {/* Stand Out Factor & Brag List */}
        <Box mb={4}>
          <Typography variant="h6" fontWeight="bold" mb={1}>
            Stand Out Factor & Brag List
          </Typography>
          <Paper sx={{ padding: 2, backgroundColor: 'grey.100' }} elevation={1}>
            <Typography variant="body1" color="textSecondary">
              Your stand out factors and brag list items go here...
            </Typography>
          </Paper>
        </Box>

        {/* Application Strategy Tips */}
        <Box mb={4}>
          <Typography variant="h6" fontWeight="bold" mb={1}>
            Application Strategy Tips
          </Typography>
          <Paper sx={{ padding: 2, backgroundColor: 'grey.100' }} elevation={1}>
            <ul>
              <li>Strategy Tip 1</li>
              <li>Strategy Tip 2</li>
              <li>Strategy Tip 3</li>
            </ul>
          </Paper>
        </Box>

        {/* Interest & Major Mapping */}
        <Box mb={4}>
          <Typography variant="h6" fontWeight="bold" mb={1}>
            Interest & Major Mapping
          </Typography>
          <Paper sx={{ padding: 2, backgroundColor: 'grey.100' }} elevation={1}>
            <Typography variant="body1" color="textSecondary">
              Your interest and major mapping details go here...
            </Typography>
          </Paper>
        </Box>

        {/* Potential Extracurriculars */}
        <Box mb={4}>
          <Typography variant="h6" fontWeight="bold" mb={1}>
            Potential Extracurriculars
          </Typography>
          <Paper sx={{ padding: 2, backgroundColor: 'grey.100' }} elevation={1}>
            <ul>
              <li>Extracurricular 1</li>
              <li>Extracurricular 2</li>
              <li>Extracurricular 3</li>
            </ul>
          </Paper>
        </Box>

        {/* Things To Do This Summer */}
        <Box mb={4}>
          <Typography variant="h6" fontWeight="bold" mb={1}>
            Things To Do This Summer
          </Typography>
          <Paper sx={{ padding: 2, backgroundColor: 'grey.100' }} elevation={1}>
            <ul>
              <li>Summer Activity 1</li>
              <li>Summer Activity 2</li>
              <li>Summer Activity 3</li>
            </ul>
          </Paper>
        </Box>

        {/* Recommended Reading & Resources */}
        <Box mb={4}>
          <Typography variant="h6" fontWeight="bold" mb={1}>
            Recommended Reading & Resources
          </Typography>
          <Paper sx={{ padding: 2, backgroundColor: 'grey.100' }} elevation={1}>
            <ul>
              <li>Resource 1</li>
              <li>Resource 2</li>
              <li>Resource 3</li>
            </ul>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default InsightsPage; 
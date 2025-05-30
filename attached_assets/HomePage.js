import React from 'react';
import { Button, Typography, Container, Grid, Box } from '@mui/material';

const HomePage = () => {
  return (
    <Container>
      <Grid container direction="column" alignItems="center" justifyContent="center" spacing={3}>
        <Typography variant="h4" gutterBottom>
          Welcome to Your College Application Journey
        </Typography>
        <Typography variant="body1" paragraph>
          Fill out intake questionnaires, upload documents, and explore recommended schools to guide your college application process.
        </Typography>

        <Grid item>
          <Button variant="contained" color="primary" fullWidth>
            Start Intake Questionnaires
          </Button>
        </Grid>
        <Grid item>
          <Button variant="outlined" color="primary" fullWidth>
            Upload Documents
          </Button>
        </Grid>
        <Grid item>
          <Button variant="outlined" color="secondary" fullWidth>
            Send Parent Form
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;
